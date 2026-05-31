import { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useMedia } from '../context/MediaContext';

export default function AutoDiscoverMedia() {
  const { settings } = useSettings();
  const { scanDevice, convertMP4, importTracks } = useMedia();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const runDiscovery = async () => {
      if (!settings.autoScanMedia) return;

      try {
        const scanData = await scanDevice();
        
        let filesToImport = [];

        if (settings.autoImportMedia && scanData.audioCount > 0) {
          filesToImport.push(...scanData.audioFiles);
        }

        if (scanData.videoCount > 0 && settings.autoConvertMP4) {
          // Convert silently
          convertMP4(
            scanData.videoFiles,
            (progressData) => {
              if (progressData.type === 'success' && settings.autoImportMedia) {
                // Import the file immediately after success
                importTracks([progressData.outputPath]).catch(console.error);
              }
            },
            async () => {
              if (settings.deleteOriginalMP4) {
                try {
                  await fetch('/api/media/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ files: scanData.videoFiles })
                  });
                } catch (e) {
                  console.error('Failed to delete originals automatically', e);
                }
              }
            },
            (errData) => console.error('Auto convert error:', errData)
          );
        }

        if (filesToImport.length > 0) {
          await importTracks(filesToImport);
        }

      } catch (err) {
        console.error('Auto-discovery failed:', err);
      }
    };

    runDiscovery();
  }, [settings, scanDevice, convertMP4, importTracks]);

  return null;
}
