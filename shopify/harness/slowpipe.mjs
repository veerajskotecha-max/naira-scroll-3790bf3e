// Time-to-product on a MODELLED slow-4G link, for comparing two builds.
//
// Chromium here cannot reach the network itself, and Playwright's route
// interception bypasses CDP's network throttle — so the throttle is modelled in
// the proxy instead. One shared FIFO pipe at 1.6 Mbit/s (Lighthouse slow 4G,
// 200 kB/s) plus 150 ms per request; a response is delivered only once all the
// bytes queued ahead of it have drained. Bytes requested early therefore delay
// bytes requested later — the effect that matters for eager preloads.
//
// Pass 1 warms an in-memory cache so pass 2 is not measuring the real network.
// CPU is throttled 4x as Lighthouse does. Output is a model, not a phone: use it
// to compare A against B, not as an absolute.
import { chromium } from 'playwright';
const URL = process.argv[2];
const RATE = 1600 * 1024 / 8;   // bytes per second
const RTT = 150;                // ms
const cache = new Map();
const key = (q) => q.method() + ' ' + q.url() + ' ' + (q.postData() || '');
const get = async (q) => {
  const k = key(q);
  if (!cache.has(k)) {
    const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
    const body = Buffer.from(await r.arrayBuffer());
    const headers = Object.fromEntries([...r.headers].filter(([h]) => !/^(content-encoding|content-length)$/i.test(h)));
    cache.set(k, { status: r.status, headers, body });
  }
  return cache.get(k);
};
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const run = async (modelled) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA });
  let pipeFree = 0; const log = []; let t0 = 0;
  await ctx.route('**/*', async (route) => {
    const q = route.request();
    if (/(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics)/i.test(q.url())) return route.abort();
    try {
      const asked = Date.now();
      const r = await get(q);
      if (modelled) {
        const start = Math.max(asked + RTT, pipeFree);
        const done = start + (r.body.length / RATE) * 1000;
        pipeFree = done;
        const wait = done - Date.now();
        if (wait > 0) await new Promise((res) => setTimeout(res, wait));
        log.push({ url: q.url(), type: q.resourceType(), bytes: r.body.length, at: done - t0 });
      }
      await route.fulfill({ status: r.status, headers: r.headers, body: r.body });
    } catch { await route.abort().catch(() => {}); }
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  if (modelled) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  t0 = Date.now();
  await page.goto(URL, { waitUntil: 'commit', timeout: 300000 });
  const marks = {};
  const seen = async (label, fn, cap = 240000) => {
    try { await page.waitForFunction(fn, { timeout: cap, polling: 100 }); marks[label] = +((Date.now() - t0) / 1000).toFixed(1); }
    catch { marks[label] = null; }
  };
  await seen('productName', () => { const h = document.querySelector('h1'); return !!(h && h.innerText.trim().length > 2); });
  await seen('interactive', () => [...document.querySelectorAll('button')].some((x) => /add to (cart|bag)/i.test(x.innerText) && !x.disabled && x.getBoundingClientRect().height > 0 && x.onclick !== undefined && Object.keys(x).some((k) => k.startsWith('__react'))));
  await seen('heroImage', () => [...document.images].some((i) => i.naturalWidth > 200 && i.getBoundingClientRect().top < 900 && i.complete));
  // let lazy work settle so "total" is comparable
  await page.waitForTimeout(modelled ? 4000 : 6000);
  await ctx.close();
  return { marks, log };
};

await run(false);                     // warm the cache
const { marks, log } = await run(true);
const before = (s) => log.filter((l) => s != null && l.at <= s * 1000);
const kb = (arr) => Math.round(arr.reduce((s, l) => s + l.bytes, 0) / 1024);
const js = (arr) => arr.filter((l) => /\.js(\?|$)/.test(l.url));
const three = log.find((l) => /three/i.test(l.url));
console.log(JSON.stringify({
  url: URL,
  modelledSeconds: marks,
  kBBeforeInteractive: kb(before(marks.interactive)),
  jsKBBeforeInteractive: kb(js(before(marks.interactive))),
  jsFilesBeforeInteractive: js(before(marks.interactive)).length,
  kBTotalAfterSettle: kb(log),
  threeJsArrivesAt: three ? +(three.at / 1000).toFixed(1) : 'never requested',
  jsBeforeInteractive: js(before(marks.interactive)).map((l) => l.url.split('/').pop()),
}, null, 1));
await b.close();
