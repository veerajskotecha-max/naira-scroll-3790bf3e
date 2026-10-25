// Opens the real Fastrr checkout from the live bag with N pieces and records
// what Fastrr itself says the discount is. No phone number is entered and no
// order is placed. Ad and analytics trackers are blocked (allow-list).
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base, out, piecesArg] = process.argv.slice(2);
const pieces = Number(piecesArg);
const ALLOW = /(^|\.)(nairaflore\.com|shopify\.com|myshopify\.com|shopifycdn\.net|fonts\.googleapis\.com|fonts\.gstatic\.com|pickrr\.com|shiprocket\.com|shiprocket\.in|shiprocket\.co|fastrr\.com)$/;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const { defaultBrowserType, ...phone } = devices['iPhone 13'];
const ctx = await browser.newContext(phone);
const blocked = new Set();
await ctx.route('**/*', (r) => { const h = new URL(r.request().url()).hostname; if (ALLOW.test(h)) return r.continue(); blocked.add(h); return r.abort(); });
const found = [];
ctx.on('response', async (res) => {
  const u = res.url();
  if (!/pickrr|shiprocket|fastrr/i.test(u)) return;
  const ct = res.headers()['content-type'] || '';
  if (!/json/.test(ct)) return;
  try {
    const body = await res.text();
    if (/discount|coupon/i.test(body)) found.push({ url: u.split('?')[0], body: body.slice(0, 20000) });
  } catch {}
});
const page = await ctx.newPage();
const HANDLES = ['prism-riviere-bracelet', 'kiss-knot-bangle', 'woven-gold-hoops'];
for (let i = 0; i < pieces; i++) {
  await page.goto(`${base}/jewellery/${HANDLES[i]}`, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
  await page.locator('#product-actions button', { hasText: /Add to cart/i }).click();
  await page.waitForSelector('[data-bag-foot]', { timeout: 20000 }); await page.waitForTimeout(2500);
}
const bag = await page.evaluate(() => document.querySelector('[data-bag-foot]')?.innerText.replace(/\s+/g, ' ').slice(0, 200));
await page.screenshot({ path: `${out}/live-bag-${pieces}pc.png` });
await page.locator('[data-bag-foot] button', { hasText: /Checkout/i }).last().click();
await page.waitForTimeout(15000);
await page.screenshot({ path: `${out}/live-fastrr-${pieces}pc.png` });
const frames = page.frames().map((f) => f.url().split('?')[0]).filter((u) => /pickrr|shiprocket|fastrr/i.test(u));
let frameText = '';
for (const f of page.frames()) if (/pickrr|shiprocket|fastrr/i.test(f.url())) { try { frameText += (await f.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 1500); } catch {} }
writeFileSync(`${out}/fastrr-${pieces}pc.json`, JSON.stringify({ bag, frames, frameText, found, blocked: [...blocked] }, null, 1));
console.log(JSON.stringify({ pieces, bag, frames, frameText: frameText.slice(0, 600), responses: found.map((f) => f.url), blocked: [...blocked] }, null, 1));
await browser.close();
