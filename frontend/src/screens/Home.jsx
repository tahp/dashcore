import { 
  Navigation, 
  Car, 
  Bluetooth, 
  Camera, 
  Play, 
  SkipBack, 
  SkipForward,
} from "lucide-react"
import { useAppState } from "../context/StateContext"

function Home() {
  const { setPriorityState } = useAppState()

  return (
    <div className="home-screen">

      <section className="hero-card">
        <div className="media-content">
          <div className="album-art">
            <div className="ambient-glow"></div>
          </div>
          <div className="media-info">
            <span className="now-playing">NOW PLAYING</span>
            <h2>After Hours</h2>
            <p>The Weeknd</p>
          </div>
        </div>

        <div className="media-controls">
          <button className="btn-secondary"><SkipBack size={24} fill="currentColor" /></button>
          <button className="btn-primary"><Play size={32} fill="currentColor" /></button>
          <button className="btn-secondary"><SkipForward size={24} fill="currentColor" /></button>
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
