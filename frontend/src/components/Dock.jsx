import { LayoutGrid, Music, Settings, Car } from "lucide-react"
import { useAppState } from "../context/StateContext"

function Dock() {
  const { mainState, setMainState } = useAppState()

  return (
    <nav className="dock">
      <button 
        className={`dock-item ${mainState === 'HOME' ? 'active' : ''}`} 
        onClick={() => setMainState('HOME')}
      >
        <LayoutGrid size={24} />
        <span>Home</span>
      </button>

      <button 
        className={`dock-item ${mainState === 'VEHICLE' ? 'active' : ''}`} 
        onClick={() => setMainState('VEHICLE')}
      >
        <Car size={24} />
        <span>Vehicle</span>
      </button>

      <button 
        className={`dock-item ${mainState === 'MEDIA' ? 'active' : ''}`} 
        onClick={() => setMainState('MEDIA')}
      >
        <Music size={24} />
        <span>Media</span>
      </button>

      <button 
        className={`dock-item ${mainState === 'SETTINGS' ? 'active' : ''}`} 
        onClick={() => setMainState('SETTINGS')}
      >
        <Settings size={24} />
        <span>Settings</span>
      </button>
    </nav>
  )
}

export default Dock
