// Lay a set of screencast frames (adtrace.mjs FILM=dir, t<seconds>.jpg) side by
// side, one row per run: node filmsheet.mjs out.jpg "label|dir" "label|dir" ...
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
const [OUT, ...rows] = process.argv.slice(2);
const TIMES = (process.env.TIMES || '0.5,1.0,1.5,2.0,2.5,3.0,4.0,5.0,6.0').split(',');
const html = `<!doctype html><meta charset="utf-8"><style>
 body{margin:0;padding:18px 20px;background:#faf7f2;color:#1c1a17;font:13px/1.35 ui-sans-serif,system-ui,sans-serif}
 h2{font-size:12px;letter-spacing:.05em;text-transform:uppercase;margin:0 0 6px;color:#3a332c}
 section{margin-bottom:14px} .s{display:grid;grid-template-columns:repeat(${TIMES.length},1fr);gap:7px}
 figure{margin:0} img{width:100%;display:block;border:1px solid #e2dbd0;border-radius:4px}
 figcaption{text-align:center;font-size:11px;color:#6b6257;margin-top:3px;font-variant-numeric:tabular-nums}
</style>${rows.map((r) => { const [label, dir] = r.split('|'); return `<section><h2>${label}</h2><div class="s">${TIMES.map((t) => {
  const f = `${dir}/t${t}.jpg`; return `<figure>${existsSync(f) ? `<img src="data:image/jpeg;base64,${readFileSync(f).toString('base64')}">` : '<div></div>'}<figcaption>${t} s</figcaption></figure>`; }).join('')}</div></section>`; }).join('')}`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1500, height: 400 }, deviceScaleFactor: 1 });
await p.setContent(html); await p.waitForTimeout(200);
await p.screenshot({ path: OUT, type: 'jpeg', quality: 82, fullPage: true }); await b.close(); console.log('->', OUT);
