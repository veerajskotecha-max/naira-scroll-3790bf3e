// node render.mjs <version> <outDir> [--at t1 t2 ...]   (PNG frames, lossless)
// Skips frames already on disk. A frame that fails (a screenshot or an image load can fail when several renders
// share the machine) relaunches the browser and is tried again, up to three times, rather than ending the run.
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { resolve } from 'path';
const [ver, out, ...rest] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const D = JSON.parse(readFileSync(`data_${ver}.json`, 'utf8')); D.version = ver; const FPS = D.fps;
let idx = [];
if (rest[0] === '--at') idx = rest.slice(1).map(Number).map(t => Math.round(t * FPS));
else for (let i = 0; i < Math.round(D.dur * FPS); i++) idx.push(i);
const file = i => `${out}/f_${String(i + 1).padStart(5, '0')}.png`;
idx = idx.filter(i => rest[0] === '--at' || !existsSync(file(i)) || statSync(file(i)).size === 0);
const CH = 120; const t0 = Date.now();
let b = null, p = null, used = 0;
async function open() {
  if (b) await b.close().catch(() => {});
  b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-web-security', '--disable-dev-shm-usage', '--force-color-profile=srgb'] });
  p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  await p.addInitScript(d => { window.D = d; }, D);
  await p.goto('file://' + resolve('index.html')); await p.evaluate(() => window.ready); used = 0;
}
for (const i of idx) {
  for (let tries = 1; ; tries++) {
    try {
      if (!p || used >= CH) await open();
      await p.evaluate(t => window.render(t), i / FPS);
      await p.evaluate(() => window.waitImages());
      await p.screenshot({ path: file(i), type: 'png' }); used++; break;
    } catch (e) {
      console.log(`frame ${i + 1}: ${String(e.message).split('\n')[0]} (try ${tries})`);
      if (tries >= 3) { await b?.close().catch(() => {}); process.exit(2); }
      await open();
    }
  }
  if ((idx.indexOf(i) + 1) % CH === 0) console.log(`  ${idx.indexOf(i) + 1}/${idx.length}`);
}
await b?.close();
console.log(`rendered ${idx.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
