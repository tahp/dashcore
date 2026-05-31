import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppState } from './context/StateContext'
import dashcoreLogo from './assets/branding/dashcore-logo.png'

import StatusBar from './components/StatusBar'
import Dock from './components/Dock'
import AutoDiscoverMedia from './components/AutoDiscoverMedia'

import Home from './screens/Home'
import Media from './screens/Media'
import Settings from './screens/Settings'
import Vehicle from './screens/Vehicle'
import Navigation from './screens/Navigation'

const screenVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
}

function App() {
  const { activeDisplay, setSystemState, setPriorityState, visibleOverlays } = useAppState()

  const [bootFading, setBootFading] = useState(false)

  useEffect(() => {
    // Wait for app to be fully ready, then fade out boot screen
    const readyTimer = setTimeout(() => {
      setBootFading(true)
      // After fade animation completes, switch to READY state
      const fadeTimer = setTimeout(() => {
        setSystemState('READY')
      }, 600) // Match CSS transition duration
      return () => clearTimeout(fadeTimer)
    }, 1500)
    return () => clearTimeout(readyTimer)
  }, [setSystemState])

  const handleDismissPriority = (state) => {
    setPriorityState(state, false)
  }

  function renderContent() {
    const { type, state } = activeDisplay

    if (type === 'SYSTEM') {
      if (state === 'BOOT') {
        return (
          <div key="BOOT" className={`boot-screen ${bootFading ? 'fade-out' : ''}`}>
            <motion.img 
              src={dashcoreLogo} 
              alt="Dashcore" 
              className="boot-logo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <div className="boot-loader">
              <motion.div 
                className="boot-loader-bar"
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              ></motion.div>
            </div>
          </div>
        )
      }
      return <div key="SYSTEM" className="system-screen">{state}</div>
    }

    if (type === 'PRIORITY') {
      return (
        <motion.div 
          key="PRIORITY"
          className="priority-screen"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className={`alert-box ${state.toLowerCase()}`} onClick={() => handleDismissPriority(state)}>
            <h2>{state.replace('_', ' ')}</h2>
            <p>Tap to dismiss (Dev Mode)</p>
          </div>
        </motion.div>
      )
    }

    // MAIN UI
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={screenVariants.transition}
          className="screen-wrapper"
          style={{ height: '100%', width: '100%' }}
        >
          {state === 'MEDIA' && <Media />}
          {state === 'SETTINGS' && <Settings />}
          {state === 'VEHICLE' && <Vehicle />}
          {state === 'NAVIGATION' && <Navigation />}
          {state === 'HOME' && <Home />}
        </motion.div>
      </AnimatePresence>
    )
  }

  const isSystemState = activeDisplay.type === 'SYSTEM'

  return (
    <div className={`app ${isSystemState ? 'system-active' : ''}`}>
      <AutoDiscoverMedia />
      {!isSystemState && <StatusBar />}

      <main className="content">
        {renderContent()}
        
        {/* Overlays Layer */}
        {!isSystemState && (
          <div className="overlays-container">
            <AnimatePresence>
              {visibleOverlays.map(overlay => (
                <motion.div 
                  key={overlay} 
                  className={`overlay ${overlay.toLowerCase()}`}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.9 }}
                >
                  <span>{overlay.replace('_', ' ')} Active</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {!isSystemState && <Dock />}
    </div>
  )
}

export default App
