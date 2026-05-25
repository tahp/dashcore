import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StateProvider } from './context/StateContext'
import { VehicleProvider } from './context/VehicleContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StateProvider>
      <VehicleProvider>
        <App />
      </VehicleProvider>
    </StateProvider>
  </StrictMode>,
)
