// node render.mjs <reel> <outDir> [--at t1 t2 ...] [--jpg]
// Frames are PNG (lossless) unless --jpg. Skips frames already on disk. A frame that fails relaunches the browser and is
// retried, up to three times, rather than ending the run.
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { resolve } from 'path';
const args = process.argv.slice(2); const reel = args[0], out = args[1]; mkdirSync(out, { recursive: true });
const jpg = args.includes('--jpg'); const qi = args.indexOf('--q'); const Q = qi >= 0 ? Number(args[qi + 1]) : 92;
const D = JSON.parse(readFileSync(`data_${reel}.json`, 'utf8')); const FPS = D.fps;
if (existsSync(`track_${reel}.json`)) D.tracks = JSON.parse(readFileSync(`track_${reel}.json`, 'utf8'));
let idx = [];
const at = args.indexOf('--at');
if (at >= 0) { idx = []; for (const a of args.slice(at + 1)) { if (a.startsWith('--')) break; idx.push(Math.round(Number(a) * FPS)); } }
else for (let i = 0; i < D.frames; i++) idx.push(i);
const ext = jpg ? 'jpg' : 'png';
const file = i => `${out}/f_${String(i + 1).padStart(5, '0')}.${ext}`;
if (at < 0) idx = idx.filter(i => !existsSync(file(i)) || statSync(file(i)).size === 0);
const CH = 150; const t0 = Date.now();
let b = null, p = null, used = 0;
async function open() {
  if (b) await b.close().catch(() => {});
  b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-web-security', '--disable-dev-shm-usage', '--force-color-profile=srgb'] });
  p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.addInitScript(d => { window.D = d; }, D);
  await p.goto('file://' + resolve('index.html')); await p.evaluate(() => window.ready); used = 0;
}
for (const i of idx) {
  for (let tries = 1; ; tries++) {
    try {
      if (!p || used >= CH) await open();
      await p.evaluate(t => window.renderAt(t), i / FPS);
      await p.screenshot({ path: file(i), type: jpg ? 'jpeg' : 'png', ...(jpg ? { quality: Q } : {}) }); used++; break;
    } catch (e) {
      console.log(`frame ${i + 1}: ${String(e.message).split('\n')[0]} (try ${tries})`);
      if (tries >= 3) { await b?.close().catch(() => {}); process.exit(2); }
      await open();
    }
  }
}
await b?.close();
console.log(`${reel}: rendered ${idx.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
