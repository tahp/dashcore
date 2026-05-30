import { useState, useEffect, useRef } from 'react';
import { Search, FolderOpen, CheckCircle2, X, RefreshCw, PlayCircle, Zap } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

function MediaImportModal({ isOpen, onClose }) {
  const { scanDevice, importTracks, startPlaylist, hasSavedScanLocation } = useMedia();
  const [step, setStep] = useState('initial'); // initial, scanning, results, importing, success
  const [scannedFiles, setScannedFiles] = useState([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [canAutoScan, setCanAutoScan] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      hasSavedScanLocation().then(setCanAutoScan);
    }
  }, [isOpen, hasSavedScanLocation]);

  if (!isOpen) return null;

  const handleScan = async (auto = false) => {
    setStep('scanning');
    setError(null);
    try {
      const files = await scanDevice(auto);
      if (files === null) {
        setStep('initial'); // User cancelled
        return;
      }
      setScannedFiles(files);
      setStep('results');
    } catch (err) {
      setError(err.message);
      setStep('initial');
    }
  };

  const handleImport = async () => {
    setStep('importing');
    setImportProgress({ current: 0, total: scannedFiles.length });
    try {
      await importTracks(scannedFiles, (current, total) => {
        setImportProgress({ current, total });
      });
      setStep('success');
    } catch (err) {
      setError(err.message);
      setStep('results');
    }
  };

  const handleManualChoose = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setScannedFiles(files);
      setStep('results');
    }
    event.target.value = '';
  };

  const handlePlayNow = () => {
    startPlaylist();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content import-modal">
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        
        {step === 'initial' && (
          <div className="import-step">
            <h2>Media Library</h2>
            <p className="message">Would you like Dashcore to automatically scan for media files on this device?</p>
            {error && <p className="error-message">{error}</p>}
            <div className="import-actions">
              {canAutoScan && (
                <button className="btn-modal-primary auto-scan" onClick={() => handleScan(true)}>
                  <Zap size={20} />
                  <span>Automatic Scan</span>
                </button>
              )}
              <button className={canAutoScan ? 'btn-modal-secondary' : 'btn-modal-primary'} onClick={() => handleScan(false)}>
                <Search size={20} />
                <span>{canAutoScan ? 'Change Scan Location' : 'Scan Device'}</span>
              </button>
              <button className="btn-modal-secondary" onClick={handleManualChoose}>
                <FolderOpen size={20} />
                <span>Choose Files Manually</span>
              </button>
              <button className="btn-modal-text" onClick={onClose}>Cancel</button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              accept="audio/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>
        )}

        {step === 'scanning' && (
          <div className="import-step loading">
            <RefreshCw size={48} className="icon-spin" />
            <h2>Scanning Device...</h2>
            <p>Searching for media files in common locations</p>
          </div>
        )}

        {step === 'results' && (
          <div className="import-step">
            <div className="result-icon">
              <CheckCircle2 size={48} className="icon-success" />
            </div>
            <h2>Scan Complete</h2>
            <div className="scan-results-box">
              <p className="found-count">Found: <strong>{scannedFiles.length}</strong> audio files</p>
              <p>Import these tracks into Dashcore</p>
            </div>
            <div className="import-actions">
              <button className="btn-modal-primary" onClick={handleImport}>
                <span>Import</span>
              </button>
              <button className="btn-modal-text" onClick={() => setStep('initial')}>Cancel</button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="import-step">
            <h2>Importing media...</h2>
            <div className="progress-container">
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                ></div>
              </div>
              <p className="progress-text">{importProgress.current} / {importProgress.total} tracks</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="import-step">
            <div className="result-icon">
              <CheckCircle2 size={64} className="icon-success" />
            </div>
            <h2>Success</h2>
            <p className="success-message">{scannedFiles.length} tracks imported successfully.</p>
            <div className="import-actions horizontal">
              <button className="btn-modal-primary" onClick={handlePlayNow}>
                <PlayCircle size={20} />
                <span>Play Now</span>
              </button>
              <button className="btn-modal-secondary" onClick={onClose}>
                <span>Done</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default MediaImportModal;
