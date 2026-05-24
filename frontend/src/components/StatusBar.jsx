import { Bluetooth, Clock, Zap } from "lucide-react"

function StatusBar() {
  return (
    <header className="topbar">
      <div className="status-left">
        <Bluetooth size={16} className="icon-dim" />
      </div>
      <div className="status-center">
        <Clock size={16} className="icon-dim" />
        <span>3:32 PM</span>
      </div>
      <div className="status-right">
        <Zap size={16} className="icon-accent" />
        <span>13.8V</span>
      </div>
    </header>
  )
}

export default StatusBar
