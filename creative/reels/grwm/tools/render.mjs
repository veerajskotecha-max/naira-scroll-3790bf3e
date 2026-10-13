// node render.mjs <outDir> <fromFrame> <toFrame> [--bg <png>]   transparent PNGs of the title at 30 fps; --bg composites over a frame
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const [out, a, b] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const bi = process.argv.indexOf('--bg'), bg = bi > 0 ? process.argv[bi + 1] : null;
const here = dirname(fileURLToPath(import.meta.url));
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--force-color-profile=srgb'] });
const p = await br.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto('file://' + resolve(here, 'index.html')); await p.evaluate(() => window.ready);
if (bg) await p.evaluate(u => { document.body.style.background = `url(${u})`; }, 'data:image/png;base64,' + readFileSync(bg).toString('base64'));
for (let i = Number(a); i <= Number(b); i++) {
  await p.evaluate(t => window.setT(t), i / 30);
  await p.screenshot({ path: `${out}/${String(i).padStart(4, '0')}.png`, omitBackground: !bg });
}
await br.close(); console.log('rendered', a, '..', b);
