import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Monitor, Gauge, Volume2, Moon, Database, Info, ChevronRight } from 'lucide-react';

function Settings() {
  const { settings, updateSetting } = useSettings();

  const SettingGroup = ({ icon: Icon, title, children }) => (
    <div className="settings-group">
      <div className="group-header">
        <Icon size={20} className="icon-accent" />
        <span>{title}</span>
      </div>
      <div className="group-content">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ label, value, onClick, type = 'action' }) => (
    <div className="settings-row" onClick={onClick}>
      <span className="row-label">{label}</span>
      <div className="row-control">
        {type === 'toggle' ? (
          <div className={`toggle-switch ${value ? 'on' : 'off'}`}>
            <div className="toggle-handle"></div>
          </div>
        ) : type === 'select' ? (
          <span className="select-value">{value}</span>
        ) : (
          <ChevronRight size={20} className="icon-dim" />
        )}
      </div>
    </div>
  );

  return (
    <div className="settings-screen">
      <div className="settings-container">
        
        <SettingGroup icon={Monitor} title="Display">
          <div className="settings-row-static">
            <span className="row-label">Brightness</span>
            <input 
              type="range" 
              className="settings-slider" 
              value={settings.brightness}
              onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
            />
          </div>
          <SettingRow 
            label="Night Mode" 
            type="toggle" 
            value={settings.autoNightMode} 
            onClick={() => updateSetting('autoNightMode', !settings.autoNightMode)}
          />
        </SettingGroup>

        <SettingGroup icon={Gauge} title="System Units">
          <SettingRow 
            label="Measurement System" 
            type="select" 
            value={settings.units} 
            onClick={() => updateSetting('units', settings.units === 'METRIC' ? 'IMPERIAL' : 'METRIC')}
          />
        </SettingGroup>

        <SettingGroup icon={Volume2} title="Audio">
          <div className="settings-row-static">
            <span className="row-label">System Volume</span>
            <input 
              type="range" 
              className="settings-slider" 
              value={settings.volume}
              onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
            />
          </div>
        </SettingGroup>

        <SettingGroup icon={Database} title="Developer">
          <SettingRow 
            label="Hardware Simulation" 
            type="toggle" 
            value={settings.simulationMode} 
            onClick={() => updateSetting('simulationMode', !settings.simulationMode)}
          />
          <SettingRow label="Clear Local Storage" onClick={() => localStorage.clear()} />
        </SettingGroup>

        <SettingGroup icon={Info} title="About">
          <div className="settings-row-static version">
            <span className="row-label">Dashcore OS</span>
            <span className="select-value">v0.1.0-alpha</span>
          </div>
        </SettingGroup>

      </div>
    </div>
  );
}

export default Settings;
