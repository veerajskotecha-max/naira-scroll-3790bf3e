import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'node:fs';
/* The brand book sets the wordmark in sage on cream. That is right at the
   scale the book shows it; in a 30px header it measures 2.1:1 and reads as a
   smudge. The book's own lockup page supplies a high-contrast pair for
   exactly this case, so: sage letterforms -> ink, peach iris untouched.
   Hue classification, because the two are far apart on the wheel (sage ~165
   degrees, peach ~20) and luminance alone would flatten both. */
const src = 'data:image/png;base64,' + readFileSync(process.argv[2]).toString('base64');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage();
const out = await page.evaluate(async (src) => {
  const img = new Image(); img.src = src; await img.decode();
  const cv = document.createElement('canvas');
  cv.width = img.width; cv.height = img.height;
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, cv.width, cv.height), a = d.data;
  let recoloured = 0, kept = 0;
  for (let i = 0; i < a.length; i += 4) {
    const r = a[i], gr = a[i + 1], bl = a[i + 2];
    const mx = Math.max(r, gr, bl), mn = Math.min(r, gr, bl);
    const sat = mx === 0 ? 0 : (mx - mn) / mx;
    if (sat < 0.06) continue;                      // near-neutral ground
    let h;                                          // hue in degrees
    if (mx === r) h = 60 * (((gr - bl) / (mx - mn)) % 6);
    else if (mx === gr) h = 60 * ((bl - r) / (mx - mn) + 2);
    else h = 60 * ((r - gr) / (mx - mn) + 4);
    if (h < 0) h += 360;
    if (h > 120 && h < 220) {                       // sage / cyan-green
      /* Keep the pixel's own lightness so anti-aliased edges stay smooth:
         a hard fill would leave the letterforms jagged. */
      const t = (r + gr + bl) / 765;
      a[i]     = Math.round(26  + (255 - 26)  * t * 0.10);
      a[i + 1] = Math.round(22  + (248 - 22)  * t * 0.10);
      a[i + 2] = Math.round(20  + (245 - 20)  * t * 0.10);
      recoloured++;
    } else kept++;
  }
  g.putImageData(d, 0, 0);
  return { url: cv.toDataURL('image/png'), recoloured, kept };
}, src);
writeFileSync(process.argv[3], Buffer.from(out.url.split(',')[1], 'base64'));
console.log(`${process.argv[3]}  sage->ink: ${out.recoloured} px, peach kept: ${out.kept} px`);
await b.close();
