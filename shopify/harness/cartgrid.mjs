// Contact sheet: the whole cart drawer on every phone width we test, one build.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const [DIR, OUT, TITLE = 'Cart drawer — all phone widths'] = process.argv.slice(2);
const PHONES = [
  ['fold-cover',  'Z Fold cover · 344',  344],
  ['android-360', 'Galaxy A / Redmi · 360', 360],
  ['android-360t','Galaxy A tall · 360', 360],
  ['iphone-se',   'iPhone SE · 375',     375],
  ['iphone-14',   'iPhone 14/15 · 390',  390],
  ['pixel',       'Pixel · 412',         412],
];
const b64 = (f) => 'data:image/png;base64,' + readFileSync(f).toString('base64');
const cells = PHONES.map(([n, label]) =>
  `<figure><img src="${b64(`${DIR}/${n}.png`)}"><figcaption>${label}</figcaption></figure>`).join('');
const html = `<!doctype html><meta charset="utf-8"><style>
 body{margin:0;background:#faf7f2;color:#1c1a17;padding:24px;
      font:13px/1.4 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
 h1{font-size:18px;margin:0 0 18px}
 .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
 figure{margin:0}
 img{display:block;width:100%;border:1px solid #e2dbd0;border-radius:6px;background:#fff}
 figcaption{margin-top:6px;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#6b6257}
</style><h1>${TITLE}</h1><div class="grid">${cells}</div>`;
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await br.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: 'load' });
await p.waitForTimeout(500);
writeFileSync(OUT, await p.screenshot({ fullPage: true, type: 'jpeg', quality: 78 }));
console.log('grid ->', OUT);
await br.close();
