// What a shopper actually SEES after tapping a catalogue ad, timed from the
// browser's own paint records instead of polling or screenshots (both run late
// on a throttled CPU and made the product look later — or earlier — than it is).
//
// Network model (MODEL=h2, the default): gzip-sized text; 3 round trips to open
// each new domain (started early for <link rel=preconnect>); every response
// waits one round trip for its first byte; the phone's bandwidth is shared
// fairly between the domains that are sending, and inside one domain the
// response Chrome ranks highest goes first (HTTP/2 priorities, Chrome's own
// ranking read over CDP, including its in-viewport image boosts). MODEL=fifo
// is the old single first-come-first-served pipe. 4x CPU slowdown. Pass 1
// warms a cache so pass 2 measures the model, not this sandbox's network.
//
//   node adtrace.mjs <url> [fast4g|slow4g]
//   SUBST=<url>        serve that page's HTML for the first document instead
//                      (e.g. the pre-built /jewellery/ page at the /products/ URL)
//   FILM=<dir>         also record a screencast and keep a frame every 0.5 s
//   NO3D=1             swap the header's 3D flower for a no-op
//   SCOPE=<selector>   where the product's <h1> and photo live (default #root);
//   WAIT_S=<n>         with SCOPE=body and WAIT_S, any store's product page
//   BLOCK_EXTRA=<re>   abort more requests (e.g. another store's analytics)
//   TRACE=<file> / CPUPROF=<file>   Chrome trace / CPU profile of the timed pass
//                      (summarise with tracesum.mjs / cpusum.mjs)
//   DEBUG=1            paint records and documents served, on stderr
//
// Paint times: Element Timing on every <h1> and <img> (attributes added the
// moment the node enters the DOM, before it can paint), LCP, first paint.
import { chromium } from 'playwright';
import { gzipSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
const [URL0, PROFILE = 'fast4g'] = process.argv.slice(2);
const PROFILES = { fast4g: { kbps: 9000, rtt: 60 }, slow4g: { kbps: 1600, rtt: 150 } };
const { kbps, rtt: RTT } = PROFILES[PROFILE];
const MODEL = process.env.MODEL || 'h2';
const PRI = { VeryHigh: 4, High: 3, Medium: 2, Low: 1, VeryLow: 0 };
const RATE = kbps * 1024 / 8;
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|\/functions\/v1\/meta-capi)/i;
const TEXT = /(javascript|css|html|json|svg|xml|text\/plain)/i;
const cache = new Map();
const key = (q) => q.method() + ' ' + q.url() + ' ' + (q.postData() || '');
// Client hints of the phone browser the page thinks it is, not "HeadlessChrome"
// (some stores answer that with a bot check instead of the product page).
const HINTS = { 'sec-ch-ua': '"Chromium";v="120", "Google Chrome";v="120", "Not?A_Brand";v="99"', 'sec-ch-ua-mobile': '?1', 'sec-ch-ua-platform': '"Android"' };
const load = async (url, q) => {
  const r = await fetch(url, { method: q.method(), headers: { ...q.headers(), ...HINTS }, body: q.postData() || undefined, redirect: 'manual' });
  const body = Buffer.from(await r.arrayBuffer());
  const headers = Object.fromEntries([...r.headers].filter(([h]) => !/^(content-encoding|content-length)$/i.test(h)));
  const wire = TEXT.test(r.headers.get('content-type') || '') && body.length > 1024 ? gzipSync(body, { level: 6 }).length : body.length;
  return { status: r.status, headers, body, wire };
};

const SCOPE = process.env.SCOPE || '#root';
const INIT = `(() => {
  // Behave like a shopper's browser, not an automated one: the app treats
  // navigator.webdriver as "this is the prerenderer" and skips work for it.
  try { Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false, configurable: true }); } catch (e) {}
  const SCOPE = ${JSON.stringify(SCOPE)};
  const now = () => Math.round(performance.now());
  const nf = window.__nf = { marks: {}, h1: [], lcp: [], el: [], paints: {}, longTasks: 0 };
  const mark = (k) => { if (!(k in nf.marks)) nf.marks[k] = now(); };
  const obs = (type, fn) => { try { new PerformanceObserver((l) => l.getEntries().forEach(fn)).observe({ type, buffered: true }); } catch (e) {} };
  obs('paint', (e) => { nf.paints[e.name] = Math.round(e.startTime); });
  obs('largest-contentful-paint', (e) => nf.lcp.push({ t: Math.round(e.startTime), size: e.size,
    what: e.element ? e.element.tagName.toLowerCase() + ' ' + (e.url || e.element.textContent || '').replace(/\\s+/g, ' ').slice(0, 60) : (e.url || '').slice(0, 60) }));
  obs('element', (e) => nf.el.push({ id: e.identifier, t: Math.round(e.renderTime || e.loadTime),
    area: Math.round(e.intersectionRect.width * e.intersectionRect.height), url: e.url || '' }));
  obs('longtask', (e) => { nf.longTasks += e.duration; });
  const seen = new WeakSet(); let n = 0, pre = null;
  const isReact = (el) => Object.keys(el).some((k) => k.startsWith('__react'));
  const scan = () => {
    const root = document.querySelector(SCOPE);
    const first = root && root.firstElementChild;
    if (first && !pre && !isReact(first)) { pre = first; mark('prebuiltInDom'); }
    if (pre && !pre.isConnected) mark('prebuiltWiped');
    if (first && isReact(first)) mark('reactFirstCommit');
    for (const el of document.querySelectorAll(SCOPE + ' h1, ' + SCOPE + ' img')) {
      if (seen.has(el)) continue; seen.add(el);
      const id = el.tagName.toLowerCase() + '-' + (++n) + (isReact(el) ? '-react' : '-html');
      el.setAttribute('elementtiming', id);
      if (el.tagName === 'H1') nf.h1.push({ id, at: now(), text: (el.textContent || '').trim().slice(0, 48) });
    }
    if ([...document.querySelectorAll('button')].some((b) => /add to (cart|bag)/i.test(b.textContent || '') && !b.disabled && isReact(b))) mark('addToCartWorks');
  };
  new MutationObserver(scan).observe(document, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', () => { mark('domReady'); scan(); });
})();`;

// Each pass gets its own browser: the GPU process is shared by every page of a
// browser, and the warm-up pass's 3D work (software GL in this sandbox) was
// still running when the timed pass started, delaying it by up to a second.
let b;
const run = async (modelled) => {
  b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' });
  await ctx.addInitScript({ content: INIT });
  let pipeFree = 0, t0 = 0, firstDoc = true; const ready = new Map(); const log = [];
  const prio = new Map(), idUrl = new Map(), queue = [];
  let last = Date.now();
  const tick = () => {
    const now = Date.now(); let budget = RATE * (now - last) / 1000; last = now;
    let live = queue.filter((x) => x.firstByte <= now && x.left > 0);
    while (budget > 1 && live.length) {
      const origins = [...new Set(live.map((x) => x.origin))];
      const share = budget / origins.length; let used = 0;
      for (const o of origins) {
        let give = share;
        const mine = live.filter((x) => x.origin === o).sort((a, c) => (prio.get(c.url) ?? 1) - (prio.get(a.url) ?? 1) || a.asked - c.asked);
        for (const it of mine) { if (give <= 0) break; const g = Math.min(give, it.left); it.left -= g; give -= g; used += g; if (it.left <= 0) it.finish(now); }
      }
      budget -= used; live = live.filter((x) => x.left > 0);
      if (used < 1) break;
    }
    for (let i = queue.length - 1; i >= 0; i--) if (queue[i].left <= 0) queue.splice(i, 1);
  };
  const timer = modelled && MODEL === 'h2' ? setInterval(tick, 3) : null;
  await ctx.route('**/*', async (route) => {
    const q = route.request();
    if (BLOCK.test(q.url()) || (process.env.BLOCK_EXTRA && new RegExp(process.env.BLOCK_EXTRA).test(q.url()))) return route.abort();
    try {
      const asked = Date.now();
      const src = firstDoc && q.resourceType() === 'document' && process.env.SUBST ? process.env.SUBST : q.url();
      if (q.resourceType() === 'document') firstDoc = false;
      const k = key(q) + ' <' + src;
      if (!cache.has(k)) cache.set(k, await load(src, q));
      let r = cache.get(k);
      // NO3D=1: the header's 3D flower never starts. Aborting its chunks is not
      // an option — a failed chunk makes main.tsx reload the whole page — so
      // the scene module is swapped for a no-op and three.js for an empty one.
      if (process.env.NO3D && /\/assets\/(scene|RoomEnvironment)-[\w-]+\.js/.test(q.url())) {
        const js = /RoomEnvironment-/.test(q.url()) ? 'export {};' : 'export const mountNairaFlower = () => ({ dispose() {} });';
        r = { status: 200, headers: { 'content-type': 'application/javascript' }, body: Buffer.from(js), wire: js.length };
      }
      if (process.env.DEBUG && q.resourceType() === 'document') { const t = r.body.toString('utf8'); console.error('DOC', modelled ? 'timed' : 'warm', q.url().slice(0, 70), '<', src.slice(0, 70), r.status, r.body.length, (t.match(/<link rel="canonical"[^>]*href="([^"]+)"/) || [])[1]); }
      if (modelled) {
        const origin = new URL(q.url()).origin;
        if (!ready.has(origin)) ready.set(origin, asked + 3 * RTT);          // DNS + TCP + TLS
        const firstByte = Math.max(asked, ready.get(origin)) + RTT;           // request → first byte
        let done;
        if (MODEL === 'fifo') {
          const start = Math.max(firstByte, pipeFree);
          done = start + (r.wire / RATE) * 1000; pipeFree = done;
          const wait = done - Date.now(); if (wait > 0) await new Promise((res) => setTimeout(res, wait));
        } else {
          done = await new Promise((res) => {
            const it = { origin, url: q.url(), asked, firstByte, left: r.wire, finish: (t) => res(t) };
            if (r.wire <= 0) setTimeout(() => res(Date.now()), Math.max(0, firstByte - Date.now()));
            else queue.push(it);
          });
        }
        if (q.resourceType() === 'document' && /html/.test(r.headers['content-type'] || '')) {
          for (const m of r.body.toString('utf8', 0, 20000).matchAll(/<link[^>]+rel="?preconnect"?[^>]*href="?([^" >]+)/g)) {
            try { const o = new URL(m[1]).origin; if (!ready.has(o)) ready.set(o, done + 3 * RTT); } catch {}
          }
        }
        log.push({ url: q.url(), type: q.resourceType(), wire: r.wire, asked: asked - t0, at: done - t0 });
      }
      await route.fulfill({ status: r.status, headers: r.headers, body: r.body });
    } catch { await route.abort().catch(() => {}); }
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  cdp.on('Network.requestWillBeSent', (e) => { idUrl.set(e.requestId, e.request.url); prio.set(e.request.url, PRI[e.request.initialPriority] ?? 1); });
  cdp.on('Network.resourceChangedPriority', (e) => { const u = idUrl.get(e.requestId); if (u) prio.set(u, PRI[e.newPriority] ?? 1); });
  if (modelled) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const frames = [];
  if (modelled && process.env.FILM) {
    cdp.on('Page.screencastFrame', (f) => { frames.push({ ts: f.metadata.timestamp * 1000, data: f.data }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 70, maxWidth: 390, maxHeight: 844, everyNthFrame: 1 });
  }
  if (modelled && process.env.TRACE) await b.startTracing(page, { path: process.env.TRACE, categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'v8', 'loading', 'toplevel', 'gpu'] });
  if (modelled && process.env.CPUPROF) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 }); await cdp.send('Profiler.start'); }
  t0 = Date.now();
  await page.goto(URL0, { waitUntil: 'commit', timeout: 300000 });
  // WAIT_S=<n>: pages that are not this app (no React Add to cart to wait for)
  // are simply given n seconds.
  if (process.env.WAIT_S) await page.waitForTimeout(Number(process.env.WAIT_S) * 1000);
  else await page.waitForFunction(() => window.__nf && window.__nf.marks.addToCartWorks, null, { timeout: 240000, polling: 200 }).catch(() => {});
  await page.waitForTimeout(modelled ? 4000 : 3000);
  const nf = await page.evaluate((SCOPE) => {
    const photo = [...document.querySelectorAll(SCOPE + ' img')].filter((i) => { const r = i.getBoundingClientRect(); return r.top < 600 && r.width > 250 && i.complete && i.naturalWidth > 200; })[0];
    const name = document.querySelector(SCOPE + ' h1')?.textContent?.trim() || '';
    return { ...window.__nf, origin: performance.timeOrigin, photoFile: photo ? new URL(photo.currentSrc || photo.src).pathname.split('/').pop() : null, name };
  }, SCOPE);
  if (modelled && process.env.TRACE) await b.stopTracing();
  if (modelled && process.env.CPUPROF) {
    const { profile } = await cdp.send('Profiler.stop');
    writeFileSync(process.env.CPUPROF, JSON.stringify(profile));
  }
  if (frames.length) {
    const dir = process.env.FILM; mkdirSync(dir, { recursive: true });
    for (let s = 0.5; s <= 10.01; s += 0.5) {
      const due = nf.origin + s * 1000;
      const f = frames.filter((x) => x.ts <= due).pop();
      if (f) writeFileSync(`${dir}/t${s.toFixed(1)}.jpg`, Buffer.from(f.data, 'base64'));
    }
  }
  if (timer) clearInterval(timer);
  await ctx.close();
  await b.close();
  return { nf, log };
};
await run(false);
const { nf, log } = await run(true);

const s = (ms) => (ms == null ? null : +(ms / 1000).toFixed(2));
const nameText = nf.name.slice(0, 12).toLowerCase();
const nameH1 = nf.h1.filter((h) => nameText && h.text.toLowerCase().startsWith(nameText));
const paintOf = (id) => nf.el.find((e) => e.id === id)?.t ?? null;
const namePaints = nameH1.map((h) => ({ id: h.id, painted: paintOf(h.id) }));
const photoPaints = nf.photoFile ? nf.el.filter((e) => e.url.includes(nf.photoFile) && e.area > 40000).map((e) => ({ id: e.id, painted: e.t })) : [];
const firstOf = (a) => a.map((x) => x.painted).filter((x) => x != null).sort((x, y) => x - y)[0] ?? null;
const reactName = namePaints.find((p) => p.id.endsWith('-react'))?.painted ?? null;
const reactPhoto = photoPaints.find((p) => p.id.endsWith('-react'))?.painted ?? null;
const wiped = nf.marks.prebuiltWiped ?? null;
const pick = (l) => /\.(js|css)(\?|$)/.test(l.url) || ['document', 'font', 'fetch', 'xhr'].includes(l.type) || (l.type === 'image' && l.wire > 15000);
const short = (u) => { const x = new URL(u); return (x.hostname.includes('nairaflore') || x.hostname === '127.0.0.1' ? '' : x.hostname.replace(/^www\./, '') + ' ') + x.pathname.split('/').slice(-2).join('/').slice(0, 58); };
const until = (reactPhoto ?? nf.marks.addToCartWorks ?? 1e9) + 200;
const kb = (a) => Math.round(a.reduce((t, l) => t + l.wire, 0) / 1024);
if (process.env.DEBUG) console.error(JSON.stringify({ h1: nf.h1, el: nf.el.map((e) => ({ ...e, url: e.url.split('/').pop().slice(0, 40) })), marks: nf.marks, paints: nf.paints, photoFile: nf.photoFile }, null, 0));
console.log(JSON.stringify({
  profile: PROFILE, model: MODEL, no3d: process.env.NO3D ? true : undefined, blocked: process.env.BLOCK_EXTRA || undefined, url: URL0.replace(/\?.*/, '?…'), served: process.env.SUBST ? 'HTML of ' + process.env.SUBST.replace(/\?.*/, '') : 'as live',
  seconds: {
    firstPaint: s(nf.paints['first-contentful-paint']),
    nameFirstOnScreen: s(firstOf(namePaints)), photoFirstOnScreen: s(firstOf(photoPaints)),
    reactFirstCommit: s(nf.marks.reactFirstCommit), prebuiltWiped: s(wiped),
    nameBackFromApp: s(reactName), photoBackFromApp: s(reactPhoto),
    blankGap: wiped != null && reactName != null && firstOf(namePaints) != null && firstOf(namePaints) < wiped ? s(reactName - wiped) : null,
    addToCartWorks: s(nf.marks.addToCartWorks), lcp: s(nf.lcp.at(-1)?.t), lcpElement: nf.lcp.at(-1)?.what,
  },
  mainThreadLongTasks_s: s(nf.longTasks),
  downloadedBeforePhoto_kB: kb(log.filter((l) => l.at <= until)),
  imagesBeforePhoto_kB: kb(log.filter((l) => l.at <= until && l.type === 'image')),
  waterfall: log.filter((l) => l.at <= until && pick(l)).sort((x, y) => x.at - y.at).map((l) => `${(l.asked / 1000).toFixed(2)}→${(l.at / 1000).toFixed(2)}s ${String(Math.round(l.wire / 1024)).padStart(4)}kB ${l.type.padEnd(8)} ${short(l.url)}`),
}, null, 1));
