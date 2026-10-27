// Which <img> on a phone-width product page downloaded which file, and is it on screen?
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { NO_REPORT } from '/home/user/naira-scroll-3790bf3e/shopify/harness/noreport.mjs';
const [PATH] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://127.0.0.1:8100';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const ctx = await browser.newContext((({ defaultBrowserType, ...rest }) => rest)(devices['Pixel 7']));
// as a real phone: not an automated browser (the page renders every slide then)
await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
await ctx.route('**/*', (r) => (NO_REPORT.test(r.request().url()) || !/^127\.0\.0\.1$|(^|\.)(shopify\.com|myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(new URL(r.request().url()).hostname) ? r.abort() : r.continue()));
const page = await ctx.newPage();
await page.goto(BASE + PATH, { waitUntil: 'load' });
await page.waitForTimeout(7000);
const rows = await page.evaluate(() => {
  const res = new Map(performance.getEntriesByType('resource').filter((e) => e.initiatorType === 'img' || /\.(jpe?g|png|webp|avif)/.test(e.name)).map((e) => [e.name, e]));
  const out = [];
  for (const img of document.images) {
    const src = img.currentSrc;
    if (!src || !res.has(src)) continue;
    const e = res.get(src);
    let el = img, hidden = false;
    while (el) { if (getComputedStyle(el).display === 'none') { hidden = true; break; } el = el.parentElement; }
    const r = img.getBoundingClientRect();
    out.push({ file: src.split('/').pop().slice(0, 48), kb: Math.round((e.encodedBodySize || e.transferSize) / 1024), at: Math.round(e.startTime), hidden, top: Math.round(r.top + scrollY), left: Math.round(r.left), w: Math.round(r.width), loading: img.loading, where: img.closest('section')?.getAttribute('aria-labelledby') || img.closest('[class*="md:block"]') ? 'desktop-gallery' : img.closest('.snap-x') ? 'scroller' : '' });
  }
  return out.sort((a, b) => b.kb - a.kb);
});
const total = rows.reduce((a, r) => a + r.kb, 0);
console.log(`images downloaded without scrolling: ${rows.length}, ${total} KB; in hidden (desktop-only) parts: ${rows.filter((r) => r.hidden).reduce((a, r) => a + r.kb, 0)} KB; off to the side or below the screen: ${rows.filter((r) => !r.hidden && (r.top > 915 || r.left >= 412)).reduce((a, r) => a + r.kb, 0)} KB`);
for (const r of rows.slice(0, 22)) console.log(`  ${String(r.kb).padStart(4)} KB @${r.at}ms ${r.hidden ? 'HIDDEN ' : ''}top ${r.top} left ${r.left} w${r.w} ${r.loading} ${r.where} ${r.file}`);
await browser.close();
