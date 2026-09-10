import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const files = process.argv.slice(3);
const out = process.argv[2];
const mime = f => f.endsWith('.webp') ? 'image/webp' : f.endsWith('.svg') ? 'image/svg+xml' : f.endsWith('.jpg')||f.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';
const imgs = files.map(f => ({ n: f.split('/').pop(),
  d: `data:${mime(f)};base64,` + readFileSync(f).toString('base64') }));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1300, height: 900 } });
await page.setContent(`<style>body{margin:0;background:#3a3a3a;display:grid;
 grid-template-columns:repeat(2,1fr);gap:10px;padding:10px;font:13px sans-serif}
 figure{margin:0}img{width:100%;display:block}
 figcaption{color:#fff;padding:4px 0}</style>` +
  imgs.map(i => `<figure><img src="${i.d}"><figcaption>${i.n}</figcaption></figure>`).join(''));
await page.waitForTimeout(1200);
const bad = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.alt || 'BROKEN').length);
writeFileSync(out, await page.screenshot({ fullPage: true }));
console.log('broken images:', bad);
await b.close();
