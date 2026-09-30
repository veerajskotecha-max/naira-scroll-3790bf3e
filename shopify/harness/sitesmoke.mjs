// Every page in the sitemap on a phone: does it load cleanly?
//   node sitesmoke.mjs <base> [sitemap file or URL]
// For each page: page errors, console errors, failed or 4xx/5xx requests,
// whether it drew its <h1>, and on product pages whether Add to cart is ready.
// Network goes through Node (the sandbox CA); ad and analytics tags and the
// site's own Meta relay are blocked so a run never reaches anyone's reports.
//   CONC=4 pages at a time; ONLY=regex to test a subset of paths.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const [BASE, SITEMAP = '/tmp/mainwt/dist/sitemap.xml'] = process.argv.slice(2);
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|hotjar|\/functions\/v1\/meta-capi|~api\/analytics)/i;
const xml = SITEMAP.startsWith('http') ? await (await fetch(SITEMAP)).text() : readFileSync(SITEMAP, 'utf8');
let paths = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];
if (process.env.ONLY) paths = paths.filter((x) => new RegExp(process.env.ONLY).test(x));
const CONC = Number(process.env.CONC || 4);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const visit = async (path) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' });
  await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
  const blocked = new Set();
  const bad = [];
  await ctx.route('**/*', async (route) => {
    const q = route.request(); const u = q.url();
    if (BLOCK.test(u)) { blocked.add(u); return route.abort(); }
    try {
      const r = await fetch(u, { method: q.method(), headers: q.headers(), body: q.postDataBuffer() || undefined, redirect: 'manual' });
      const body = Buffer.from(await r.arrayBuffer());
      if (r.status >= 400) bad.push(`${r.status} ${u.replace(BASE, '').slice(0, 110)}`);
      const headers = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers, body });
    } catch (e) { bad.push(`FAILED ${u.replace(BASE, '').slice(0, 110)} (${String(e).slice(0, 40)})`); await route.abort().catch(() => {}); }
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 140)}`));
  p.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource|net::ERR_FAILED|payment manifest/.test(t)) return; // our own blocks; reported via requests
    errors.push(`console: ${t.slice(0, 140)}`);
  });
  const row = { path, h1: null, atc: null, ms: 0, errors, bad };
  const t0 = Date.now();
  try {
    const res = await p.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (!res || res.status() >= 400) bad.push(`document ${res?.status()}`);
    await p.waitForSelector('#root h1', { timeout: 25000 }).catch(() => {});
    row.h1 = await p.evaluate(() => document.querySelector('#root h1')?.textContent.trim().slice(0, 50) ?? null);
    if (/^\/jewellery\/(?!collections\/)[^/]+$/.test(path)) {
      row.atc = await p.waitForFunction(() => [...document.querySelectorAll('#product-actions button')].some((x) => /add to cart|pre-order/i.test(x.textContent) && !x.disabled && Object.keys(x).some((k) => k.startsWith('__react'))), null, { timeout: 25000 }).then(() => true, () => false);
    }
    await p.waitForTimeout(2500); // late errors: reviews, reels, lazy sections
    row.landed = new URL(p.url()).pathname;
  } catch (e) { errors.push(`visit: ${String(e).slice(0, 120)}`); }
  row.ms = Date.now() - t0;
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
    const flags = [!row.h1 && 'NO H1', row.atc === false && 'ATC NOT READY', row.landed && row.landed !== path && `→ ${row.landed}`, row.errors.length && `${row.errors.length} error(s)`, row.bad.length && `${row.bad.length} bad request(s)`].filter(Boolean);
    console.log(`${flags.length ? 'ISSUE' : 'ok   '} ${path}${flags.length ? '  — ' + flags.join(', ') : ''}`);
  }
}));
await b.close();

const withIssues = rows.filter((r) => !r.h1 || r.atc === false || r.errors.length || r.bad.length);
console.log(`\n${rows.length} pages · ${rows.length - withIssues.length} clean · ${withIssues.length} with something to look at`);
for (const r of withIssues) {
  console.log(`\n${r.path}  (h1: ${r.h1 ?? 'none'}${r.atc === null ? '' : `, add to cart ${r.atc ? 'ready' : 'NOT ready'}`})`);
  for (const e of [...r.errors, ...r.bad].slice(0, 8)) console.log(`   ${e}`);
}
process.exit(withIssues.length ? 1 : 0);
