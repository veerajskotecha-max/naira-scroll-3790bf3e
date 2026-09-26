// Reproduce a catalogue-ad click on throttled mobile data and record what is
// actually on the critical path. Chromium here cannot reach the internet, so
// every request is proxied through Node fetch; the throttling is applied in
// the browser via CDP so the proxy does not distort it.
import { chromium } from 'playwright';
const URL = process.argv[2];
const PROFILE = process.argv[3] || 'slow4g';
const PROFILES = {
  // Lighthouse's own definitions
  good4g:  { downloadThroughput: 9000 * 1024 / 8, uploadThroughput: 1500 * 1024 / 8, latency: 40 },
  slow4g:  { downloadThroughput: 1600 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 150 },
  none:    null,
};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const res = [];
await ctx.route('**/*', async (route) => {
  const req = route.request();
  try {
    const r = await fetch(req.url(), { method: req.method(), headers: req.headers(), body: req.postData() || undefined, redirect: 'follow' });
    const buf = Buffer.from(await r.arrayBuffer());
    res.push({ url: req.url(), type: req.resourceType(), bytes: buf.length, status: r.status });
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: buf });
  } catch { await route.abort(); }
});
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
if (PROFILES[PROFILE]) await cdp.send('Network.emulateNetworkConditions', { offline: false, ...PROFILES[PROFILE] });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: PROFILE === 'none' ? 1 : 4 });

const t0 = Date.now();
await page.goto(URL, { waitUntil: 'commit', timeout: 180000 });
const marks = {};
const seen = async (label, fn, cap = 170000) => {
  try { await page.waitForFunction(fn, { timeout: cap, polling: 120 }); marks[label] = ((Date.now() - t0) / 1000).toFixed(1); }
  catch { marks[label] = '>' + (cap / 1000); }
};
await seen('firstPaint', () => document.body && document.body.innerText.trim().length > 0);
await seen('productName', () => {
  const h = document.querySelector('h1');
  return !!(h && h.innerText.trim().length > 2);
});
await seen('price', () => /₹|Rs\.?\s?\d/.test(document.body.innerText));
await seen('heroImage', () => [...document.images].some(i => i.naturalWidth > 200 && i.getBoundingClientRect().top < 900 && i.complete));
console.log(JSON.stringify({ url: URL, profile: PROFILE, marks }, null, 1));

const by = {};
for (const r of res) { by[r.type] = by[r.type] || { n: 0, kb: 0 }; by[r.type].n++; by[r.type].kb += r.bytes / 1024; }
console.log('\nbytes by type');
Object.entries(by).sort((a, b2) => b2[1].kb - a[1].kb).forEach(([t, v]) =>
  console.log(`  ${t.padEnd(12)} ${String(v.n).padStart(3)} files  ${v.kb.toFixed(0).padStart(6)} kB`));
console.log('  ' + '-'.repeat(34));
console.log(`  ${'TOTAL'.padEnd(12)} ${String(res.length).padStart(3)} files  ${(res.reduce((s, r) => s + r.bytes, 0) / 1024).toFixed(0).padStart(6)} kB`);
console.log('\nheaviest 12');
res.sort((a, b2) => b2.bytes - a.bytes).slice(0, 12).forEach(r =>
  console.log(`  ${(r.bytes / 1024).toFixed(0).padStart(6)} kB  ${r.type.padEnd(10)} ${r.url.replace(/^https?:\/\//, '').slice(0, 78)}`));
await b.close();
