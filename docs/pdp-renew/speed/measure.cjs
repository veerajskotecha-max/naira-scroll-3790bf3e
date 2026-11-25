/* Load-speed lab test of one product page on local production builds.
   node measure.cjs <label=port> [<label=port> ...] [--runs=5] [--profile=slow|good|desk] [--handle=woven-gold-hoops]
   Each label is served by `vite preview` on its port (the pre-built page where it exists).
   Reporting requests (Meta, the relay, Clarity, analytics) are refused, as in the site's own pre-build. */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.split("=")[1] : d; };
const targets = args.filter((a) => !a.startsWith("--")).map((a) => { const [label, port] = a.split("="); return { label, port }; });
const RUNS = Number(opt("runs", "5"));
const PROFILE = opt("profile", "slow");
const HANDLE = opt("handle", "woven-gold-hoops");
const PROFILES = {
  // Lighthouse's mobile preset: slow 4G and a mid-range phone.
  slow: { latency: 150, down: (1.6 * 1024 * 1024) / 8, up: (750 * 1024) / 8, cpu: 4, vp: { width: 390, height: 844 }, mobile: true, dpr: 2 },
  // A good 4G connection on a recent phone.
  good: { latency: 40, down: (10 * 1024 * 1024) / 8, up: (3 * 1024 * 1024) / 8, cpu: 2, vp: { width: 390, height: 844 }, mobile: true, dpr: 2 },
  // A laptop on broadband.
  desk: { latency: 20, down: (40 * 1024 * 1024) / 8, up: (10 * 1024 * 1024) / 8, cpu: 1, vp: { width: 1440, height: 900 }, mobile: false, dpr: 1 },
};
const P = PROFILES[PROFILE];
const REPORTING = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|hotjar|monorail-edge|events\.pickrr\.com|pickrr|fastrr|shiprocket|wigzo|cloudflareinsights\.com|\/functions\/v1\/meta-capi|\/functions\/v1\/shopper-performance|~api\/analytics)/;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const once = async (browser, port) => {
  const context = await browser.newContext({ viewport: P.vp, isMobile: P.mobile, hasTouch: P.mobile, deviceScaleFactor: P.dpr,
    userAgent: P.mobile ? "Mozilla/5.0 (Linux; Android 14; SM-A155F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36" : undefined });
  let refusedMutations = 0;
  await context.route("**/*", (route) => {
    const req = route.request(); const url = req.url();
    if (REPORTING.test(url) && !/^https?:\/\/127\.0\.0\.1/.test(url.replace(/\/functions\/v1\/.*/, ""))) return route.abort();
    if (REPORTING.test(url) && /\/functions\/v1\//.test(url)) return route.abort();
    if (req.method() === "POST" && /graphql/.test(url) && /mutation/.test(req.postData() || "")) { refusedMutations++; return route.abort(); }
    return route.continue();
  });
  await context.addInitScript(() => {
    window.__m = { lcp: 0, lcpEl: "", cls: 0, long: 0, longCount: 0, fcp: 0 };
    try {
      new PerformanceObserver((list) => { for (const e of list.getEntries()) { window.__m.lcp = e.startTime; window.__m.lcpEl = (e.element && (e.element.tagName + (e.element.currentSrc ? " " + e.element.currentSrc.split("/").pop().slice(0, 60) : " " + (e.element.textContent || "").slice(0, 40)))) || ""; window.__m.lcpSize = e.size; } }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => { for (const e of list.getEntries()) { window.__m.long += Math.max(0, e.duration - 50); window.__m.longCount++; } }).observe({ type: "longtask", buffered: true });
      new PerformanceObserver((list) => { for (const e of list.getEntries()) if (e.name === "first-contentful-paint") window.__m.fcp = e.startTime; }).observe({ type: "paint", buffered: true });
    } catch (e) {}
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: P.latency, downloadThroughput: P.down, uploadThroughput: P.up });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: P.cpu });
  const bytes = { total: 0, js: 0, css: 0, img: 0, font: 0, doc: 0, other: 0, requests: 0 };
  const types = new Map();
  cdp.on("Network.responseReceived", (e) => types.set(e.requestId, e.type));
  cdp.on("Network.loadingFinished", (e) => {
    const t = types.get(e.requestId) || "Other"; const n = e.encodedDataLength || 0;
    bytes.total += n; bytes.requests++;
    if (t === "Script") bytes.js += n; else if (t === "Stylesheet") bytes.css += n; else if (t === "Image") bytes.img += n; else if (t === "Font") bytes.font += n; else if (t === "Document") bytes.doc += n; else bytes.other += n;
  });
  const t0 = Date.now();
  // With the closing slash: the local server then returns the piece's own pre-built page, as the live host does
  // for the plain address (without it, it falls back to the home page's file and the test would time that instead).
  await page.goto(`http://127.0.0.1:${port}/jewellery/${HANDLE}/`, { waitUntil: "load", timeout: 120000 });
  const loadMs = Date.now() - t0;
  // Let late work settle: the app hydrates, the catalogue answers, lazy parts arrive.
  await sleep(PROFILE === "slow" ? 9000 : 6000);
  const m = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const btn = [...document.querySelectorAll("#product-actions button")].find((b) => /add to (cart|bag)/i.test(b.textContent || ""));
    return { ...window.__m, ttfb: nav ? nav.responseStart : 0, dcl: nav ? nav.domContentLoadedEventEnd : 0, load: nav ? nav.loadEventEnd : 0, h1: document.querySelector("#root h1")?.textContent || "", hasButton: Boolean(btn) };
  });
  await context.close();
  return { ...m, loadMs, ...bytes, refusedMutations };
};

(async () => {
  const browser = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled"] });
  const out = { profile: PROFILE, handle: HANDLE, runs: RUNS, results: {} };
  // Interleave the targets, so a noisy minute falls on all of them alike.
  const all = Object.fromEntries(targets.map((t) => [t.label, []]));
  for (let i = 0; i < RUNS; i++) for (const t of targets) { try { all[t.label].push(await once(browser, t.port)); } catch (e) { console.error(t.label, "run failed:", String(e).slice(0, 160)); } }
  await browser.close();
  const keys = ["ttfb", "fcp", "lcp", "cls", "long", "longCount", "dcl", "load", "total", "js", "css", "img", "font", "doc", "requests"];
  for (const t of targets) {
    const runs = all[t.label];
    const med = Object.fromEntries(keys.map((k) => [k, median(runs.map((r) => r[k]))]));
    out.results[t.label] = { median: med, lcpEl: runs.map((r) => r.lcpEl), h1: runs[0]?.h1, hasButton: runs.every((r) => r.hasButton), n: runs.length, lcps: runs.map((r) => Math.round(r.lcp)), clss: runs.map((r) => Number(r.cls.toFixed(4))) };
  }
  fs.writeFileSync(path.join(__dirname, `result-${PROFILE}-${HANDLE}.json`), JSON.stringify(out, null, 1));
  const kb = (n) => `${Math.round(n / 1024)} KB`;
  const ms = (n) => `${(n / 1000).toFixed(2)} s`;
  console.log(`profile ${PROFILE} · ${HANDLE} · median of ${RUNS}`);
  for (const t of targets) {
    const r = out.results[t.label]; const m = r.median;
    console.log(`${t.label.padEnd(8)} FCP ${ms(m.fcp)} · LCP ${ms(m.lcp)} [${r.lcps.join(", ")}] · CLS ${m.cls.toFixed(3)} · blocking ${Math.round(m.long)} ms (${m.longCount} long tasks) · ${m.requests} requests · ${kb(m.total)} (js ${kb(m.js)}, css ${kb(m.css)}, img ${kb(m.img)}, font ${kb(m.font)}, html ${kb(m.doc)}) · LCP element: ${r.lcpEl[0]} · button ${r.hasButton}`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
