import { motion } from "framer-motion"
import { LayoutGrid, Music, Settings, Car, Map } from "lucide-react"
import { useAppState } from "../context/StateContext"

function Dock() {
  const { mainState, setMainState } = useAppState()

  const dockItemVariants = {
    hover: { scale: 1.1, y: -5 },
    tap: { scale: 0.9 },
    active: { scale: 1.1, color: "#44aaff" }
  }

  const items = [
    { id: 'HOME', icon: LayoutGrid, label: 'Home' },
    { id: 'NAVIGATION', icon: Map, label: 'Nav' },
    { id: 'VEHICLE', icon: Car, label: 'Vehicle' },
    { id: 'MEDIA', icon: Music, label: 'Media' },
    { id: 'SETTINGS', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="dock">
      {items.map(({ id, icon: Icon, label }) => (
        <motion.button 
          key={id}
          className={`dock-item ${mainState === id ? 'active' : ''}`} 
          onClick={() => setMainState(id)}
          variants={dockItemVariants}
          whileHover="hover"
          whileTap="tap"
          animate={mainState === id ? "active" : ""}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Icon size={24} />
          <span>{label}</span>
        </motion.button>
      ))}
    </nav>
  )
}

export default Dock
