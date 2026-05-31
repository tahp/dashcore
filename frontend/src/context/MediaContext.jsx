/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getTracks, saveTrack, deleteTrack, clearTracks } from '../utils/db';

const MediaContext = createContext();

const INITIAL_PLAYLIST = [];
const MEDIA_STATE_KEY = 'dashcore_media_state';

const loadSavedMediaMetadata = () => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = window.localStorage.getItem(MEDIA_STATE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to restore saved media metadata', error);
    return null;
  }
};

export const MediaProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState(INITIAL_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const audioRef = useRef(null);
  const saveTimerRef = useRef(null);
  const objectUrlsRef = useRef(new Map());

  const currentTrack = useMemo(() => {
    const track = playlist[currentTrackIndex];
    if (!track || !track.src) return null;
    return track;
  }, [playlist, currentTrackIndex]);

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
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const startPlaylist = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [playlist.length]);

  // Load tracks from IndexedDB on mount
  useEffect(() => {
    const initMedia = async () => {
      try {
        const savedTracks = await getTracks();
        const savedMeta = loadSavedMediaMetadata();
        
        const tracksWithSrc = savedTracks.map(t => {
          const url = URL.createObjectURL(t.file);
          objectUrlsRef.current.set(t.id, url);
          return { ...t, src: url };
        });

        // Restore resume times from metadata if available
        const mergedPlaylist = tracksWithSrc.map(t => {
          const meta = savedMeta?.playlist?.find(p => p.id === t.id);
          return meta ? { ...t, resumeTime: meta.resumeTime || 0, duration: meta.duration || t.duration } : t;
        });

        setPlaylist(mergedPlaylist);
        
        if (savedMeta) {
          setCurrentTrackIndex(savedMeta.currentTrackIndex < mergedPlaylist.length ? savedMeta.currentTrackIndex : 0);
          setCurrentTime(savedMeta.currentTime || 0);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize media library', error);
        setIsInitialized(true);
      }
    };
    initMedia();

    const urls = objectUrlsRef.current;
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Audio element management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !isInitialized) return;

    // Only update src if it changed
    if (audio.src !== currentTrack.src) {
      audio.src = currentTrack.src;
      const restoredTime = Number.isFinite(currentTrack.resumeTime) ? currentTrack.resumeTime : 0;
      audio.currentTime = restoredTime;
      setCurrentTime(restoredTime);
    }

    const resumePlayback = () => {
      if (!isPlaying) return;
      if (audio.paused) {
        audio.play().catch((error) => {
          if (error.name !== 'AbortError') console.error('Audio playback failed', error);
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
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      updateTrackDuration();
      resumePlayback();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, currentTrackIndex, isInitialized, isPlaying, handleNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !currentTrack.src || !isInitialized) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        if (error.name !== 'AbortError') console.error('Audio playback failed', error);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, isInitialized]);

  // Persistence (Metadata only in localStorage, Files in IndexedDB)
  useEffect(() => {
    if (!isInitialized) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      try {
        const metadata = {
          playlist: playlist.map(t => ({ id: t.id, resumeTime: t.id === currentTrack?.id ? currentTime : (t.resumeTime || 0), duration: t.duration })),
          currentTrackIndex,
          currentTime,
        };
        window.localStorage.setItem(MEDIA_STATE_KEY, JSON.stringify(metadata));
      } catch (error) {
        console.error('Failed to persist media metadata', error);
      }
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [playlist, currentTrackIndex, currentTime, isInitialized, currentTrack?.id]);

  const addTrackToPlaylist = useCallback(async (file) => {
    const id = Date.now() + Math.random();
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.set(id, url);

    const newTrack = {
      id,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local file',
      album: 'Imported audio',
      duration: 0,
      cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
      src: url,
      resumeTime: 0,
    };

    await saveTrack(newTrack, file);
    setPlaylist((prev) => [newTrack, ...prev]);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const importTracks = useCallback(async (filesOrPaths, onProgress) => {
    let count = 0;
    const importedTracks = [];
    for (const item of filesOrPaths) {
      let file = item;
      let sourcePath = null;
      let fileName = null;

      if (typeof item === 'string') {
        sourcePath = item;
        fileName = item.split('/').pop() || item.split('\\').pop();
      } else {
        fileName = item.name;
        sourcePath = item.name; // Use filename as path for manual uploads as a basic dedup
      }

      // Check for duplicates
      const isDuplicate = playlist.some(t => t.sourcePath === sourcePath || (t.title === fileName.replace(/\.[^/.]+$/, '')));
      const isAlreadyImported = importedTracks.some(t => t.sourcePath === sourcePath || (t.title === fileName.replace(/\.[^/.]+$/, '')));
      if (isDuplicate || isAlreadyImported) {
        continue;
      }

      if (typeof item === 'string') {
        try {
          const res = await fetch(`/api/media/file?path=${encodeURIComponent(item)}`);
          if (!res.ok) throw new Error('Network response was not ok');
          const blob = await res.blob();
          file = new File([blob], fileName, { type: blob.type || 'audio/mpeg' });
        } catch (e) {
          console.error('Failed to fetch file:', item, e);
          continue;
        }
      }

      const id = Date.now() + Math.random();
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.set(id, url);

      const newTrack = {
        id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local file',
        album: 'Imported audio',
        duration: 0,
        cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
        src: url,
        resumeTime: 0,
        sourcePath, // Store for future dedup
      };

      await saveTrack(newTrack, file);
      importedTracks.push(newTrack);
      count++;
      if (onProgress) onProgress(count, filesOrPaths.length);
    }
    
    if (importedTracks.length > 0) {
      setPlaylist((prev) => [...importedTracks, ...prev]);
    }
    return importedTracks;
  }, [playlist]);

  const scanDevice = useCallback(async () => {
    try {
      const response = await fetch('/api/media/scan');
      if (!response.ok) throw new Error('Failed to scan device');
      const data = await response.json();
      return data; // Returns { audioCount, videoCount, audioFiles, videoFiles }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const convertMP4 = useCallback((files, onProgress, onComplete, onError) => {
    fetch('/api/media/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files })
    }).then(async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop(); // Keep the incomplete part

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const dataStr = part.replace('data: ', '');
              try {
                const data = JSON.parse(dataStr);
                if (data.type === 'progress' && onProgress) {
                  onProgress(data);
                } else if (data.type === 'success' && onProgress) {
                  onProgress(data); // Can handle success per file
                } else if (data.type === 'error' && onError) {
                  onError(data);
                } else if (data.type === 'complete' && onComplete) {
                  onComplete();
                }
              } catch (e) {
                console.error('Failed to parse SSE data', e);
              }
            }
          }
        }
      }
    }).catch(err => {
      console.error(err);
      if (onError) onError({ error: err.message });
    });
  }, []);

  const hasSavedScanLocation = useCallback(async () => {
    // With the new backend, we no longer need user interaction for a directory handle.
    return true;
  }, []);

  const removeTrackFromPlaylist = useCallback(async (trackId) => {
    await deleteTrack(trackId);
    
    // Cleanup Object URL
    const url = objectUrlsRef.current.get(trackId);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(trackId);
    }

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

  const clearLibrary = useCallback(async () => {
    await clearTracks();
    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
    setPlaylist([]);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(false);
    window.localStorage.removeItem(MEDIA_STATE_KEY);
  }, []);

  const moveTrack = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setPlaylist((prev) => {
      const next = [...prev];
      const [movedTrack] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedTrack);
      const activeTrackId = prev[currentTrackIndex]?.id;
      if (activeTrackId) {
        const nextIndex = next.findIndex((track) => track.id === activeTrackId);
        setCurrentTrackIndex(nextIndex);
      }
      return next;
    });
  }, [currentTrackIndex]);

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <MediaContext.Provider value={{
        currentTrack,
        isPlaying,
        currentTime,
        playlist,
        addTrackToPlaylist,
        importTracks,
        scanDevice,
        convertMP4,
        hasSavedScanLocation,
        removeTrackFromPlaylist,
        clearLibrary,
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
