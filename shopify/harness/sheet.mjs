import { chromium } from 'playwright';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const dir = process.argv[2];
const cols = Number(process.argv[3] || 3);
const only = process.argv[4] ? process.argv[4].split(',') : null;
const out = process.argv[5] || 'sheet.png';
let files = readdirSync(dir).filter(f => /^p-\d+\.png$/.test(f)).sort();
if (only) files = files.filter(f => only.includes(f.match(/\d+/)[0]));
const imgs = files.map(f => ({ n: f.match(/\d+/)[0],
  d: 'data:image/png;base64,' + readFileSync(dir + f).toString('base64') }));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: cols * 700, height: 1200 } });
await page.setContent(`<style>body{margin:0;background:#222;display:grid;
  grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px;font:16px sans-serif}
  figure{margin:0;position:relative}img{width:100%;display:block;background:#fff}
  figcaption{position:absolute;top:2px;left:2px;background:#000;color:#fff;padding:2px 8px}</style>` +
  imgs.map(i => `<figure><img src="${i.d}"><figcaption>p${i.n}</figcaption></figure>`).join(''));
await page.waitForTimeout(1500);
writeFileSync(dir + out, await page.screenshot({ fullPage: true }));
console.log('sheet:', out, files.length, 'pages');
await b.close();
