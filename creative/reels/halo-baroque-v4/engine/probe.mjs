import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
const D = JSON.parse(readFileSync('data.json', 'utf8')), faces = JSON.parse(readFileSync('../faces.json', 'utf8'));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.addInitScript(d => { window.D = d; }, D);
await p.goto('file://' + resolve('index.html')); await p.evaluate(() => window.ready);
const out = [];
for (const k of Object.keys(faces)) {
  const t = +k;
  const boxes = await p.evaluate(t => {
    render(t);
    const vis = el => { let e = el; while (e && e.nodeType === 1) { const cs = getComputedStyle(e); if (cs.display === 'none' || +cs.opacity < .05) return false; if (e.getAttribute && e.getAttribute('opacity') !== null && +e.getAttribute('opacity') < .05) return false; e = e.parentNode; } return true; };
    const q = [['bubble', '.bub'], ['badge', '.badge'], ['tag', '.tag'], ['disc', '#disc'], ['panel', '#panel'], ['both', '#both'], ['bigtext', '.big'], ['caption', '#cap > div'],
               ['label', '#wsvg > g > g'], ['circle', '#wsvg > g > circle'], ['icon', '#text svg path']];
    const r = [];
    for (const [name, sel] of q) for (const el of document.querySelectorAll(sel)) {
      if (!vis(el)) continue; const bb = el.getBoundingClientRect(); if (bb.width < 4 || bb.height < 4) continue;
      let label = name; if (name === 'bigtext' || name === 'tag') label += ':' + el.textContent.trim().slice(0, 18);
      if (name === 'caption') { const ws = [...el.querySelectorAll('.cw')].filter(w => +getComputedStyle(w).opacity > .05); if (!ws.length) continue;
        const x0 = Math.min(...ws.map(w => w.getBoundingClientRect().left)), x1 = Math.max(...ws.map(w => w.getBoundingClientRect().right));
        const y0 = Math.min(...ws.map(w => w.getBoundingClientRect().top)), y1 = Math.max(...ws.map(w => w.getBoundingClientRect().bottom)); r.push([label, x0, y0, x1, y1]); continue; }
      r.push([label, bb.left, bb.top, bb.right, bb.bottom]);
    }
    return r;
  }, t);
  const [fx0, fy0, fx1, fy1] = faces[k];
  for (const [n, x0, y0, x1, y1] of boxes) {
    const ix = Math.max(0, Math.min(x1, fx1) - Math.max(x0, fx0)), iy = Math.max(0, Math.min(y1, fy1) - Math.max(y0, fy0));
    const frac = ix * iy / ((fx1 - fx0) * (fy1 - fy0));
    if (frac > .04) out.push({ t, n, frac: +frac.toFixed(2), box: [x0, y0, x1, y1].map(Math.round), face: faces[k] });
  }
}
writeFileSync('../overlaps.json', JSON.stringify(out));
await b.close();
const by = {}; for (const o of out) { (by[o.n] ||= []).push(o); }
for (const [n, l] of Object.entries(by)) console.log(n.padEnd(34), l.length, 'samples', 't', l[0].t, '-', l[l.length - 1].t, 'max face cover', Math.max(...l.map(o => o.frac)));
