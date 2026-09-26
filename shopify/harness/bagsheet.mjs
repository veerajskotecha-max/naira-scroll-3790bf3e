// Before/after sheet for the bag header: top of the open bag at each phone
// width, plus desktop.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const [BEFORE, AFTER, OUT] = process.argv.slice(2);
const ROWS = [['344', 'Galaxy Z Fold cover · 344px', 344], ['360', 'Galaxy A / Redmi · 360px', 360], ['390', 'iPhone 14/15 · 390px', 390], ['412', 'Pixel · 412px', 412]];
const b64 = (f) => 'data:image/png;base64,' + readFileSync(f).toString('base64');
const crop = (file, w, hCss) => `<div class="win" style="aspect-ratio:${w}/${hCss}"><img src="${b64(file)}" style="width:100%"></div>`;
const rows = ROWS.map(([n, label, w]) => `<section><h2>${label}</h2><div class="pair">
  <figure><figcaption class="bad">today</figcaption>${crop(`${BEFORE}/bag-${n}.png`, w, 250)}</figure>
  <figure><figcaption class="good">fixed</figcaption>${crop(`${AFTER}/bag-${n}.png`, w, 250)}</figure></div></section>`).join('');
const desk = `<section><h2>Desktop · the side panel keeps its corner cross, unchanged</h2><div class="pair one">
  <figure><figcaption class="good">fixed</figcaption><div class="win" style="aspect-ratio:1280/300"><img src="${b64(`${AFTER}/bag-desktop.png`)}" style="width:100%"></div></figure></div></section>`;
const html = `<!doctype html><meta charset="utf-8"><style>
 body{margin:0;background:#faf7f2;color:#1c1a17;padding:24px 26px 30px;font:13px/1.45 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
 h1{font-size:19px;margin:0 0 4px} p.sub{margin:0 0 20px;color:#6b6257;font-size:12.5px;max-width:720px}
 section{margin-bottom:22px} h2{font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:#6b6257;margin:0 0 8px;padding-bottom:6px;border-bottom:1px solid #e2dbd0}
 .pair{display:grid;grid-template-columns:1fr 1fr;gap:16px} .pair.one{grid-template-columns:1fr}
 figure{margin:0} figcaption{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px} .bad{color:#9c3b2e} .good{color:#3f6b52}
 .win{overflow:hidden;border:1px solid #e2dbd0;border-radius:7px;background:#fff} .win img{display:block}
</style><h1>The bag on phones — today and fixed</h1>
<p class="sub">Today the bag has two identical crosses in one column: the top one closes it, the lower one deletes the piece. Fixed: a back arrow top-left closes it (and so does the phone's own back button now), and deleting says "Remove".</p>${rows}${desk}`;
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await br.newPage({ viewport: { width: 860, height: 900 }, deviceScaleFactor: 2 });
await p.setContent(html, { waitUntil: 'load' }); await p.waitForTimeout(400);
writeFileSync(OUT, await p.screenshot({ fullPage: true, type: 'jpeg', quality: 82 }));
console.log('sheet ->', OUT); await br.close();
