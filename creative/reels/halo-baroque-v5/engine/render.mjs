// node render.mjs out [t0 t1] | node render.mjs out --at 1.2 3.4 ...
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { resolve } from 'path';
const args = process.argv.slice(2), out = args[0]; mkdirSync(out, { recursive: true });
const D = JSON.parse(readFileSync('data.json', 'utf8')), FPS = D.fps;
let idx = [];
if (args[1] === '--at') idx = args.slice(2).map(Number).map(t => Math.round(t * FPS));
else { const a = args[1] !== undefined ? +args[1] : 0, c = args[2] !== undefined ? +args[2] : D.dur;
  for (let i = Math.round(a * FPS); i < Math.round(c * FPS); i++) idx.push(i); }
idx = idx.filter(i => { const f = `${out}/f_${String(i + 1).padStart(5, '0')}.jpg`; return args[1] === '--at' || !existsSync(f) || statSync(f).size === 0; });
const CH = 120; const t0 = Date.now();
for (let k = 0; k < idx.length; k += CH) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-web-security', '--disable-dev-shm-usage'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => { console.error('PAGEERROR', e.message); process.exit(2); });
  p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  await p.addInitScript(d => { window.D = d; }, D);
  await p.goto('file://' + resolve('index.html')); await p.evaluate(() => window.ready);
  for (const i of idx.slice(k, k + CH)) {
    await p.evaluate(t => window.render(t), i / FPS);
    await p.evaluate(() => window.waitImages());
    await p.screenshot({ path: `${out}/f_${String(i + 1).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 94 });
  }
  await b.close(); console.log(`  ${Math.min(k + CH, idx.length)}/${idx.length}`);
}
console.log(`rendered ${idx.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
