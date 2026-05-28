import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';

const MediaContext = createContext();

const INITIAL_PLAYLIST = [];
const MEDIA_STATE_KEY = 'dashcore_media_state';

const sanitizePlaylistForStorage = (playlist) => playlist.map((track) => ({
  ...track,
  src: track.src,
}));

const loadSavedMediaState = () => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = window.localStorage.getItem(MEDIA_STATE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to restore saved media state', error);
    return null;
  }
};

export const MediaProvider = ({ children }) => {
  const savedState = loadSavedMediaState();

  const [playlist, setPlaylist] = useState(() => savedState?.playlist ?? INITIAL_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => savedState?.currentTrackIndex ?? 0);
  const [isPlaying, setIsPlaying] = useState(() => savedState?.isPlaying ?? false);
  const [currentTime, setCurrentTime] = useState(() => savedState?.currentTime ?? 0);
  const audioRef = useRef(null);

  const currentTrack = useMemo(() => {
    const track = playlist[currentTrackIndex];
    if (!track || !track.src) return null;
    return track;
  }, [playlist, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.autoplay = isPlaying;
    audio.src = currentTrack.src;
    const restoredTime = Number.isFinite(currentTrack.resumeTime) ? currentTrack.resumeTime : 0;
    audio.currentTime = restoredTime;
    setCurrentTime(restoredTime);

    const resumePlayback = () => {
      if (!isPlaying) return;

      if (audio.paused) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Audio playback failed', error);
          setIsPlaying(false);
        });
      }
    };

    const updateTrackDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        const roundedDuration = Math.round(audio.duration);
        setPlaylist((prev) => prev.map((track, idx) => idx === currentTrackIndex ? { ...track, duration: roundedDuration } : track));
      }
    };

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      setPlaylist((prev) => prev.map((track, idx) => idx === currentTrackIndex ? { ...track, resumeTime: Math.floor(time) } : track));
    };

    const handleLoadedMetadata = () => {
      audio.currentTime = Number.isFinite(currentTrack.resumeTime) ? currentTrack.resumeTime : 0;
      setCurrentTime(audio.currentTime);
      updateTrackDuration();
      resumePlayback();
    };
    const handleDurationChange = () => {
      setCurrentTime(audio.currentTime);
      updateTrackDuration();
    };
    const handleCanPlay = () => {
      setCurrentTime(audio.currentTime);
      updateTrackDuration();
      resumePlayback();
    };
    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };
    const handleError = () => {
      console.error('Audio playback error', audio.error);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack?.src, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !currentTrack.src) return;

    if (isPlaying) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Audio playback failed', error);
        }
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.src]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(MEDIA_STATE_KEY, JSON.stringify({
      playlist: sanitizePlaylistForStorage(playlist),
      currentTrackIndex,
      currentTime,
      isPlaying,
    }));
  }, [playlist, currentTrackIndex, currentTime, isPlaying]);

  const resetSavedResumeTimes = () => {
    setPlaylist((prev) => prev.map((track) => ({ ...track, resumeTime: 0 })));
  };

  const addTrackToPlaylist = (file) => {
    const newTrack = {
      id: Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local file',
      album: 'Uploaded audio',
      duration: 0,
      cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
      src: '',
      resumeTime: 0,
    };

    setPlaylist((prev) => [newTrack, ...prev.map((track) => ({ ...track, resumeTime: 0 }))]);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPlaylist((prev) => prev.map((track) => track.id === newTrack.id ? { ...track, src: dataUrl } : track));
    };
    reader.readAsDataURL(file);
  };

  const removeTrackFromPlaylist = (trackId) => {
    const trackToRemove = playlist.find((track) => track.id === trackId);
    const removeIndex = playlist.findIndex((track) => track.id === trackId);
    const isRemovingCurrentTrack = removeIndex === currentTrackIndex;
    const wasPlaying = isPlaying;

    setPlaylist((prev) => {
      const updatedPlaylist = prev.filter((track) => track.id !== trackId);

      if (updatedPlaylist.length === 0) {
        setCurrentTrackIndex(0);
        setCurrentTime(0);
        setIsPlaying(false);
        return updatedPlaylist;
      }

      if (isRemovingCurrentTrack) {
        const nextIndex = removeIndex >= updatedPlaylist.length ? updatedPlaylist.length - 1 : removeIndex;
        setCurrentTrackIndex(nextIndex);
        setCurrentTime(0);
        setIsPlaying(wasPlaying);
      }

      return updatedPlaylist;
    });
  };

  const moveTrack = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const activeTrackId = currentTrack?.id;

    setPlaylist((prev) => {
      const next = [...prev];
      const [movedTrack] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedTrack);

      if (activeTrackId) {
        const nextIndex = next.findIndex((track) => track.id === activeTrackId);
        setCurrentTrackIndex(nextIndex);
      }

      return next;
    });
  };

  const startPlaylist = () => {
    if (playlist.length === 0) return;
    resetSavedResumeTimes();
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => setIsPlaying((prev) => !prev);

  const handleNext = () => {
    if (playlist.length <= 1) return;
    resetSavedResumeTimes();
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setCurrentTime(0);
  };

  const handlePrev = () => {
    if (playlist.length <= 1) return;
    resetSavedResumeTimes();
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setCurrentTime(0);
  };

  const playTrack = (trackIndex) => {
    if (playlist.length === 0) return;
    resetSavedResumeTimes();
    setCurrentTrackIndex(trackIndex);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <MediaContext.Provider value={{
        currentTrack,
        isPlaying,
        currentTime,
        playlist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        startPlaylist,
        handleTogglePlay,
        handleNext,
        handlePrev,
        playTrack,
        moveTrack,
        seek
      }}>
        {children}
      </MediaContext.Provider>
    </>
  );
};

export function useMedia() {
  const context = useContext(MediaContext);
  if (!context) throw new Error('useMedia must be used within a MediaProvider');
  return context;
}
