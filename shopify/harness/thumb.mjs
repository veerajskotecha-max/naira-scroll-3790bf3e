// Downscale full-page PNGs to web-sized JPEGs via Chromium's canvas.
// No ImageMagick/sharp in this sandbox; Playwright's browser is already here.
import { chromium } from 'playwright';
import fs from 'node:fs';

// Sandbox has Chromium 1194; playwright 1.57 expects 1217. Pin the binary.
const CHROME = '/opt/pw-browsers/chromium';
import path from 'node:path';

const SRC   = process.argv[2];
const DEST  = process.argv[3];
const WIDTH = Number(process.argv[4] || 380);
const QUAL  = Number(process.argv[5] || 0.72);
// Chromium refuses canvases past ~16k px on a side; taller pages get cropped
// to this and flagged, rather than silently coming back blank.
const MAX_H = 15000;

if (!SRC || !DEST) { console.error('usage: thumb.mjs <srcDir> <destDir> [width] [quality]'); process.exit(1); }
fs.mkdirSync(DEST, { recursive: true });

const files = fs.readdirSync(SRC).filter(f => /\.png$/i.test(f));
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
const rows = [];

for (const f of files) {
  const out = path.join(DEST, f.replace(/\.png$/i, '.jpg'));
  try {
    const b64 = fs.readFileSync(path.join(SRC, f)).toString('base64');
    const jpg = await page.evaluate(async ({ b64, WIDTH, QUAL, MAX_H }) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = 'data:image/png;base64,' + b64; });
      const scale = WIDTH / img.width;
      const h = Math.min(Math.round(img.height * scale), MAX_H);
      const c = document.createElement('canvas');
      c.width = WIDTH; c.height = h;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, img.width, Math.round(h / scale), 0, 0, WIDTH, h);
      return { data: c.toDataURL('image/jpeg', QUAL), truncated: Math.round(img.height * scale) > MAX_H, srcW: img.width, srcH: img.height };
    }, { b64, WIDTH, QUAL, MAX_H });
    fs.writeFileSync(out, Buffer.from(jpg.data.split(',')[1], 'base64'));
    rows.push(`${f.replace(/\.png$/, '').padEnd(26)} ${String(jpg.srcW + 'x' + jpg.srcH).padEnd(13)} -> ${String((fs.statSync(out).size / 1024).toFixed(0) + 'KB').padStart(7)}${jpg.truncated ? '  [CROPPED]' : ''}`);
  } catch (e) { rows.push(`${f.padEnd(26)} FAIL ${String(e.message).split('\n')[0].slice(0, 60)}`); }
}
await browser.close();
console.log(rows.join('\n'));
const total = fs.readdirSync(DEST).reduce((n, f) => n + fs.statSync(path.join(DEST, f)).size, 0);
console.log(`\n${fs.readdirSync(DEST).length} files, ${(total / 1048576).toFixed(1)}MB total`);
