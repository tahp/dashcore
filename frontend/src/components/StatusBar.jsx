import { useState, useEffect, useRef } from "react"
import { Bluetooth, Clock, Zap, Volume2 } from "lucide-react"
import { useAppState } from "../context/StateContext"
import { useVehicle } from "../context/VehicleContext"

function StatusBar() {
  const { setOverlay } = useAppState()
  const { data } = useVehicle()
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()))
  const volumeTimerRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const triggerVolume = () => {
    // Clear any existing timer to avoid stacking
    if (volumeTimerRef.current) {
      clearTimeout(volumeTimerRef.current)
    }
    setOverlay('VOLUME_OVERLAY', true)
    volumeTimerRef.current = setTimeout(() => {
      setOverlay('VOLUME_OVERLAY', false)
      volumeTimerRef.current = null
    }, 3000)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (volumeTimerRef.current) {
        clearTimeout(volumeTimerRef.current)
      }
    }
  }, [])

  return (
    <header className="topbar">
      <div className="status-left">
        <Bluetooth size={16} className="icon-dim" />
      </div>
      <div className="status-center">
        <Clock size={16} className="icon-dim" />
        <span>{currentTime}</span>
      </div>
      <div className="status-right" style={{ gap: '16px' }}>
        <Volume2 
          size={16} 
          className="icon-dim" 
          style={{ cursor: 'pointer' }} 
          onClick={triggerVolume}
        />
        <div className="status-right">
          <Zap size={16} className={`icon-accent ${data.voltage < 12 ? 'low-voltage' : ''}`} />
          <span>{data.voltage}V</span>
        </div>
      </div>
    </header>
  )
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default StatusBar
