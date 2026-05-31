import { 
  Navigation as NavigationIcon, 
  Car, 
  Bluetooth, 
  Camera, 
  Play, 
  Pause,
  SkipBack, 
  SkipForward,
} from "lucide-react"
import { motion } from "framer-motion"
import { useAppState } from "../context/StateContext"
import { useMedia } from "../context/MediaContext"

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  hover: {
    scale: 1.02,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98
  }
}

function Home() {
  const { setPriorityState, setMainState } = useAppState()
  const { currentTrack, isPlaying, handleTogglePlay, handleNext, handlePrev, playlist } = useMedia()

  const safeTrack = currentTrack || {
    title: 'No audio loaded',
    artist: 'Upload a file to start playback',
    cover: '',
  }

  const hasTrack = Boolean(currentTrack)

  return (
    <motion.div 
      className="home-screen"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >

      <motion.section 
        className="hero-card" 
        variants={cardVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setMainState('MEDIA')} 
        style={{ cursor: 'pointer' }}
      >
        <div className="media-content">
          <div className="album-art" style={{ background: hasTrack ? 'transparent' : 'rgba(255,255,255,0.08)' }}>
            {hasTrack ? (
              <>
                <img src={safeTrack.cover} alt={safeTrack.title} style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }} />
                <div className="ambient-glow" style={{ backgroundImage: `url(${safeTrack.cover})`, backgroundSize: 'cover' }}></div>
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px', textAlign: 'center', padding: '12px' }}>
                No audio loaded
              </div>
            )}
          </div>
          <div className="media-info">
            <span className="now-playing">{hasTrack ? (isPlaying ? 'NOW PLAYING' : 'PAUSED') : 'WAITING FOR AUDIO'}</span>
            <h2>{safeTrack.title}</h2>
            <p>{safeTrack.artist}</p>
          </div>
        </div>

        <div className="media-controls" onClick={(e) => e.stopPropagation()}>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
            className="btn-secondary" 
            onClick={handlePrev} 
            disabled={!playlist.length}
          >
            <SkipBack size={24} fill="currentColor" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
            className="btn-primary" 
            onClick={handleTogglePlay} 
            disabled={!playlist.length}
          >
            {hasTrack && isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
            className="btn-secondary" 
            onClick={handleNext} 
            disabled={!playlist.length}
          >
            <SkipForward size={24} fill="currentColor" />
          </motion.button>
        </div>
      </motion.section>

      <motion.section 
        className="quick-action nav-card" 
        variants={cardVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setMainState('NAVIGATION')}
      >
        <div className="card-content">
          <NavigationIcon size={32} className="icon-accent" />
          <div className="card-text">
            <span className="label">Navigation</span>
            <span className="sub-label">Route to Home</span>
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="quick-action vehicle-card" 
        variants={cardVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setPriorityState('LOW_VOLTAGE', true)}
      >
        <Car size={28} />
        <span>Vehicle</span>
      </motion.section>

      <motion.section 
        className="quick-action bt-card"
        variants={cardVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Bluetooth size={28} />
        <span>Bluetooth</span>
      </motion.section>

      <motion.section 
        className="quick-action camera-card" 
        variants={cardVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setPriorityState('REVERSE_CAMERA', true)}
      >
        <Camera size={28} />
        <span>Cameras</span>
      </motion.section>

    </motion.div>
  )
}

export default Home
