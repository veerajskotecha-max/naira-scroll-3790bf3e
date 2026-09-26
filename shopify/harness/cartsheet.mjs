// Build a before/after contact sheet for the cart checkout button.
// Both columns come from the same local build — only the patch differs — so the
// comparison is not confounded by live data or a different bundle.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const [BEFORE, AFTER, OUT] = process.argv.slice(2);
// name, label, css width, crop top in DEVICE px (dsf 2), crop height in device px
const ROWS = [
  ['fold-cover',  'Galaxy Z Fold, cover screen — 344px', 344],
  ['android-360', 'Galaxy A / Redmi — 360px',            360],
  ['iphone-14',   'iPhone 14 / 15 — 390px',              390],
  ['pixel',       'Pixel / large Android — 412px',       412],
];
const b64 = (f) => 'data:image/png;base64,' + readFileSync(f).toString('base64');

const cells = ROWS.map(([n, label, w]) => {
  // the clips are already cropped to the button; both columns just scale to a
  // common width, and each keeps its own height so the growth is visible
  const shot = (dir, cls, cap) => `<figure><figcaption class="${cls}">${cap}</figcaption>
      <img src="${b64(`${dir}/${n}.png`)}"></figure>`;
  return `<section>
    <h2>${label}</h2>
    <div class="pair">${shot(BEFORE, 'bad', 'before')}${shot(AFTER, 'good', 'after')}</div>
  </section>`;
}).join('');

const html = `<!doctype html><meta charset="utf-8"><style>
 :root{--ink:#1c1a17;--cream:#faf7f2;--rule:#e2dbd0}
 *{box-sizing:border-box} body{margin:0;background:var(--cream);color:var(--ink);
   font:14px/1.4 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;padding:26px 26px 34px}
 h1{font-size:19px;margin:0 0 4px;letter-spacing:.01em}
 p.sub{margin:0 0 22px;color:#6b6257;font-size:12.5px}
 section{margin-bottom:26px}
 h2{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#6b6257;
    margin:0 0 8px;padding-bottom:6px;border-bottom:1px solid var(--rule)}
 .pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}
 figure{margin:0}
 figcaption{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}
 .bad{color:#9c3b2e} .good{color:#3f6b52}
 figure img{display:block;width:100%;border:1px solid var(--rule);border-radius:7px;background:#fff}
 .pair{align-items:start}
</style>
<h1>Cart checkout button — before and after</h1>
<p class="sub">Same local build, same cart, same product. The only difference between the two columns is the patch.</p>
${cells}`;

const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await br.newPage({ viewport: { width: 820, height: 900 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: 'load' });
await p.waitForTimeout(500);
writeFileSync(OUT, await p.screenshot({ fullPage: true, type: 'jpeg', quality: 82 }));
console.log('sheet ->', OUT);
await br.close();
