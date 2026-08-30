// Side-by-side computed-style diff: the real React app (built to dist/, port 4320)
// against the ported Liquid theme (rendered + served on port 4310).
//
// Screenshots only catch what the eye happens to land on. This walks both DOMs,
// keys every text-bearing element by its own text, and reports:
//   MISSING  text the React page renders and the theme does not
//   EXTRA    text the theme renders and React does not
//   DRIFT    text both render, with the computed properties that differ
//
// Usage: node styledif.mjs <reactPath> <themePath> [--width 1440] [--json out.json]
import { chromium } from 'playwright';
import fs from 'node:fs';

const args = process.argv.slice(2);
const reactPath = args[0] ?? '/';
const themePath = args[1] ?? '/index';
const width = Number((args[args.indexOf('--width') + 1]) || 1440) || 1440;
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;

const PROPS = ['fontFamily','fontSize','fontWeight','fontStyle','textTransform','letterSpacing',
               'lineHeight','color','backgroundColor','textAlign','textDecorationLine'];

const collect = () => {
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();
  const key = s => norm(s).toLowerCase().replace(/[‘’']/g, "'").replace(/[“”]/g, '"');
  const out = [];
  const seen = new Map();
  for (const el of document.querySelectorAll('body *')) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG|PATH|LINK|META|HEAD)$/.test(el.tagName)) continue;
    // own text only: ignore text that belongs to a descendant
    let own = '';
    for (const n of el.childNodes) if (n.nodeType === 3) own += n.nodeValue;
    own = norm(own);
    if (own.length < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const k = key(own);
    const n = (seen.get(k) || 0) + 1; seen.set(k, n);
    const style = {};
    for (const p of ['fontFamily','fontSize','fontWeight','fontStyle','textTransform','letterSpacing',
                     'lineHeight','color','backgroundColor','textAlign','textDecorationLine']) style[p] = cs[p];
    // what the user actually sees, after text-transform
    let shown = own;
    if (cs.textTransform === 'uppercase') shown = own.toUpperCase();
    else if (cs.textTransform === 'lowercase') shown = own.toLowerCase();
    out.push({ k: k + (n > 1 ? '#' + n : ''), text: own, shown, tag: el.tagName.toLowerCase(),
               cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60), style,
               w: Math.round(r.width), h: Math.round(r.height) });
  }
  // images and background images, keyed by file basename
  const media = [];
  for (const el of document.querySelectorAll('img')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2) continue;
    media.push({ kind: 'img', file: (el.currentSrc || el.src || '').split('/').pop().split('?')[0],
                 w: Math.round(r.width), h: Math.round(r.height),
                 fit: getComputedStyle(el).objectFit, natural: el.naturalWidth });
  }
  for (const el of document.querySelectorAll('body *')) {
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === 'none' || !bg.includes('url(')) continue;
    const r = el.getBoundingClientRect(); if (r.width < 2) continue;
    for (const m of bg.matchAll(/url\("?([^")]+)"?\)/g))
      media.push({ kind: 'bg', file: m[1].split('/').pop().split('?')[0],
                   w: Math.round(r.width), h: Math.round(r.height),
                   size: getComputedStyle(el).backgroundSize, op: getComputedStyle(el).opacity });
  }
  return { nodes: out, media, docH: document.documentElement.scrollHeight };
};

async function grab(browser, url, label) {
  const ctx = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.route('**/*', async r => {
    const u = r.request().url();
    if (u.includes('127.0.0.1')) return r.continue();
    try {
      const res = await fetch(u, { redirect: 'follow' });
      const body = Buffer.from(await res.arrayBuffer());
      const h = Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
      await r.fulfill({ status: res.status, headers: h, body });
    } catch { await r.abort(); }
  });
  // Both sides pop the welcome offer 9s after load. Whichever side reaches that
  // mark first during the scroll walk shows a modal the other does not, and the
  // whole dialog reads as a diff. Same localStorage key on both, so seed it.
  await ctx.addInitScript(() => {
    try { localStorage.setItem('naira-promo-popup-seen', '1'); } catch (e) {}
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(() => { document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager'); });
  // walk the page so scroll-triggered content mounts, then come back
  await page.evaluate(async () => {
    const step = innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y); await new Promise(r => setTimeout(r, 90));
    }
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
  });
  await page.waitForTimeout(1200);
  const data = await page.evaluate(collect);
  await ctx.close();
  console.error(`  ${label}: ${data.nodes.length} text nodes, ${data.media.length} media, ${data.docH}px tall`);
  return data;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
console.error(`collecting @ ${width}px`);
const A = await grab(browser, (process.env.REACT_BASE || 'http://127.0.0.1:4320') + reactPath, 'react');
const B = await grab(browser, (process.env.THEME_BASE || 'http://127.0.0.1:4310') + themePath, 'theme');
await browser.close();

const bykey = arr => { const m = new Map(); for (const n of arr) if (!m.has(n.k)) m.set(n.k, n); return m; };
const MA = bykey(A.nodes), MB = bykey(B.nodes);

const missing = [...MA.values()].filter(n => !MB.has(n.k));
const extra   = [...MB.values()].filter(n => !MA.has(n.k));
const drift = [];
for (const [k, a] of MA) {
  const b = MB.get(k); if (!b) continue;
  const diffs = [];
  if (a.shown !== b.shown) diffs.push({ p: 'RENDERED TEXT', react: a.shown.slice(0,48), theme: b.shown.slice(0,48) });
  for (const p of PROPS) {
    let av = a.style[p], bv = b.style[p];
    if (p === 'fontFamily') { av = av.split(',')[0].replace(/["']/g,''); bv = bv.split(',')[0].replace(/["']/g,''); }
    if (av !== bv) diffs.push({ p, react: av, theme: bv });
  }
  if (diffs.length) drift.push({ text: a.text.slice(0, 52), tag: a.tag, cls: a.cls, diffs });
}

const mediaNames = d => new Set(d.media.map(m => m.file));
const mA = mediaNames(A), mB = mediaNames(B);

const report = { width, reactPath, themePath,
  counts: { reactNodes: A.nodes.length, themeNodes: B.nodes.length,
            missing: missing.length, extra: extra.length, drift: drift.length,
            reactHeight: A.docH, themeHeight: B.docH },
  missing: missing.map(n => ({ text: n.text.slice(0,70), tag: n.tag, cls: n.cls })),
  extra:   extra.map(n => ({ text: n.text.slice(0,70), tag: n.tag, cls: n.cls })),
  drift,
  mediaOnlyInReact: [...mA].filter(f => !mB.has(f)),
  mediaOnlyInTheme: [...mB].filter(f => !mA.has(f)) };

if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(report, null, 1));

console.log(`\n=== ${reactPath}  vs  ${themePath}   @${width}px ===`);
console.log(`react ${A.nodes.length} text nodes / ${A.docH}px   theme ${B.nodes.length} / ${B.docH}px`);
console.log(`MISSING ${missing.length}   EXTRA ${extra.length}   DRIFT ${drift.length}`);
const propCount = {};
for (const d of drift) for (const x of d.diffs) propCount[x.p] = (propCount[x.p] || 0) + 1;
console.log('\ndrift by property:');
for (const [p, n] of Object.entries(propCount).sort((a,b) => b[1]-a[1])) console.log(`  ${String(n).padStart(4)}  ${p}`);
console.log(`\nmedia only in react (${report.mediaOnlyInReact.length}): ${report.mediaOnlyInReact.slice(0,14).join(', ')}`);
console.log(`media only in theme (${report.mediaOnlyInTheme.length}): ${report.mediaOnlyInTheme.slice(0,14).join(', ')}`);
