import { 
  Navigation, 
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
  const { currentTrack, isPlaying, handleTogglePlay, handleNext, handlePrev } = useMedia()

  return (
    <div className="home-screen">

      <section className="hero-card" onClick={() => setMainState('MEDIA')} style={{ cursor: 'pointer' }}>
        <div className="media-content">
          <div className="album-art">
            <img src={currentTrack.cover} alt={currentTrack.title} style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }} />
            <div className="ambient-glow" style={{ backgroundImage: `url(${currentTrack.cover})`, backgroundSize: 'cover' }}></div>
          </div>
          <div className="media-info">
            <span className="now-playing">{isPlaying ? 'NOW PLAYING' : 'PAUSED'}</span>
            <h2>{currentTrack.title}</h2>
            <p>{currentTrack.artist}</p>
          </div>
        </div>

        <div className="media-controls" onClick={(e) => e.stopPropagation()}>
          <button className="btn-secondary" onClick={handlePrev}><SkipBack size={24} fill="currentColor" /></button>
          <button className="btn-primary" onClick={handleTogglePlay}>
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
          <button className="btn-secondary" onClick={handleNext}><SkipForward size={24} fill="currentColor" /></button>
        </div>
      </section>

      <section className="quick-action nav-card">
        <div className="card-content">
          <Navigation size={32} className="icon-accent" />
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
