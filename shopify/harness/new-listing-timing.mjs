// Opens product links on a phone against a LOCAL build served like the live
// host (new-listing-serve.mjs: a pre-built file when there is one, else
// dist/index.html) and records what the shopper sees over time: a state probe
// every 50 ms inside the page plus screencast frames, so a homepage-first flash
// can be timed and shown. Read-only: no cart, no clicks; every host outside the
// allow-list is aborted (pixel, Clarity, Supabase, analytics beacons).
//
//   BASE=http://127.0.0.1:8100 node new-listing-timing.mjs <outDir> <profile:none|phone4g> <runs> [casePrefix,...]
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const [OUT, PROFILE = 'none', RUNS_ARG = '3', ONLY] = process.argv.slice(2);
const RUNS = Number(RUNS_ARG);
const BASE = process.env.BASE || 'http://127.0.0.1:8100';
const NAME = 'Watch Link Bangle'; // Shopify handle watch-link-bracelet, published 25 Oct 22:01 UTC
const NO_FILE = () => `/jewellery/zz-no-file-${Date.now()}`;
const CASES = [
  // Pre-built page, as every product listed BEFORE the last publish gets.
  { id: 'A-prerendered', url: '/jewellery/watch-link-bracelet', expect: NAME },
  // A product listed AFTER the last publish: the host has no file for it and
  // sends dist/index.html, the homepage file. Watch Link is in neither the
  // bundled catalogue nor the snapshot's handle list, so the app takes exactly
  // the path a new listing takes.
  { id: 'B-new-listing', url: '/jewellery/watch-link-bracelet', expect: NAME, fallbackDoc: true },
  { id: 'B3-new-listing-alias', url: '/jewelry/watch-link-bracelet', expect: NAME },
  // Meta catalogue ad for a new listing: /products/<handle>.
  { id: 'D-catalogue-ad-new-listing', url: '/products/watch-link-bracelet', expect: NAME, fallbackDoc: true },
  // A handle that does not exist at all: ends on the shop.
  { id: 'C-made-up-handle', url: '/jewellery/zz-not-a-real-piece', expect: null },
  // The homepage itself must show from first paint, untouched.
  { id: 'E-homepage', url: '/', expect: null },
  // An address that is not a piece and has no file.
  { id: 'F-unknown-page', url: '/zz-not-a-page', expect: null },
];
const PROFILES = {
  none: null,
  // Indian 4G on a mid-range Android (same profile as earlier load tests).
  phone4g: { latency: 90, down: 6e6 / 8, up: 2e6 / 8, cpu: 4 },
};
const P = PROFILES[PROFILE];
const ALLOW = /^127\.0\.0\.1$|(^|\.)(shopify\.com|myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
const WATCH_MS = P ? 14000 : 9000;

const probeScript = (expectName) => {
  const tl = [];
  window.__tl = tl;
  window.__paint = {};
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__paint[e.name] = Math.round(e.startTime); }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__paint.lcp = Math.round(e.startTime); }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}
  let last = '';
  const vis = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom <= 0 || r.top >= innerHeight) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05;
  };
  const probe = () => {
    if (!document.body) return;
    const root = document.getElementById('root');
    const heads = [...document.querySelectorAll('#root h1, #root h2')].filter(vis).map((h) => h.textContent.replace(/\s+/g, ' ').trim());
    const h1 = [...document.querySelectorAll('#root h1')].filter(vis).map((h) => h.textContent.replace(/\s+/g, ' ').trim()).join(' | ').slice(0, 50);
    // The pre-built homepage's DOM (its hero h1) in #root. Shown from first
    // paint until React's first commit replaces it.
    const homeH1 = document.querySelector('#root h1');
    const home = (vis(homeH1) && /Softly, slowly/i.test((homeH1.textContent || '').replace(/\s+/g, ' '))) || heads.some((t) => /New Arrivals/i.test(t));
    // The fallback guard's mark: the homepage hidden, the page outline shown.
    const mark = document.documentElement.getAttribute('data-nf-fallback');
    const skeleton = /Loading piece/.test(document.querySelector('[role="status"]')?.textContent || '');
    const product = !!expectName && h1.includes(expectName) && vis(document.getElementById('product-price'));
    // Add to cart rendered and enabled (it sits just below the fold on a phone).
    const cta = [...document.querySelectorAll('#product-actions button')].some((b) => { const r = b.getBoundingClientRect(); return !b.disabled && r.height > 0 && /add to cart|reserve/i.test(b.textContent); });
    const reactStarted = !!root && Object.keys(root).some((k) => k.startsWith('__reactContainer'));
    const listing = location.pathname === '/jewellery' && !home && heads.length > 0;
    const view = mark ? `GUARD-${mark.toUpperCase()}` : home ? 'HOME' : skeleton ? 'SKELETON' : product ? (cta ? 'PRODUCT+CTA' : 'PRODUCT') : listing ? 'LISTING' : heads.length ? 'OTHER' : 'BLANK';
    const s = `${view}|${location.pathname}|${document.title}|${h1}|react=${reactStarted ? 1 : 0}`;
    if (s !== last) {
      last = s;
      tl.push({ t: Math.round(performance.now()), view, path: location.pathname, title: document.title, h1, react: reactStarted });
    }
  };
  let lastTick = 0;
  setInterval(() => {
    const now = performance.now();
    if (lastTick && now - lastTick > 200) tl.push({ t: Math.round(lastTick), view: '(main thread busy)', gap: Math.round(now - lastTick) });
    lastTick = now;
    probe();
  }, 50);
  document.addEventListener('readystatechange', probe);
};

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' },
});
const { defaultBrowserType, ...phone } = devices['iPhone 13'];
const results = [];

for (const c of CASES) {
  if (ONLY && !ONLY.split(',').some((o) => c.id.startsWith(o))) continue;
  for (let run = 1; run <= RUNS; run++) {
    const ctx = await browser.newContext(phone);
    const blocked = new Set();
    await ctx.route('**/*', (r) => {
      const h = new URL(r.request().url()).hostname;
      if (ALLOW.test(h)) return r.fallback();
      blocked.add(h);
      return r.abort();
    });
    await ctx.addInitScript(probeScript, c.expect);
    const page = await ctx.newPage();
    if (c.fallbackDoc) {
      await page.route(BASE + c.url, async (route) => {
        if (route.request().resourceType() !== 'document') return route.fallback();
        const resp = await route.fetch({ url: BASE + NO_FILE() });
        await route.fulfill({ response: resp });
      });
    }
    const cdp = await ctx.newCDPSession(page);
    if (P) {
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: P.latency, downloadThroughput: P.down, uploadThroughput: P.up });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: P.cpu });
    }
    const frames = [];
    cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
      frames.push({ ts: metadata.timestamp * 1000, data });
      try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch {}
    });
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 70, maxWidth: 390, maxHeight: 844, everyNthFrame: 1 });

    const wall0 = Date.now();
    let navError = null;
    await page.goto(BASE + c.url, { waitUntil: 'commit', timeout: 60000 }).catch((e) => { navError = String(e).slice(0, 200); });
    await page.waitForTimeout(WATCH_MS - (Date.now() - wall0));
    try { await cdp.send('Page.stopScreencast'); } catch {}

    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const res = performance.getEntriesByType('resource').map((r) => ({ name: r.name, start: Math.round(r.startTime), end: Math.round(r.responseEnd), size: r.transferSize, body: r.decodedBodySize, type: r.initiatorType }));
      return { timeOrigin: performance.timeOrigin, tl: window.__tl, paint: window.__paint, docStart: Math.round(nav?.responseStart ?? -1), docEnd: Math.round(nav?.responseEnd ?? -1), dcl: Math.round(nav?.domContentLoadedEventEnd ?? -1), res, finalUrl: location.pathname + location.search, title: document.title };
    }).catch((e) => ({ error: String(e) }));

    const pick = (re) => m.res?.filter((r) => re.test(r.name)).map((r) => ({ f: r.name.replace(/^https?:\/\/[^/]+/, '').replace(/\?.*$/, '').slice(0, 60), start: r.start, end: r.end, kb: Math.round((r.body || 0) / 1024) }));
    const keyRes = {
      graphql: m.res?.filter((r) => /graphql\.json/.test(r.name)).map((r) => ({ start: r.start, end: r.end })),
      pdpChunk: pick(/\/assets\/JewelDetailNext-/),
      snapshotChunk: pick(/\/assets\/jewellerySnapshot-/),
      productDetailChunk: pick(/\/assets\/ProductDetail-/),
      homeChunk: pick(/\/assets\/Index-/),
      mainJs: pick(/\/assets\/index-[^/]+\.js/),
    };
    const states = (m.tl || []).filter((e) => !e.view.startsWith('('));
    const busy = (m.tl || []).filter((e) => e.view.startsWith('(')).map((e) => [e.t, e.gap]);
    const first = (v) => states.find((e) => (Array.isArray(v) ? v.includes(e.view) : e.view === v))?.t ?? null;
    const lastEnd = (v) => {
      // time the view stopped being shown (start of the next different state)
      let end = null;
      for (let i = 0; i < states.length; i++) if (states[i].view === v) end = states[i + 1]?.t ?? 'still';
      return end;
    };
    const row = {
      case: c.id, profile: PROFILE, run, url: c.url, navError,
      fp: m.paint?.['first-paint'] ?? null, fcp: m.paint?.['first-contentful-paint'] ?? null, lcp: m.paint?.lcp ?? null,
      docEnd: m.docEnd, dcl: m.dcl,
      reactStart: states.find((e) => e.react)?.t ?? null,
      busy,
      homeFrom: first('HOME'), homeTo: lastEnd('HOME'),
      guardFrom: first(['GUARD-PIECE', 'GUARD-PAGE']), guardTo: lastEnd('GUARD-PIECE') ?? lastEnd('GUARD-PAGE'), guardKind: states.find((e) => e.view.startsWith('GUARD'))?.view ?? null,
      blankAfterReact: states.filter((e) => e.view === 'BLANK' && e.react).map((e) => e.t),
      skeletonFrom: first('SKELETON'), skeletonTo: lastEnd('SKELETON'),
      productAt: first(['PRODUCT', 'PRODUCT+CTA']), ctaAt: first('PRODUCT+CTA'), listingAt: first('LISTING'),
      finalUrl: m.finalUrl, finalTitle: m.title,
      keyRes, blocked: [...blocked], timeline: m.tl,
    };
    results.push(row);
    console.log(JSON.stringify({ ...row, timeline: undefined, keyRes: undefined, blocked: undefined }));

    // Frames for the contact sheet: the last frame painted at or before each 300 ms tick.
    const dir = `${OUT}/frames/${PROFILE}/${c.id}/run${run}`;
    mkdirSync(dir, { recursive: true });
    const rel = frames.map((f) => ({ t: Math.round(f.ts - m.timeOrigin), data: f.data })).sort((a, b) => a.t - b.t);
    const ticks = [];
    for (let t = 0; t <= Math.min(WATCH_MS, P ? 12000 : 6000); t += 300) {
      const f = [...rel].reverse().find((x) => x.t <= t);
      const st = [...states].reverse().find((e) => e.t <= t);
      const file = f ? `${dir}/t${String(t).padStart(5, '0')}.jpg` : null;
      if (f) writeFileSync(file, Buffer.from(f.data, 'base64'));
      ticks.push({ t, file, frameAt: f?.t ?? null, view: st?.view ?? 'NOTHING', path: st?.path ?? '', title: st?.title ?? '' });
    }
    writeFileSync(`${dir}/ticks.json`, JSON.stringify({ case: c.id, url: c.url, profile: PROFILE, run, ticks, frameTimes: rel.map((x) => x.t) }, null, 1));
    await ctx.close();
  }
}
writeFileSync(`${OUT}/results-${PROFILE}.json`, JSON.stringify(results, null, 1));
await browser.close();
