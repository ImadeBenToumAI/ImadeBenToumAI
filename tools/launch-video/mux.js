// Lays the narration over the desktop cut: ambiflex-desktop.mp4 + narration.mp3 → ambiflex-desktop-voiced.mp4.
// Usage: node mux.js <assetsDir>   (expects ambiflex-desktop.mp4 and narration.mp3 there)
const { execFileSync } = require('node:child_process')
const path = require('node:path')
const fs = require('node:fs')

const dir = process.argv[2] || path.join(__dirname, '..', '..', 'assets', 'launch')
const video = path.join(dir, 'ambiflex-desktop.mp4')
const voice = ['narration.mp3', 'narration.wav', 'narration.m4a'].map(f => path.join(dir, f)).find(f => fs.existsSync(f))
if (!voice) { console.error('No narration file in', dir, '(narration.mp3/.wav/.m4a). Generate it from docs/launch-video-script.md first.'); process.exit(1) }
const outFile = path.join(dir, 'ambiflex-desktop-voiced.mp4')
// The picture is the clock: the voice is padded or cut to the video's length, never the other way round.
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-i', voice, '-filter_complex', '[1:a]apad[a]', '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', outFile])
console.log('wrote', outFile)
