// The product page's offer text at 390px: the pairing row's label and any
// "Buy 2, save" facts. Trackers are blocked.
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
const [base, out] = process.argv.slice(2);
const ALLOW = /(^|\.)(nairaflore\.com|cdn\.shopify\.com|nc5eti-gp\.myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const { defaultBrowserType, ...phone } = devices['iPhone 13'];
const ctx = await browser.newContext(phone);
await ctx.route('**/*', (r) => { const h = new URL(r.request().url()).hostname; return ALLOW.test(h) || h === '127.0.0.1' ? r.continue() : r.abort(); });
const page = await ctx.newPage();
await page.goto(`${base}/jewellery/prism-riviere-bracelet`, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(6000);
const texts = await page.evaluate(() => [...document.querySelectorAll('p, span, li')].map((e) => e.textContent.trim()).filter((t) => /\d+%/.test(t) && t.length < 80));
console.log(JSON.stringify([...new Set(texts)]));
const label = page.locator('p', { hasText: /pieces · \d+% off/ }).first();
await label.scrollIntoViewIfNeeded(); await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollBy(0, -120)); await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/pdp-pairing-390.png` });
await browser.close();
