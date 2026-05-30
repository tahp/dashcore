import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';

const MediaContext = createContext();

const INITIAL_PLAYLIST = [];
const MEDIA_STATE_KEY = 'dashcore_media_state';
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB safety limit for localStorage

const sanitizePlaylistForStorage = (playlist) => playlist.map((track) => ({
  ...track,
  // Only persist src if it's reasonably small (object URLs or short data URLs)
  // Large data URLs (>1MB) are excluded to prevent localStorage overflow
  src: track.src && track.src.length < MAX_STORAGE_SIZE ? track.src : '',
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
  const [isPlaying, setIsPlaying] = useState(false); // Never auto-play on load
  const [currentTime, setCurrentTime] = useState(() => savedState?.currentTime ?? 0);
  const audioRef = useRef(null);
  const saveTimerRef = useRef(null);

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
      setIsPlaying(false);
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

  // Debounced persistence to avoid excessive localStorage writes on every timeupdate
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      try {
        const stateToSave = JSON.stringify({
          playlist: sanitizePlaylistForStorage(playlist),
          currentTrackIndex,
          currentTime,
          isPlaying: false, // Never persist playing state
        });

        // Guard against exceeding localStorage quota
        if (stateToSave.length < MAX_STORAGE_SIZE) {
          window.localStorage.setItem(MEDIA_STATE_KEY, stateToSave);
        } else {
          console.warn('Media state too large to persist, skipping save');
        }
      } catch (error) {
        console.error('Failed to persist media state', error);
      }
    }, 2000); // Save at most every 2 seconds

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [playlist, currentTrackIndex, currentTime]);

  const resetSavedResumeTimes = useCallback(() => {
    setPlaylist((prev) => prev.map((track) => ({ ...track, resumeTime: 0 })));
  }, []);

  const addTrackToPlaylist = useCallback((file) => {
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

    setPlaylist((prev) => [newTrack, ...prev]);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPlaylist((prev) => prev.map((track) => track.id === newTrack.id ? { ...track, src: dataUrl } : track));
    };
    reader.onerror = () => {
      console.error('Failed to read audio file');
    };
    reader.readAsDataURL(file);
  }, []);

  const removeTrackFromPlaylist = useCallback((trackId) => {
    setPlaylist((prev) => {
      const removeIndex = prev.findIndex((track) => track.id === trackId);
      const updatedPlaylist = prev.filter((track) => track.id !== trackId);

      if (updatedPlaylist.length === 0) {
        setCurrentTrackIndex(0);
        setCurrentTime(0);
        setIsPlaying(false);
        return updatedPlaylist;
      }

      if (removeIndex === currentTrackIndex) {
        const nextIndex = removeIndex >= updatedPlaylist.length ? updatedPlaylist.length - 1 : removeIndex;
        setCurrentTrackIndex(nextIndex);
        setCurrentTime(0);
      } else if (removeIndex < currentTrackIndex) {
        setCurrentTrackIndex(prev => prev - 1);
      }

      return updatedPlaylist;
    });
  }, [currentTrackIndex]);

  const moveTrack = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    setPlaylist((prev) => {
      const next = [...prev];
      const [movedTrack] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedTrack);

      // Recalculate current track index
      const activeTrackId = prev[currentTrackIndex]?.id;
      if (activeTrackId) {
        const nextIndex = next.findIndex((track) => track.id === activeTrackId);
        setCurrentTrackIndex(nextIndex);
      }

      return next;
    });
  }, [currentTrackIndex]);

  const startPlaylist = useCallback(() => {
    if (playlist.length === 0) return;
    resetSavedResumeTimes();
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [playlist.length, resetSavedResumeTimes]);

  const handleTogglePlay = useCallback(() => setIsPlaying((prev) => !prev), []);

  const handleNext = useCallback(() => {
    if (playlist.length <= 1) return;
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setCurrentTime(0);
  }, [playlist.length]);

  const handlePrev = useCallback(() => {
    if (playlist.length <= 1) return;
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setCurrentTime(0);
  }, [playlist.length]);

  const playTrack = useCallback((trackIndex) => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex(trackIndex);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [playlist.length]);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  }, []);

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
