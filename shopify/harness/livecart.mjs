import { chromium } from 'playwright';
/* The live site, on a phone, all the way to the checkout handoff. */
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
  deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
await ctx.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
/* Headless Chromium has no route to the outside here, but Node's fetch goes
   through the agent proxy. So every request the page makes is fulfilled by
   Node instead. */
await ctx.route('**/*', async (route) => {
  const req = route.request();
  try {
    const r = await fetch(req.url(), {
      method: req.method(),
      headers: { ...req.headers(), 'accept-encoding': 'identity' },
      body: ['GET', 'HEAD'].includes(req.method()) ? undefined : req.postData(),
      redirect: 'follow',
    });
    const buf = Buffer.from(await r.arrayBuffer());
    const headers = {};
    r.headers.forEach((v, k) => {
      if (!['content-encoding', 'content-length', 'content-security-policy'].includes(k.toLowerCase())) headers[k] = v;
    });
    await route.fulfill({ status: r.status, headers, body: buf });
  } catch (e) {
    await route.abort();
  }
});

const net = [];
const page = await ctx.newPage();
page.on('requestfailed', r => net.push('FAIL ' + r.url().slice(0, 90)));
page.on('response', r => { if (r.url().includes('graphql') || r.url().includes('/cart')) net.push(r.status() + ' ' + r.url().slice(0, 90)); });

const URL = process.env.URL || 'https://nairaflore.com/jewellery';
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(6000);
console.log('title:', await page.title());
console.log('h1:', (await page.locator('h1').first().textContent().catch(() => '(none)') || '').trim().slice(0, 60));

/* Find anything that looks like the buy affordance. */
const buys = await page.evaluate(() => {
  const hits = [];
  for (const el of document.querySelectorAll('button, a')) {
    const t = (el.textContent || '').trim();
    if (/add to bag|add to cart|shop now|buy now|checkout/i.test(t) && t.length < 40) {
      const r = el.getBoundingClientRect();
      hits.push({ t: t.slice(0, 28), tag: el.tagName, w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top) });
    }
  }
  return hits.slice(0, 8);
});
console.log('buy affordances:', JSON.stringify(buys));
const SHOT = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/';
await page.screenshot({ path: SHOT + 'live-1-listing.png' });

/* Add to cart, then open whatever the cart surface is. */
try {
  await page.locator('button', { hasText: /^ADD TO CART$/ }).first().click({ timeout: 20000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: SHOT + 'live-2-added.png' });
  const drawerOpen = await page.evaluate(() =>
    !!document.querySelector('[role="dialog"], [data-state="open"], aside'));
  console.log('cart surface opened by itself:', drawerOpen);
  if (!drawerOpen) {
    const cart = page.locator('[aria-label*="cart" i], [aria-label*="bag" i]').first();
    if (await cart.count()) { await cart.click({ timeout: 15000 }); await page.waitForTimeout(4000); }
  }
  await page.screenshot({ path: SHOT + 'live-3-cart.png' });

  /* Measure the cart surface as a phone sees it. */
  const cart = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"], aside');
    if (!d) return null;
    const r = d.getBoundingClientRect();
    const small = [];
    for (const el of d.querySelectorAll('button, a, input')) {
      const b = el.getBoundingClientRect();
      if (b.width && b.height && b.height < 44)
        small.push({ t: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24),
                     w: Math.round(b.width), h: Math.round(b.height) });
    }
    const co = [...d.querySelectorAll('button, a')].find(e => /checkout|pay|bag/i.test(e.textContent || ''));
    const cr = co && co.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             coversViewport: Math.round(r.height) >= innerHeight - 4,
             checkout: co ? { text: (co.textContent||'').trim().slice(0,30), h: Math.round(cr.height),
                              bottom: Math.round(cr.bottom), inThumbReach: cr.bottom > innerHeight * 0.55 } : null,
             tapTargetsUnder44: small.slice(0, 8), text: d.innerText.replace(/\n+/g, ' | ').slice(0, 300) };
  });
  console.log('CART:', JSON.stringify(cart, null, 1));
} catch (e) { console.log('cart flow failed:', String(e).split('\n')[0].slice(0, 120)); }
console.log('network:', net.slice(0, 5).join(' | ') || '(nothing notable)');
await b.close();
