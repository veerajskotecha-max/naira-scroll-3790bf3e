// Film the bag's Naira gift box after Add to cart, on a phone, and time it:
//   node giftfilm.mjs <base> <outDir> [cpuRate]
// Network through Node (sandbox CA); ad and analytics tags blocked. Times are
// from the tap itself (a capturing click listener). Frames are kept at full
// resolution (2x) at the moments in KEEP (ms after the bag opened).
//   VIEW=desktop     a 1440x900 laptop instead of a 390x844 phone
//   PREADD=h1,h2     add these pieces first (their own pages), so the bag is full
//   HANDLE=h         the piece to film (default prism-riviere-bracelet)
//   RM=1             prefers-reduced-motion (the box should stay still)
//   SCROLL_AT=ms     scroll the bag's list to the box this long after it opens
//   PEEK_AT=ms       tap "Peek inside" this long after the bag opens
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const [BASE, OUT, RATE = '1'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const BLOCK = /(facebook|clarity\.ms|googletagmanager|google-analytics|doubleclick|meta-capi|~api\/analytics)/i;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const DESKTOP = process.env.VIEW === 'desktop';
const ctx = await b.newContext({ ...(DESKTOP ? { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), reducedMotion: process.env.RM ? 'reduce' : 'no-preference' });
await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
const cartLog = [];
let tapAt = 0;
await ctx.route('**/*', async (route) => { const q = route.request(); const u = q.url(); if (BLOCK.test(u)) return route.abort();
  const t = Date.now(); const cart = /graphql\.json/.test(u) && /cart/i.test(q.postData() || '');
  try { const r = await fetch(u, { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'manual' }); const body = Buffer.from(await r.arrayBuffer());
    if (cart && tapAt) cartLog.push([(q.postData() || '').match(/(mutation|query) (\w+)/)?.[2], t, Date.now()]);
    const headers = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k))); await route.fulfill({ status: r.status, headers, body }); } catch { await route.abort().catch(() => {}); } });
const p = await ctx.newPage();
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
const ready = () => p.waitForFunction(() => [...document.querySelectorAll('#product-actions button')].some((x) => /add to cart/i.test(x.textContent) && Object.keys(x).some((k) => k.startsWith('__react'))), null, { timeout: 60000 });
const BAG = '[role="dialog"][data-state="open"] [data-gift-row]';
for (const handle of (process.env.PREADD || '').split(',').filter(Boolean)) {
  await p.goto(`${BASE}/preview/jewellery/${handle}`, { waitUntil: 'domcontentloaded' });
  await ready(); await p.waitForTimeout(1500);
  await p.locator('#product-actions button', { hasText: /add to cart/i }).click();
  await p.waitForSelector(BAG, { timeout: 15000 });
  await p.waitForTimeout(1200); await p.keyboard.press('Escape'); await p.waitForTimeout(600);
}
await p.goto(`${BASE}/preview/jewellery/${process.env.HANDLE || 'prism-riviere-bracelet'}`, { waitUntil: 'domcontentloaded' });
await ready();
await p.waitForTimeout(Number(process.env.SETTLE_MS || 3500));
const cdp = await ctx.newCDPSession(p);
if (RATE !== '1') await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(RATE) });
const frames = [];
cdp.on('Page.screencastFrame', (f) => { frames.push({ ts: f.metadata.timestamp * 1000, data: f.data }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: DESKTOP ? 1440 : 780, maxHeight: DESKTOP ? 900 : 1688, everyNthFrame: 1 });
const cta = p.locator('#product-actions button', { hasText: /add to cart/i });
await cta.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
await p.waitForTimeout(600);
await p.evaluate((BAG) => {
  window.__open = 0; window.__peek = 0;
  new MutationObserver(() => {
    if (!window.__open && document.querySelector(BAG)) window.__open = performance.now();
    // the drawer starts moving: an animation on the tray
    const tray = document.querySelector(`${BAG} [style*="rotateX(90deg)"] > div`);
    if (!window.__peek && tray?.getAnimations().length) window.__peek = performance.now();
  }).observe(document.body, { subtree: true, childList: true, attributes: true });
  const poll = () => { const tray = [...document.querySelectorAll(`${BAG} div`)].find((d) => d.style.transform?.startsWith('translateY(') && d.parentElement?.style.overflow === 'hidden');
    if (!window.__peek && tray?.getAnimations().length) window.__peek = performance.now(); if (!window.__peek) requestAnimationFrame(poll); };
  requestAnimationFrame(poll);
  addEventListener('click', () => { window.__tap = performance.now(); window.__tapWall = Date.now(); }, { capture: true, once: true });
}, BAG);
tapAt = Date.now();
await cta.click();
tapAt = await p.evaluate(() => window.__tapWall);
await p.waitForSelector(BAG, { timeout: 15000 }).catch(() => {});
const openWall = tapAt + await p.evaluate(() => Math.round(window.__open - window.__tap));
if (process.env.SCROLL_AT) { await p.waitForTimeout(Math.max(0, Number(process.env.SCROLL_AT) - (Date.now() - openWall))); await p.evaluate((BAG) => document.querySelector(BAG)?.scrollIntoView({ block: 'nearest', behavior: 'instant' }), BAG); }
if (process.env.PEEK_AT) { await p.waitForTimeout(Math.max(0, Number(process.env.PEEK_AT) - (Date.now() - openWall))); await p.locator(`${BAG} button`, { hasText: /peek inside/i }).click(); }
await p.waitForTimeout(Number(process.env.FILM_MS || 6500) - (Date.now() - openWall));
await cdp.send('Page.stopScreencast');
const t = await p.evaluate(() => ({ open: Math.round(window.__open - window.__tap), peek: window.__peek ? Math.round(window.__peek - window.__tap) : null }));
const state = await p.evaluate((BAG) => {
  const row = document.querySelector(BAG); const list = row?.closest('.overflow-y-auto');
  const r = row?.getBoundingClientRect(); const l = list?.getBoundingClientRect();
  return { row: row?.innerText.replace(/\s+/g, ' '), rowInView: !!(r && l && r.top >= l.top - 1 && r.bottom <= l.bottom + 1), peekButton: !!row?.querySelector('button'),
    running: row ? [...row.querySelectorAll('*')].flatMap((el) => el.getAnimations()).filter((a) => a.playState === 'running').length : 0 };
}, BAG);
const cartRequests = cartLog.map(([name, a, z]) => `${name} ${a - tapAt}→${z - tapAt} ms`);
// what reached the screen from the bag opening, while the box plays
const shot = frames.filter((f) => f.ts >= openWall && f.ts <= openWall + 6000).map((f) => f.ts);
const gaps = shot.slice(1).map((x, i) => x - shot[i]).sort((a, c) => a - c);
const screen = gaps.length ? { screenFrames: shot.length, screen_p50_ms: Math.round(gaps[Math.floor(gaps.length * 0.5)]), screen_p95_ms: Math.round(gaps[Math.floor(gaps.length * 0.95)]), screen_max_ms: Math.round(gaps.at(-1)) } : {};
console.log(JSON.stringify({ view: DESKTOP ? 'desktop' : 'phone', cpu: RATE + 'x', reducedMotion: !!process.env.RM, bagOpenedAfterTap_ms: t.open, peekStartedAfterTap_ms: t.peek, cartRequests, ...screen, ...state, errors }, null, 1));
// keep the last frame painted at or before each moment after the bag opened
const KEEP = (process.env.KEEP || '0,300,600,900,1200,1500,1800,2100,2400,2700,3000,3300,3600,4000,4500,5000,6000').split(',').map(Number);
for (const ms of KEEP) {
  const f = frames.filter((x) => x.ts <= openWall + ms).pop();
  if (f) writeFileSync(`${OUT}/g${String(ms).padStart(4, '0')}.jpg`, Buffer.from(f.data, 'base64'));
}
await b.close();
