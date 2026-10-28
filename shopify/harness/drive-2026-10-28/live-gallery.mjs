// The phone gallery of a few live product pages, in order, once live Shopify data has arrived.
//   node live-gallery.mjs <outDir> <handle> ...
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { NO_REPORT } from '/home/user/naira-scroll-3790bf3e/shopify/harness/noreport.mjs';
const [OUT, ...handles] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY } });
const phone = (({ defaultBrowserType, ...rest }) => rest)(devices['Pixel 7']);
for (const h of handles) {
  const ctx = await browser.newContext(phone);
  await ctx.route('**/*', (r) => (NO_REPORT.test(r.request().url()) ? r.abort() : r.continue()));
  /* The gallery draws photos two onward only for real browsers (navigator.webdriver is unset). */
  await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }));
  const page = await ctx.newPage();
  await page.goto(`https://www.nairaflore.com/products/${h}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(9000);
  const files = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button[aria-label*="full screen"]')].filter((b) => b.getBoundingClientRect().width > 0);
    return btns.map((b) => (b.querySelector('img')?.getAttribute('src') || '').split('?')[0].split('/').pop());
  });
  const at = Number(process.env.AT || 4);
  await page.evaluate((k) => { const s = document.querySelector('.snap-x'); if (s) s.scrollLeft = s.clientWidth * k; }, at);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${h}.png` });
  console.log(`${h}: ${files.length} photos\n  ${files.join('\n  ')}`);
  await ctx.close();
}
await browser.close();
