import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const out = process.argv[2];
const grounds = ['#FFF8F5', '#FFFFFF', '#99B4AF'];
const files = process.argv.slice(3);
const imgs = files.map(f => ({ n: f.split('/').pop(),
  d: 'data:image/png;base64,' + readFileSync(f).toString('base64') }));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1100, height: 700 } });
await page.setContent(`<style>body{margin:0;font:12px sans-serif;background:#2a2a2a}
 .row{display:flex}.cell{flex:1;padding:22px;display:flex;align-items:center;justify-content:center}
 img{width:200px}.lbl{color:#fff;padding:6px 10px}</style>` +
 imgs.map(i => `<div class="lbl">${i.n} — shown at 200px, the size a checkout header uses</div>
  <div class="row">${grounds.map(g => `<div class="cell" style="background:${g}"><img src="${i.d}"></div>`).join('')}</div>`).join(''));
await page.waitForTimeout(1000);
writeFileSync(out, await page.screenshot({ fullPage: true }));
console.log('ok');
await b.close();
