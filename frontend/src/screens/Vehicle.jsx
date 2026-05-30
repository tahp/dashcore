import React from 'react';
import { useVehicle } from '../context/VehicleContext';
import { useSettings } from '../context/SettingsContext';
import { Activity, Thermometer, Zap, Gauge, Fuel, Power } from 'lucide-react';

function Vehicle() {
  const { data, triggerScenario, simulationActive } = useVehicle();
  const { settings } = useSettings();

  const isMetric = settings.units === 'METRIC';
  const formatTemp = (c) => isMetric ? c : parseFloat((c * 9/5 + 32).toFixed(1));
  const displaySpeed = isMetric ? data.speed : Math.round(data.speed * 0.621371);
  const speedUnit = isMetric ? 'km/h' : 'mph';

  const GaugeCard = ({ icon: Icon, label, value, unit, color }) => (
    <div className="gauge-card">
      <div className="gauge-header">
        <Icon size={20} style={{ color }} />
        <span>{label}</span>
      </div>
      <div className="gauge-value">
        {value}
        <span className="unit">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="vehicle-screen">
      <div className="vehicle-header">
        <h2>Vehicle Status</h2>
        <div className="engine-status">
          <Power size={16} className={data.isEngineRunning ? 'icon-accent' : 'icon-dim'} />
          <span>{data.isEngineRunning ? 'Engine Running' : 'Engine Off'}</span>
          {simulationActive && <span className="sim-badge">SIM</span>}
        </div>
      </div>

      <div className="gauge-grid">
        <GaugeCard 
          icon={Activity} 
          label="Speed" 
          value={displaySpeed} 
          unit={speedUnit} 
          color="#44aaff" 
        />
        <GaugeCard 
          icon={Gauge} 
          label="RPM" 
          value={data.rpm} 
          unit="rpm" 
          color="#44aaff" 
        />
        <GaugeCard 
          icon={Thermometer} 
          label="Coolant" 
          value={formatTemp(data.coolantTemp)} 
          unit={isMetric ? "°C" : "°F"} 
          color={data.coolantTemp > 105 ? "#ff4444" : "#44ff88"} 
        />
        <GaugeCard 
          icon={Zap} 
          label="Voltage" 
          value={data.voltage} 
          unit="V" 
          color={data.voltage < 12 ? "#ff4444" : "#ffcc44"} 
        />
        <GaugeCard 
          icon={Fuel} 
          label="Fuel" 
          value={Math.round(data.fuelLevel)} 
          unit="%" 
          color={data.fuelLevel < 15 ? '#ff4444' : '#44aaff'} 
        />
      </div>

      <div className="dev-controls">
        <h3>Simulation Scenarios</h3>
        <div className="btn-group">
          <button onClick={() => triggerScenario('CRITICAL_VOLTAGE')}>Critical Voltage</button>
          <button onClick={() => triggerScenario('OVERHEAT_ENGINE')}>Overheat Engine</button>
          <button onClick={() => triggerScenario('RESET')}>Reset All</button>
        </div>
      </div>
    </div>
  );
}

export default Vehicle;
