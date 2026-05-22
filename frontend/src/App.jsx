import { useState } from 'react'

import StatusBar from './components/StatusBar'
import Dock from './components/Dock'

import Home from './screens/Home'
import Media from './screens/Media'
import Settings from './screens/Settings'

function App() {

  const [currentScreen, setCurrentScreen] = useState('HOME')

  function renderScreen() {

    switch (currentScreen) {

      case 'MEDIA':
        return <Media />

      case 'SETTINGS':
        return <Settings />

      case 'HOME':
      default:
        return <Home />
    }
  }

  return (
    <div className="app">

      <StatusBar />

      <main className="content">
        {renderScreen()}
      </main>

      <Dock setCurrentScreen={setCurrentScreen} />

    </div>
  )
}

export default App
