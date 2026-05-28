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
import { useAppState } from "../context/StateContext"
import { useMedia } from "../context/MediaContext"

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
    <div className="home-screen">

      <section className="hero-card" onClick={() => setMainState('MEDIA')} style={{ cursor: 'pointer' }}>
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
          <button className="btn-secondary" onClick={handlePrev} disabled={!playlist.length}><SkipBack size={24} fill="currentColor" /></button>
          <button className="btn-primary" onClick={handleTogglePlay} disabled={!playlist.length}>
            {hasTrack && isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
          <button className="btn-secondary" onClick={handleNext} disabled={!playlist.length}><SkipForward size={24} fill="currentColor" /></button>
        </div>
      </section>

      <section className="quick-action nav-card" onClick={() => setMainState('NAVIGATION')}>
        <div className="card-content">
          <NavigationIcon size={32} className="icon-accent" />
          <div className="card-text">
            <span className="label">Navigation</span>
            <span className="sub-label">Route to Home</span>
          </div>
        </div>
      </section>

      <section className="quick-action vehicle-card" onClick={() => setPriorityState('LOW_VOLTAGE', true)}>
        <Car size={28} />
        <span>Vehicle</span>
      </section>

      <section className="quick-action bt-card">
        <Bluetooth size={28} />
        <span>Bluetooth</span>
      </section>

      <section className="quick-action camera-card" onClick={() => setPriorityState('REVERSE_CAMERA', true)}>
        <Camera size={28} />
        <span>Cameras</span>
      </section>

    </div>
  )
}

export default Home
