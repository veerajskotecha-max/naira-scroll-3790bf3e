// The bag's offer band on current iPhones: the gap between the sale line's
// letters and the tops of the rung boxes (negative = they collide), plus a
// close-up of the band. Trackers are blocked.
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
const [base, out, tag, piecesArg = '1'] = process.argv.slice(2);
const pieces = Number(piecesArg);
const ALLOW = /(^|\.)(nairaflore\.com|cdn\.shopify\.com|nc5eti-gp\.myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const block = (ctx) => ctx.route('**/*', (r) => { const h = new URL(r.request().url()).hostname; return ALLOW.test(h) || h === '127.0.0.1' ? r.continue() : r.abort(); });
const strip = ({ defaultBrowserType, ...d }) => d;
const PHONES = {
  'iPhone 14 Pro (393)': strip(devices['iPhone 14 Pro']),
  'iPhone 15 (393)': strip(devices['iPhone 15']),
  'iPhone 16 Pro (402)': { ...strip(devices['iPhone 15 Pro']), viewport: { width: 402, height: 874 } },
  'iPhone 15 Pro Max (430)': strip(devices['iPhone 15 Pro Max']),
  'iPhone 16 Pro Max (440)': { ...strip(devices['iPhone 15 Pro Max']), viewport: { width: 440, height: 956 } },
};
const seed = await browser.newContext(PHONES['iPhone 15 (393)']); await block(seed);
const p0 = await seed.newPage();
const HANDLES = ['prism-riviere-bracelet', 'kiss-knot-bangle', 'woven-gold-hoops'];
for (let i = 0; i < pieces; i++) {
  await p0.goto(`${base}/jewellery/${HANDLES[i]}`, { waitUntil: 'domcontentloaded' }); await p0.waitForTimeout(5000);
  await p0.locator('#product-actions button', { hasText: /Add to cart/i }).click();
  await p0.waitForSelector('[data-bag-foot]', { timeout: 20000 }); await p0.waitForTimeout(2500);
}
const state = await seed.storageState(); await seed.close();
for (const [name, opts] of Object.entries(PHONES)) {
  const ctx = await browser.newContext({ ...opts, storageState: state }); await block(ctx);
  const page = await ctx.newPage();
  await page.goto(`${base}/jewellery`, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(4500);
  await page.locator('header button[aria-label*="ag" i], nav button[aria-label*="ag" i], button[aria-label*="cart" i]').first().click();
  await page.waitForSelector('[data-bag-foot]', { timeout: 20000 }); await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const ladder = document.querySelector('[data-ladder]');
    const sale = ladder.querySelector('p');
    const bar = ladder.querySelector('[role="progressbar"]');
    const rings = [...bar.querySelectorAll('span[aria-hidden="true"]')].map((r) => r.getBoundingClientRect());
    const rng = document.createRange(); rng.selectNodeContents(sale); const glyphs = rng.getBoundingClientRect();
    const lb = ladder.getBoundingClientRect();
    return { sale: sale.textContent.trim(), gap: Math.round((Math.min(...rings.map((r) => r.top)) - glyphs.bottom) * 10) / 10, clip: { x: lb.left, y: Math.max(0, lb.top - 4), width: lb.width, height: lb.height + 8 } };
  });
  console.log(`${tag} ${name}: letters→boxes ${m.gap}px ${m.gap < 0 ? 'COLLIDE' : 'clear'} | "${m.sale}"`);
  await page.screenshot({ path: `${out}/${tag}-${name.replace(/[^a-z0-9]+/gi, '-').replace(/-$/, '')}-band.png`, clip: m.clip });
  await ctx.close();
}
await browser.close();
