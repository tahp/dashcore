import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedia } from '../context/MediaContext';
import { Play, Pause, SkipBack, SkipForward, ListMusic, Upload, Trash2 } from 'lucide-react';
import MediaImportModal from '../components/MediaImportModal';

function Media() {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    handleTogglePlay, 
    handleNext, 
    handlePrev,
    playlist,
    removeTrackFromPlaylist,
    startPlaylist,
    playTrack,
    moveTrack,
    seek
  } = useMedia();
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canSkip = playlist.length > 1;

  return (
    <div className="media-screen">
      <MediaImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />

      <div className="media-layout">
        
        {/* Left Side: Now Playing Info */}
        <section className="now-playing-section">
          <AnimatePresence mode="wait">
            {currentTrack ? (
              <motion.div 
                key={currentTrack.id}
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                transition={{ duration: 0.5 }}
                className="now-playing-container"
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
              >
                <motion.div 
                  className="album-art-large"
                  animate={{ 
                    scale: isPlaying ? [1, 1.02, 1] : 1,
                    rotate: isPlaying ? [0, 1, -1, 0] : 0
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 4, 
                    ease: "easeInOut" 
                  }}
                >
                  <img src={currentTrack.cover} alt={currentTrack.title} />
                  <div className="ambient-glow-large" style={{ backgroundImage: `url(${currentTrack.cover})` }}></div>
                </motion.div>
                
                <div className="track-details">
                  <motion.h2
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >{currentTrack.title}</motion.h2>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >{currentTrack.artist}</motion.p>
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
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="btn-control-secondary"
                      onClick={handlePrev}
                      disabled={!canSkip}
                      aria-label="Previous track"
                    >
                      <SkipBack size={32} fill="white" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="btn-control-primary" 
                      onClick={handleTogglePlay}
                    >
                      {isPlaying ? <Pause size={40} fill="black" /> : <Play size={40} fill="black" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="btn-control-secondary"
                      onClick={handleNext}
                      disabled={!canSkip}
                      aria-label="Next track"
                    >
                      <SkipForward size={32} fill="white" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="track-details"
              >
                <h2>No audio loaded</h2>
                <p>Upload a file to start playback.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Side: Playlist / Queue */}
        <section className="playlist-section">
          <div className="playlist-header">
            <ListMusic size={20} />
            <span>Up Next</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-control-secondary" 
                onClick={startPlaylist}
              >
                Start playlist
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-control-secondary" 
                onClick={() => setIsImportModalOpen(true)}
              >
                <Upload size={18} />
              </motion.button>
            </div>
          </div>
          <motion.div 
            className="playlist-items"
            initial="initial"
            animate="animate"
            variants={{
              animate: {
                transition: { staggerChildren: 0.05 }
              }
            }}
          >
            {playlist.map((track, index) => (
              <motion.div
                key={track.id}
                variants={{
                  initial: { opacity: 0, x: 20 },
                  animate: { opacity: 1, x: 0 }
                }}
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
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', x: 5 }}
              >
                <img src={track.cover} alt={track.title} />
                <div className="item-info">
                  <span className="item-title">{track.title}</span>
                  <span className="item-artist">{track.artist}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                  <span className="item-duration">{formatTime(track.duration || 0)}</span>
                  <motion.button
                    whileHover={{ scale: 1.2, color: '#ef4444' }}
                    whileTap={{ scale: 0.8 }}
                    className="btn-control-secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeTrackFromPlaylist(track.id);
                    }}
                    style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

      </div>
    </div>
  );
}

export default Media;
