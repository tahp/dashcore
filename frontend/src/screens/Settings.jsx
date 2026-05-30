import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useMedia } from '../context/MediaContext';
import { Monitor, Gauge, Volume2, Database, Info, ChevronRight, Music } from 'lucide-react';
import MediaImportModal from '../components/MediaImportModal';

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

function Settings() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { clearLibrary } = useMedia();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleClearData = () => {
    // Only clear dashcore-specific keys, not all localStorage
    const dashcoreKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('dashcore_') || key === 'dashcore_settings' || key === 'dashcore_media_state')) {
        dashcoreKeys.push(key);
      }
    }
    dashcoreKeys.forEach(key => localStorage.removeItem(key));
    clearLibrary();
    resetSettings();
  };

  const handleClearLibrary = () => {
    if (window.confirm('Are you sure you want to clear your entire media library?')) {
      clearLibrary();
    }
  };

  return (
    <div className="settings-screen">
      <MediaImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />

      <div className="settings-container">
        
        <SettingGroup icon={Music} title="Media Library">
          <SettingRow label="Scan Device" onClick={() => setIsImportModalOpen(true)} />
          <SettingRow label="Refresh Library" onClick={() => setIsImportModalOpen(true)} />
          <SettingRow label="Clear Library" onClick={handleClearLibrary} />
        </SettingGroup>

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
          <SettingRow label="Reset App Data" onClick={handleClearData} />
        </SettingGroup>

        <SettingGroup icon={Info} title="About">
          <div className="settings-row-static version">
            <span className="row-label">Dashcore OS</span>
            <span className="select-value">v0.2.0-alpha</span>
          </div>
        </SettingGroup>

      </div>
    </div>
  );
}

export default Settings;
