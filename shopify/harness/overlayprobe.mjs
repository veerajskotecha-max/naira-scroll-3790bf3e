// The phone menu and the wishlist: does back close them, and do their links
// leave clean history behind?
import { chromium } from 'playwright';
const BASE = process.argv[2];
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google)/i;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const mk = async () => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' });
  await ctx.route('**/*', async (route) => {
    const q = route.request(); if (BLOCK.test(q.url())) return route.abort();
    try { const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
      const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) }); } catch { await route.abort().catch(() => {}); }
  });
  return ctx.newPage();
};
const menuOpen = (p) => p.evaluate(() => { const d = document.querySelector('[role="dialog"][aria-modal="true"]'); return !!d && d.getBoundingClientRect().right > 50 && !!d.closest('*') && /main navigation/i.test(d.innerHTML); }).catch(() => false);
const sheetOpen = (p, re) => p.evaluate((src) => [...document.querySelectorAll('[role="dialog"]')].some((d) => new RegExp(src, 'i').test(d.innerText) && d.getAttribute('data-state') === 'open'), re).catch(() => false);
let failures = 0;
const check = async (p, label, want) => {
  await p.waitForTimeout(900);
  const got = { at: await p.evaluate(() => location.pathname).catch(() => 'OFF THE SITE'), menu: (await menuOpen(p)) ? 'open' : 'closed', wishlist: (await sheetOpen(p, 'your wishlist')) ? 'open' : 'closed', bag: (await sheetOpen(p, 'your bag')) ? 'open' : 'closed' };
  const ok = Object.entries(want).every(([k, v]) => got[k] === v); if (!ok) failures++;
  console.log(`   ${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(42)} → ${got.at.padEnd(22)} menu ${got.menu.padEnd(6)} wishlist ${got.wishlist.padEnd(6)} bag ${got.bag}${ok ? '' : `  wanted ${JSON.stringify(want)}`}`);
};
const start = async (p) => { await p.goto(BASE + '/about'); await p.waitForTimeout(1500); await p.goto(BASE + '/jewellery', { waitUntil: 'load' }); await p.waitForTimeout(2000); };

console.log('\nPHONE MENU');
{ const p = await mk(); await start(p);
  await p.getByRole('button', { name: 'Open menu' }).click(); await check(p, 'open the menu', { at: '/jewellery', menu: 'open' });
  await p.goBack(); await check(p, 'phone back', { at: '/jewellery', menu: 'closed' });
  await p.goBack(); await check(p, 'phone back again (previous page)', { at: '/about', menu: 'closed' });
  await p.context().close(); }
{ const p = await mk(); await start(p);
  await p.getByRole('button', { name: 'Open menu' }).click(); await p.waitForTimeout(600);
  await p.locator('nav[aria-label="Main navigation"] a', { hasText: /^gifting$/i }).click();
  await check(p, 'tap GIFTING in the menu', { at: '/gifting', menu: 'closed' });
  await p.goBack(); await check(p, 'phone back → the page, not the menu', { at: '/jewellery', menu: 'closed' });
  await p.goBack(); await check(p, 'phone back again (no dead press)', { at: '/about', menu: 'closed' });
  await p.context().close(); }
{ const p = await mk(); await start(p);
  await p.getByRole('button', { name: 'Open menu' }).click(); await p.waitForTimeout(600);
  await p.locator('[role="dialog"][aria-modal="true"] button[aria-label^="Open cart"]').first().click();
  await check(p, 'menu → bag', { at: '/jewellery', menu: 'closed', bag: 'open' });
  await p.goBack(); await check(p, 'phone back closes the bag', { at: '/jewellery', bag: 'closed', menu: 'closed' });
  await p.goBack(); await check(p, 'phone back again (previous page)', { at: '/about', bag: 'closed' });
  await p.context().close(); }

console.log('\nWISHLIST');
{ const p = await mk(); await start(p);
  await p.getByRole('button', { name: 'Open wishlist' }).first().click(); await check(p, 'open the wishlist', { at: '/jewellery', wishlist: 'open' });
  await p.goBack(); await check(p, 'phone back', { at: '/jewellery', wishlist: 'closed' });
  await p.getByRole('button', { name: 'Open wishlist' }).first().click(); await p.waitForTimeout(1000);
  const arrow = await p.getByRole('button', { name: 'Back to shopping' }).boundingBox();
  console.log(`   ${arrow && arrow.x < 40 ? 'ok  ' : 'FAIL'} back arrow top-left at ${arrow ? `${Math.round(arrow.x)},${Math.round(arrow.y)}` : 'missing'}`); if (!(arrow && arrow.x < 40)) failures++;
  await p.getByRole('button', { name: 'Back to shopping' }).click(); await check(p, 'tap the arrow', { at: '/jewellery', wishlist: 'closed' });
  await p.goBack(); await check(p, 'phone back (no dead press)', { at: '/about', wishlist: 'closed' });
  await p.context().close(); }
await b.close();
console.log(failures ? `\n${failures} check(s) FAILED` : '\nall checks passed');
