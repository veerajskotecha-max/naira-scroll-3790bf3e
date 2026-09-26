// What does the phone's back button do while the cart is open? Playwright's
// goBack() is a history traversal — exactly what Android's back button and
// iOS's swipe-back do to a web page.
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'https://nairaflore.com';
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google)/i;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const mk = async () => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' });
  await ctx.route('**/*', async (route) => {
    const q = route.request();
    if (BLOCK.test(q.url())) return route.abort();
    try {
      const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
      const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) });
    } catch { await route.abort().catch(() => {}); }
  });
  return ctx.newPage();
};
const state = async (p, label) => {
  await p.waitForTimeout(1200);
  const s = await p.evaluate(() => ({
    url: location.href.replace(location.origin, '') || '(blank)',
    origin: location.origin,
    cartOpen: !![...document.querySelectorAll('[role="dialog"]')].find((d) => /your bag/i.test(d.innerText) && d.getAttribute('data-state') === 'open'),
    pageBehind: (document.querySelector('main h1, h1')?.innerText || '').trim().slice(0, 30),
  })).catch(() => ({ url: '(page gone)' }));
  const where = s.origin && !s.origin.includes(new URL(BASE).host) ? `LEFT THE SITE (${s.origin || 'blank'})` : s.url;
  console.log(`  ${label.padEnd(34)} → ${String(where).padEnd(44)} cart ${s.cartOpen ? 'OPEN  ' : 'closed'}  page behind: ${JSON.stringify(s.pageBehind ?? '')}`);
  return s;
};
const addToCart = async (p) => {
  await p.locator('button', { hasText: /add to (cart|bag)/i }).first().click({ timeout: 30000 });
  await p.waitForFunction(() => [...document.querySelectorAll('[role="dialog"]')].some((d) => /your bag/i.test(d.innerText)), null, { timeout: 30000 });
};

console.log('A) Browsing: collection → product → add to cart → press back twice');
{ const p = await mk();
  await p.goto(BASE + '/jewellery', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
  const link = p.locator('a[href^="/jewellery/"]:not([href*="/collections/"])').first();
  await link.click(); await p.waitForFunction(() => /jewellery\/[^/]+$/.test(location.pathname) && !!document.querySelector('h1'), null, { timeout: 30000 });
  await p.waitForTimeout(2000);
  await state(p, 'on the product page');
  await addToCart(p); await state(p, 'after Add to cart');
  await p.goBack({ timeout: 30000 }).catch(() => {}); await state(p, 'press back once');
  await p.goBack({ timeout: 30000 }).catch(() => {}); await state(p, 'press back again');
  await p.context().close(); }

console.log('B) Arriving from an ad straight onto a product → add to cart → press back');
{ const p = await mk();
  await p.goto('about:blank'); await p.goto(BASE + '/jewellery/prism-riviere-bracelet', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
  await addToCart(p); await state(p, 'after Add to cart');
  await p.goBack({ timeout: 30000 }).catch(() => {}); await state(p, 'press back once');
  await p.context().close(); }
await b.close();
