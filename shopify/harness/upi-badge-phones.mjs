// The GPay / PhonePe / Paytm badge on every buy button, on many phones: does
// the label plus badge fit inside the button, do they touch, and did each
// logo render at its intended size? Trackers are blocked.
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base, out, tag = 'badges'] = process.argv.slice(2);
const ALLOW = /(^|\.)(nairaflore\.com|cdn\.shopify\.com|nc5eti-gp\.myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const block = (ctx) => ctx.route('**/*', (r) => { const h = new URL(r.request().url()).hostname; return ALLOW.test(h) || h === '127.0.0.1' ? r.continue() : r.abort(); });
const strip = ({ defaultBrowserType, ...d }) => d;
const PHONES = {
  'Fold cover (280)': { ...strip(devices['Galaxy S9+']), viewport: { width: 280, height: 653 } },
  'Galaxy S9+ (320)': strip(devices['Galaxy S9+']),
  'Galaxy S8 (360)': strip(devices['Galaxy S8']),
  'iPhone SE (375)': strip(devices['iPhone SE']),
  'iPhone 13 (390)': strip(devices['iPhone 13']),
  'In-app browser (390x664)': { ...strip(devices['iPhone 13']), viewport: { width: 390, height: 664 } },
  'iPhone 15 (393)': strip(devices['iPhone 15']),
  'Pixel 7 (412)': strip(devices['Pixel 7']),
  'iPhone 15 Pro Max (430)': strip(devices['iPhone 15 Pro Max']),
  'iPhone 16 Pro Max (440)': { ...strip(devices['iPhone 15 Pro Max']), viewport: { width: 440, height: 956 } },
};
const measure = (sel) => {
  // "scope >> text" picks the button under scope whose text matches.
  const [scope, want] = sel.split(' >> ');
  const btn = want ? [...document.querySelectorAll(scope)].find((b) => b.textContent.toLowerCase().includes(want)) : document.querySelector(sel);
  if (!btn) return { missing: sel };
  const b = btn.getBoundingClientRect();
  const badge = btn.querySelector('[data-upi-badges]');
  const text = [...btn.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
  const r = document.createRange(); if (text) r.selectNodeContents(text);
  const t = text ? r.getBoundingClientRect() : null;
  const g = badge?.getBoundingClientRect();
  const discs = badge ? [...badge.children].map((d) => { const dr = d.getBoundingClientRect(); const s = d.querySelector('svg').getBoundingClientRect(); return `${Math.round(dr.width)}/${Math.round(s.width)}x${Math.round(s.height * 10) / 10}`; }) : [];
  return {
    label: text?.textContent.trim(), btnW: Math.round(b.width), btnH: Math.round(b.height),
    fits: btn.scrollWidth <= btn.clientWidth + 0.5 && (!g || (g.left >= b.left + 2 && g.right <= b.right - 2)),
    padL: t ? Math.round((t.left - b.left) * 10) / 10 : null, padR: g ? Math.round((b.right - g.right) * 10) / 10 : null,
    textToBadge: t && g ? Math.round((g.left - t.right) * 10) / 10 : null,
    badgeMidVsText: t && g ? Math.round(((g.top + g.bottom) / 2 - (t.top + t.bottom) / 2) * 10) / 10 : null,
    discs, badgeVisible: !!g && g.width > 0,
  };
};
const report = {};
// One cart for the bag checks.
const seed = await browser.newContext(PHONES['iPhone 13 (390)']); await block(seed);
const p0 = await seed.newPage();
await p0.goto(`${base}/jewellery/prism-riviere-bracelet`, { waitUntil: 'domcontentloaded' }); await p0.waitForTimeout(5000);
await p0.locator('#product-actions button', { hasText: /Add to cart/i }).click();
await p0.waitForSelector('[data-bag-foot]', { timeout: 20000 }); await p0.waitForTimeout(2000);
const state = await seed.storageState(); await seed.close();
for (const [name, opts] of Object.entries(PHONES)) {
  const file = name.replace(/[^a-z0-9]+/gi, '-').replace(/-$/, '');
  const ctx = await browser.newContext({ ...opts, storageState: state }); await block(ctx);
  const page = await ctx.newPage();
  await page.goto(`${base}/jewellery/prism-riviere-bracelet`, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
  const main = await page.evaluate(measure, '#product-actions > button >> buy now');
  const actions = page.locator('#product-actions'); await actions.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  await actions.screenshot({ path: `${out}/${tag}-${file}-pdp.png` });
  await page.evaluate(() => window.scrollBy(0, 1400)); await page.waitForTimeout(1200);
  const stickySel = 'div.fixed.inset-x-0.bottom-0 button >> buy now';
  const sticky = await page.evaluate(measure, stickySel);
  const bar = page.locator('div.fixed.inset-x-0.bottom-0').filter({ has: page.locator('button', { hasText: /Buy Now/i }) }).first();
  if (await bar.isVisible().catch(() => false)) await bar.screenshot({ path: `${out}/${tag}-${file}-sticky.png` });
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
  await page.locator('header button[aria-label*="ag" i], nav button[aria-label*="ag" i], button[aria-label*="cart" i]').first().click();
  await page.waitForSelector('[data-bag-foot]', { timeout: 20000 }); await page.waitForTimeout(2000);
  const bag = await page.evaluate(measure, '[data-checkout]');
  await page.locator('[data-bag-foot]').screenshot({ path: `${out}/${tag}-${file}-bag.png` });
  report[name] = { main, sticky, bag };
  const line = (k, m) => m.missing ? `${k}: missing` : `${k} ${m.btnW}x${m.btnH} fits=${m.fits} pad ${m.padL}/${m.padR} text→badge ${m.textToBadge} mid ${m.badgeMidVsText} discs ${m.discs.join(' ')}`;
  console.log(`${name}\n  ${line('PDP', main)}\n  ${line('sticky', sticky)}\n  ${line('bag', bag)}`);
  await ctx.close();
}
writeFileSync(`${out}/${tag}.json`, JSON.stringify(report, null, 1));
await browser.close();
