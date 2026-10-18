// Every jewellery product page on a phone: where does each recommendation link
// go, and should it?
//   node pdplinks.mjs <base> <catalogue.json> [out.json]
// catalogue.json is the live catalogue as the site builds it (an array of
// { handle, name, category, sale, tags, adjustable }). Each page is opened once; its
// "Complete the look", "More …" and reel product links are read and checked
// against the catalogue and against the pages that actually rendered:
//   broken    the link's piece is not in the catalogue or its page did not render
//   self      a page recommending itself
//   twice     the same piece twice in one row
//   sold out  a recommended piece that cannot be bought
//   ring add  a one-tap Add on a ring sized to the finger (open-back rings,
//             adjustable in the catalogue, fit US 6 to 8 and may be added)
//   pre-order a one-tap Add on a piece Shopify tags pre-order
// Network through Node (the sandbox CA); nothing reaches an ad or analytics
// account (noreport.mjs). CONC=4 pages at a time; ONLY=regex for a subset.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { NO_REPORT } from './noreport.mjs';

const [BASE, CATALOGUE, OUT] = process.argv.slice(2);
if (!BASE || !CATALOGUE) {
  console.error('usage: node pdplinks.mjs <base> <catalogue.json> [out.json]');
  process.exit(2);
}
const catalogue = JSON.parse(readFileSync(CATALOGUE, 'utf8'));
const byHandle = new Map(catalogue.map((p) => [p.handle, p]));
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const pages = catalogue.filter((p) => !ONLY || ONLY.test(p.handle));
const CONC = Number(process.env.CONC || 4);
const ANDROID = 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: ANDROID });
await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
await ctx.route('**/*', async (route) => {
  const q = route.request();
  const u = q.url();
  if (NO_REPORT.test(u) || q.resourceType() === 'media') return route.abort();
  try {
    const r = await fetch(u, { method: q.method(), headers: q.headers(), body: q.postDataBuffer() || undefined, redirect: 'manual' });
    const body = Buffer.from(await r.arrayBuffer());
    const headers = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
    await route.fulfill({ status: r.status, headers, body });
  } catch {
    await route.abort().catch(() => {});
  }
});

const handleOf = (href) => (href.match(/\/jewellery\/([^/?#]+)/) || [])[1] || null;

const visit = async (piece) => {
  const p = await ctx.newPage();
  const row = { handle: piece.handle, name: piece.name, category: piece.category, rendered: false, h1: '', look: [], more: [], reels: [], moreTitle: '' };
  try {
    await p.goto(`${BASE}/jewellery/${piece.handle}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForFunction(() => document.querySelector('#root h1') && [...document.querySelectorAll('button')].some((x) => Object.keys(x).some((k) => k.startsWith('__react'))), null, { timeout: 60000 });
    // The rows fill from the live catalogue; give it time to arrive.
    await p.waitForFunction(() => document.querySelector('#more-like-this'), null, { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(2500);
    Object.assign(
      row,
      await p.evaluate(() => {
        const cards = (selector) =>
          [...document.querySelectorAll(`${selector} article`)].map((a) => ({
            href: a.querySelector('a')?.getAttribute('href') || '',
            name: (a.querySelectorAll('a')[1]?.textContent || a.querySelector('a')?.textContent || '').trim(),
            action: [...a.querySelectorAll('button, a')].map((x) => x.textContent.trim()).filter((t) => /^(add|adding…|choose size|pre-order|view)/i.test(t))[0] || '',
          }));
        return {
          rendered: true,
          h1: document.querySelector('#root h1')?.textContent.trim() || '',
          look: cards('section[aria-labelledby="complete-the-look"]'),
          more: cards('section[aria-labelledby="more-like-this"]'),
          moreTitle: document.querySelector('#more-like-this')?.textContent.trim() || '',
          reels: [...document.querySelectorAll('section[aria-labelledby="shop-reels-title"] a[href*="/jewellery/"]')].map((a) => a.getAttribute('href')),
        };
      }),
    );
  } catch (error) {
    row.error = String(error.message || error).slice(0, 120);
  } finally {
    await p.close();
  }
  return row;
};

const rows = [];
let next = 0;
await Promise.all(
  Array.from({ length: CONC }, async () => {
    while (next < pages.length) {
      const piece = pages[next++];
      rows.push(await visit(piece));
      process.stdout.write('.');
    }
  }),
);
console.log('');
await b.close();

const rendered = new Set(rows.filter((r) => r.rendered && r.h1).map((r) => r.handle));
const problems = [];
const flag = (page, kind, detail) => problems.push({ page, kind, detail });
for (const r of rows) {
  if (!r.rendered) flag(r.handle, 'page', r.error || 'did not render');
  for (const [row, cards] of [['look', r.look], ['more', r.more]]) {
    const seen = new Set();
    for (const c of cards) {
      const h = handleOf(c.href);
      const target = h && byHandle.get(h);
      if (!h || !target) flag(r.handle, 'broken', `${row}: ${c.href}`);
      else if (!rendered.has(h) && !ONLY) flag(r.handle, 'broken', `${row}: ${h} did not render`);
      if (h === r.handle) flag(r.handle, 'self', row);
      if (h && seen.has(h)) flag(r.handle, 'twice', `${row}: ${h}`);
      if (h) seen.add(h);
      if (target && target.sale === false) flag(r.handle, 'sold out', `${row}: ${h}`);
      if (target && /^add/i.test(c.action) && target.category === 'Rings' && !target.adjustable) flag(r.handle, 'ring add', `${row}: ${h}`);
      if (target && /^choose size/i.test(c.action) && (target.category !== 'Rings' || target.adjustable)) flag(r.handle, 'needless size', `${row}: ${h}`);
      if (target && /^add/i.test(c.action) && /pre-order/i.test(target.tags || '')) flag(r.handle, 'pre-order', `${row}: ${h}`);
    }
  }
  for (const href of r.reels) {
    const h = handleOf(href);
    if (!h || !byHandle.has(h)) flag(r.handle, 'broken', `reel: ${href}`);
  }
}

const count = (kind) => problems.filter((x) => x.kind === kind).length;
const kinds = ['page', 'broken', 'self', 'twice', 'sold out', 'ring add', 'needless size', 'pre-order'];
console.log(`${rows.length} product pages · ${rendered.size} rendered · ${rows.reduce((t, r) => t + r.look.length + r.more.length, 0)} recommendation links · ${rows.reduce((t, r) => t + r.reels.length, 0)} reel links`);
for (const kind of kinds) console.log(`  ${kind.padEnd(9)} ${count(kind)}`);
const byKind = {};
for (const x of problems) (byKind[x.kind] ||= []).push(`${x.page} → ${x.detail}`);
for (const kind of kinds) if (byKind[kind]) console.log(`\n${kind}:\n  ${[...new Set(byKind[kind])].slice(0, 12).join('\n  ')}${byKind[kind].length > 12 ? `\n  … ${byKind[kind].length - 12} more` : ''}`);
if (OUT) writeFileSync(OUT, JSON.stringify({ rows, problems }, null, 1));
process.exit(problems.length ? 1 : 0);
