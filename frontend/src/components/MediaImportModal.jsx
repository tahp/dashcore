import { useState, useRef } from 'react';
import { Search, FolderOpen, CheckCircle2, X, RefreshCw, PlayCircle, Video, Trash2, Save } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

function MediaImportModal({ isOpen, onClose }) {
  const { scanDevice, convertMP4, importTracks, startPlaylist } = useMedia();
  const [step, setStep] = useState('initial'); // initial, scanning, results, converting, post-convert, importing, success
  const [scanData, setScanData] = useState({ audioCount: 0, videoCount: 0, audioFiles: [], videoFiles: [] });
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [convertProgress, setConvertProgress] = useState({ current: 0, total: 0, file: '' });
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Checkbox states
  const [importAudio, setImportAudio] = useState(true);
  const [convertVideos, setConvertVideos] = useState(true);
  const [importConverted, setImportConverted] = useState(true);

  // Track successfully converted files for potential deletion and import
  const [convertedFiles, setConvertedFiles] = useState([]);

  if (!isOpen) return null;

  const handleScan = async () => {
    setStep('scanning');
    setError(null);
    try {
      const data = await scanDevice();
      setScanData(data);
      // Determine what checkboxes to show based on results
      setImportAudio(data.audioCount > 0);
      setConvertVideos(data.videoCount > 0);
      setImportConverted(data.videoCount > 0);
      setStep('results');
    } catch (err) {
      setError(err.message);
      setStep('initial');
    }
  };

  const handleManualChoose = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Simulate scan data for manual files
      setScanData({
        audioCount: files.length,
        videoCount: 0,
        audioFiles: files, // Notice these are File objects, our context handles both
        videoFiles: []
      });
      setImportAudio(true);
      setConvertVideos(false);
      setStep('results');
    }
    event.target.value = '';
  };

  const handleContinueFromResults = () => {
    if (scanData.videoCount > 0 && convertVideos) {
      setStep('converting');
      setConvertProgress({ current: 1, total: scanData.videoFiles.length, file: scanData.videoFiles[0] });
      setConvertedFiles([]);
      convertMP4(
        scanData.videoFiles,
        (progressData) => {
          if (progressData.type === 'progress') {
            setConvertProgress({ current: progressData.index, total: progressData.total, file: progressData.file });
          } else if (progressData.type === 'success') {
            setConvertedFiles(prev => [...prev, progressData.outputPath]);
          }
        },
        () => {
          setStep('post-convert');
        },
        (errData) => {
          console.error("Conversion error:", errData);
        }
      );
    } else {
      startImport();
    }
  };

  const handleDeleteOriginals = async () => {
    try {
      await fetch('/api/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: scanData.videoFiles })
      });
    } catch (err) {
      console.error('Failed to delete originals', err);
    }
    startImport();
  };

  const startImport = async () => {
    const filesToImport = [];
    if (importAudio && scanData.audioCount > 0) {
      filesToImport.push(...scanData.audioFiles);
    }
    if (importConverted && convertedFiles.length > 0) {
      filesToImport.push(...convertedFiles);
    }

    if (filesToImport.length === 0) {
      setStep('initial');
      return;
    }

    setStep('importing');
    setImportProgress({ current: 0, total: filesToImport.length });
    try {
      await importTracks(filesToImport, (current, total) => {
        setImportProgress({ current, total });
      });
      setStep('success');
    } catch (err) {
      setError(err.message);
      setStep('results');
    }
  };

  const handlePlayNow = () => {
    startPlaylist();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content import-modal" style={{ maxWidth: '600px' }}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        
        {step === 'initial' && (
          <div className="import-step">
            <h2>Media Library</h2>
            <p className="message">Would you like Dashcore to automatically scan for media files?</p>
            {error && <p className="error-message">{error}</p>}
            <div className="import-actions" style={{ flexDirection: 'column', gap: '1rem' }}>
              <button className="btn-modal-primary" onClick={handleScan}>
                <Search size={20} />
                <span>Scan Device</span>
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
          <div className="import-step" style={{ textAlign: 'left', padding: '1rem' }}>
            <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Scan Complete</h2>
            
            <div className="scan-results-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Found:</p>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>{scanData.audioCount} audio files</li>
                {scanData.videoCount > 0 && <li>{scanData.videoCount} MP4 files</li>}
              </ul>
            </div>

            <p style={{ marginBottom: '1rem', textAlign: 'center' }}>What would you like to do?</p>

            <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {scanData.audioCount > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={importAudio} onChange={e => setImportAudio(e.target.checked)} style={{ width: '24px', height: '24px' }} />
                  <span style={{ fontSize: '1.2rem' }}>Import audio files</span>
                </label>
              )}
              {scanData.videoCount > 0 && (
                <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={convertVideos} onChange={e => setConvertVideos(e.target.checked)} style={{ width: '24px', height: '24px' }} />
                    <span style={{ fontSize: '1.2rem' }}>Convert MP4 files to MP3</span>
                  </label>
                  {convertVideos && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', marginLeft: '2rem' }}>
                      <input type="checkbox" checked={importConverted} onChange={e => setImportConverted(e.target.checked)} style={{ width: '24px', height: '24px' }} />
                      <span style={{ fontSize: '1.2rem' }}>Import converted files</span>
                    </label>
                  )}
                </>
              )}
            </div>

            <div className="import-actions horizontal">
              <button className="btn-modal-primary" onClick={handleContinueFromResults}>
                <span>Continue</span>
              </button>
              <button className="btn-modal-secondary" onClick={() => setStep('initial')}>Cancel</button>
            </div>
          </div>
        )}

        {step === 'converting' && (
          <div className="import-step">
            <Video size={48} className="icon-spin" style={{ animationDuration: '3s' }} />
            <h2 style={{ margin: '1rem 0' }}>Converting media...</h2>
            
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{convertProgress.current} / {convertProgress.total}</p>
            <p style={{ color: '#9ca3af', marginBottom: '2rem', wordBreak: 'break-all' }}>
              {typeof convertProgress.file === 'string' ? convertProgress.file.split('/').pop() : ''}
            </p>

            <div className="progress-container" style={{ width: '100%' }}>
              <div className="progress-bar-bg" style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${(convertProgress.current / (convertProgress.total || 1)) * 100}%`,
                    height: '100%',
                    background: '#86efac',
                    transition: 'width 0.3s'
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {step === 'post-convert' && (
          <div className="import-step">
            <CheckCircle2 size={48} className="icon-success" />
            <h2 style={{ margin: '1rem 0' }}>Conversion complete</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Would you like to keep the original MP4 files?</p>
            
            <div className="import-actions" style={{ flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <button className="btn-modal-secondary" onClick={startImport} style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <Save size={20} /> Keep Originals
              </button>
              <button className="btn-modal-primary" onClick={handleDeleteOriginals} style={{ background: '#ef4444', color: 'white', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <Trash2 size={20} /> Delete Originals
              </button>
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
                  style={{ width: `${(importProgress.current / (importProgress.total || 1)) * 100}%` }}
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
            <p className="success-message">{importProgress.total} tracks imported successfully.</p>
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
