import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StateProvider } from './context/StateContext'
import { VehicleProvider } from './context/VehicleContext'
import { MediaProvider } from './context/MediaContext'
import { NavigationProvider } from './context/NavigationContext'
import { SettingsProvider } from './context/SettingsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StateProvider>
      <VehicleProvider>
        <MediaProvider>
          <NavigationProvider>
            <SettingsProvider>
              <App />
            </SettingsProvider>
          </NavigationProvider>
        </MediaProvider>
      </VehicleProvider>
    </StateProvider>
  </StrictMode>,
)
