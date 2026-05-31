const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const SEARCH_PATHS = [
  path.join(os.homedir(), 'Music'),
  path.join(os.homedir(), 'Downloads'),
  '/media',
  '/mnt'
];

const AUDIO_EXTS = ['.mp3', '.flac', '.wav', '.m4a', '.aac', '.ogg'];
const VIDEO_EXTS = ['.mp4'];

// Recursive file scanner
async function scanDirectory(dir, results = { audio: [], video: [] }) {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await scanDirectory(fullPath, results);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (AUDIO_EXTS.includes(ext)) {
          results.audio.push(fullPath);
        } else if (VIDEO_EXTS.includes(ext)) {
          results.video.push(fullPath);
        }
      }
    }
  } catch (err) {
    // Ignore permission or missing directory errors
  }
  return results;
}

app.get('/api/media/scan', async (req, res) => {
  let allResults = { audio: [], video: [] };
  
  for (const searchPath of SEARCH_PATHS) {
    const results = await scanDirectory(searchPath);
    allResults.audio.push(...results.audio);
    allResults.video.push(...results.video);
  }

  // Remove duplicates
  allResults.audio = [...new Set(allResults.audio)];
  allResults.video = [...new Set(allResults.video)];

  res.json({
    audioCount: allResults.audio.length,
    videoCount: allResults.video.length,
    audioFiles: allResults.audio,
    videoFiles: allResults.video
  });
});

app.post('/api/media/convert', (req, res) => {
  const { files } = req.body;
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: 'files array required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const convertNext = (index) => {
    if (index >= files.length) {
      res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
      return res.end();
    }

    const file = files[index];
    res.write(`data: ${JSON.stringify({ type: 'progress', index: index + 1, total: files.length, file })}\n\n`);

    const outputExt = '.mp3';
    const outputFileName = path.basename(file, path.extname(file)) + outputExt;
    const outputDir = path.dirname(file);
    const outputPath = path.join(outputDir, outputFileName);

    // ffmpeg -i input.mp4 -vn -c:a libmp3lame -q:a 2 output.mp3
    const ffmpegProcess = spawn('ffmpeg', [
      '-y', // Overwrite
      '-i', file,
      '-vn',
      '-c:a', 'libmp3lame',
      '-q:a', '2',
      outputPath
    ]);

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        res.write(`data: ${JSON.stringify({ type: 'success', file, outputPath })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', file, error: 'FFmpeg process exited with code ' + code })}\n\n`);
      }
      convertNext(index + 1);
    });

    req.on('close', () => {
      ffmpegProcess.kill();
    });
  };

  convertNext(0);
});

app.post('/api/media/delete', async (req, res) => {
  const { files } = req.body;
  if (!files || !Array.isArray(files)) return res.status(400).json({ error: 'files array required' });
  
  const results = [];
  for (const file of files) {
    try {
      await fs.promises.unlink(file);
      results.push({ file, success: true });
    } catch (err) {
      results.push({ file, success: false, error: err.message });
    }
  }
  res.json({ results });
});

// Serve individual files so frontend can fetch and import them
app.get('/api/media/file', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'path query required' });
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'file not found' });
  
  res.sendFile(filePath);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
