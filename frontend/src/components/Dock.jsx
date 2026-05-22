function Dock({ setCurrentScreen }) {
  return (
    <nav className="dock">

      <button onClick={() => setCurrentScreen('HOME')}>
        Home
      </button>

      <button onClick={() => setCurrentScreen('MEDIA')}>
        Music
      </button>

      <button onClick={() => setCurrentScreen('SETTINGS')}>
        Settings
      </button>

    </nav>
  )
}

export default Dock
