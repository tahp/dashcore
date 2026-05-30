# Dashcore

A 7-inch Raspberry Pi-based car dashboard UI built with React and Vite. Dashcore provides a modern, touch-friendly interface for vehicle telemetry, media playback, navigation, and system settings.

## Features

- **Home Screen** - Quick access cards for media, navigation, vehicle status, Bluetooth, and cameras
- **Media Player** - Local audio file playback with playlist management, drag-to-reorder, seek, and persistent state
- **Vehicle Telemetry** - Real-time gauges for speed, RPM, coolant temperature, voltage, and fuel level with hardware simulation mode
- **Navigation** - Route planning UI with recent destinations (mock/placeholder)
- **Settings** - Display brightness, night mode, unit system (metric/imperial), volume, and developer tools
- **Priority State System** - Interrupt-driven alerts for critical warnings (low voltage, overheat, reverse camera)
- **Overlay System** - Non-blocking notifications (volume, incoming call, voice assistant)

## Architecture

The app uses a layered state machine with priority-based display logic:

```
System States (BOOT, READY, SLEEP, SHUTDOWN)
  -> Priority States (CRITICAL_WARNING > OVERHEAT > LOW_VOLTAGE > REVERSE_CAMERA)
       -> Main UI (HOME, MEDIA, NAVIGATION, VEHICLE, SETTINGS)
             -> Overlays (VOLUME, INCOMING_CALL, VOICE_ASSISTANT)
```

See [`docs/states.md`](docs/states.md) for the full state model documentation.

## Tech Stack

- **Frontend**: React 19 + Vite 8
- **Icons**: Lucide React
- **Styling**: Custom CSS with glassmorphism design language
- **Target**: Chromium kiosk on Raspberry Pi (7" 1024x600 display)

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # StatusBar, Dock
│   ├── context/        # State, Vehicle, Media, Navigation, Settings providers
│   ├── screens/        # Home, Media, Vehicle, Navigation, Settings
│   ├── assets/         # Branding and static images
│   ├── App.jsx         # Root component with display routing
│   ├── main.jsx        # Provider composition and render
│   └── index.css       # Global styles
├── public/             # Static assets
└── package.json
```

## Development

- Toggle **Hardware Simulation** in Settings to enable/disable live telemetry simulation
- Use **Dev Scenarios** on the Vehicle screen to trigger alert states
- The app persists media playlist and settings to localStorage

## License

MIT
