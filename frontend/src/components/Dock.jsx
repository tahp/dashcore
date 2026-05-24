import { LayoutGrid, Music, Settings } from "lucide-react"

function Dock({ setCurrentScreen }) {
  return (
    <nav className="dock">
      <button className="dock-item" onClick={() => setCurrentScreen('HOME')}>
        <LayoutGrid size={24} />
        <span>Home</span>
      </button>

      <button className="dock-item" onClick={() => setCurrentScreen('MEDIA')}>
        <Music size={24} />
        <span>Media</span>
      </button>

      <button className="dock-item" onClick={() => setCurrentScreen('SETTINGS')}>
        <Settings size={24} />
        <span>Settings</span>
      </button>
    </nav>
  )
}

export default Dock
