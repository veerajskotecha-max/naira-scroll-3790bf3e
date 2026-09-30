// Lay screenshots side by side with captions, for comparing pages:
//   node imgsheet.mjs out.jpg "caption|file.jpg" "caption|file.png" ...
//   COLS=6 (per row), TITLE="..." (a heading over the sheet)
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
const [OUT, ...cells] = process.argv.slice(2);
const COLS = Number(process.env.COLS || Math.min(cells.length, 6));
const mime = (f) => (/\.png$/i.test(f) ? 'image/png' : 'image/jpeg');
const html = `<!doctype html><meta charset="utf-8"><style>
 body{margin:0;padding:18px 20px;background:#faf7f2;color:#1c1a17;font:13px/1.35 ui-sans-serif,system-ui,sans-serif}
 h1{font-size:15px;margin:0 0 12px;letter-spacing:.02em}
 .g{display:grid;grid-template-columns:repeat(${COLS},1fr);gap:12px;align-items:start}
 figure{margin:0} img{width:100%;display:block;border:1px solid #e2dbd0;border-radius:4px}
 figcaption{font-size:12px;color:#3a332c;margin-top:4px;font-weight:600}
</style>${process.env.TITLE ? `<h1>${process.env.TITLE}</h1>` : ''}<div class="g">${cells.map((c) => {
  const [cap, file] = c.split('|');
  return `<figure>${existsSync(file) ? `<img src="data:${mime(file)};base64,${readFileSync(file).toString('base64')}">` : '<div>missing</div>'}<figcaption>${cap}</figcaption></figure>`;
}).join('')}</div>`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: Number(process.env.WIDTH || 1500), height: 400 }, deviceScaleFactor: 1 });
await p.setContent(html); await p.waitForTimeout(300);
await p.screenshot({ path: OUT, type: 'jpeg', quality: 84, fullPage: true }); await b.close(); console.log('->', OUT);
