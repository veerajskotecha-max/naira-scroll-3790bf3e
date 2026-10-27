// The desktop product page must still show its four-photo grid; a phone must
// not download photos two to four of it.
//   BASE=http://127.0.0.1:8100 node desk-grid.mjs <outDir> <path>
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { NO_REPORT } from '/home/user/naira-scroll-3790bf3e/shopify/harness/noreport.mjs';
const [OUT, PATH] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://127.0.0.1:8100';
const ALLOW = /^127\.0\.0\.1$|(^|\.)(shopify\.com|myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
for (const [label, opts] of [['desktop 1440', { viewport: { width: 1440, height: 900 } }], ['tablet 820', { viewport: { width: 820, height: 1180 } }], ['phone', (({ defaultBrowserType, ...rest }) => rest)(devices['Pixel 7'])]]) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
  await ctx.route('**/*', (r) => (NO_REPORT.test(r.request().url()) || !ALLOW.test(new URL(r.request().url()).hostname) ? r.abort() : r.continue()));
  const page = await ctx.newPage();
  const big = [];
  page.on('requestfinished', async (r) => { if (r.resourceType() === 'image' && /cdn\.shopify\.com/.test(r.url())) { const s = await r.sizes().catch(() => null); big.push([r.url().split('/').pop().slice(0, 40), Math.round((s?.responseBodySize ?? 0) / 1024)]); } });
  await page.goto(BASE + PATH, { waitUntil: 'load' });
  await page.waitForTimeout(6000);
  const grid = await page.evaluate(() =>
    [...document.querySelectorAll('.hidden.md\\:block img')].slice(0, 4).map((i) => ({ shown: !!i.offsetParent, w: i.naturalWidth, src: (i.currentSrc || '').startsWith('data:') ? 'blank' : (i.currentSrc || '').split('/').pop().slice(0, 40) })),
  );
  const kb = big.reduce((a, [, k]) => a + k, 0);
  console.log(`${label}: desktop grid ${JSON.stringify(grid)} | product photos downloaded ${big.length}, ${kb} KB`);
  await page.screenshot({ path: `${OUT}/grid-${label.split(' ')[0]}.png` });
  await ctx.close();
}
await browser.close();
