import React from 'react';
import { useVehicle } from '../context/VehicleContext';
import { useSettings } from '../context/SettingsContext';
import { Activity, Thermometer, Zap, Gauge } from 'lucide-react';

function Vehicle() {
  const { data, triggerScenario } = useVehicle();
  const { settings } = useSettings();

  const isMetric = settings.units === 'METRIC';
  const formatTemp = (c) => isMetric ? c : parseFloat((c * 9/5 + 32).toFixed(1));

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
      <div className="gauge-grid">
        <GaugeCard 
          icon={Activity} 
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
          icon={Gauge} 
          label="Fuel" 
          value={data.fuelLevel} 
          unit="%" 
          color="#44aaff" 
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
