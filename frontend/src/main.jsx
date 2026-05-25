import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StateProvider } from './context/StateContext'
import { VehicleProvider } from './context/VehicleContext'
import { MediaProvider } from './context/MediaContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StateProvider>
      <VehicleProvider>
        <MediaProvider>
          <App />
        </MediaProvider>
      </VehicleProvider>
    </StateProvider>
  </StrictMode>,
)
