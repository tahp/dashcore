import { useEffect } from 'react'
import { useAppState } from './context/StateContext'

import StatusBar from './components/StatusBar'
import Dock from './components/Dock'

import Home from './screens/Home'
import Media from './screens/Media'
import Settings from './screens/Settings'
import Vehicle from './screens/Vehicle'
import Navigation from './screens/Navigation'

function App() {
  const { activeDisplay, setSystemState, setPriorityState, visibleOverlays, activeOverlays } = useAppState()

  useEffect(() => {
    const timer = setTimeout(() => {
      setSystemState('READY')
    }, 2000)
    return () => clearTimeout(timer)
  }, [setSystemState])

  const handleDismissPriority = (state) => {
    setPriorityState(state, false)
  }

  function renderContent() {
    const { type, state } = activeDisplay

    if (type === 'SYSTEM') {
      if (state === 'BOOT') {
        return (
          <div className="boot-screen">
            <h1>DASHCORE</h1>
            <div className="loader"></div>
          </div>
        )
      }
      return <div className="system-screen">{state}</div>
    }

    if (type === 'PRIORITY') {
      return (
        <div className="priority-screen">
          <div className={`alert-box ${state.toLowerCase()}`} onClick={() => handleDismissPriority(state)}>
            <h2>{state.replace('_', ' ')}</h2>
            <p>Tap to dismiss (Dev Mode)</p>
          </div>
        </div>
      )
    }

    // MAIN UI
    switch (state) {
      case 'MEDIA':
        return <Media />
      case 'SETTINGS':
        return <Settings />
      case 'VEHICLE':
        return <Vehicle />
      case 'NAVIGATION':
        return <Navigation />
      case 'HOME':
      default:
        return <Home />
    }
  }

  const isSystemState = activeDisplay.type === 'SYSTEM'

  return (
    <div className={`app ${isSystemState ? 'system-active' : ''}`}>
      {!isSystemState && <StatusBar />}

      <main className="content">
        {renderContent()}
        
        {/* Overlays Layer */}
        {!isSystemState && visibleOverlays.map(overlay => (
          <div key={overlay} className={`overlay ${overlay.toLowerCase()}`}>
             <span>{overlay.replace('_', ' ')} Active</span>
          </div>
        ))}
      </main>

      {!isSystemState && <Dock />}
    </div>
  )
}

export default App
