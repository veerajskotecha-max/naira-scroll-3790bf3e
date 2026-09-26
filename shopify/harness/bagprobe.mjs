// Every way into and out of the bag, on a phone and on a desktop, against a
// build. Shiprocket's checkout script is replaced by a stub that does what the
// real one does to history (push its own entry on open; answer back with an
// exit prompt and push again), so the hand-off can be checked without opening
// a real checkout.
import { chromium } from 'playwright';
const BASE = process.argv[2];
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google)/i;
const FASTRR_STUB = `(() => {
  window.shiprocketCheckoutEvents = { buyDirect() {
    window.__handoff = { historyLength: history.length, state: history.state,
      bagOpen: [...document.querySelectorAll('[role="dialog"]')].some(d => /your bag/i.test(d.innerText) && d.getAttribute('data-state') === 'open') };
    history.pushState(null, null, location.href);
    window.__handoff.afterPush = history.length;
    const c = document.createElement('div'); c.id = 'fastrr-main-container';
    c.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:2147483647'; c.textContent = 'STUB CHECKOUT';
    document.body.appendChild(c);
  } };
  window.addEventListener('popstate', () => {
    if (document.getElementById('fastrr-main-container')) { window.__exitPrompts = (window.__exitPrompts || 0) + 1; history.pushState(null, null, location.href); }
  });
})();`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const mk = async (phone = true) => {
  const ctx = await b.newContext(phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' }
    : { viewport: { width: 1280, height: 900 } });
  await ctx.route('**/*', async (route) => {
    const q = route.request(); const u = q.url();
    if (BLOCK.test(u)) return route.abort();
    if (/pickrr\.com|shiprocket/i.test(u)) return route.fulfill({ status: 200, contentType: u.endsWith('.css') ? 'text/css' : 'application/javascript', body: u.endsWith('.css') ? '' : FASTRR_STUB });
    try {
      const r = await fetch(u, { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
      const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) });
    } catch { await route.abort().catch(() => {}); }
  });
  return ctx.newPage();
};
const bagOpen = (p) => p.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].some((d) => /your bag/i.test(d.innerText) && d.getAttribute('data-state') === 'open')).catch(() => false);
const where = async (p) => p.evaluate(() => location.origin === 'null' || location.href === 'about:blank' ? 'OFF THE SITE' : location.pathname).catch(() => 'OFF THE SITE');
let failures = 0;
const check = async (p, label, want) => {
  await p.waitForTimeout(900);
  const got = { at: await where(p), bag: (await bagOpen(p)) ? 'open' : 'closed' };
  const ok = Object.entries(want).every(([k, v]) => (v instanceof RegExp ? v.test(got[k]) : got[k] === v));
  if (!ok) failures++;
  console.log(`   ${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(40)} → ${got.at.padEnd(36)} bag ${got.bag}${ok ? '' : `   (wanted ${JSON.stringify(want)})`}`);
};
const openProduct = async (p, direct) => {
  if (direct) { await p.goto('about:blank'); await p.goto(BASE + '/jewellery/prism-riviere-bracelet', { waitUntil: 'load', timeout: 120000 }); }
  else {
    await p.goto(BASE + '/jewellery', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
    await p.locator('a[href="/jewellery/prism-riviere-bracelet"]').first().click();
  }
  await p.waitForFunction(() => /prism-riviere/.test(location.pathname) && /add to (cart|bag)/i.test(document.body.innerText), null, { timeout: 60000 });
  await p.waitForTimeout(1500);
};
const add = async (p) => {
  await p.locator('button', { hasText: /add to (cart|bag)/i }).first().click({ timeout: 30000 });
  await p.waitForFunction(() => [...document.querySelectorAll('[role="dialog"]')].some((d) => /your bag/i.test(d.innerText) && d.getAttribute('data-state') === 'open'), null, { timeout: 30000 });
};
const PDP = /prism-riviere-bracelet$/;

console.log('\nPHONE — browsing: collection → product → add to cart');
{ const p = await mk(); await openProduct(p, false); await add(p);
  await check(p, 'bag opens', { at: PDP, bag: 'open' });
  await p.goBack(); await check(p, 'phone back', { at: PDP, bag: 'closed' });
  await p.goBack(); await check(p, 'phone back again', { at: '/jewellery', bag: 'closed' });
  await p.context().close(); }

console.log('\nPHONE — from an ad straight onto the product');
{ const p = await mk(); await openProduct(p, true); await add(p);
  await p.goBack(); await check(p, 'phone back', { at: PDP, bag: 'closed' });
  await p.goBack(); await check(p, 'phone back again (leaves, as it should)', { at: 'OFF THE SITE' });
  await p.context().close(); }

console.log('\nPHONE — the new back arrow');
{ const p = await mk(); await openProduct(p, false); await add(p);
  const arrow = p.getByRole('button', { name: 'Back to shopping' });
  await p.waitForTimeout(1000); // let the slide-in finish
  const box = await arrow.boundingBox(); const cross = await p.locator('[role="dialog"] button:has(.sr-only:text-is("Close"))').isVisible().catch(() => false);
  console.log(`   ${box && box.x < 40 && box.y < 60 && !cross ? 'ok  ' : 'FAIL'} arrow top-left at ${box ? `${Math.round(box.x)},${Math.round(box.y)}` : 'missing'}, corner cross hidden: ${!cross}`);
  if (!(box && box.x < 40 && box.y < 60 && !cross)) failures++;
  await arrow.click(); await check(p, 'tap the arrow', { at: PDP, bag: 'closed' });
  await p.goBack(); await check(p, 'then phone back (no dead press)', { at: '/jewellery', bag: 'closed' });
  await p.context().close(); }

console.log('\nPHONE — "Continue shopping" out of the bag');
{ const p = await mk(); await openProduct(p, true); await add(p);
  await p.locator('[role="dialog"] a', { hasText: /continue shopping/i }).last().click();
  await check(p, 'tap Continue shopping', { at: '/jewellery', bag: 'closed' });
  await p.goBack(); await check(p, 'phone back → the product, bag closed', { at: PDP, bag: 'closed' });
  await p.context().close(); }

console.log('\nPHONE — checkout hand-off (Shiprocket stub)');
{ const p = await mk(); await openProduct(p, false);
  const before = await p.evaluate(() => history.length);
  await add(p);
  await p.locator('button', { hasText: /proceed to checkout/i }).first().click();
  await p.waitForFunction(() => !!window.__handoff, null, { timeout: 60000 });
  const h = await p.evaluate(() => window.__handoff);
  const clean = h.afterPush === before + 1 && !(h.state && h.state.nfBag);
  if (!clean) failures++;
  console.log(`   ${clean ? 'ok  ' : 'FAIL'} checkout lands one entry above the product, exactly as before (${before} → ${h.afterPush}); bag entry gone at hand-off: ${!(h.state && h.state.nfBag)}; bag still on screen until checkout covers it: ${h.bagOpen}`);
  await p.goBack(); await p.waitForTimeout(900);
  const prompts = await p.evaluate(() => window.__exitPrompts || 0); const reopened = await bagOpen(p);
  if (prompts !== 1 || reopened) failures++;
  console.log(`   ${prompts === 1 && !reopened ? 'ok  ' : 'FAIL'} back inside checkout → its own exit prompt (${prompts}), bag not reopened behind it (${!reopened})`);
  await p.context().close(); }

console.log('\nPHONE — scroll position survives closing the bag');
{ const p = await mk(); await openProduct(p, false);
  await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(600);
  await p.locator('[aria-label="Open cart"]').first().click(); await p.waitForTimeout(800);
  await p.goBack(); await p.waitForTimeout(450); // close animation holds the scroll lock until here
  const y1 = await p.evaluate(() => Math.round(scrollY));
  await p.evaluate(() => window.scrollTo(0, 1300)); await p.waitForTimeout(1100);
  const y2 = await p.evaluate(() => Math.round(scrollY));
  // The page settles ~33 px short of 1300 after any bag session — main does the
  // same closing with its old cross — so the test is "not dragged back to 900".
  const ok = Math.abs(y1 - 900) < 5 && y2 > 1200; if (!ok) failures++;
  console.log(`   ${ok ? 'ok  ' : 'FAIL'} stays at ${y1} after closing; a scroll straight after goes through (${y2}), not dragged back to 900`);
  await p.context().close(); }

console.log('\nPHONE — reload with the bag open');
{ const p = await mk(); await openProduct(p, false); await add(p);
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(2500);
  await check(p, 'after reload', { at: PDP, bag: 'open' });
  await p.goBack(); await check(p, 'phone back', { at: PDP, bag: 'closed' });
  await p.context().close(); }

console.log('\nDESKTOP — cross, tap outside, Escape');
for (const how of ['cross', 'outside', 'escape']) {
  const p = await mk(false); await openProduct(p, false); await add(p);
  const arrowShown = await p.getByRole('button', { name: 'Back to shopping' }).isVisible();
  if (how === 'cross') await p.locator('[role="dialog"] button:has(.sr-only:text-is("Close"))').click();
  if (how === 'outside') await p.mouse.click(200, 450);
  if (how === 'escape') await p.keyboard.press('Escape');
  await check(p, `close by ${how}${arrowShown ? ' (arrow wrongly shown)' : ''}`, { at: PDP, bag: 'closed' });
  if (arrowShown) failures++;
  await p.goBack(); await check(p, '  then browser back', { at: '/jewellery', bag: 'closed' });
  await p.context().close();
}
await b.close();
console.log(failures ? `\n${failures} check(s) FAILED` : '\nall checks passed');
