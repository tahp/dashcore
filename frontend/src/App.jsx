import StatusBar from './components/StatusBar'
import Dock from './components/Dock'

function App() {
  return (
    <div className="app">

      <StatusBar />

      <main className="content">
        <h1>Dashcore</h1>
      </main>

      <Dock />

    </div>
  )
}

export default App
