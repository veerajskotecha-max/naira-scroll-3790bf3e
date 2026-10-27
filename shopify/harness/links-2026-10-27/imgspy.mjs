// Logs, for one photo, every time a script sets an image address: the element's
// loading attribute, whether it is in the page, and its nearest labelled parent.
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { NO_REPORT } from '/home/user/naira-scroll-3790bf3e/shopify/harness/noreport.mjs';
const [PATH, NEEDLE] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://127.0.0.1:8100';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const ctx = await browser.newContext((({ defaultBrowserType, ...rest }) => rest)(devices['Pixel 7']));
await ctx.addInitScript({ content: `
  Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});
  window.__spy = [];
  const needle = ${JSON.stringify(NEEDLE)};
  const describe = (el, how, val) => {
    if (!String(val).includes(needle)) return;
    const chain = []; let p = el.parentElement; let i = 0;
    while (p && i < 6) { chain.push((p.tagName + (p.className && typeof p.className === 'string' ? '.' + p.className.split(' ').slice(0, 3).join('.') : '')).slice(0, 70)); p = p.parentElement; i++; }
    window.__spy.push({ how, loading: el.getAttribute('loading'), connected: el.isConnected, t: Math.round(performance.now()), chain, stack: (new Error().stack || '').split('\\n').slice(2, 7).map((s) => s.trim().slice(0, 90)) });
  };
  const sa = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) { if (this instanceof HTMLImageElement && (n === 'src' || n === 'srcset')) describe(this, 'setAttribute ' + n, v); return sa.call(this, n, v); };
  for (const prop of ['src', 'srcset']) {
    const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, prop);
    Object.defineProperty(HTMLImageElement.prototype, prop, { ...d, set(v) { describe(this, 'prop ' + prop, v); return d.set.call(this, v); } });
  }
` });
await ctx.route('**/*', (r) => (NO_REPORT.test(r.request().url()) || !/^127\.0\.0\.1$|(^|\.)(shopify\.com|myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(new URL(r.request().url()).hostname) ? r.abort() : r.continue()));
const page = await ctx.newPage();
const reqT = [];
const t0 = Date.now();
page.on('request', (r) => { if (r.url().includes(NEEDLE)) reqT.push(`${r.url().split('?')[1]} at +${Date.now() - t0}ms frame-nav ${r.isNavigationRequest()}`); });
await page.goto(BASE + PATH, { waitUntil: 'load' });
await page.waitForTimeout(5000);
const spy = await page.evaluate(() => window.__spy);
for (const x of spy) console.log(`${x.t}ms ${x.how} loading=${x.loading} connected=${x.connected} in ${x.chain.slice(0, 4).join(' < ')}`);
console.log('network requests for it:', reqT.join(' | '));
const els = await page.evaluate((needle) => [...document.images].filter((i) => (i.getAttribute('src') || '').includes(needle) || (i.getAttribute('srcset') || '').includes(needle)).map((i) => {
  let hidden = false; for (let p = i; p; p = p.parentElement) if (getComputedStyle(p).display === 'none') { hidden = true; break; }
  const r = i.getBoundingClientRect();
  return { hidden, left: Math.round(r.left), top: Math.round(r.top), complete: i.complete, natural: i.naturalWidth, current: (i.currentSrc || '').split('?')[1] || '', loading: i.getAttribute('loading'), sizes: i.getAttribute('sizes'), srcset: (i.getAttribute('srcset') || '').split(',').map((x) => x.trim().split(' ')[1]).join(' ') };
}), NEEDLE);
for (const e of els) console.log(JSON.stringify(e));
await browser.close();
