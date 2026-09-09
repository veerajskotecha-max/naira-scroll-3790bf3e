import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'node:fs';
/* No PIL in this container (the apt build targets 3.12, python is 3.11), so
   crops go through a real canvas in Chromium instead. */
/* Chromium refuses to decode a file:// image from an about:blank page, so
   the source is handed over as a data URL instead. */
const SRC = 'data:image/png;base64,' + readFileSync(process.argv[2]).toString('base64');
const CUTS = [
  // The generator flattened the right half and left a hard vertical seam at
  // exactly 50%. Crop below it and let CSS supply the negative space instead.
  { name: 'nf-hero.jpg', sx: 0, sy: 0, sw: 0.49, sh: 1, out: 1400, q: 0.86 },
  // A squarer cut for the mobile band, framed tighter on the pedestal.
  { name: 'nf-hero-mobile.jpg', sx: 0.03, sy: 0.06, sw: 0.5, sh: 0.94, out: 1000, q: 0.86 },
];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage();
await page.goto('about:blank');
for (const c of CUTS) {
  const dataUrl = await page.evaluate(async ({ src, c }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const sw = img.width * c.sw, sh = img.height * c.sh;
    const cv = document.createElement('canvas');
    cv.width = c.out;
    cv.height = Math.round(c.out * (sh / sw));
    const g = cv.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, img.width * c.sx, img.height * c.sy, sw, sh, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/jpeg', c.q);
  }, { src: SRC, c });
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  writeFileSync('shopify/savor/assets/' + c.name, buf);
  console.log(`${c.name}  ${(buf.length / 1024).toFixed(0)}KB`);
}
await b.close();
