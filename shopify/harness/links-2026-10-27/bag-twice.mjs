// Adding a piece already in the bag: the line shows one more at once, then
// Shopify's count; it survives the sync the bag runs when opened again.
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { NO_REPORT } from '/home/user/naira-scroll-3790bf3e/shopify/harness/noreport.mjs';
const BASE = process.env.BASE || 'http://127.0.0.1:8100';
const ALLOW = /^127\.0\.0\.1$|(^|\.)(shopify\.com|myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|pickrr\.com)$/;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const ctx = await browser.newContext((({ defaultBrowserType, ...rest }) => rest)(devices['Pixel 7']));
await ctx.route('**/*', (r) => {
  const url = r.request().url();
  if (NO_REPORT.test(url)) return r.abort();
  if (/fastrr-boost-ui\.pickrr\.com\/assets\/js/.test(url)) return r.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.shiprocketCheckoutEvents={buyDirect(){}}' });
  return ALLOW.test(new URL(url).hostname) ? r.continue() : r.abort();
});
const page = await ctx.newPage();
await page.goto(`${BASE}/jewellery/droplet-open-cuff?colour=silver`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => [...document.querySelectorAll('#product-actions button')].some((b) => !b.disabled && /add to cart/i.test(b.textContent)), null, { timeout: 30000 });
await page.waitForTimeout(4000);
const qty = () => page.evaluate(() => {
  const line = document.querySelector('[role="dialog"] [data-line="droplet-open-cuff"]');
  return line ? { qty: line.querySelector('[aria-label^="Quantity"]')?.textContent?.trim(), adding: /Adding to your bag/.test(line.textContent), variant: line.getAttribute('data-variant')?.split('/').pop() } : null;
});
for (const round of [1, 2]) {
  await page.locator('#product-actions button', { hasText: /add to cart/i }).first().click();
  await page.waitForTimeout(150);
  const early = await qty();
  await page.waitForFunction(() => { const l = document.querySelector('[role="dialog"] [data-line="droplet-open-cuff"]'); return l && !/Adding to your bag/.test(l.textContent); }, null, { timeout: 15000 });
  const done = await qty();
  console.log(`add ${round}: at the tap ${JSON.stringify(early)} → confirmed ${JSON.stringify(done)}`);
  await page.getByRole('button', { name: 'Back to shopping' }).click();
  await page.waitForTimeout(1000);
}
await page.getByRole('button', { name: 'Open cart' }).first().click();
await page.waitForTimeout(4000);
console.log('reopened (synced with Shopify):', JSON.stringify(await qty()), '| total', await page.evaluate(() => document.querySelector('[data-total]')?.textContent));
await browser.close();
