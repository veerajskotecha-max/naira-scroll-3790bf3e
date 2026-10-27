// How heavy and how smooth a product page, the bag and the checkout tap are on
// a mid-range Android phone over Indian 4G (6 Mbps down, 90 ms, CPU 4x slower):
//   BASE=http://127.0.0.1:8100 node pdp-checkout-speed.mjs <outDir> [runs]
// Load: first paint, largest paint, layout shift, main-thread blocking, the
// moment Add to cart can be tapped, and the bytes the phone downloads. Then the
// taps a shopper makes: a colour, the gallery, a scroll down the page, Add to
// cart until the bag is open, and Checkout until the hand-off. Real Shopify
// carts, never an order: Shiprocket's script is a stand-in that records the
// hand-off, ad and analytics requests are blocked (noreport.mjs).
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { NO_REPORT } from '/home/user/naira-scroll-3790bf3e/shopify/harness/noreport.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const [OUT, RUNS_ARG = '2'] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://127.0.0.1:8100';
const RUNS = Number(RUNS_ARG);
mkdirSync(OUT, { recursive: true });
const AD = 'utm_content=Facebook_UA&utm_source=facebook';
const PAGES = [
  { id: 'prism-riviere (top ad page)', path: `/products/prism-riviere-bracelet?${AD}&variant=47501788348578` },
  { id: 'tubogas silver (new, ring)', path: `/products/tubogas-dome-ring?${AD}&variant=50651970109602`, colour: 'Gold' },
  { id: 'droplet cuff (two metals)', path: `/products/droplet-open-cuff?${AD}&variant=50651971190946`, colour: 'Silver' },
];
const SHIPROCKET = /fastrr-boost-ui\.pickrr\.com\/assets\/js/i;
const STAND_IN = `window.shiprocketCheckoutEvents={buyDirect:function(p){window.__handoff=performance.now();}};`;
const ALLOW = /^127\.0\.0\.1$|(^|\.)(shopify\.com|myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|pickrr\.com)$/;

const observe = () => {
  const m = (window.__m = { lcp: 0, cls: 0, long: [], events: [], fcp: 0 });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') m.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) m.long.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) m.events.push([e.name, Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  // frames: gaps between animation frames while the shopper scrolls
  m.frames = [];
  let last = 0;
  const tick = (t) => { if (m.recordFrames && last) m.frames.push(t - last); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
};
const blocking = (long, from = 0, to = Infinity) => long.filter(([s]) => s >= from && s < to).reduce((a, [, d]) => a + Math.max(0, d - 50), 0);
const kb = (n) => Math.round(n / 1024);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const phone = (({ defaultBrowserType, ...rest }) => rest)(devices['Pixel 7']);
const results = [];
for (let run = 1; run <= RUNS; run++) {
  for (const pg of PAGES) {
    const ctx = await browser.newContext(phone);
    await ctx.addInitScript(observe);
    const left = [];
    await ctx.route('**/*', (r) => {
      const url = r.request().url();
      if (NO_REPORT.test(url)) return r.abort();
      if (process.env.BLOCK3D && /\/three-[\w-]+\.js/.test(url)) return r.abort();
      if (SHIPROCKET.test(url)) return r.fulfill({ status: 200, contentType: 'text/javascript', body: STAND_IN });
      const host = new URL(url).hostname;
      if (!ALLOW.test(host)) return r.abort();
      // never leave the shop for a real checkout page
      if (r.request().isNavigationRequest() && host !== '127.0.0.1') { left.push(url); return r.abort(); }
      return r.continue();
    });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 90, downloadThroughput: 6e6 / 8, uploadThroughput: 2e6 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const bytes = {};
    const types = new Map();
    let phase = 'load';
    cdp.on('Network.responseReceived', (e) => types.set(e.requestId, [e.type, new URL(e.response.url).hostname]));
    cdp.on('Network.loadingFinished', (e) => {
      const [type = 'Other', host = ''] = types.get(e.requestId) ?? [];
      const key = `${phase}:${type}`;
      bytes[key] = (bytes[key] ?? 0) + e.encodedDataLength;
      bytes[`${phase}:all`] = (bytes[`${phase}:all`] ?? 0) + e.encodedDataLength;
      if (host !== '127.0.0.1' && host !== 'localhost') bytes[`${phase}:third`] = (bytes[`${phase}:third`] ?? 0) + (/cdn\.shopify\.com/.test(host) ? 0 : e.encodedDataLength);
    });
    const t0 = Date.now();
    await page.goto(BASE + pg.path, { waitUntil: 'commit' });
    const ready = await page
      .waitForFunction(() => [...document.querySelectorAll('#product-actions button')].some((b) => !b.disabled && /add to cart/i.test(b.textContent)), null, { timeout: 30000, polling: 50 })
      .then(() => Date.now() - t0)
      .catch(() => -1);
    await page.waitForTimeout(8000);
    const load = await page.evaluate(() => ({ ...window.__m, nav: performance.getEntriesByType('navigation')[0]?.responseStart }));
    const row = { run, page: pg.id, ttfb: Math.round(load.nav ?? 0), fcp: Math.round(load.fcp), lcp: Math.round(load.lcp), cls: +load.cls.toFixed(3), tbtLoad: blocking(load.long), addReady: ready };
    phase = 'after';

    // a colour tap
    if (pg.colour) {
      const before = (await page.evaluate(() => window.__m.events.length));
      await page.locator(`[data-option="Metal"] [role=radio]`, { hasText: pg.colour }).first().click();
      await page.waitForTimeout(1200);
      const ev = await page.evaluate((n) => window.__m.events.slice(n), before);
      row.colourTap = Math.max(0, ...ev.map(([, , d]) => d));
    }
    // swipe the gallery, then scroll the whole page
    await page.evaluate(() => { window.__m.recordFrames = true; window.__m.frames = []; window.__m.mark = performance.now(); });
    const box = await page.locator('button[aria-label$="image 1 full screen"]').first().boundingBox();
    if (box) for (let i = 0; i < 3; i++) {
      await page.mouse.move(box.x + box.width * 0.85, box.y + box.height / 2);
      await page.mouse.down(); await page.mouse.move(box.x + box.width * 0.1, box.y + box.height / 2, { steps: 8 }); await page.mouse.up();
      await page.waitForTimeout(500);
    }
    for (let i = 0; i < 24; i++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(110); }
    for (let i = 0; i < 24; i++) { await page.mouse.wheel(0, -500); await page.waitForTimeout(60); }
    await page.waitForTimeout(800);
    const sc = await page.evaluate(() => { const m = window.__m; m.recordFrames = false; return { frames: m.frames, long: m.long.filter(([s]) => s >= m.mark) }; });
    row.scrollFrames = sc.frames.length;
    row.scrollJank = sc.frames.filter((d) => d > 50).length; // frames held >50 ms (3+ dropped at 60 Hz)
    row.scrollWorstFrame = Math.round(Math.max(0, ...sc.frames));
    row.scrollTBT = blocking(sc.long);

    // Add to cart → bag open
    const evBefore = await page.evaluate(() => window.__m.events.length);
    const ta = Date.now();
    await page.locator('#product-actions button', { hasText: /add to cart/i }).first().click();
    const bagOpen = await page.waitForSelector('[data-checkout]', { state: 'visible', timeout: 20000 }).then(() => Date.now() - ta).catch(() => -1);
    await page.waitForTimeout(1500);
    const addEv = await page.evaluate((n) => window.__m.events.slice(n), evBefore);
    row.addTap = Math.max(0, ...addEv.map(([, , d]) => d));
    row.bagOpen = bagOpen;
    // Checkout tap → button answers → hand-off to Shiprocket
    const ckBefore = await page.evaluate(() => window.__m.events.length);
    const tc = await page.evaluate(() => performance.now());
    await page.locator('[data-checkout]').first().click();
    const answered = await page.waitForFunction(() => /opening/i.test(document.querySelector('[data-checkout]')?.textContent || ''), null, { timeout: 5000, polling: 'raf' }).then(() => true).catch(() => false);
    const handoff = await page.waitForFunction(() => window.__handoff, null, { timeout: 15000, polling: 50 }).then((h) => h.jsonValue()).catch(() => null);
    const ckEv = await page.evaluate((n) => window.__m.events.slice(n), ckBefore);
    row.checkoutTap = Math.max(0, ...ckEv.map(([, , d]) => d));
    row.checkoutAnswered = answered;
    row.handoff = handoff ? Math.round(handoff - tc) : -1;
    row.leftShop = left.length;
    row.kb = { loadAll: kb(bytes['load:all'] ?? 0), loadJS: kb(bytes['load:Script'] ?? 0), loadCSS: kb(bytes['load:Stylesheet'] ?? 0), loadImg: kb(bytes['load:Image'] ?? 0), loadFont: kb(bytes['load:Font'] ?? 0), loadData: kb((bytes['load:Fetch'] ?? 0) + (bytes['load:XHR'] ?? 0)), afterAll: kb(bytes['after:all'] ?? 0), afterImg: kb(bytes['after:Image'] ?? 0), afterJS: kb(bytes['after:Script'] ?? 0) };
    results.push(row);
    console.log(JSON.stringify(row));
    if (run === 1) await page.screenshot({ path: `${OUT}/${pg.id.split(' ')[0]}-bag.png` });
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${OUT}/speed.json`, JSON.stringify(results, null, 1));
