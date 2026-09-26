// Smoke-test a built site: console errors, failed local requests, client-side
// navigation into a product (route chunk fetched on demand), and lazy review
// photos actually loading once scrolled to.
import { chromium } from 'playwright';
const BASE = process.argv[2];
const UA = 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const proxy = async (route) => {
  const q = route.request();
  if (/(facebook\.net|facebook\.com|fbcdn\.net)/i.test(q.url())) return route.abort();
  try {
    const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) });
  } catch { await route.abort().catch(() => {}); }
};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: UA });
await ctx.route('**/*', proxy);
const p = await ctx.newPage();
const errors = [], badLocal = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
p.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 140)));
p.on('response', (r) => { if (r.url().startsWith(BASE) && r.status() >= 400) badLocal.push(`${r.status()} ${r.url().slice(BASE.length)}`); });
const out = {};
for (const path of ['/', '/jewellery', '/collections/shop-all', '/jewellery/prism-riviere-bracelet']) {
  await p.goto(BASE + path, { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => (document.querySelector('h1')?.innerText || '').trim().length > 2, null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1500);
  out[path] = await p.evaluate(() => ({ h1: (document.querySelector('h1')?.innerText || '').trim().slice(0, 40), title: document.title.slice(0, 50) }));
}
// client-side navigation: from the collection, tap the first product card
await p.goto(BASE + '/jewellery', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
const chunksBefore = new Set();
p.on('request', (r) => { if (/\/assets\/.*\.js$/.test(r.url())) chunksBefore.add(r.url().split('/').pop()); });
const fromH1 = await p.evaluate(() => (document.querySelector('h1')?.innerText || '').trim());
const link = p.locator('a[href^="/jewellery/"]').first();
const target = await link.getAttribute('href');
const t0 = Date.now();
await link.click();
await p.waitForURL('**' + target, { timeout: 30000 });
await p.waitForFunction((old) => { const t = (document.querySelector('h1')?.innerText || '').trim(); return t.length > 2 && t !== old; }, fromH1, { timeout: 30000 });
const navMs = Date.now() - t0;
out.clientNav = { from: fromH1.slice(0, 30), to: target, ms: navMs, h1: await p.evaluate(() => document.querySelector('h1').innerText.trim().slice(0, 40)), chunksFetchedOnNav: chunksBefore.size };
// lazy review photos: none loaded up top, loaded after scrolling to them
const requested = new Set();
p.on('request', (r) => requested.add(r.url()));
await p.goto(BASE + '/jewellery/verdant-eternity-band', { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => (document.querySelector('h1')?.innerText || '').trim().length > 2, null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(2000);
const photos = async () => {
  const d = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('img[alt="Review photo"]')];
    return { srcs: imgs.map((i) => i.src), total: imgs.length, lazy: imgs.filter((i) => i.loading === 'lazy').length,
             loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length };
  });
  // which of those photos has the browser actually requested so far?
  const fetched = d.srcs.filter((u) => requested.has(u)).length;
  return { total: d.total, lazy: d.lazy, requested: fetched, loaded: d.loaded };
};
const top = await photos();
// walk down the page so anything mounted on intersection gets mounted
for (let y = 0; y < 40; y++) { await p.mouse.wheel(0, 700); await p.waitForTimeout(120); }
const first = p.locator('img[alt="Review photo"]').first();
if (await first.count()) { await first.scrollIntoViewIfNeeded(); await p.waitForTimeout(4000); }
const scrolled = await photos();
out.reviewPhotos = { atTop: top, afterScroll: scrolled };
out.consoleErrors = errors;
out.failedLocalRequests = badLocal;
console.log(JSON.stringify(out, null, 1));
await b.close();
