// Checks and phone screenshots for the product-page redesign preview:
//   node previewcheck.mjs <base> <outDir>
// Network goes through Node (the sandbox's Chromium cannot use the proxy CA);
// ad and analytics tags are blocked so no run reaches live accounts.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const [BASE, OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|\/functions\/v1\/meta-capi|~api\/analytics)/i;
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const newPage = async (w = 390, h = 844) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' });
  await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
  await ctx.route('**/*', async (route) => {
    const q = route.request(); const u = q.url();
    if (BLOCK.test(u)) return route.abort();
    try {
      const r = await fetch(u, { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'manual' });
      const body = Buffer.from(await r.arrayBuffer());
      const headers = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers, body });
    } catch { await route.abort().catch(() => {}); }
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  // Chromium fetching payment-app manifests (cred.club) directly fails on this
  // sandbox's proxy certificate; that is the test machine, not the page.
  p.on('console', (m) => m.type() === 'error' && !/Failed to load resource|net::ERR|payment manifest/.test(m.text()) && errors.push(m.text()));
  return { ctx, p, errors };
};
const shot = async (p, name, opts = {}) => writeFileSync(`${OUT}/${name}.jpg`, await p.screenshot({ type: 'jpeg', quality: 80, ...opts }));
const mounted = (p, re) => p.waitForFunction((src) => {
  const h1 = document.querySelector('#root h1');
  return h1 && new RegExp(src, 'i').test(h1.textContent || '') && [...document.querySelectorAll('button')].some((x) => /add to cart|pre-order/i.test(x.textContent || '') && Object.keys(x).some((k) => k.startsWith('__react')));
}, re.source, { timeout: 60000 });
// Stock shadcn navy / slate / blue-grey values, as computed colours.
const offBrand = (p) => p.evaluate(() => {
  const bad = { 'rgb(15, 23, 42)': 'navy', 'rgb(2, 8, 23)': 'navy-black', 'rgb(100, 116, 139)': 'slate', 'rgb(226, 232, 240)': 'blue-grey border', 'rgb(241, 245, 249)': 'blue-grey fill', 'rgb(248, 250, 252)': 'blue-white' };
  const hits = {};
  for (const el of document.querySelectorAll('#root *, [role="dialog"] *')) {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    for (const prop of ['color', 'backgroundColor', 'borderTopColor']) {
      const v = cs[prop]; const key = v.replace(/rgba\((\d+), (\d+), (\d+), [\d.]+\)/, 'rgb($1, $2, $3)');
      if (bad[key] && !(prop === 'borderTopColor' && cs.borderTopWidth === '0px') && !(prop === 'color' && !el.textContent.trim() && el.tagName !== 'svg')) {
        const tag = `${bad[key]} ${prop} <${el.tagName.toLowerCase()}> "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}"`;
        hits[tag] = (hits[tag] || 0) + 1;
      }
    }
  }
  return hits;
});

const H = 'prism-riviere-bracelet';

// A. The preview product page on a 390px phone.
{
  const { ctx, p, errors } = await newPage();
  await p.goto(`${BASE}/preview/jewellery/${H}`, { waitUntil: 'domcontentloaded' });
  await mounted(p, /Prism Rivi/);
  await p.waitForTimeout(2500);
  const info = await p.evaluate(() => ({
    cls: document.documentElement.className,
    body: getComputedStyle(document.body).backgroundColor,
    cta: getComputedStyle([...document.querySelectorAll('#product-actions button')].find((x) => /add to cart/i.test(x.textContent))).backgroundColor,
    counter: [...document.querySelectorAll('#root span')].find((s) => /^\d+ \/ \d+$/.test(s.textContent.trim()))?.textContent.trim(),
    rows: [...document.querySelectorAll('#root span')].filter((s) => ['Size', 'Finish'].includes(s.textContent.trim())).length,
    facts: !!document.getElementById('product-facts'),
    sold: [...document.querySelectorAll('#root p')].some((x) => /sold in the last 24 hours/.test(x.textContent)),
    robots: document.querySelector('meta[name="robots"]')?.content,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    title: document.title,
    priceBottom: document.getElementById('product-price')?.getBoundingClientRect().bottom,
    ctaBottom: document.getElementById('product-actions')?.getBoundingClientRect().bottom,
  }));
  check('palette class on while the preview is open', /\bnf-next\b/.test(info.cls), info.cls);
  check('ivory page ground', info.body === 'rgb(251, 243, 236)', info.body);
  check('Add to cart is deep sage', info.cta === 'rgb(79, 114, 104)', info.cta);
  check('photo counter shows 1 / 6 (or 1 / 7 once the reel slide joins)', /^1 \/ [67]$/.test(info.counter || ''), info.counter);
  check('first screen cleared: no facts block, size or finish rows, sold line', !info.facts && info.rows === 0 && !info.sold, JSON.stringify({ facts: info.facts, rows: info.rows, sold: info.sold }));
  check('kept out of search', /noindex/.test(info.robots || ''), info.robots);
  check('canonical names the live page', info.canonical === `https://nairaflore.com/jewellery/${H}`, info.canonical);
  check('price and Add to cart in the first screen', info.priceBottom < 844 && info.ctaBottom <= 844, `price ends ${Math.round(info.priceBottom)}px, button ${Math.round(info.ctaBottom)}px`);
  console.log(`      (Add to cart ends at ${Math.round(info.ctaBottom)}px of an 844px screen)`);
  const buyAtLanding = await p.evaluate(() => {
    const bar = [...document.querySelectorAll('button')].find((x) => /add to cart\s*·/i.test(x.textContent || ''));
    const main = document.querySelector('#product-actions button')?.getBoundingClientRect();
    return (bar && getComputedStyle(bar.parentElement).visibility === 'visible') || (main && main.bottom <= innerHeight) ? 'visible' : 'none';
  });
  check('a buy button is on screen from landing (390×844)', buyAtLanding === 'visible', buyAtLanding);
  await shot(p, 'next-390-00');
  // swipe the gallery
  await p.evaluate(() => { const s = document.querySelector('#root .md\\:hidden .snap-x'); s.scrollTo({ left: s.clientWidth * 2, behavior: 'instant' }); });
  await p.waitForTimeout(500);
  const counter3 = await p.evaluate(() => [...document.querySelectorAll('#root span')].find((s) => /^\d+ \/ \d+$/.test(s.textContent.trim()))?.textContent.trim());
  check('counter follows a swipe', /^3 \/ [67]$/.test(counter3 || ''), counter3);
  // the reel this piece is in, as the gallery's last slide
  await p.waitForFunction(() => /\/ 7$/.test([...document.querySelectorAll('#root span')].find((s) => /^\d+ \/ \d+$/.test(s.textContent.trim()))?.textContent.trim() || ''), null, { timeout: 15000 }).catch(() => {});
  const videoSlide = await p.evaluate(() => !!document.querySelector('#root .md\\:hidden .snap-x [aria-label$="in a Naira reel"]'));
  check('the reel it appears in is the last gallery slide', videoSlide);
  if (videoSlide) {
    await p.evaluate(() => { const s = document.querySelector('#root .md\\:hidden .snap-x'); s.scrollTo({ left: s.scrollWidth, behavior: 'instant' }); });
    await p.waitForTimeout(3500);
    await shot(p, 'next-gallery-video', { clip: { x: 0, y: 0, width: 390, height: 520 } });
  }
  const first = await p.evaluate(() => ({
    saving: [...document.querySelectorAll('#product-price span')].map((x) => x.textContent.trim()).find((t) => /% off$/i.test(t)),
    folds: [...document.querySelectorAll('#root details')].filter((d) => d.querySelector('#pdp-panel-details, #pdp-panel-care, #pdp-panel-delivery')).map((d) => d.open),
    gift: [...document.querySelectorAll('#product-actions p')].map((x) => x.textContent.trim()).find((t) => /gift box/i.test(t)),
    look: document.querySelectorAll('section[aria-labelledby="complete-the-look"] article').length,
    care: document.getElementById('pdp-panel-care')?.textContent.replace(/\s+/g, ' ') ?? '',
    faqSection: !!document.getElementById('pdp-faq'),
    more: document.querySelectorAll('#more-like-this ~ div article').length,
    jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((x) => { try { return JSON.parse(x.textContent)['@type']; } catch { return '?'; } }),
    embedded: !!document.getElementById('nf-piece'),
  }));
  check('saving shown as a percentage', /^43% off$/i.test(first.saving || ''), first.saving);
  check('details, care and delivery as three closed fold-downs', first.folds.length === 3 && first.folds.every((o) => !o), JSON.stringify(first.folds));
  check('gift box stated under the button', !!first.gift, first.gift);
  check('complete the look: three pieces', first.look === 3, `${first.look} card(s)`);
  check('tarnish and skin answered in Care, no separate FAQ section', /tarnish/i.test(first.care) && /skin/i.test(first.care) && !first.faqSection, first.care.slice(0, 120));
  check('more of the category', first.more >= 2, `${first.more} card(s)`);
  check('product and breadcrumb data, embedded piece, no FAQ data', ['Product', 'BreadcrumbList'].every((t) => first.jsonld.includes(t)) && !first.jsonld.includes('FAQPage') && first.embedded, first.jsonld.join(', '));
  await p.evaluate(() => { const s = document.querySelector('#root .md\\:hidden .snap-x'); s.scrollTo({ left: 0, behavior: 'instant' }); });
  // off-brand colours anywhere on the page
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 250)); } });
  await p.waitForTimeout(3000);
  const hits = await offBrand(p);
  const n = Object.values(hits).reduce((a, c) => a + c, 0);
  check('no stock navy / slate / blue-grey left on the page', n === 0, n ? JSON.stringify(hits).slice(0, 600) : 'none');
  // segments of the whole page
  const HH = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let i = 0; i * 844 < HH && i < 8; i++) {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), i * 844);
    await p.waitForTimeout(700);
    await shot(p, `next-390-seg${i}`);
  }
  // fold-downs
  await p.evaluate(() => { document.getElementById('pdp-panel-details').closest('details').scrollIntoView({ block: 'start', behavior: 'instant' }); window.scrollBy({ top: -160, behavior: 'instant' }); });
  await p.waitForTimeout(400);
  await shot(p, 'next-folds-closed');
  await p.evaluate(() => document.getElementById('pdp-panel-care').closest('details').querySelector('summary').click());
  const careShown = await p.evaluate(() => document.getElementById('pdp-panel-care').closest('details').open && document.getElementById('pdp-panel-care').offsetHeight > 0);
  check('Care opens on a tap', careShown);
  await p.evaluate(() => document.getElementById('pdp-panel-delivery').closest('details').querySelector('summary').click());
  await p.waitForTimeout(300);
  await shot(p, 'next-fold-delivery');
  const deliv = await p.evaluate(() => document.getElementById('pdp-panel-delivery').innerText);
  const hasPin = await p.evaluate(() => !!document.querySelector('#pdp-panel-delivery input'));
  check('Delivery & returns carries pincode check and WhatsApp help', hasPin && /WhatsApp/.test(deliv), deliv.replace(/\s+/g, ' ').slice(0, 160));
  // new sections
  for (const [id, name] of [['complete-the-look', 'next-look'], ['more-like-this', 'next-more']]) {
    await p.evaluate((i) => { document.getElementById(i)?.scrollIntoView({ block: 'start', behavior: 'instant' }); window.scrollBy({ top: -130, behavior: 'instant' }); }, id);
    await p.waitForTimeout(1500);
    await shot(p, name);
  }
  // reel section
  await p.waitForFunction(() => document.querySelectorAll('[data-reel-slide]').length > 0, null, { timeout: 30000 }).catch(() => {});
  await p.evaluate(() => { document.getElementById('shop-reels-title')?.scrollIntoView({ block: 'start', behavior: 'instant' }); window.scrollBy({ top: -130, behavior: 'instant' }); });
  await p.waitForTimeout(4000);
  await shot(p, 'next-reel');
  const reel = await p.evaluate(() => ({
    slides: document.querySelectorAll('[data-reel-slide]').length,
    rows: document.querySelectorAll('[data-reel-slide] li').length,
    add: [...document.querySelectorAll('[data-reel-slide] li button')].filter((x) => /^add/i.test(x.textContent.trim())).map((x) => { const cs = getComputedStyle(x); return `${cs.borderTopColor} / ${cs.color}`; })[0],
    smallest: Math.min(...[...document.querySelectorAll('#shop-reels-title ~ *, [data-reel-slide] *')].filter((e) => e.childNodes.length && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize))),
    video: !!document.querySelector('[data-reel-slide] video'),
  }));
  check('reel section shows the reels with a piece list', reel.slides > 0 && reel.rows > 0, `${reel.slides} reel(s), ${reel.rows} piece row(s)`);
  check('reel Add buttons are outlined in deep sage (the filled one is Add to cart)', reel.add === 'rgb(79, 114, 104) / rgb(79, 114, 104)', reel.add);
  check('no text under 9.5px in the reel section', reel.smallest >= 9.5, `smallest ${reel.smallest}px`);
  // sticky bar mid-page
  await p.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }));
  await p.waitForTimeout(700);
  const bar = await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => /add to cart\s*·/i.test(x.textContent || ''))?.textContent.replace(/\s+/g, ' ').trim());
  check('buy bar carries the price', /₹2,399/.test(bar || ''), bar);
  await shot(p, 'next-sticky');
  // add to cart → the new bag
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await p.waitForTimeout(400);
  await p.locator('#product-actions button', { hasText: /add to cart/i }).click();
  await p.waitForSelector('[role="dialog"][data-state="open"]', { timeout: 20000 });
  await p.waitForTimeout(2500);
  await p.waitForFunction(() => [...document.querySelectorAll('[role="dialog"][data-state="open"] button')].some((x) => /checkout/i.test(x.textContent)), null, { timeout: 20000 }).catch(() => {});
  const bag = await p.evaluate(() => {
    const d = document.querySelector('[role="dialog"][data-state="open"]');
    const btn = [...d.querySelectorAll('button')].find((x) => /checkout/i.test(x.textContent));
    return { text: d.innerText.replace(/\s+/g, ' '), bg: getComputedStyle(d).backgroundColor,
      btn: btn?.textContent.trim(), btnBg: btn ? getComputedStyle(btn).backgroundColor : null };
  });
  check('Add to cart opens the new bag', /Checkout · ₹/.test(bag.btn || ''), bag.btn);
  check('bag is ivory with a deep-sage Checkout', bag.bg === 'rgb(251, 243, 236)' && bag.btnBg === 'rgb(79, 114, 104)', `${bag.bg} / ${bag.btnBg}`);
  check('bag drops Shiprocket line, Continue shopping and repeated shipping', !/Powered by|Continue Shopping/i.test(bag.text) && (bag.text.match(/free insured shipping/gi) || []).length <= 1, bag.text.slice(0, 160));
  const bagHits = await offBrand(p);
  check('no stock navy / slate in the bag', Object.keys(bagHits).length === 0, JSON.stringify(bagHits).slice(0, 300));
  check('bag kept clean: no suggestions, no subtotal and shipping rows', !/Complete the look|Subtotal/i.test(bag.text) && !(await p.$('[role="dialog"][data-state="open"] #bag-pairings')), bag.text.slice(0, 160));
  await shot(p, 'next-bag');
  // the gift box: hovering, ring shut; a tap opens it and says what it means, then it closes
  const caption = () => p.evaluate(() => document.querySelector('[role="dialog"][data-state="open"] [data-gift-row] [aria-live]')?.textContent.trim() ?? '');
  const idleCap = await caption();
  check('gift box hovers in the bag, ring shut, tap to open', /tap to open/i.test(idleCap), idleCap);
  await p.locator('[role="dialog"][data-state="open"] [aria-label="Open the gift box"]').click();
  await p.waitForFunction(() => /comes in this gift box/i.test(document.querySelector('[role="dialog"][data-state="open"] [data-gift-row] [aria-live]')?.textContent || ''), null, { timeout: 6000 }).catch(() => {});
  const upCap = await caption();
  await shot(p, 'next-bag-box-open');
  await p.waitForFunction(() => /tap to open/i.test(document.querySelector('[role="dialog"][data-state="open"] [data-gift-row] [aria-live]')?.textContent || ''), null, { timeout: 8000 }).catch(() => {});
  const backCap = await caption();
  check('a tap raises the ring and says "your piece comes in this gift box", then it closes', /comes in this gift box/i.test(upCap) && /tap to open/i.test(backCap), `${upCap} → ${backCap}`);
  // one more of the same piece earns the 2-piece offer
  await p.locator('[role="dialog"][data-state="open"] button[aria-label="Increase quantity"]').first().click();
  await p.waitForFunction(() => /2 pieces · 10% off/i.test(document.querySelector('[role="dialog"][data-state="open"]')?.innerText || ''), null, { timeout: 20000 }).catch(() => {});
  const after = await p.evaluate(() => document.querySelector('[role="dialog"][data-state="open"]').innerText.replace(/\s+/g, ' '));
  check('a second piece earns the 10%, named as the 2-piece offer, no code name', /2 pieces · 10% off applied/i.test(after) && !/BUY2|NAIRA10/.test(after), (after.match(/2 pieces[^₹]*₹[\d,]+/) || [after.slice(0, 120)])[0]);
  await shot(p, 'next-bag-2');
  // the phone back button closes the bag
  await p.goBack();
  await p.waitForTimeout(800);
  // The header's menu is a dialog too, always in the page: look for the open one.
  const open = await p.evaluate(() => !!document.querySelector('[role="dialog"][data-state="open"]'));
  check('phone back button closes the bag, page stays', !open && /\/preview\/jewellery\//.test(p.url()), p.url());
  // leaving the preview restores the live palette
  await p.evaluate(() => window.history.pushState({}, '', '/jewellery'));
  await p.evaluate(() => window.dispatchEvent(new PopStateEvent('popstate')));
  await p.waitForTimeout(1500);
  const clsAfter = await p.evaluate(() => document.documentElement.className);
  check('leaving the preview turns the palette off', !/\bnf-next\b/.test(clsAfter), clsAfter || '(none)');
  check('no page errors on the preview', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// B. A ring: size buttons and the size guide.
{
  const { ctx, p, errors } = await newPage();
  await p.goto(`${BASE}/preview/jewellery/cushion-halo-ring`, { waitUntil: 'domcontentloaded' });
  await mounted(p, /Cushion Halo/);
  await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('[role="radiogroup"]')?.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await p.waitForTimeout(400);
  await shot(p, 'next-ring-size');
  const radios = await p.evaluate(() => [...document.querySelectorAll('[role="radiogroup"] [role="radio"]')].map((r) => `${r.textContent.trim()}${r.getAttribute('aria-checked') === 'true' ? '*' : ''}`));
  check('ring shows US size buttons', radios.length === 3, radios.join(', '));
  await p.getByRole('button', { name: 'Size guide' }).click();
  await p.waitForTimeout(900);
  // The size chart is its own sheet (not a Radix dialog): find it by its heading.
  const guide = await p.evaluate(() => /ring size chart/i.test(document.body.innerText));
  const guideHits = await offBrand(p);
  check('size guide opens, no stock navy / slate in it', guide && Object.keys(guideHits).length === 0, JSON.stringify(guideHits).slice(0, 300));
  await shot(p, 'next-ring-guide');
  check('no page errors on the ring page', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// C. Other phone widths, first screen.
for (const [w, h] of [[360, 780], [414, 896]]) {
  const { ctx, p } = await newPage(w, h);
  await p.goto(`${BASE}/preview/jewellery/${H}`, { waitUntil: 'domcontentloaded' });
  await mounted(p, /Prism Rivi/);
  await p.waitForTimeout(2000);
  const over = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  check(`${w}px: no sideways scroll`, !over);
  await shot(p, `next-${w}-00`);
  await ctx.close();
}

// E. Desktop, side by side with the live page.
for (const [label, path] of [['next', `/preview/jewellery/${H}`], ['live', `/jewellery/${H}`]]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
  await ctx.route('**/*', async (route) => {
    const q = route.request(); const u = q.url();
    if (BLOCK.test(u)) return route.abort();
    try {
      const r = await fetch(u, { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'manual' });
      const body = Buffer.from(await r.arrayBuffer());
      const headers = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers, body });
    } catch { await route.abort().catch(() => {}); }
  });
  const p = await ctx.newPage();
  await p.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await mounted(p, /Prism Rivi/);
  await p.waitForTimeout(2500);
  await shot(p, `${label}-desktop`);
  await ctx.close();
}

// D. The live product page and bag are the new design.
{
  const { ctx, p, errors } = await newPage();
  await p.goto(`${BASE}/jewellery/${H}`, { waitUntil: 'domcontentloaded' });
  await mounted(p, /Prism Rivi/);
  await p.waitForTimeout(1500);
  const live = await p.evaluate(() => ({ cls: document.documentElement.className, robots: document.querySelector('meta[name="robots"]')?.content ?? '', folds: document.querySelectorAll('#root details').length }));
  check('live page: the new design, in search', /\bnf-next\b/.test(live.cls) && !/noindex/.test(live.robots) && live.folds >= 3, JSON.stringify(live));
  await p.locator('#product-actions button', { hasText: /add to cart/i }).first().click();
  await p.waitForSelector('[role="dialog"][data-state="open"] [data-gift-row]', { timeout: 20000 });
  await p.waitForTimeout(1500);
  const bag = await p.evaluate(() => { const d = document.querySelector('[role="dialog"][data-state="open"]'); return { text: d.innerText.replace(/\s+/g, ' '), palette: d.classList.contains('nf-palette') }; });
  check('live page: the new bag with the gift box', /Checkout · ₹/i.test(bag.text) && /tap to open/i.test(bag.text) && bag.palette, bag.text.slice(0, 120));
  check('no page errors on the live product page', errors.length === 0, errors.slice(0, 2).join(' | '));
  await shot(p, 'live-bag');
  await ctx.close();
}

// E. The bag is the same on other pages (opened from the header).
{
  const { ctx, p, errors } = await newPage();
  await p.goto(`${BASE}/jewellery`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => [...document.querySelectorAll('button[aria-label="Open cart"]')].some((x) => Object.keys(x).some((k) => k.startsWith('__react'))), null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  await p.locator('button[aria-label="Open cart"]').first().click();
  await p.waitForSelector('[role="dialog"][data-state="open"].nf-palette', { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(1200);
  const bag = await p.evaluate(() => { const d = document.querySelector('[role="dialog"][data-state="open"]'); return d ? { palette: d.classList.contains('nf-palette'), bg: getComputedStyle(d).backgroundColor, text: d.innerText.replace(/\s+/g, ' ') } : null; });
  check('bag opens from the header on the listing, in Naira colours', !!bag && bag.palette && bag.bg === 'rgb(251, 243, 236)', bag ? `${bag.bg} · ${bag.text.slice(0, 80)}` : 'no bag');
  const hits = await offBrand(p);
  check('no stock navy / slate in the bag on the listing', Object.keys(hits).length === 0, JSON.stringify(hits).slice(0, 300));
  check('no page errors on the listing', errors.length === 0, errors.slice(0, 2).join(' | '));
  await shot(p, 'listing-bag');
  await ctx.close();
}

// F. A shopper with NAIRA10 stored from an earlier visit: one 10%, never shown twice, never named.
{
  const { ctx, p, errors } = await newPage();
  await ctx.addInitScript({ content: "try { localStorage.setItem('naira-promo-code', 'NAIRA10'); } catch {}" });
  await p.goto(`${BASE}/jewellery/${H}`, { waitUntil: 'domcontentloaded' });
  await mounted(p, /Prism Rivi/);
  await p.waitForTimeout(1500);
  await p.locator('#product-actions button', { hasText: /add to cart/i }).first().click();
  await p.waitForSelector('[role="dialog"][data-state="open"] [data-gift-row]', { timeout: 20000 });
  await p.waitForTimeout(1500);
  const one = await p.evaluate(() => document.querySelector('[role="dialog"][data-state="open"]').innerText.replace(/\s+/g, ' '));
  check('NAIRA10 never shown in the bag', !/NAIRA/i.test(one), one.slice(0, 160));
  check('with a 10% code, the band offers only the 20% rung', /10% off — add 2 pieces for 20%/i.test(one) && !/save 10%/i.test(one), (one.match(/[^·]*off — add[^%]*%/i) || [one.slice(0, 80)])[0]);
  check('the one discount is named for what it is', /Promo code · 10% off applied/i.test(one), (one.match(/Promo code[^₹]*₹[\d,]+/) || [''])[0]);
  await shot(p, 'bag-naira10');
  check('no page errors with a stored code', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`);
await b.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
