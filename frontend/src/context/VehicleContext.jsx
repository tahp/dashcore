import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAppState } from './StateContext';

const VehicleContext = createContext();

export const VehicleProvider = ({ children }) => {
  const { setPriorityState, systemState } = useAppState();
  
  const [data, setData] = useState({
    voltage: 13.8,
    coolantTemp: 90,
    rpm: 850,
    speed: 0,
    fuelLevel: 75,
    isEngineRunning: true,
  });

  const [simulationActive, setSimulationActive] = useState(true);
  const dataRef = useRef(data);

  // Sync ref with state for the simulation loop to avoid stale closures
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!simulationActive || systemState !== 'READY') return;

    const interval = setInterval(() => {
      setData(prev => {
        const newData = { ...prev };

        // 1. Simulate Voltage fluctuation (13.2V to 14.4V)
        newData.voltage = parseFloat((prev.voltage + (Math.random() - 0.5) * 0.1).toFixed(1));
        if (newData.voltage < 12.0) newData.voltage = 13.5;
        if (newData.voltage > 15.0) newData.voltage = 14.0;

        // 2. Simulate RPM (Idle around 800-900)
        newData.rpm = Math.floor(800 + Math.random() * 100);

        // 3. Simulate Temperature (Slow rise/fall)
        newData.coolantTemp = parseFloat((prev.coolantTemp + (Math.random() - 0.4) * 0.2).toFixed(1));

        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simulationActive, systemState]);

  // Logic to trigger system alerts based on vehicle data
  useEffect(() => {
    if (systemState !== 'READY') return;

    // Check for Low Voltage Alert (< 11.5V)
    if (data.voltage < 11.5) {
      setPriorityState('LOW_VOLTAGE', true);
    }

    // Check for Overheat Alert (> 110C)
    if (data.coolantTemp > 110) {
      setPriorityState('OVERHEAT', true);
    }
  }, [data.voltage, data.coolantTemp, systemState, setPriorityState]);

  // Helper to manually trigger scenarios for testing
  const triggerScenario = (scenario) => {
    switch (scenario) {
      case 'CRITICAL_VOLTAGE':
        setData(prev => ({ ...prev, voltage: 10.8 }));
        break;
      case 'OVERHEAT_ENGINE':
        setData(prev => ({ ...prev, coolantTemp: 115 }));
        break;
      case 'RESET':
        setData({
          voltage: 13.8,
          coolantTemp: 90,
          rpm: 850,
          speed: 0,
          fuelLevel: 75,
          isEngineRunning: true,
        });
        setPriorityState('LOW_VOLTAGE', false);
        setPriorityState('OVERHEAT', false);
        break;
      default:
        break;
    }
  };

  return (
    <VehicleContext.Provider value={{ data, triggerScenario, simulationActive, setSimulationActive }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};
