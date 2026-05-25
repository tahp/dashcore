import React, { createContext, useContext, useState, useEffect } from 'react';

const MediaContext = createContext();

const INITIAL_PLAYLIST = [
  { id: 1, title: 'After Hours', artist: 'The Weeknd', album: 'After Hours', duration: 362, cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop' },
  { id: 2, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, cover: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&h=400&fit=crop' },
  { id: 3, title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', duration: 230, cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop' },
  { id: 4, title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: 215, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
];

export const MediaProvider = ({ children }) => {
  const [playlist] = useState(INITIAL_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const handleTogglePlay = () => setIsPlaying(!isPlaying);
  
  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setCurrentTime(0);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setCurrentTime(0);
  };

  const seek = (time) => setCurrentTime(time);

  return (
    <MediaContext.Provider value={{
      currentTrack,
      isPlaying,
      currentTime,
      playlist,
      handleTogglePlay,
      handleNext,
      handlePrev,
      seek
    }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) throw new Error('useMedia must be used within a MediaProvider');
  return context;
};
