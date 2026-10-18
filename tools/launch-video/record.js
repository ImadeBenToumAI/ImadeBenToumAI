// Records the 60-second Ambiflex launch video from the real tree, shot by shot (docs/launch-kit.md §1).
// Usage: node record.js <portrait|landscape> <outDir>
const { chromium } = require('playwright')
const path = require('node:path')
const fs = require('node:fs')

const mode = process.argv[2] || 'portrait'
const out = process.argv[3] || path.join(__dirname, 'out')
fs.mkdirSync(out, { recursive: true })
const size = mode === 'portrait' ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 }
const viewport = mode === 'portrait' ? { width: 540, height: 960 } : { width: 1536, height: 864 }
const here = p => 'file://' + path.join(__dirname, p)

const sleep = ms => new Promise(r => setTimeout(r, ms))

;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined })
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: size.width / viewport.width, recordVideo: { dir: out, size } })
  const page = await ctx.newPage()
  let shot = 0
  const still = async name => { await page.screenshot({ path: path.join(out, `${String(++shot).padStart(2, '0')}-${name}-${mode}.png`) }) }
  const cap = (text, where = 'bottom') => page.evaluate(([t, w]) => { const c = document.getElementById('cap'); c.textContent = t; c.className = t ? `on ${w}` : '' }, [text, where])

  // 1. The tree
  await page.goto(here('app.html'))
  await page.waitForSelector('#graph .node')
  await page.evaluate(() => { const b = document.getElementById('tab-tree'); b && b.click() })
  await sleep(400)
  await cap('This is a plan Claude Code is executing on its own.')
  await still('tree')
  await sleep(5000)

  // 2. A node and its proof
  await page.click('.node[data-id="n7"]')
  await sleep(500)
  await cap('Every node needs a proof before it counts as done.', 'top')
  await still('node-proof')
  await sleep(7000)

  // 3. Three tracks, one benchmark
  await page.click('#s-close')
  await sleep(300)
  await page.click('.node[data-id="n16"]')
  await sleep(500)
  await cap('Three agents tried three ideas in parallel. Same benchmark: 3.15 / 6.66 / 7.3.', 'top')
  await still('tracks')
  await sleep(8000)

  // 4. The benchmark, run by me
  await page.goto(here('term.html'))
  await page.evaluate(() => window.show('bench'))
  await page.evaluate(() => window.cap('I ran the benchmark myself. 334 ms → 44 ms.'))
  await still('bench')
  await sleep(8000)

  // 5. Cost and ETA
  await page.goto(here('app.html'))
  await page.waitForSelector('#graph .node')
  await sleep(400)
  await page.evaluate(() => { document.querySelector('header').style.outline = '4px solid #2f5bea'; document.querySelector('header').style.outlineOffset = '-4px' })
  await cap('Cost and ETA, before and during. Not after.')
  await still('cost')
  await sleep(8000)
  await page.evaluate(() => { document.querySelector('header').style.outline = '' })

  // 6. Steering from the phone
  await page.click('.node[data-id="n11"]')
  await sleep(500)
  await page.evaluate(() => { const b = [...document.querySelectorAll('#s-actions .btn')].find(x => x.textContent === 'Validate'); b && b.classList.add('pressed') })
  await sleep(600)
  await page.evaluate(() => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = 'Sent to Claude. The reply lands in the conversation and the tree updates here.'; document.querySelector('main').appendChild(t) })
  await cap('I steer from my phone. Claude replies in the session.', 'top')
  await still('steer')
  await sleep(8000)

  // 7. The hand-over
  await page.goto(here('term.html'))
  await page.evaluate(() => window.show('auto'))
  await page.evaluate(() => window.cap('After each turn, the plugin hands Claude the next node. No approval needed.'))
  await still('handover')
  await sleep(8000)

  // 8. Install
  await page.evaluate(() => window.show('install'))
  await page.evaluate(() => window.cap("Felix Rieseberg's method, as a panel."))
  await still('install')
  await sleep(8000)

  await ctx.close()
  await browser.close()
  const webm = fs.readdirSync(out).find(f => f.endsWith('.webm'))
  fs.renameSync(path.join(out, webm), path.join(out, `ambiflex-${mode}.webm`))
  console.log('recorded', path.join(out, `ambiflex-${mode}.webm`))
})()
