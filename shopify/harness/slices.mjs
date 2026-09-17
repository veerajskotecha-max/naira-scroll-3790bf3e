// Scale a tall screenshot to a readable width and cut it into vertical slices
// so each piece can be looked at without losing detail.
// usage: node slices.mjs <src.png> <outPrefix> [targetWidth=900] [sliceH=1100]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const [src, prefix, W = '900', SH = '1100'] = process.argv.slice(2);
const w = +W, sh = +SH;
const data = 'data:image/png;base64,' + readFileSync(src).toString('base64');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: w, height: 400 } });
await page.setContent(`<img id=i src="${data}">`);
await page.waitForFunction(() => { const i = document.getElementById('i'); return i.complete && i.naturalWidth; });
const { nw, nh } = await page.evaluate(() => ({ nw: i.naturalWidth, nh: i.naturalHeight }));
const scale = w / nw, H = Math.round(nh * scale), n = Math.ceil(H / sh);
const out = [];
for (let k = 0; k < n; k++) {
  const top = k * sh, h = Math.min(sh, H - top);
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<style>html,body{margin:0;background:#222;overflow:hidden}
    img{position:absolute;left:0;top:${-top}px;width:${w}px;display:block}</style><img src="${data}">`);
  await page.waitForTimeout(220);
  const f = `${prefix}-${String(k + 1).padStart(2, '0')}.png`;
  writeFileSync(f, await page.screenshot()); out.push(f);
}
console.log(`${src} ${nw}x${nh} -> ${w}x${H} in ${n} slices`);
await b.close();
