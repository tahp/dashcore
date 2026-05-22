#docs/states.md

# Dashcore State Architecture

## Philosophy

Dashcore is a state-driven automotive interface.

The UI does not directly control behavior.

Instead:
- the system enters a state
- the UI reacts to the current state
- higher-priority states can override lower-priority states

This architecture is designed for:
- touchscreen operation
- low driver distraction
- fast interaction
- predictable behavior
- future hardware integration

---

# State Categories

## 1. System States

Global operating conditions.

| State | Description |
|---|---|
| BOOT | System starting |
| READY | System operational |
| SLEEP | Low-power standby |
| SHUTDOWN | Powering off |
| ERROR | Critical failure state |

---

## 2. Main UI States

Primary fullscreen interfaces.

| State | Description |
|---|---|
| HOME | Dashboard overview |
| MEDIA | Music and playback |
| NAVIGATION | Maps and routing |
| VEHICLE | OBD2 and vehicle data |
| SETTINGS | System configuration |

---

## 3. Overlay States

Temporary UI layers shown above active screens.

| State | Description |
|---|---|
| VOLUME_OVERLAY | Volume adjustment popup |
| NOTIFICATION | Temporary notification |
| INCOMING_CALL | Incoming Bluetooth call |
| VOICE_ASSISTANT | Voice interaction active |

Overlays should:
- not fully replace main UI
- disappear automatically when appropriate
- interrupt minimally

---

## 4. Priority States

Highest-priority operational states.

These may override all other UI states.

| State | Description |
|---|---|
| REVERSE_CAMERA | Rear camera active |
| LOW_VOLTAGE | Vehicle voltage warning |
| OVERHEAT | Thermal warning |
| CRITICAL_WARNING | Critical system alert |

Priority states must:
- display immediately
- remain visible until resolved
- minimize interaction complexity

---

# State Priority Order

Highest priority at top.

1. CRITICAL_WARNING
2. OVERHEAT
3. LOW_VOLTAGE
4. REVERSE_CAMERA
5. INCOMING_CALL
6. VOICE_ASSISTANT
7. VOLUME_OVERLAY
8. MAIN_UI_STATES

---

# Initial Startup Flow

BOOT
→ READY
→ HOME

---

# Example State Transitions

MEDIA
→ VOLUME_OVERLAY
→ MEDIA

MEDIA
→ INCOMING_CALL
→ MEDIA

NAVIGATION
→ REVERSE_CAMERA
→ NAVIGATION

---

# Design Rules

## Rule 1
No hidden navigation required for critical actions.

## Rule 2
All primary controls must be reachable within one interaction.

## Rule 3
Driver attention takes priority over feature density.

## Rule 4
Overlays should avoid fully blocking navigation context.

## Rule 5
Animations should remain fast and subtle.

---

# Future Planned States

Potential future additions:

- CAMERA_FRONT
- CAMERA_360
- DSP_TUNING
- NIGHT_MODE
- PARKING_MODE
- DIAGNOSTICS
- OTA_UPDATE
- PHONE_PROJECTION
- SPLASH_SCREEN
- GARAGE_MODE

---

# Current Development Phase

Current focus:
- dashboard shell
- navigation dock
- responsive layout
- touchscreen optimization

Future integrations:
- Bluetooth
- OBD2
- GPIO
- cameras
- audio DSP
- automation
