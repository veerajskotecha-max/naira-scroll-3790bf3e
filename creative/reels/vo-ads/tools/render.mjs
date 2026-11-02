// node render.mjs <adDir> <outDir> [--from i --to j] [--at t1 t2 ...]   frames as JPEG q95, 1-based f_00001.jpg
import { chromium } from 'playwright-core';
import { mkdirSync, existsSync, statSync, readFileSync } from 'fs';
import { resolve } from 'path';
const a = process.argv.slice(2); const dir = resolve(a[0]), out = resolve(a[1]); mkdirSync(out, { recursive: true });
const html = readFileSync(`${dir}/index.html`, 'utf8'); const dur = Number(/"dur": ([0-9.]+)/.exec(html)[1]); const FPS = 30;
const N = Math.round(dur * FPS);
let idx = []; const at = a.indexOf('--at');
if (at >= 0) { for (const v of a.slice(at + 1)) { if (v.startsWith('--')) break; idx.push(Math.round(Number(v) * FPS)); } }
else { const f = a.indexOf('--from'), t = a.indexOf('--to'); const i0 = f >= 0 ? +a[f + 1] : 0, i1 = t >= 0 ? +a[t + 1] : N; for (let i = i0; i < i1; i++) idx.push(i); }
const file = i => `${out}/f_${String(i + 1).padStart(5, '0')}.jpg`;
if (at < 0) idx = idx.filter(i => !existsSync(file(i)) || statSync(file(i)).size === 0);
let b, p, used = 0; const t0 = Date.now();
async function open() {
  if (b) await b.close().catch(() => {});
  b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-web-security', '--disable-dev-shm-usage', '--force-color-profile=srgb', '--font-render-hinting=none'] });
  p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('pageerror:', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  await p.goto('file://' + dir + '/index.html'); await p.evaluate(() => window.ready); used = 0;
}
for (const i of idx) {
  for (let tries = 1; ; tries++) {
    try {
      if (!p || used >= 200) await open();
      await p.evaluate(t => window.renderAt(t), i / FPS);
      await p.screenshot({ path: file(i), type: 'jpeg', quality: 95 }); used++; break;
    } catch (e) { console.log(`frame ${i + 1}: ${String(e.message).split('\n')[0]} (try ${tries})`); if (tries >= 3) process.exit(2); await open(); }
  }
}
await b?.close(); console.log(`${a[0]}: ${idx.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
