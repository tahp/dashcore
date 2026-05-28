import React, { useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import { Play, Pause, SkipBack, SkipForward, ListMusic, Upload, Trash2 } from 'lucide-react';

function Media() {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    handleTogglePlay, 
    handleNext, 
    handlePrev,
    playlist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    startPlaylist,
    playTrack,
    moveTrack,
    seek
  } = useMedia();
  const fileInputRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      addTrackToPlaylist(file);
    }
    event.target.value = '';
  };

  const canSkip = playlist.length > 1;

  return (
    <div className="media-screen">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div className="media-layout">
        
        {/* Left Side: Now Playing Info */}
        <section className="now-playing-section">
          {currentTrack ? (
            <>
              <div className="album-art-large">
                <img src={currentTrack.cover} alt={currentTrack.title} />
                <div className="ambient-glow-large" style={{ backgroundImage: `url(${currentTrack.cover})` }}></div>
              </div>
              
              <div className="track-details">
                <h2>{currentTrack.title}</h2>
                <p>{currentTrack.artist}</p>
              </div>

              <div className="playback-container">
                <input
                  type="range"
                  min="0"
                  max={currentTrack.duration || 0}
                  step="1"
                  value={currentTime}
                  onChange={(event) => seek(Number(event.target.value))}
                  aria-label="Seek track"
                  style={{
                    width: '100%',
                    accentColor: '#86efac',
                    marginBottom: '0.75rem'
                  }}
                />
                <div className="time-labels">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentTrack.duration || 0)}</span>
                </div>

                <div className="playback-controls-large">
                  <button
                    className="btn-control-secondary"
                    onClick={handlePrev}
                    disabled={!canSkip}
                    aria-label="Previous track"
                  >
                    <SkipBack size={32} fill="white" />
                  </button>
                  <button className="btn-control-primary" onClick={handleTogglePlay}>
                    {isPlaying ? <Pause size={40} fill="black" /> : <Play size={40} fill="black" />}
                  </button>
                  <button
                    className="btn-control-secondary"
                    onClick={handleNext}
                    disabled={!canSkip}
                    aria-label="Next track"
                  >
                    <SkipForward size={32} fill="white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="track-details">
              <h2>No audio loaded</h2>
              <p>Upload a file to start playback.</p>
            </div>
          )}
        </section>

        {/* Right Side: Playlist / Queue */}
        <section className="playlist-section">
          <div className="playlist-header">
            <ListMusic size={20} />
            <span>Up Next</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button className="btn-control-secondary" onClick={startPlaylist}>
                Start playlist
              </button>
              <button className="btn-control-secondary" onClick={handleUploadClick}>
                <Upload size={18} />
              </button>
            </div>
          </div>
          <div className="playlist-items">
            {playlist.map((track, index) => (
              <div
                key={track.id}
                className={`playlist-item ${currentTrack?.id === track.id ? 'active' : ''}`}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', String(track.id));
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const draggedId = Number(event.dataTransfer.getData('text/plain'));
                  const draggedIndex = playlist.findIndex((item) => item.id === draggedId);
                  if (draggedIndex >= 0 && draggedIndex !== index) {
                    moveTrack(draggedIndex, index);
                  }
                }}
                onClick={() => playTrack(index)}
                style={{ cursor: 'grab' }}
              >
                <img src={track.cover} alt={track.title} />
                <div className="item-info">
                  <span className="item-title">{track.title}</span>
                  <span className="item-artist">{track.artist}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                  <span className="item-duration">{formatTime(track.duration || 0)}</span>
                  <button
                    className="btn-control-secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeTrackFromPlaylist(track.id);
                    }}
                    style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Media;
