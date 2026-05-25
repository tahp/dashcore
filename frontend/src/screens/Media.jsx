import React from 'react';
import { useMedia } from '../context/MediaContext';
import { Play, Pause, SkipBack, SkipForward, ListMusic, Volume2 } from 'lucide-react';

function Media() {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    handleTogglePlay, 
    handleNext, 
    handlePrev,
    playlist 
  } = useMedia();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / currentTrack.duration) * 100;

  return (
    <div className="media-screen">
      <div className="media-layout">
        
        {/* Left Side: Now Playing Info */}
        <section className="now-playing-section">
          <div className="album-art-large">
            <img src={currentTrack.cover} alt={currentTrack.title} />
            <div className="ambient-glow-large" style={{ backgroundImage: `url(${currentTrack.cover})` }}></div>
          </div>
          
          <div className="track-details">
            <h2>{currentTrack.title}</h2>
            <p>{currentTrack.artist}</p>
          </div>

          <div className="playback-container">
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="time-labels">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>

            <div className="playback-controls-large">
              <button className="btn-control-secondary" onClick={handlePrev}>
                <SkipBack size={32} fill="white" />
              </button>
              <button className="btn-control-primary" onClick={handleTogglePlay}>
                {isPlaying ? <Pause size={40} fill="black" /> : <Play size={40} fill="black" />}
              </button>
              <button className="btn-control-secondary" onClick={handleNext}>
                <SkipForward size={32} fill="white" />
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Playlist / Queue */}
        <section className="playlist-section">
          <div className="playlist-header">
            <ListMusic size={20} />
            <span>Up Next</span>
          </div>
          <div className="playlist-items">
            {playlist.map((track, index) => (
              <div key={track.id} className={`playlist-item ${currentTrack.id === track.id ? 'active' : ''}`}>
                <img src={track.cover} alt={track.title} />
                <div className="item-info">
                  <span className="item-title">{track.title}</span>
                  <span className="item-artist">{track.artist}</span>
                </div>
                <span className="item-duration">{formatTime(track.duration)}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Media;
