import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:4177/innercircle';
const W = Number(process.env.W || 390);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference', viewport: { width: W, height: 844 }, deviceScaleFactor: 2, isMobile: W < 700, hasTouch: W < 700 });
await ctx.addInitScript(() => {
  try { localStorage.setItem('naira-promo-popup-seen', '1'); } catch (e) {}
});
/* MOCK=1 renders the signed-in portal without a real account: a session is
   planted in localStorage and every Supabase call is answered from fixtures,
   so the shell, orders, offer, tier and viewer all render for a screenshot. */
if (process.env.MOCK) {
  const now = Math.floor(Date.now() / 1000);
  const jwt = (p) => [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify(p)).toString('base64url'), 'sig',
  ].join('.');
  const user = {
    id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated',
    email: 'member@example.com', email_confirmed_at: '2026-01-04T10:00:00Z',
    created_at: '2026-01-04T10:00:00Z', updated_at: '2026-01-04T10:00:00Z',
    app_metadata: { provider: 'email' }, user_metadata: { full_name: 'Ananya Rao' }, identities: [],
  };
  const session = {
    access_token: jwt({ sub: user.id, role: 'authenticated', exp: now + 3600, aud: 'authenticated' }),
    refresh_token: 'mock-refresh', token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, user,
  };
  const orders = [
    { id: 'ord-1', created_at: '2026-08-28T09:12:00Z', status: 'fulfilled', total: 18400, currency: 'INR',
      item_count: 2, checkout_url: null,
      items: [{ name: 'Molten Bloom Hoops', quantity: 1, size: null, image: null, price: '\u20b92,949' }, { name: 'Woven Gold Hoops', quantity: 1, size: null, image: null, price: '\u20b92,349' }] },
    { id: 'ord-2', created_at: '2026-09-01T16:40:00Z', status: 'paid', total: 7600, currency: 'INR',
      item_count: 1, checkout_url: null, items: [{ name: 'Cushion Halo Ring', quantity: 1, size: '14', image: null, price: '\u20b97,600' }] },
    { id: 'ord-3', created_at: '2026-09-03T08:05:00Z', status: 'pending', total: 4200, currency: 'INR',
      item_count: 1, checkout_url: 'https://example.com/checkout', items: [{ name: 'Heartbead Bracelet', quantity: 1, size: null, image: null, price: '\u20b94,200' }] },
  ];
  await ctx.addInitScript(([sess, ref]) => {
    try {
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(sess));
      localStorage.setItem('naira-promo-popup-seen', '1');
    } catch (e) {}
  }, [session, 'xlsejigpjlqfvzfhhntf']);
  await ctx.route('**/*.supabase.co/**', async (route) => {
    const url = route.request().url();
    const json = (b) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(b) });
    if (url.includes('/auth/v1/user')) return json(user);
    if (url.includes('/auth/v1/token')) return json(session);
    if (url.includes('/rest/v1/member_orders')) return json(orders);
    if (url.includes('/rest/v1/profiles')) return json([{ id: user.id, full_name: 'Ananya Rao', phone: null, birthday: null, city: 'Mumbai' }]);
    return json([]);
  });
}

const errs = [];
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)));
page.on('requestfailed', r => errs.push('reqfail: ' + r.url().slice(0, 120) + ' ' + (r.failure()?.errorText || '')));
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);

const report = await page.evaluate(() => {
  const de = document.documentElement;
  const out = { scrollW: de.scrollWidth, clientW: de.clientWidth, overflow: [], tiny: [], contrast: [], noAlt: [], title: document.title };
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (r.right > de.clientWidth + 1 || r.left < -1) {
      out.overflow.push({ t: el.tagName, c: (el.className || '').toString().slice(0, 60), l: Math.round(r.left), r: Math.round(r.right) });
    }
    const txt = (el.textContent || '').trim();
    const leaf = el.children.length === 0 && txt.length > 0;
    if (leaf && parseFloat(cs.fontSize) < 12) out.tiny.push({ t: el.tagName, size: cs.fontSize, txt: txt.slice(0, 40) });
    if (el.tagName === 'BUTTON' || el.tagName === 'A') {
      if (r.height > 0 && r.height < 40 && r.width < 400) out.contrast.push({ t: el.tagName, h: Math.round(r.height), w: Math.round(r.width), txt: txt.slice(0, 30), c: (el.className || '').toString().slice(0, 70), al: el.getAttribute('aria-label') || '' });
    }
    if (el.tagName === 'IMG' && !el.hasAttribute('alt')) out.noAlt.push(el.getAttribute('src') || '');
  }
  out.overflow = out.overflow.slice(0, 12); out.tiny = out.tiny.slice(0, 12); out.contrast = out.contrast.slice(0, 12);
  return out;
});
if (process.env.TEXT) {
  const txt = await page.evaluate(() => {
    const main = document.querySelector('main');
    const walk = (el, d = 0) => {
      const out = [];
      for (const c of el.children) {
        if (c.tagName === 'FOOTER' || c.closest('footer')) continue;
        const own = [...c.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(' ');
        if (own) out.push('  '.repeat(d) + c.tagName.toLowerCase() + ': ' + own.slice(0, 120));
        if (d < 14) out.push(...walk(c, d + 1));
      }
      return out;
    };
    return walk(main).join('\n');
  });
  console.log(txt);
}
console.log(JSON.stringify({ url: URL, w: W, ...report, errs: [...new Set(errs)].slice(0, 15) }, null, 1));
await page.screenshot({ path: process.env.SHOT || `/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/portal-${W}.png`, fullPage: true });
await b.close();
