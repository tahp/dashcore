import { Bluetooth, Clock, Zap, Volume2 } from "lucide-react"
import { useAppState } from "../context/StateContext"

function StatusBar() {
  const { setOverlay } = useAppState()

  const triggerVolume = () => {
    setOverlay('VOLUME_OVERLAY', true)
    setTimeout(() => {
      setOverlay('VOLUME_OVERLAY', false)
    }, 3000)
  }

  return (
    <header className="topbar">
      <div className="status-left">
        <Bluetooth size={16} className="icon-dim" />
      </div>
      <div className="status-center">
        <Clock size={16} className="icon-dim" />
        <span>3:32 PM</span>
      </div>
      <div className="status-right" style={{ gap: '16px' }}>
        <Volume2 
          size={16} 
          className="icon-dim" 
          style={{ cursor: 'pointer' }} 
          onClick={triggerVolume}
        />
        <div className="status-right">
          <Zap size={16} className="icon-accent" />
          <span>13.8V</span>
        </div>
      </div>
    </header>
  )
}

export default StatusBar
