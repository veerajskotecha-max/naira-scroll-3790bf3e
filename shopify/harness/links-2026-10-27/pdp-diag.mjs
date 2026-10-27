// What a product page downloads before the shopper scrolls, and what happens
// between tapping Add to cart and seeing the bag. Same phone and 4G profile as
// pdp-checkout-speed.mjs; Shiprocket stand-in; analytics blocked.
//   BASE=http://127.0.0.1:8100 node pdp-diag.mjs <path>
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { NO_REPORT } from '/home/user/naira-scroll-3790bf3e/shopify/harness/noreport.mjs';

const [PATH] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://127.0.0.1:8100';
const SHIPROCKET = /fastrr-boost-ui\.pickrr\.com\/assets\/js/i;
const ALLOW = /^127\.0\.0\.1$|(^|\.)(shopify\.com|myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|pickrr\.com)$/;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const ctx = await browser.newContext((({ defaultBrowserType, ...rest }) => rest)(devices['Pixel 7']));
await ctx.route('**/*', (r) => {
  const url = r.request().url();
  if (NO_REPORT.test(url)) return r.abort();
  if (SHIPROCKET.test(url)) return r.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.shiprocketCheckoutEvents={buyDirect(){}}' });
  if (!ALLOW.test(new URL(url).hostname)) return r.abort();
  return r.continue();
});
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 90, downloadThroughput: 6e6 / 8, uploadThroughput: 2e6 / 8 });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const reqs = new Map();
let T0 = 0;
cdp.on('Network.requestWillBeSent', (e) => reqs.set(e.requestId, { url: e.request.url, method: e.request.method, start: e.timestamp, type: e.type, body: e.request.postData?.slice(0, 80) }));
cdp.on('Network.loadingFinished', (e) => { const r = reqs.get(e.requestId); if (r) { r.end = e.timestamp; r.bytes = e.encodedDataLength; } });
await page.goto(BASE + PATH, { waitUntil: 'commit' });
T0 = [...reqs.values()][0]?.start ?? 0;
await page.waitForTimeout(8000);
const ms = (t) => Math.round((t - T0) * 1000);
const name = (u) => { const x = new URL(u); return (x.hostname === '127.0.0.1' ? '' : x.hostname.replace('cdn.shopify.com', 'cdn') + ' ') + x.pathname.split('/').pop().slice(0, 60) + (x.searchParams.get('width') ? ` w=${x.searchParams.get('width')}` : ''); };
const loadRows = [...reqs.values()].filter((r) => r.end);
const sum = (t) => Math.round(loadRows.filter((r) => r.type === t).reduce((a, r) => a + r.bytes, 0) / 1024);
console.log(`LOAD (first 8 s, no scrolling): JS ${sum('Script')} KB, images ${sum('Image')} KB, fonts ${sum('Font')} KB, data ${sum('Fetch') + sum('XHR')} KB`);
for (const r of loadRows.filter((r) => r.type === 'Image').sort((a, b) => b.bytes - a.bytes).slice(0, 14)) console.log(`  img ${Math.round(r.bytes / 1024)} KB @${ms(r.start)}ms  ${name(r.url)}`);
for (const r of loadRows.filter((r) => r.type === 'Script').sort((a, b) => b.bytes - a.bytes).slice(0, 12)) console.log(`  js  ${Math.round(r.bytes / 1024)} KB @${ms(r.start)}ms  ${name(r.url)}`);
for (const r of loadRows.filter((r) => r.type === 'Font')) console.log(`  font ${Math.round(r.bytes / 1024)} KB @${ms(r.start)}ms  ${name(r.url)}`);
// what images are on screen vs below
const imgs = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth).map((i) => { const r = i.getBoundingClientRect(); return { src: (i.currentSrc || i.src).split('/').pop().slice(0, 50), top: Math.round(r.top + scrollY), loading: i.loading, w: Math.round(r.width) }; }));
console.log(`  images decoded so far: ${imgs.length}; below the first screen (top > 915): ${imgs.filter((i) => i.top > 915).length}`);
for (const i of imgs.filter((i) => i.top > 915).slice(0, 12)) console.log(`    below: top ${i.top} w${i.w} loading=${i.loading} ${i.src}`);

// Add to cart → bag
reqs.clear();
const tClick = await page.evaluate(() => performance.now());
const t0 = Date.now();
await page.locator('#product-actions button', { hasText: /add to cart/i }).first().click();
const marks = await page.evaluate(async (tClick) => {
  const out = {};
  const until = performance.now() + 15000;
  while (performance.now() < until) {
    const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right > 0 && r.left < innerWidth; };
    const dlg = [...document.querySelectorAll('[role="dialog"]')].find(vis);
    if (!out.dialog && vis(dlg)) out.dialog = Math.round(performance.now() - tClick);
    if (!out.line && dlg && /prism|tubogas|droplet/i.test(dlg.textContent || '') && vis(dlg)) out.line = Math.round(performance.now() - tClick);
    if (!out.checkout && vis(document.querySelector('[data-checkout]'))) out.checkout = Math.round(performance.now() - tClick);
    if (out.dialog && out.line && out.checkout) break;
    await new Promise((r) => requestAnimationFrame(r));
  }
  return out;
}, tClick);
console.log(`BAG after tapping Add to cart: drawer visible ${marks.dialog ?? '-'} ms, piece in it ${marks.line ?? '-'} ms, Checkout button ${marks.checkout ?? '-'} ms`);
const net = await page.evaluate((tClick) => performance.getEntriesByType('resource').filter((e) => e.startTime > tClick && /graphql|myshopify/.test(e.name)).map((e) => [Math.round(e.startTime - tClick), Math.round(e.responseEnd - tClick)]), tClick);
console.log('  Shopify calls after the tap [start, end] ms:', JSON.stringify(net));
await page.waitForTimeout(1500);
for (const r of [...reqs.values()].sort((a, b) => a.start - b.start).slice(0, 16)) console.log(`  ${r.method} @${Math.round((r.start * 1000) - (t0 / 1000) * 0)}  +${r.end ? Math.round((r.end - r.start) * 1000) : '?'}ms ${Math.round((r.bytes ?? 0) / 1024)}KB ${name(r.url)} ${r.body ? r.body.replace(/\s+/g, ' ').slice(0, 60) : ''}`);
await browser.close();
