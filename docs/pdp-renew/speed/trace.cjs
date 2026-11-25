/* What the first paint waits for: resource timings of one throttled load. node trace.cjs <port> */
const { chromium } = require("playwright");
const port = process.argv[2] || "4193";
(async () => {
  const browser = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled"] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (Linux; Android 14; SM-A155F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36" });
  await context.route("**/*", (route) => {
    const req = route.request(); const url = req.url();
    if (/(facebook\.net|facebook\.com|clarity\.ms|googletagmanager|google-analytics|pickrr|fastrr|shiprocket|wigzo|cloudflareinsights)/.test(url)) return route.abort();
    if (/\/functions\/v1\//.test(url)) return route.abort();
    if (req.method() === "POST" && /graphql/.test(url) && /mutation/.test(req.postData() || "")) return route.abort();
    return route.continue();
  });
  await context.addInitScript(() => { window.__lcp = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp.push([Math.round(e.startTime), e.element?.tagName, (e.element?.currentSrc || e.url || "").split("/").pop().slice(0, 60), Math.round(e.size)]); }).observe({ type: "largest-contentful-paint", buffered: true }); } catch (e) {} });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(`http://127.0.0.1:${port}/jewellery/woven-gold-hoops/`, { waitUntil: "load", timeout: 120000 });
  await new Promise((r) => setTimeout(r, 7000));
  const out = await page.evaluate(() => {
    const res = performance.getEntriesByType("resource").map((r) => ({ n: r.name.replace(/^https?:\/\/[^/]+/, "").split("?")[0].slice(-58), host: new URL(r.name).host, type: r.initiatorType, start: Math.round(r.startTime), end: Math.round(r.responseEnd), kb: Math.round((r.transferSize || 0) / 1024), block: r.renderBlockingStatus }));
    const paints = Object.fromEntries(performance.getEntriesByType("paint").map((p) => [p.name, Math.round(p.startTime)]));
    const nav = performance.getEntriesByType("navigation")[0];
    const head = [...document.head.querySelectorAll('link[rel="preload"], link[rel="modulepreload"], link[rel="stylesheet"], link[rel="preconnect"]')].map((l) => `${l.rel} ${l.as || ""} ${(l.href || "").replace(/^https?:\/\/[^/]+/, "").slice(-50)} ${l.getAttribute("imagesrcset") ? "[imagesrcset]" : ""}`);
    return { paints, lcp: window.__lcp, ttfb: Math.round(nav.responseStart), htmlEnd: Math.round(nav.responseEnd), dcl: Math.round(nav.domContentLoadedEventEnd), res: res.sort((a, b) => a.start - b.start).slice(0, 34), head };
  });
  console.log(JSON.stringify({ paints: out.paints, lcp: out.lcp, ttfb: out.ttfb, htmlEnd: out.htmlEnd, dcl: out.dcl }));
  console.log(out.head.filter((h) => !/modulepreload/.test(h)).join("\n"));
  for (const r of out.res) console.log(`${String(r.start).padStart(5)} → ${String(r.end).padStart(5)}  ${String(r.kb).padStart(4)} KB  ${r.type.padEnd(7)} ${r.block === "blocking" ? "BLOCK" : "     "} ${r.host.startsWith("127.") ? "" : r.host + " "}${r.n}`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
