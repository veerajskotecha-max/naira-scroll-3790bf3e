// node probe.mjs <version> [step]  -> prints overlay/face overlaps
import { chromium } from 'playwright-core';
import { readFileSync } from 'fs';
import { resolve } from 'path';
const [ver, stepArg] = process.argv.slice(2); const step = +(stepArg || .1);
const D = JSON.parse(readFileSync(`data_${ver}.json`, 'utf8')); D.version = ver;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-web-security'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => { console.error('PAGEERROR', e.message); process.exit(2); });
await p.addInitScript(d => { window.D = d; }, D);
await p.goto('file://' + resolve('index.html')); await p.evaluate(() => window.ready);
const hits = {};
for (let t = 0; t < D.dur; t += step) {
  const r = await p.evaluate(tt => { window.render(tt); return window.probe(tt); }, t);
  for (const e of r.els) for (const f of r.faces) {
    const ix = Math.min(e.x1, f.x1) - Math.max(e.x0, f.x0), iy = Math.min(e.y1, f.y1) - Math.max(e.y0, f.y0);
    if (ix > 4 && iy > 4) { const k = e.n; (hits[k] ||= []).push(`${t.toFixed(1)}(${Math.round(ix)}x${Math.round(iy)})`); }
  }
}
for (const [k, v] of Object.entries(hits)) console.log(k.padEnd(48), v.length, v.slice(0, 8).join(' '), v.length > 8 ? '…' : '');
if (!Object.keys(hits).length) console.log('no overlaps');
await b.close();
