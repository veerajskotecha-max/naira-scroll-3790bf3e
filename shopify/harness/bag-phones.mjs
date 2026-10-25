// The bag on several phones: the sale line against the ladder, and any
// overlap or sideways spill in the drawer. One real Shopify cart is made once
// and reused (its id rides in localStorage). Trackers are blocked.
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base, out, tag = 'before', piecesArg = '1'] = process.argv.slice(2);
const pieces = Number(piecesArg);
const ALLOW = /(^|\.)(nairaflore\.com|cdn\.shopify\.com|nc5eti-gp\.myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const block = (ctx) => ctx.route('**/*', (r) => { const h = new URL(r.request().url()).hostname; return ALLOW.test(h) || h === '127.0.0.1' ? r.continue() : r.abort(); });
const strip = ({ defaultBrowserType, ...d }) => d;
const PHONES = {
  'iPhone SE (375)': strip(devices['iPhone SE']),
  'iPhone 13 (390)': strip(devices['iPhone 13']),
  'iPhone 14 Pro Max (430)': strip(devices['iPhone 14 Pro Max']),
  'Pixel 7 (412)': strip(devices['Pixel 7']),
  'Galaxy S9+ (320)': strip(devices['Galaxy S9+']),
  'Galaxy S8 (360)': strip(devices['Galaxy S8']),
  'In-app browser (390x664)': { ...strip(devices['iPhone 13']), viewport: { width: 390, height: 664 } },
  'Fold cover screen (280)': { ...strip(devices['Galaxy S9+']), viewport: { width: 280, height: 653 } },
};
// 1. One cart, filled once.
const seed = await browser.newContext(PHONES['iPhone 13 (390)']); await block(seed);
const p0 = await seed.newPage();
const HANDLES = ['prism-riviere-bracelet', 'kiss-knot-bangle', 'woven-gold-hoops'];
for (let i = 0; i < pieces; i++) {
  await p0.goto(`${base}/jewellery/${HANDLES[i]}`, { waitUntil: 'domcontentloaded' }); await p0.waitForTimeout(5000);
  await p0.locator('#product-actions button', { hasText: /Add to cart/i }).click();
  await p0.waitForSelector('[data-bag-foot]', { timeout: 20000 }); await p0.waitForTimeout(2500);
}
const state = await seed.storageState(); await seed.close();
const report = {};
for (const [name, opts] of Object.entries(PHONES)) {
  const ctx = await browser.newContext({ ...opts, storageState: state }); await block(ctx);
  const page = await ctx.newPage();
  await page.goto(`${base}/jewellery`, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(4500);
  await page.locator('header button[aria-label*="ag" i], nav button[aria-label*="ag" i], button[aria-label*="cart" i]').first().click();
  await page.waitForSelector('[data-bag-foot]', { timeout: 20000 }); await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const drawer = document.querySelector('[data-bag-foot]').closest('[role="dialog"]');
    const ladder = drawer.querySelector('[data-ladder]');
    const sale = ladder.querySelector('p');
    const bar = ladder.querySelector('[role="progressbar"]');
    const rings = [...bar.querySelectorAll('span[aria-hidden="true"]')].map((r) => r.getBoundingClientRect());
    const labels = [...ladder.querySelectorAll('div:last-child > span')].map((s) => s.getBoundingClientRect());
    const rng = document.createRange(); rng.selectNodeContents(sale); const glyphs = rng.getBoundingClientRect();
    const ringTop = Math.min(...rings.map((r) => r.top)), ringBottom = Math.max(...rings.map((r) => r.bottom));
    // text boxes that overlap each other anywhere in the drawer
    // What the eye sees: an element clipped by a scrolling ancestor counts only
    // for the part inside it, and the ladder's own track pieces are left out.
    const visibleRect = (e) => {
      let r = e.getBoundingClientRect(); let { left, top, right, bottom } = r;
      for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (/(auto|scroll|hidden)/.test(cs.overflowY + cs.overflowX)) { const c = a.getBoundingClientRect(); left = Math.max(left, c.left); top = Math.max(top, c.top); right = Math.min(right, c.right); bottom = Math.min(bottom, c.bottom); }
      }
      return { left, top, right, bottom, width: right - left, height: bottom - top };
    };
    const els = [...drawer.querySelectorAll('p, span, a, button, h2, img, li > div > div')].filter((e) => { const r = visibleRect(e); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[role="progressbar"]'); });
    const leaf = els.filter((e) => ![...e.querySelectorAll('p, span, a, button, img')].some((c) => els.includes(c)));
    const overlaps = [];
    for (let i = 0; i < leaf.length; i++) for (let j = i + 1; j < leaf.length; j++) {
      const a = visibleRect(leaf[i]), b = visibleRect(leaf[j]);
      if (leaf[i].contains(leaf[j]) || leaf[j].contains(leaf[i])) continue;
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w > 1 && h > 1) overlaps.push(`${(leaf[i].textContent || leaf[i].tagName).trim().slice(0, 24)} × ${(leaf[j].textContent || leaf[j].tagName).trim().slice(0, 24)} (${Math.round(w)}x${Math.round(h)})`);
    }
    const spill = [...drawer.querySelectorAll('*')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible' && !/truncate|line-clamp/.test(e.className)).map((e) => (e.className || e.tagName).toString().slice(0, 50));
    const dr = drawer.getBoundingClientRect();
    const offRight = [...drawer.querySelectorAll('p, span, a, button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.right > dr.right + 0.5 || r.left < dr.left - 0.5); }).map((e) => e.textContent.trim().slice(0, 30));
    return {
      saleText: sale.textContent.trim(), saleFontPx: getComputedStyle(sale).fontSize,
      textToRings: Math.round((ringTop - glyphs.bottom) * 10) / 10,
      ringsToLabels: Math.round((Math.min(...labels.map((l) => l.top)) - ringBottom) * 10) / 10,
      saleWidth: Math.round(glyphs.width), ladderInner: Math.round(ladder.clientWidth - 40),
      overlaps: [...new Set(overlaps)].slice(0, 8), spill: [...new Set(spill)].slice(0, 5), offRight: [...new Set(offRight)].slice(0, 5),
      viewport: [innerWidth, innerHeight], footTop: Math.round(drawer.querySelector('[data-bag-foot]').getBoundingClientRect().top),
    };
  });
  report[name] = m;
  console.log(`${name}: text→rings ${m.textToRings}px, rings→labels ${m.ringsToLabels}px, sale line ${m.saleWidth}/${m.ladderInner}px | overlaps ${m.overlaps.length ? JSON.stringify(m.overlaps) : 'none'} | spill ${m.spill.length ? JSON.stringify(m.spill) : 'none'} | off-edge ${m.offRight.length ? JSON.stringify(m.offRight) : 'none'}`);
  const file = name.replace(/[^a-z0-9]+/gi, '-').replace(/-$/, '');
  await page.screenshot({ path: `${out}/${tag}-${pieces}pc-${file}.png` });
  await ctx.close();
}
writeFileSync(`${out}/${tag}-${pieces}pc.json`, JSON.stringify(report, null, 1));
await browser.close();
