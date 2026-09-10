import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const file = process.argv[2];
const top = Number(process.argv[3] || 12);
const d = 'data:image/png;base64,' + readFileSync(file).toString('base64');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage();
const out = await page.evaluate(async ({ d, top }) => {
  const img = new Image(); img.src = d; await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const px = g.getImageData(0, 0, c.width, c.height).data;
  const bins = new Map();
  for (let i = 0; i < px.length; i += 4) {
    // quantise to 8 levels per channel so watercolour washes group
    const k = ((px[i] >> 3) << 10) | ((px[i+1] >> 3) << 5) | (px[i+2] >> 3);
    const e = bins.get(k) || [0, 0, 0, 0];
    e[0] += px[i]; e[1] += px[i+1]; e[2] += px[i+2]; e[3]++;
    bins.set(k, e);
  }
  const hex = n => Math.round(n).toString(16).padStart(2, '0');
  const total = px.length / 4;
  return [...bins.values()].sort((a, b2) => b2[3] - a[3]).slice(0, top)
    .map(e => `#${hex(e[0]/e[3])}${hex(e[1]/e[3])}${hex(e[2]/e[3])}  ${(100*e[3]/total).toFixed(1)}%`);
}, { d, top });
console.log(out.join('\n'));
await b.close();
