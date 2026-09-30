// Every page in the sitemap on a phone: does it load cleanly?
//   node sitesmoke.mjs <base> [sitemap file or URL | .txt list of paths]
// For each page: page errors, console errors, failed or 4xx/5xx requests,
// whether it drew its <h1>, and on product pages whether Add to cart is ready.
// A .txt list can hold ad links (/products/<handle>?fbclid=…): each must open
// on its own product (the pre-built <h1> is the product's, not the homepage's),
// move to /jewellery/<handle> and keep its query.
// Network goes through Node (the sandbox CA); ad and analytics tags and the
// site's own Meta relay are blocked so a run never reaches anyone's reports.
//   CONC=4 pages at a time; ONLY=regex to test a subset of paths;
//   VIEW=desktop  a 1440x900 laptop instead of a phone.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { NO_REPORT } from './noreport.mjs';
const [BASE, SITEMAP = '/tmp/mainwt/dist/sitemap.xml'] = process.argv.slice(2);
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|hotjar|\/functions\/v1\/meta-capi|~api\/analytics)/i;
const xml = SITEMAP.startsWith('http') ? await (await fetch(SITEMAP)).text() : readFileSync(SITEMAP, 'utf8');
let paths = SITEMAP.endsWith('.txt') ? xml.split('\n').map((x) => x.trim()).filter(Boolean)
  : [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];
if (process.env.ONLY) paths = paths.filter((x) => new RegExp(process.env.ONLY).test(x));
const CONC = Number(process.env.CONC || 4);
// What this sandbox causes, not the site: its Chromium can't verify the proxy's
// certificate on WebSockets (route() never sees them; the same socket answers
// 101 from Node), and Instagram serves data-centre traffic its login wall, which
// refuses to be framed. Counted and reported apart, never silently dropped.
const SANDBOX = [
  [/^WebSocket connection to 'wss:\/\/[^']*supabase\.co\/realtime\/.*(net::ERR_CERT_AUTHORITY_INVALID|opening handshake timed out)/, 'WebSocket blocked by the sandbox proxy (live reviews)'],
  [/^Refused to display 'https:\/\/www\.instagram\.com\/' in a frame/, 'Instagram login wall for data-centre traffic'],
  // a live page served through route() has no certificate in Chrome's eyes, so the checkout script's
  // payment check (PaymentRequest) is refused; a shopper's phone sees the real certificate
  [/^(SSL certificate is not valid\. Security level: NONE|No UI will be shown\. CanMakePayment)/, 'payment check refused: no real certificate on a routed page (checkout script)'],
];
const sandboxOnly = new Map();
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const DESKTOP = process.env.VIEW === 'desktop';
const visit = async (path) => {
  const ctx = await b.newContext(DESKTOP ? { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' });
  await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
  const blocked = new Set();
  const bad = [];
  const waiting = new Set(); // asked for and not yet answered: a stall shows here, not as an error
  await ctx.route('**/*', async (route) => { if (NO_REPORT.test(route.request().url())) return route.abort();
    const q = route.request(); const u = q.url();
    if (BLOCK.test(u)) { blocked.add(u); return route.abort(); }
    waiting.add(u);
    try {
      const r = await fetch(u, { method: q.method(), headers: q.headers(), body: q.postDataBuffer() || undefined, redirect: 'manual' });
      const body = Buffer.from(await r.arrayBuffer());
      if (r.status >= 400) bad.push(`${r.status} ${u.replace(BASE, '').slice(0, 110)}`);
      const headers = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers, body });
    } catch (e) { bad.push(`FAILED ${u.replace(BASE, '').slice(0, 110)} (${String(e).slice(0, 40)})`); await route.abort().catch(() => {}); }
    finally { waiting.delete(u); }
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 140)}`));
  p.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource|net::ERR_FAILED|payment manifest/.test(t)) return; // our own blocks; reported via requests
    const known = SANDBOX.find(([re]) => re.test(t));
    if (known) { sandboxOnly.set(known[1], (sandboxOnly.get(known[1]) ?? 0) + 1); return; }
    errors.push(`console: ${t.slice(0, 140)}`);
  });
  const row = { path, h1: null, atc: null, ms: 0, errors, bad };
  const [pathOnly, query = ''] = path.split('?');
  const ad = pathOnly.startsWith('/products/');
  const t0 = Date.now();
  try {
    const res = await p.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (!res || res.status() >= 400) bad.push(`document ${res?.status()}`);
    if (ad) row.firstH1 = await p.evaluate(() => document.querySelector('#root h1')?.textContent.trim().slice(0, 50) ?? null);
    // the title once the app has taken over: a pre-built page's own <h1> can vanish while the app loads
    await p.waitForFunction(() => document.querySelector('#root h1') && Object.keys(document.getElementById('root')?.firstElementChild || {}).some((k) => k.startsWith('__react')), null, { timeout: 25000 }).catch(() => {});
    row.h1 = await p.evaluate(() => document.querySelector('#root h1')?.textContent.trim().slice(0, 50) ?? null);
    if (/^\/(jewellery|products)\/(?!collections\/)[^/]+$/.test(pathOnly)) {
      row.atc = await p.waitForFunction(() => [...document.querySelectorAll('#product-actions button')].some((x) => /add to cart|pre-order|reserve/i.test(x.textContent) && !x.disabled && Object.keys(x).some((k) => k.startsWith('__react'))), null, { timeout: 25000 }).then(() => true, () => false);
    }
    await p.waitForTimeout(2500); // late errors: reviews, reels, lazy sections
    const at = new URL(p.url());
    row.landed = at.pathname;
    if (ad) {
      if (row.landed === pathOnly.replace('/products/', '/jewellery/')) row.landed = pathOnly; // the expected move
      if (query && at.search !== `?${query}`) errors.push(`query changed: ?${query} → ${at.search || '(none)'}`);
      if (row.firstH1 !== row.h1) errors.push(`pre-built page was "${row.firstH1}", not the product "${row.h1}"`);
    }
  } catch (e) { errors.push(`visit: ${String(e).slice(0, 120)}`); }
  row.ms = Date.now() - t0;
  if (!row.h1 || row.atc === false) for (const u of waiting) bad.push(`NO ANSWER yet ${u.replace(BASE, '').slice(0, 110)}`);
  await ctx.close();
  return row;
};

const rows = [];
let next = 0;
await Promise.all(Array.from({ length: CONC }, async () => {
  while (next < paths.length) {
    const path = paths[next++];
    const row = await visit(path);
    rows.push(row);
    const flags = [!row.h1 && 'NO H1', row.atc === false && 'ATC NOT READY', row.landed && row.landed !== path.split('?')[0] && `→ ${row.landed}`, row.errors.length && `${row.errors.length} error(s)`, row.bad.length && `${row.bad.length} bad request(s)`].filter(Boolean);
    console.log(`${flags.length ? 'ISSUE' : 'ok   '} ${path}${flags.length ? '  — ' + flags.join(', ') : ''}`);
  }
}));
await b.close();

const withIssues = rows.filter((r) => !r.h1 || r.atc === false || r.errors.length || r.bad.length);
console.log(`\n${rows.length} pages · ${rows.length - withIssues.length} clean · ${withIssues.length} with something to look at`);
for (const [label, n] of sandboxOnly) console.log(`   sandbox only, not the site: ${n} × ${label}`);
for (const r of withIssues) {
  console.log(`\n${r.path}  (h1: ${r.h1 ?? 'none'}${r.atc === null ? '' : `, add to cart ${r.atc ? 'ready' : 'NOT ready'}`})`);
  for (const e of [...r.errors, ...r.bad].slice(0, 8)) console.log(`   ${e}`);
}
process.exit(withIssues.length ? 1 : 0);
