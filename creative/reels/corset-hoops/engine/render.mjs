// node render.mjs <version> <outDir> [--at t1 t2 ...]   (PNG frames, lossless)
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { resolve } from 'path';
const [ver, out, ...rest] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const D = JSON.parse(readFileSync(`data_${ver}.json`, 'utf8')); D.version = ver; const FPS = D.fps;
let idx = [];
if (rest[0] === '--at') idx = rest.slice(1).map(Number).map(t => Math.round(t * FPS));
else for (let i = 0; i < Math.round(D.dur * FPS); i++) idx.push(i);
idx = idx.filter(i => { const f = `${out}/f_${String(i + 1).padStart(5, '0')}.png`; return rest[0] === '--at' || !existsSync(f) || statSync(f).size === 0; });
const CH = 120; const t0 = Date.now();
for (let k = 0; k < idx.length; k += CH) {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-web-security', '--disable-dev-shm-usage', '--force-color-profile=srgb'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => { console.error('PAGEERROR', e.message); process.exit(2); });
  p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  await p.addInitScript(d => { window.D = d; }, D);
  await p.goto('file://' + resolve('index.html')); await p.evaluate(() => window.ready);
  for (const i of idx.slice(k, k + CH)) {
    await p.evaluate(t => window.render(t), i / FPS);
    await p.evaluate(() => window.waitImages());
    await p.screenshot({ path: `${out}/f_${String(i + 1).padStart(5, '0')}.png`, type: 'png' });
  }
  await b.close(); console.log(`  ${Math.min(k + CH, idx.length)}/${idx.length}`);
}
console.log(`rendered ${idx.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
