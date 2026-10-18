// Records the desktop, dark-mode Ambiflex launch film (1920×1080) cue by cue, following
// docs/launch-video-script.md. Writes the .webm, one still per shot, and the SRT.
// Usage: node record-desktop.js <outDir> [--burn]   (--burn draws the subtitles into the picture)
const { chromium } = require('playwright')
const path = require('node:path')
const fs = require('node:fs')

const out = process.argv[2] || path.join(__dirname, 'out-desktop')
const burn = process.argv.includes('--burn')
fs.mkdirSync(out, { recursive: true })
const size = { width: 1920, height: 1080 }
const viewport = { width: 1600, height: 900 }
const here = p => 'file://' + path.join(__dirname, p)
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Cue times in seconds, as the narration script lays them out.
const CUES = [
  [0, 7, 'This is a plan Claude Code executed on its own. Nineteen nodes. One evening.'],
  [7, 15, "It follows Felix Rieseberg's method: altitude, depth, range."],
  [15, 24, 'A node is not done because the model says so. It needs a proof. Only I can validate.'],
  [24, 34, 'Three agents, three ways to speed up a parser, each in its own branch, scored by the same benchmark.'],
  [34, 42, 'Then I ran the benchmark myself. 334 ms down to 44.'],
  [42, 50, 'Cost and time on screen before and during. Estimates calibrated against real timings.'],
  [50, 58, 'In auto mode, after each turn, the plugin hands Claude the next open node.'],
  [58, 66, 'And I steer from anywhere. Validate, go deeper, go wider, prune.'],
  [66, 75, 'Ambiflex. Open source, one line to install.'],
]

const srt = CUES.map(([a, b, text], i) => `${i + 1}\n${ts(a)} --> ${ts(b)}\n${text}\n`).join('\n')
fs.writeFileSync(path.join(out, 'ambiflex-desktop.srt'), srt)
function ts(s) { const h = String(Math.floor(s / 3600)).padStart(2, '0'), m = String(Math.floor((s % 3600) / 60)).padStart(2, '0'), sec = String(s % 60).padStart(2, '0'); return `${h}:${m}:${sec},000` }

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1.2, recordVideo: { dir: out, size }, colorScheme: 'dark' })
  const page = await ctx.newPage()
  const t0 = Date.now()
  const until = async sec => { const left = t0 + sec * 1000 - Date.now(); if (left > 0) await sleep(left) }
  let shot = 0
  const still = async name => page.screenshot({ path: path.join(out, `${String(++shot).padStart(2, '0')}-${name}.png`) })
  const cap = (text, side = '') => burn ? page.evaluate(([t, s]) => { const c = document.getElementById('cap'); if (!c) return; c.textContent = t; c.className = t ? 'on ' + s : '' }, [text, side]) : Promise.resolve()
  const camera = (x, y, k) => page.evaluate(([x, y, k]) => { const v = window.__view; v.x = x; v.y = y; v.k = k; window.__apply() }, [x, y, k])
  const app = async () => { await page.goto(here('desktop.html')); await page.waitForSelector('#graph .node'); await sleep(300) }
  const term = async (key, delay) => { await page.goto(here('term-desktop.html')); await page.evaluate(([k, d]) => window.show(k, d), [key, delay]) }

  // 1. The whole tree, slow push-in (0–7)
  await app()
  await camera(40, 10, 1.05)
  await cap(CUES[0][2]); await still('tree')
  await camera(60, 0, 1.18)
  await until(7)

  // 2. Goal and the three tracks (7–15)
  await camera(-120, -20, 1.9)
  await cap(CUES[1][2]); await sleep(600); await still('tracks-colour')
  await until(15)

  // 3. Node n7: the proof (15–24)
  await camera(40, 10, 1.05)
  await page.click('.node[data-id="n7"]'); await sleep(500)
  await page.evaluate(() => { const m = document.getElementById('s-meta'); m.id = 'hl' })
  await cap(CUES[2][2], 'left'); await still('proof')
  await until(24)

  // 4. Node n16: three tracks, three scores (24–34)
  await page.evaluate(() => { const m = document.getElementById('hl'); if (m) m.id = 's-meta' })
  await page.evaluate(() => document.getElementById('s-close').click()); await sleep(300)
  await camera(-60, -420, 1.5)
  await page.evaluate(() => window.__select('n16')); await sleep(500)
  await cap(CUES[3][2], 'left'); await still('search')
  await until(34)

  // 5. The benchmark, typed (34–42)
  await term('bench', 500)
  await cap(CUES[4][2]); await sleep(3000); await still('bench')
  await until(42)

  // 6. Cost, ETA, calibration (42–50)
  await app()
  await camera(40, 10, 1.05)
  await page.evaluate(() => { const h = document.querySelector('header'); h.style.outline = '3px solid var(--accent)'; h.style.outlineOffset = '-3px' })
  await cap(CUES[5][2]); await still('cost')
  await until(50)

  // 7. The hand-over, typed (50–58)
  await term('auto', 400)
  await cap(CUES[6][2]); await sleep(3000); await still('handover')
  await until(58)

  // 8. Steering: Validate on n11 (58–66)
  await app()
  await camera(-60, -300, 1.5)
  await page.evaluate(() => window.__select('n11')); await sleep(600)
  await cap(CUES[7][2], 'left')
  await page.evaluate(() => { const b = [...document.querySelectorAll('#s-actions .btn')].find(x => x.textContent === 'Validate'); b && b.classList.add('pressed') })
  await sleep(700)
  await page.evaluate(() => { const t = document.createElement('div'); t.className = 'toast left'; t.textContent = 'Sent to Claude.'; document.querySelector('main').appendChild(t) })
  await still('steer')
  await until(66)

  // 9. Title card (66–75)
  await page.evaluate(() => document.getElementById('title-card').classList.add('on'))
  await cap(CUES[8][2]); await sleep(500); await still('title')
  await until(75)

  await ctx.close(); await browser.close()
  const webm = fs.readdirSync(out).find(f => f.endsWith('.webm'))
  fs.renameSync(path.join(out, webm), path.join(out, 'ambiflex-desktop.webm'))
  console.log('recorded', path.join(out, 'ambiflex-desktop.webm'))
})()
