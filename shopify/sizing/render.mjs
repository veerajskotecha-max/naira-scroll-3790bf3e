// Size images for Naira listings. Run with NF_WORK pointing at a working folder that holds
// sizing/data.json, sizing/hi/ (photos and bmarks.json), sizing/clean/ (cleaned supplier photos),
// catalogue/products.json and fonts/ (Jost, Velista); card.html sits in sizing/render/.
// Renders every size image from sizing/data.json to sizing/cards/<handle>.jpg.
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { readFileSync, mkdirSync } from 'node:fs';
const S = process.env.NF_WORK || process.cwd();
const data = JSON.parse(readFileSync(`${S}/sizing/data.json`, 'utf8'));
const prods = Object.fromEntries(JSON.parse(readFileSync(`${S}/catalogue/products.json`, 'utf8')).map((p) => [p.handle, p]));
const only = process.argv.slice(2);
const DIMS = JSON.parse(readFileSync(`${S}/sizing/hi/dims.json`, 'utf8'));
// marks come from measured extents (tools/extent.py); y0 crops portrait photos to a square
const BM = JSON.parse(readFileSync(`${S}/sizing/hi/bmarks.json`, 'utf8'));
const Y0 = { 'aqua-heart-drops-silver': 200, 'quatrefoil-eclat-studs': 172, 'bold-dome-huggies': 215, 'torsade-huggies': 215 };
const B = Object.fromEntries(Object.entries(BM).map(([h, m]) => [h, { img: m.img, y0: Y0[h] ?? 0, marks: m.marks, mm: 10, span: m.ppm * 10, scale: m.scale }]));
const cards = [];
for (const d of data) {
  if (!d.card || (only.length && !only.includes(d.handle))) continue;
  const title = prods[d.handle].title.replace(/\s+[–—-]\s+Silver$/i, '');
  const c = { id: d.handle, type: d.card, title, caption: d.caption };
  if (d.card === 'A') c.img = `${S}/sizing/clean/${d.img}`;
  if (d.card === 'B') {
    const b = B[d.handle];
    if (!b) continue;
    c.img = `${S}/sizing/hi/${b.img}`;
    const [W, H] = DIMS.hi[b.img];
    const f = W / DIMS.copy[b.img][0]; // marks were read on the smaller copies
    c.srcW = W; c.srcH = H;
    c.crop = { x0: 0, y0: H > W ? b.y0 : 0, size: W };
    c.marks = b.marks.map((m) => ({ ...m, x1: m.x1 * f, y1: m.y1 * f, x2: m.x2 * f, y2: m.y2 * f }));
    c.scale = { x: b.scale.x * f, y: b.scale.y * f, pxPerMm: (b.span * f) / b.mm };
  }
  if (d.card === 'N') { const m = d.supplier.join(' ').match(/Length (\d+)(?: \+ (\d+))? cm/); c.length = +m[1]; c.ext = m[2] ? +m[2] : 0; }
  if (d.card === 'W') { const m = d.supplier.join(' ').match(/Length (\d+)(?: \+ (\d+))? cm/); c.length = +m[1]; c.ext = m[2] ? +m[2] : 0; c.fitLo = c.length - 2.5; c.fitHi = c.length - 1.5; }
  if (d.card === 'R') { const m = d.supplier.join(' ').match(/Inner diameter ([\d.]+) mm/); c.inner = +m[1]; c.open = /open/i.test(d.caption + ' ' + d.propose.join(' ')); }
  cards.push(c);
}
mkdirSync(`${S}/sizing/cards`, { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: 1 });
await page.goto(`file://${S}/sizing/render/card.html`);
for (const c of cards) {
  // images load over file://, so give the page absolute file URLs
  if (c.img) c.img = 'file://' + c.img;
  await page.evaluate((card) => window.renderCard(card), c);
  await page.waitForTimeout(120);
  await page.locator('#card').screenshot({ path: `${S}/sizing/cards/${c.id}.jpg`, type: 'jpeg', quality: 90 });
}
console.log('rendered', cards.length);
await b.close();
