import { motion } from 'framer-motion';
import { useVehicle } from '../context/VehicleContext';
import { useSettings } from '../context/SettingsContext';
import { Activity, Thermometer, Zap, Gauge, Fuel, Power } from 'lucide-react';

const GaugeCard = ({ icon: Icon, label, value, unit, color }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="gauge-card"
    whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.06)" }}
  >
    <div className="gauge-header">
      <Icon size={20} style={{ color }} />
      <span>{label}</span>
    </div>
    <div className="gauge-value">
      <motion.span
        key={value}
        initial={{ opacity: 0.5, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.span>
      <span className="unit">{unit}</span>
    </div>
  </motion.div>
);

function Vehicle() {
  const { data, triggerScenario, simulationActive } = useVehicle();
  const { settings } = useSettings();

  const isMetric = settings.units === 'METRIC';
  const formatTemp = (c) => isMetric ? c : parseFloat((c * 9/5 + 32).toFixed(1));
  const displaySpeed = isMetric ? data.speed : Math.round(data.speed * 0.621371);
  const speedUnit = isMetric ? 'km/h' : 'mph';

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <div className="vehicle-screen">
      <motion.div 
        className="vehicle-header"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h2>Vehicle Status</h2>
        <div className="engine-status">
          <motion.div
            animate={data.isEngineRunning ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Power size={16} className={data.isEngineRunning ? 'icon-accent' : 'icon-dim'} />
          </motion.div>
          <span>{data.isEngineRunning ? 'Engine Running' : 'Engine Off'}</span>
          {simulationActive && <span className="sim-badge">SIM</span>}
        </div>
      </motion.div>

      <motion.div 
        className="gauge-grid"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
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
      </motion.div>

      <motion.div 
        className="dev-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3>Simulation Scenarios</h3>
        <div className="btn-group">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => triggerScenario('CRITICAL_VOLTAGE')}>Critical Voltage</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => triggerScenario('OVERHEAT_ENGINE')}>Overheat Engine</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => triggerScenario('RESET')}>Reset All</motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default Vehicle;
