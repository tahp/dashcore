import React, { createContext, useContext, useState, useMemo } from 'react';

const StateContext = createContext();

export const STATE_PRIORITY = {
  CRITICAL_WARNING: 100,
  OVERHEAT: 90,
  LOW_VOLTAGE: 80,
  REVERSE_CAMERA: 70,
  INCOMING_CALL: 60,
  VOICE_ASSISTANT: 50,
  VOLUME_OVERLAY: 40,
  MAIN_UI: 0,
};

export const StateProvider = ({ children }) => {
  // 1. System State
  const [systemState, setSystemState] = useState('BOOT'); // BOOT, READY, SLEEP, SHUTDOWN, ERROR

  // 2. Main UI State
  const [mainState, setMainState] = useState('HOME'); // HOME, MEDIA, NAVIGATION, VEHICLE, SETTINGS

  // 3. Priority States (Highest priority overrides)
  // We'll store these in a set or object to track which ones are active
  const [activePriorityStates, setActivePriorityStates] = useState({});

  // 4. Overlays
  const [activeOverlays, setActiveOverlays] = useState({});

  // Helper to trigger a priority state
  const setPriorityState = (state, isActive) => {
    setActivePriorityStates(prev => {
      const next = { ...prev };
      if (isActive) {
        next[state] = true;
      } else {
        delete next[state];
      }
      return next;
    });
  };

  // Helper to trigger an overlay
  const setOverlay = (overlay, isActive, data = null) => {
    setActiveOverlays(prev => {
      const next = { ...prev };
      if (isActive) {
        next[overlay] = data || true;
      } else {
        delete next[overlay];
      }
      return next;
    });
  };

  // Determine the current "Active Display" based on priority logic
  const activeDisplay = useMemo(() => {
    if (systemState === 'BOOT') return { type: 'SYSTEM', state: 'BOOT' };
    if (systemState === 'SHUTDOWN') return { type: 'SYSTEM', state: 'SHUTDOWN' };

    // Check Priority States in order
    if (activePriorityStates.CRITICAL_WARNING) return { type: 'PRIORITY', state: 'CRITICAL_WARNING' };
    if (activePriorityStates.OVERHEAT) return { type: 'PRIORITY', state: 'OVERHEAT' };
    if (activePriorityStates.LOW_VOLTAGE) return { type: 'PRIORITY', state: 'LOW_VOLTAGE' };
    if (activePriorityStates.REVERSE_CAMERA) return { type: 'PRIORITY', state: 'REVERSE_CAMERA' };

    // If no priority override, show main UI
    return { type: 'MAIN', state: mainState };
  }, [systemState, activePriorityStates, mainState]);

  // Determine active overlays that should be visible on top
  const visibleOverlays = useMemo(() => {
    // Overlays only show if not blocked by a priority state (except maybe critical ones, 
    // but usually priority states like REVERSE_CAMERA block everything)
    const priorityActive = Object.keys(activePriorityStates).length > 0;
    
    if (priorityActive && !activePriorityStates.INCOMING_CALL) {
       // Most priority states (Camera, Overheat) block standard overlays
       // But this is configurable.
       return [];
    }

    return Object.keys(activeOverlays).sort((a, b) => STATE_PRIORITY[b] - STATE_PRIORITY[a]);
  }, [activeOverlays, activePriorityStates]);

  const value = {
    systemState,
    setSystemState,
    mainState,
    setMainState,
    activePriorityStates,
    setPriorityState,
    activeOverlays,
    setOverlay,
    activeDisplay,
    visibleOverlays
  };

  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};
