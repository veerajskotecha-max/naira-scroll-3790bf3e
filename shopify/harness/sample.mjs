import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const file = process.argv[2];
const pts = JSON.parse(process.argv[3]); // [[label,xFrac,yFrac],...]
const d = 'data:image/png;base64,' + readFileSync(file).toString('base64');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage();
const out = await page.evaluate(async ({ d, pts }) => {
  const img = new Image(); img.src = d; await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  c.getContext('2d').drawImage(img, 0, 0);
  const g = c.getContext('2d');
  const hex = n => n.toString(16).padStart(2, '0');
  return pts.map(([label, fx, fy]) => {
    const x = Math.round(fx * c.width), y = Math.round(fy * c.height);
    // 5x5 average so a single antialiased pixel can't lie
    let r=0,gr=0,bl=0,n=0;
    for (let dy=-2; dy<=2; dy++) for (let dx=-2; dx<=2; dx++) {
      const p = g.getImageData(x+dx, y+dy, 1, 1).data;
      r+=p[0]; gr+=p[1]; bl+=p[2]; n++;
    }
    r=Math.round(r/n); gr=Math.round(gr/n); bl=Math.round(bl/n);
    return `${label.padEnd(16)} #${hex(r)}${hex(gr)}${hex(bl)}`;
  });
}, { d, pts });
console.log(out.join('\n'));
await b.close();
