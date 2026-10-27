// The bag opening at the Add tap, on a mid-range Android over 4G (CPU 4x):
//   BASE=http://127.0.0.1:8100 node bag-tap.mjs <outDir>
// A. a normal add: when the bag shows, when the piece is in it, when Shopify
//    confirms it and Checkout can be tapped; then the bag is closed and opened
//    again (it syncs with Shopify as it opens) and the piece must still be there.
// B. Shopify refuses the piece (sold out, simulated): the bag says so and
//    lists nothing it does not hold.
// C. The logo: no three.js on a product page, still loaded on the homepage.
// Real Shopify carts, never an order; Shiprocket is a stand-in; ad and
// analytics requests are blocked.
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { NO_REPORT } from '/home/user/naira-scroll-3790bf3e/shopify/harness/noreport.mjs';
import { mkdirSync } from 'node:fs';

const [OUT] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://127.0.0.1:8100';
mkdirSync(OUT, { recursive: true });
const SHIPROCKET = /fastrr-boost-ui\.pickrr\.com\/assets\/js/i;
const ALLOW = /^127\.0\.0\.1$|(^|\.)(shopify\.com|myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|pickrr\.com)$/;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const phone = (({ defaultBrowserType, ...rest }) => rest)(devices['Pixel 7']);

const session = async ({ soldOut = false, throttle = true } = {}) => {
  const ctx = await browser.newContext(phone);
  const seen = [];
  await ctx.route('**/*', async (r) => {
    const url = r.request().url();
    if (NO_REPORT.test(url)) return r.abort();
    if (SHIPROCKET.test(url)) return r.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.shiprocketCheckoutEvents={buyDirect(){window.__handoff=1}}' });
    if (!ALLOW.test(new URL(url).hostname)) return r.abort();
    seen.push(url);
    const body = r.request().postData() || '';
    if (soldOut && /graphql\.json/.test(url) && /cartCreate|cartLinesAdd/.test(body)) {
      const op = /cartCreate/.test(body) ? 'cartCreate' : 'cartLinesAdd';
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { [op]: { cart: null, userErrors: [{ field: ['lines'], message: "The product 'Prism Rivière Bracelet' is already sold out." }] } } }) });
    }
    return r.continue();
  });
  const page = await ctx.newPage();
  if (throttle) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 90, downloadThroughput: 6e6 / 8, uploadThroughput: 2e6 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  }
  return { ctx, page, seen };
};

/* Watches the bag every frame from the tap and records when each thing happened. */
const watchBag = (page) =>
  page.evaluate(async () => {
    const t0 = performance.now();
    const out = {};
    const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right > 0 && r.left < innerWidth - 2; };
    const btn = [...document.querySelectorAll('#product-actions button')].find((b) => /add to cart/i.test(b.textContent));
    btn.click();
    const until = t0 + 15000;
    while (performance.now() < until) {
      const bag = [...document.querySelectorAll('[role="dialog"]')].find(vis);
      const at = Math.round(performance.now() - t0);
      if (bag && out.bag == null) out.bag = at;
      if (bag && out.line == null && bag.querySelector('[data-line="prism-riviere-bracelet"]')) out.line = at;
      if (bag && out.adding == null && /Adding to your bag/.test(bag.textContent)) out.adding = at;
      const ck = bag?.querySelector('[data-checkout]');
      if (out.line != null && out.confirmed == null && !/Adding to your bag/.test(bag.textContent)) out.confirmed = at;
      if (ck && !ck.disabled && out.checkout == null) out.checkout = at;
      const err = bag?.querySelector('[data-add-error]');
      if (err && out.error == null) { out.error = at; out.errorText = err.textContent.trim(); }
      if ((out.checkout != null && out.confirmed != null) || (out.error != null && at - out.error > 600)) break;
      await new Promise((r) => requestAnimationFrame(r));
    }
    out.lines = [...document.querySelectorAll('[role="dialog"] [data-line]')].map((l) => l.getAttribute('data-line'));
    out.empty = /Your bag is empty/.test(document.querySelector('[role="dialog"]')?.textContent || '');
    return out;
  });

/* A. a normal add */
{
  const { ctx, page } = await session();
  await page.goto(`${BASE}/jewellery/prism-riviere-bracelet`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => [...document.querySelectorAll('#product-actions button')].some((b) => !b.disabled && /add to cart/i.test(b.textContent)), null, { timeout: 30000 });
  await page.waitForTimeout(6000);
  const shot = page.waitForTimeout(250).then(() => page.screenshot({ path: `${OUT}/A-adding.png` }));
  const marks = await watchBag(page);
  await shot;
  await page.screenshot({ path: `${OUT}/A-confirmed.png` });
  console.log(`A. tap → bag shown ${marks.bag} ms, piece in it ${marks.line} ms ("Adding…" ${marks.adding ?? '-'} ms), confirmed ${marks.confirmed} ms, Checkout ready ${marks.checkout} ms | lines ${JSON.stringify(marks.lines)}`);
  // close and open again: the bag syncs with Shopify as it opens
  await page.getByRole('button', { name: 'Back to shopping' }).click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Open cart' }).first().click();
  await page.waitForTimeout(4000);
  const after = await page.evaluate(() => ({ lines: [...document.querySelectorAll('[role="dialog"] [data-line]')].map((l) => l.getAttribute('data-line')), stored: JSON.parse(localStorage.getItem('naira-shopify-cart') || '{}').items?.map((i) => [i.id, Boolean(i.lineId)]) }));
  console.log(`   after closing and opening the bag (it re-syncs with Shopify): ${JSON.stringify(after)}`);
  await ctx.close();
}

/* B. Shopify refuses the piece */
{
  const { ctx, page } = await session({ soldOut: true });
  await page.goto(`${BASE}/jewellery/prism-riviere-bracelet`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => [...document.querySelectorAll('#product-actions button')].some((b) => !b.disabled && /add to cart/i.test(b.textContent)), null, { timeout: 30000 });
  await page.waitForTimeout(6000);
  const marks = await watchBag(page);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/B-sold-out.png` });
  const toasts = await page.evaluate(() => [...document.querySelectorAll('[data-sonner-toast]')].map((t) => t.textContent.trim()));
  console.log(`B. sold out → bag shown ${marks.bag} ms, message at ${marks.error} ms: "${marks.errorText}" | lines ${JSON.stringify(marks.lines)} | empty bag ${marks.empty} | toasts ${JSON.stringify(toasts)}`);
  await ctx.close();
}

/* C. the logo's 3D flower */
for (const path of ['/jewellery/prism-riviere-bracelet', '/products/tubogas-dome-ring?variant=50651970109602', '/']) {
  const { ctx, page, seen } = await session({ throttle: false });
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await page.waitForTimeout(13000);
  const three = seen.filter((u) => /\/three-[\w-]+\.js/.test(u)).length;
  const live = await page.evaluate(() => getComputedStyle(document.querySelector('header canvas, nav canvas') || document.body).opacity);
  console.log(`C. ${path}: three.js downloaded ${three ? 'yes' : 'no'} | 3D canvas opacity ${live}`);
  await ctx.close();
}
await browser.close();
