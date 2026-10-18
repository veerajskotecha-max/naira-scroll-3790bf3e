// End-to-end test of the bag as the "Naira Bag CRO Plan" (16 October 2026)
// draws it: a whole visit on a 360×640 Android phone, then a 390×844 phone and
// a desktop.
//   node bagflow.mjs <base> [outDir]
// It uses real Shopify carts and never places an order. Shiprocket's checkout
// script is replaced by a stand-in that records the hand-off, so nothing reaches
// Shiprocket, and ad and analytics requests are blocked (noreport.mjs). Clarity
// is a stand-in too: the events the bag records are read back from it.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { NO_REPORT } from './noreport.mjs';

const [BASE, OUT] = process.argv.slice(2);
if (!BASE) {
  console.error('usage: node bagflow.mjs <base> [outDir]');
  process.exit(2);
}
if (OUT) mkdirSync(OUT, { recursive: true });

const PDP = '/jewellery/prism-riviere-bracelet';
// The pieces Shopify holds 20 or more of (src/lib/pairings.ts DEEP_STOCK, 18
// October): the only add-ons the bag may offer.
const DEEP_STOCK = [
  'toggle-link-chain', 'baguette-tennis-bracelet', 'prism-riviere-bracelet', 'woven-gold-hoops', 'baguette-huggies',
  'bold-nocturne-chain', 'bold-nocturne-bracelet', 'kiss-knot-bangle', 'marquise-layering-set', 'silk-mesh-cuff',
  'brushed-gold-huggies', 'ribbon-bead-bracelet', 'riviere-eternal-bracelet', 'heartbead-bracelet', 'baroque-shell-bracelet',
  'serpentine-whisper-chain-silver', 'bold-nocturne-drops', 'charm-box-chain', 'droplet-open-cuff', 'duo-link-bracelet',
  'duo-link-necklace', 'emerald-square-ear-cuff', 'fine-tennis-bracelet', 'garnet-cable-cuff', 'marquise-drop-choker',
  'mint-pear-drop-earrings', 'north-star-bangle', 'pear-point-open-cuff', 'petal-flower-studs', 'serpentine-whisper-chain',
  'triple-coil-wrap-bangle',
];
const SHIPROCKET = /fastrr-boost-ui\.pickrr\.com/i;
const ANDROID = 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};
const rupees = (s) => Number(String(s ?? '').replace(/[^\d]/g, '')) || 0;
const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
// The ladder and rounding the checkout uses (src/lib/promo.ts).
const rateFor = (pieces) => (pieces >= 3 ? 0.2 : pieces >= 2 ? 0.1 : 0);
const charged = (subtotal, rate) => Math.round(subtotal * (1 - rate));
const sum = (lines, pick) => lines.reduce((t, l) => t + pick(l) * l.qty, 0);

// Before any page script: Clarity and Shiprocket stand-ins, and a finder for
// the open bag (the header's menu is a dialog too).
const STAND_INS = `
  Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
  window.__clarityLog = [];
  window.clarity = function () { window.__clarityLog.push([].slice.call(arguments)); };
  window.shiprocketCheckoutEvents = { buyDirect: function (payload) { window.__handoff = JSON.parse(JSON.stringify(payload)); } };
  window.__bag = function () {
    return [].slice.call(document.querySelectorAll('[role="dialog"][data-state="open"]'))
      .find(function (d) { return d.querySelector('[data-bag-foot], [data-ladder]') || /Your bag/.test((d.querySelector('h2') || {}).textContent || ''); }) || null;
  };`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const newPage = async ({ w = 360, h = 640, phone = true } = {}) => {
  const ctx = await b.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
    isMobile: phone,
    hasTouch: phone,
    ...(phone ? { userAgent: ANDROID } : {}),
  });
  await ctx.addInitScript({ content: STAND_INS });
  const log = { requests: [], blocked: [], left: [] };
  let p;
  await ctx.route('**/*', async (route) => {
    const q = route.request();
    const u = q.url();
    // Never leave the shop: a hand-off that fell through to a real checkout
    // page stops here, recorded.
    let offSite = false;
    try {
      offSite = q.isNavigationRequest() && q.frame() === p?.mainFrame() && new URL(u).origin !== new URL(BASE).origin;
    } catch {
      /* a worker's request has no frame */
    }
    if (NO_REPORT.test(u) || SHIPROCKET.test(u) || offSite) {
      log.blocked.push(u);
      if (offSite) log.left.push(u);
      return route.abort();
    }
    try {
      const r = await fetch(u, { method: q.method(), headers: q.headers(), body: q.postDataBuffer() || undefined, redirect: 'manual' });
      const body = Buffer.from(await r.arrayBuffer());
      log.requests.push({ url: u, type: q.resourceType(), bytes: body.length });
      const headers = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers, body });
    } catch {
      await route.abort().catch(() => {});
    }
  });
  p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  // Not page errors, this sandbox: payment-app manifests and the live-reviews
  // WebSocket cannot get through its proxy.
  p.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (/Failed to load resource|net::ERR|payment manifest|^WebSocket connection to 'wss:\/\/[^']*supabase\.co\/realtime\/|^SSL certificate is not valid\. Security level: NONE|^No UI will be shown\. CanMakePayment/.test(text)) return;
    // React 18's development build does not know <img fetchPriority> (the
    // product photo's); production builds print nothing.
    if (/^Warning: React does not recognize the `%s` prop[\s\S]*\bfetchPriority\b/.test(text)) return;
    errors.push(text.slice(0, 200));
  });
  return { ctx, p, errors, log };
};

const shot = async (p, name) => {
  if (OUT) writeFileSync(`${OUT}/${name}.png`, await p.screenshot());
};
const until = (p, fn, arg, timeout = 30000) => p.waitForFunction(fn, arg, { timeout }).then(() => true, () => false);
const events = (p) => p.evaluate(() => window.__clarityLog.filter((c) => c[0] === 'event').map((c) => c[1]));
const lineCount = (p, n) => until(p, (n) => (window.__bag()?.querySelectorAll('[data-line]').length ?? -1) === n, n);

const openPdp = async (p) => {
  await p.goto(BASE + PDP, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(
    () => [...document.querySelectorAll('#product-actions button')].some((x) => /add to cart/i.test(x.textContent) && Object.keys(x).some((k) => k.startsWith('__react'))),
    null,
    { timeout: 90000 },
  );
  await p.waitForTimeout(1200);
};
const addFromPdp = async (p) => {
  await p.locator('#product-actions button', { hasText: /add to cart/i }).first().click();
  await until(p, () => window.__bag()?.querySelector('[data-line]'));
  await until(p, () => window.__bag()?.querySelector('[data-pair] [data-piece-card]'), null, 15000);
  await p.waitForTimeout(800);
};
const openBagFromHeader = async (p) => {
  const button = p.locator('button[aria-label^="Open cart"]:visible').first();
  if (!(await button.count())) {
    await p.goto(`${BASE}/jewellery`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => [...document.querySelectorAll('button[aria-label^="Open cart"]')].some((x) => x.offsetParent && Object.keys(x).some((k) => k.startsWith('__react'))), null, { timeout: 60000 });
  }
  await p.locator('button[aria-label^="Open cart"]:visible').first().click();
  return until(p, () => window.__bag(), null, 15000);
};

// Everything a shopper can read in the bag, plus the numbers behind it.
const read = (p) =>
  p.evaluate(() => {
    const bag = window.__bag();
    if (!bag) return null;
    const t = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
    const bar = bag.querySelector('[data-ladder] [role="progressbar"]');
    return {
      heading: t(bag.querySelector('h2')),
      band: t(bag.querySelector('[data-ladder] p')),
      rungs: [...bag.querySelectorAll('[data-ladder] [role="progressbar"] > span[aria-hidden="true"] > span:last-child')].map(t),
      bar: bar && { now: Number(bar.getAttribute('aria-valuenow')), max: Number(bar.getAttribute('aria-valuemax')), fill: bar.querySelector(':scope > span')?.style.width },
      lines: [...bag.querySelectorAll('[data-line]')].map((li) => ({
        handle: li.dataset.line,
        name: t(li.querySelector('[data-line-name]')),
        href: li.querySelector('[data-line-name]')?.getAttribute('href') || '',
        price: t(li.querySelector('[data-line-price] > span')),
        mrp: t(li.querySelector('[data-line-price] s')),
        off: t(li.querySelector('[data-line-price] s + span')),
        qty: Number(t(li.querySelector('[aria-label^="Quantity"]'))) || 1,
      })),
      pairHead: t(bag.querySelector('[data-pair] > p')),
      cards: [...bag.querySelectorAll('[data-pair] [data-piece-card]')].map((c) => ({ handle: c.dataset.pieceCard, title: t(c.querySelector('p')), note: t(c.querySelectorAll('p')[1]), href: c.querySelector('p a')?.getAttribute('href') || '' })),
      gift: t(bag.querySelector('[data-gift-row]')),
      undo: t(bag.querySelector('[data-undo]')),
      whatsapp: bag.querySelector('a[href^="https://wa.me/"]')?.getAttribute('href') || '',
      total: t(bag.querySelector('[data-total]')),
      mrpTotal: t(bag.querySelector('[data-mrp-total]')),
      youSave: t(bag.querySelector('[data-you-save]')),
      cta: t(bag.querySelector('[data-checkout]')),
      trust: [...bag.querySelectorAll('[data-trust] li')].map((li) => t(li).replace(/^✓\s*/, '')),
      foot: t(bag.querySelector('[data-bag-foot]')),
      text: bag.textContent.replace(/\s+/g, ' '),
    };
  });

// A. A whole visit on a 360×640 Android phone.
{
  const { ctx, p, errors, log } = await newPage();
  await openPdp(p);
  await addFromPdp(p);

  // One piece: the deal, the next piece, the box, the button.
  let s = await read(p);
  const first = s.lines[0] ?? {};
  const price = rupees(first.price);
  const mrp = rupees(first.mrp);
  check('Add to cart opens the bag with the piece in it', s.lines.length === 1 && first.handle === 'prism-riviere-bracelet', s.lines.map((l) => l.handle).join(', '));
  check('header: "Your bag · 1 piece"', /^Your bag\s*1 piece$/.test(s.heading), s.heading);
  check(
    'band: "A second piece takes 10% off your bag", rungs labelled 10% and 20%, bar a third along',
    s.band === 'A second piece takes 10% off your bag' && s.rungs.join(' ') === '10% 20%' && s.bar?.now === 1 && s.bar?.max === 3 && Math.abs(parseFloat(s.bar?.fill) - 100 / 3) < 0.5,
    `${s.band} · ${s.rungs.join(' ')} · ${JSON.stringify(s.bar)}`,
  );
  check('the line keeps the deal: price, struck MRP and the rupees off', price > 0 && mrp > price && first.off === `${inr(mrp - price)} off`, `${first.price} ${first.mrp} ${first.off}`);
  check(
    'one add-on (a second only when as good), from the deep-stock pieces, none already in the bag',
    s.cards.length >= 1 && s.cards.length <= 2 && s.cards.every((c) => DEEP_STOCK.includes(c.handle) && c.handle !== first.handle),
    s.cards.map((c) => c.handle).join(', '),
  );
  check('a bracelet is offered the hoops: "Wears well with your bracelet"', s.pairHead === 'Wears well with your bracelet' && s.cards[0]?.handle === 'woven-gold-hoops', `${s.pairHead} · ${s.cards[0]?.title}`);
  const card = s.cards[0] ?? { title: '', note: '' };
  const cardPrice = rupees(card.title.split('·').pop());
  const adds = charged(price + cardPrice, rateFor(2)) - price;
  check(
    'the add-on says what it adds and what it saves, by the checkout\'s own maths',
    card.note === `Adds ${inr(adds)} · saves ${inr(cardPrice - adds)}`,
    `${card.title} · ${card.note} (expected Adds ${inr(adds)} · saves ${inr(cardPrice - adds)})`,
  );
  check('gift line: "Tap to open your Naira gift box", no gift-note offer, nothing called free', s.gift === 'Tap to open your Naira gift box', s.gift);
  const gift = await p.evaluate(() => {
    const row = window.__bag().querySelector('[data-gift-row]');
    const box = row.querySelector('button span')?.getBoundingClientRect();
    return { row: Math.round(row.getBoundingClientRect().height), box: box ? [Math.round(box.width), Math.round(box.height)] : null };
  });
  // One line, a 44px tap target with its padding: the box no longer takes half the bag.
  check('the box is small and its line slim: it no longer takes half the bag', gift.box && gift.box[0] <= 40 && gift.box[1] <= 40 && gift.row <= 64, `box ${gift.box?.join('×')}px, line ${gift.row}px`);
  check(
    'each piece links to its own page: the line and the add-on',
    first.href === `/jewellery/${first.handle}` && card.href === `/jewellery/${card.handle}`,
    `${first.href} · ${card.href}`,
  );
  check('Total · incl. taxes, with the MRP struck beside it', /^Total · incl\. taxes/.test(s.foot) && rupees(s.total) === price && rupees(s.mrpTotal) === mrp, `${s.mrpTotal} → ${s.total}`);
  check('one saving line: "You save … against MRP"', s.youSave === `You save ${inr(mrp - price)} against MRP`, s.youSave);
  check('free insured shipping, with an arrival date', /Free insured shipping · arrives \d{1,2}/.test(s.foot), (s.foot.match(/Free insured shipping · arrives [^C]*/) || [''])[0].trim());
  check('Checkout carries the total', s.cta === `Checkout · ${inr(price)}`, s.cta);
  check(
    'beside the button: UPI, cards or cash on delivery · 7-day returns · 2-year plating assurance',
    s.trust.join(' | ') === 'UPI, cards or cash on delivery | 7-day returns | 2-year plating assurance',
    s.trust.join(' | '),
  );
  check('says what comes next', /Next: a quick OTP, then address and payment$/.test(s.foot));
  const lay = await p.evaluate(() => {
    const bag = window.__bag();
    const scroller = bag.querySelector('[data-line]').closest('.overflow-y-auto');
    const promo = [...bag.querySelectorAll('button')].find((x) => /Have a promo code\?/.test(x.textContent));
    const plus = bag.querySelector('[data-line] button[aria-label="Increase quantity"]');
    const before = getComputedStyle(plus, '::before');
    const r = plus.getBoundingClientRect();
    return {
      vh: innerHeight,
      footBottom: Math.round(bag.querySelector('[data-bag-foot]').getBoundingClientRect().bottom),
      fits: scroller.scrollHeight <= scroller.clientHeight + 1,
      sideways: bag.scrollWidth > bag.clientWidth + 1 || scroller.scrollWidth > scroller.clientWidth + 1,
      promo: Boolean(promo),
      promoInFoot: Boolean(promo?.closest('[data-bag-foot]')),
      target: [r.width - 2 * parseFloat(before.left), r.height - 2 * parseFloat(before.top)],
    };
  });
  check('on a 360×640 phone it all fits one screen: piece, add-on, box, links, button and reassurance', lay.fits && lay.footBottom <= lay.vh && !lay.sideways, JSON.stringify({ fits: lay.fits, foot: lay.footBottom, vh: lay.vh, sideways: lay.sideways }));
  check('"Have a promo code?" sits with the pieces, out of the pinned footer', lay.promo && !lay.promoInFoot);
  check('quantity buttons are 44px targets', lay.target[0] >= 44 && lay.target[1] >= 44, `${lay.target.join('×')}px`);
  const wa = new URL(s.whatsapp || 'https://invalid.example/');
  check(
    '"Questions? WhatsApp us" opens a chat with the bag already written in',
    `${wa.origin}${wa.pathname}` === 'https://wa.me/919561557935' && (wa.searchParams.get('text') || '').includes(first.name),
    wa.searchParams.get('text') || s.whatsapp,
  );
  const pictures = await p.evaluate(() =>
    [...window.__bag().querySelectorAll('img')].map((i) => ({ src: i.currentSrc, piece: Boolean(i.closest('[data-line], [data-piece-card]')), w: Math.round(i.getBoundingClientRect().width), natural: i.naturalWidth })),
  );
  const thumbs = pictures.filter((i) => i.piece);
  check('piece pictures are thumbnails, not full-size photos', thumbs.length >= 2 && thumbs.every((i) => i.natural > 0 && i.natural <= 480), thumbs.map((i) => `${i.w}px from ${i.natural}px`).join(', '));
  const weight = pictures.reduce((t, i) => t + (log.requests.find((r) => r.url === i.src)?.bytes ?? 0), 0);
  check('every picture in the bag together, gift box included, stays under 120 KB', weight > 0 && weight < 120 * 1024, `${(weight / 1024).toFixed(1)} KB for ${pictures.length} pictures`);
  const chunk = log.requests.find((r) => /CartDrawerNext[^/]*\.(js|tsx)(\?|$)/.test(r.url));
  if (chunk && /\.js(\?|$)/.test(chunk.url)) check('the bag\'s own code stays small (under 40 KB before compression)', chunk.bytes < 40000, `${(chunk.bytes / 1024).toFixed(1)} KB`);
  let ev = await events(p);
  check('the bag records itself in Clarity: bag_opened, bag_pair_shown', ev.includes('bag_opened') && ev.includes('bag_pair_shown'), ev.join(', '));
  await shot(p, '1-one-piece');

  // The gift box: a tap opens it in the bag, and Back returns to the line.
  await p.locator('[data-gift-row] button', { hasText: 'Tap to open your Naira gift box' }).click();
  const opened = await until(p, () => /Every piece comes with this box/.test(window.__bag()?.querySelector('[data-gift-lifted]')?.textContent || ''), null, 3000);
  check('a tap opens the gift box in the bag: "Every piece comes with this box"', opened);
  await p.waitForTimeout(2600); // the drawer slides out and the ring rises
  await shot(p, '2-gift-open');
  const panel = await p.evaluate(() => {
    const r = window.__bag()?.querySelector('[data-gift-lifted]')?.getBoundingClientRect();
    return r && { left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth };
  });
  check('the open box keeps to the bag, nothing off the edge', panel && panel.left >= 0 && panel.right <= panel.vw, JSON.stringify(panel));
  await p.locator('[data-gift-lifted] button[aria-label="Back to your bag"]').click();
  check('Back closes it and the line returns', await until(p, () => !window.__bag()?.querySelector('[data-gift-lifted]') && /Tap to open/.test(window.__bag()?.querySelector('[data-gift-row]')?.textContent || ''), null, 3000));
  ev = await events(p);
  check('the tap is recorded: bag_gift_opened', ev.includes('bag_gift_opened'));

  // The add-on: one tap, and the total moves by exactly what the card said.
  const total1 = rupees(s.total);
  await p.locator('[data-pair] [data-piece-card] button').first().click();
  await lineCount(p, 2);
  await p.waitForTimeout(800);
  s = await read(p);
  check('Add puts the hoops in the bag without leaving it', s.lines.length === 2 && s.lines[1]?.handle === card.handle && /^Your bag\s*2 pieces$/.test(s.heading), `${s.lines.map((l) => l.handle).join(', ')} · ${s.heading}`);
  check('the total rose by exactly what the card said it adds', rupees(s.total) - total1 === adds, `${inr(total1)} → ${s.total}, card said ${inr(adds)}`);
  check('band: "10% off your bag · a third piece makes it 20%", bar two thirds along', s.band === '10% off your bag · a third piece makes it 20%' && s.bar?.now === 2, `${s.band} · ${JSON.stringify(s.bar)}`);
  let sub = sum(s.lines, (l) => rupees(l.price));
  let mrpSum = sum(s.lines, (l) => rupees(l.mrp) || rupees(l.price));
  check(
    'the total is the 2-piece price, and one saving line names the 10%',
    rupees(s.total) === charged(sub, 0.1) && s.youSave === `You save ${inr(mrpSum - charged(sub, 0.1))} against MRP · includes 10% for 2 pieces` && s.cta === `Checkout · ${inr(charged(sub, 0.1))}`,
    `${s.total} · ${s.youSave}`,
  );
  check(
    'the next add-on follows the latest piece: "Wears well with your hoops"',
    s.pairHead === 'Wears well with your hoops' && s.cards.length >= 1 && s.cards.every((c) => DEEP_STOCK.includes(c.handle) && !s.lines.some((l) => l.handle === c.handle)),
    `${s.pairHead} · ${s.cards.map((c) => c.handle).join(', ')}`,
  );
  const card2 = s.cards[0] ?? { title: '', note: '' };
  const card2Price = rupees(card2.title.split('·').pop());
  const adds2 = charged(sub + card2Price, 0.2) - charged(sub, 0.1);
  check('…and its sum counts the 20% a third piece earns', card2.note === `Adds ${inr(adds2)} · saves ${inr(card2Price - adds2)}`, `${card2.note} (expected Adds ${inr(adds2)} · saves ${inr(card2Price - adds2)})`);
  ev = await events(p);
  check('the add is recorded: bag_pair_added', ev.includes('bag_pair_added'));
  await shot(p, '3-two-pieces');

  // A third piece: the best price, and no more add-ons.
  const total2 = rupees(s.total);
  await p.locator('[data-pair] [data-piece-card] button').first().click();
  await lineCount(p, 3);
  await p.waitForTimeout(800);
  s = await read(p);
  sub = sum(s.lines, (l) => rupees(l.price));
  check('a third piece: "20% off your bag, the best price", the bar full', s.band === '20% off your bag, the best price' && s.bar?.now === 3, `${s.band} · ${JSON.stringify(s.bar)}`);
  check('the total rose by exactly what that card said', rupees(s.total) - total2 === adds2 && rupees(s.total) === charged(sub, 0.2), `${inr(total2)} → ${s.total}, card said ${inr(adds2)}`);
  check('no add-on once the bag holds three', s.cards.length === 0 && !s.pairHead);
  check('the saving line names the 20%', /· includes 20% for 3 pieces$/.test(s.youSave), s.youSave);
  await shot(p, '4-three-pieces');

  // Remove comes with Undo; so does "−" at one piece.
  const last = s.lines[2];
  await p.locator(`[data-line="${last.handle}"] button`, { hasText: /^Remove$/ }).click();
  await lineCount(p, 2);
  s = await read(p);
  // In view, not just in the page: from low in a long bag the list is scrolled
  // down, and an Undo at the top of the list would be out of sight.
  const undoInView = () =>
    p.evaluate(() => {
      const note = window.__bag()?.querySelector('[data-undo]');
      if (!note) return false;
      const r = note.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return Boolean(hit && note.contains(hit)) && r.top >= 0 && r.bottom <= innerHeight;
    });
  check('Remove takes the piece out and offers Undo, in view even from low in a long bag', s.undo.startsWith(`${last.name} removed`) && /Undo$/.test(s.undo) && (await undoInView()), s.undo);
  await shot(p, '5-removed-undo');
  await p.locator('[data-undo] button', { hasText: 'Undo' }).click();
  await lineCount(p, 3);
  s = await read(p);
  check('Undo puts it back', s.lines.some((l) => l.handle === last.handle) && !s.undo, s.lines.map((l) => l.handle).join(', '));
  await p.locator(`[data-line="${last.handle}"] button[aria-label="Remove ${last.name}"]`).first().click();
  await lineCount(p, 2);
  s = await read(p);
  check('"−" at one piece removes it, with Undo too', s.undo.startsWith(`${last.name} removed`) && (await undoInView()), s.undo);

  // The promo field: opened in place, one discount, the code never named.
  sub = sum(s.lines, (l) => rupees(l.price));
  await p.locator('[role="dialog"][data-state="open"]').getByRole('button', { name: 'Have a promo code?' }).click();
  const field = await until(p, () => window.__bag()?.querySelector('#cart-promo'), null, 3000);
  s = await read(p);
  check('"Have a promo code?" opens the field in place, WhatsApp still to hand', field && Boolean(s.whatsapp));
  await p.locator('#cart-promo').fill('NOTACODE');
  await p.locator('#cart-promo').press('Enter');
  check('a code that does not work says so plainly', await until(p, () => /That code isn.t valid right now\./.test(window.__bag()?.textContent || ''), null, 3000));
  await p.locator('#cart-promo').fill('naira10');
  await p.locator('#cart-promo').press('Enter');
  await until(p, () => /Code added/.test(window.__bag()?.textContent || ''), null, 5000);
  s = await read(p);
  check('a typed code is added, and never named back in the bag', /Code added/.test(s.text) && !/NAIRA10/i.test(s.text), (s.text.match(/Code added[^·]*/) || [''])[0]);
  check(
    'code and two pieces still make one 10%, never 20%: "includes 10% with your code"',
    /· includes 10% with your code$/.test(s.youSave) && rupees(s.total) === charged(sub, 0.1) && s.band === '10% off your bag · a third piece makes it 20%',
    `${s.youSave} · ${s.total} · ${s.band}`,
  );
  await p.locator('[aria-label="Remove promo code"]').click();
  await until(p, () => /for 2 pieces$/.test(window.__bag()?.querySelector('[data-you-save]')?.textContent || ''), null, 5000);
  s = await read(p);
  check('taking the code off returns the 2-piece offer', /· includes 10% for 2 pieces$/.test(s.youSave), s.youSave);
  ev = await events(p);
  check('the field is recorded: bag_promo_opened', ev.includes('bag_promo_opened'));

  // The phone's back button closes the bag and stays on the piece.
  const here = p.url();
  await p.goBack();
  await p.waitForTimeout(900);
  check('the phone\'s back button closes the bag, the page stays', (await p.evaluate(() => !window.__bag())) && p.url() === here, p.url());
  ev = await events(p);
  check('closing with pieces in it is recorded: bag_closed', ev.includes('bag_closed'));

  // Checkout: answered at once, and the hand-off carries the bag's one discount.
  check('the bag opens again from the header', await openBagFromHeader(p));
  await p.waitForTimeout(600);
  s = await read(p);
  const pieces = s.lines.reduce((t, l) => t + l.qty, 0);
  const total = s.total;
  await p.locator('[data-checkout]').click();
  const answered = await p.evaluate(() => {
    const button = window.__bag()?.querySelector('[data-checkout]');
    return button ? { text: button.textContent.replace(/\s+/g, ' ').trim(), disabled: button.disabled } : null;
  });
  check('Checkout answers the tap at once: "Opening secure checkout…"', answered?.text === 'Opening secure checkout…' && answered.disabled, JSON.stringify(answered));
  const handed = await until(p, () => window.__handoff, null, 20000);
  const handoff = handed ? await p.evaluate(() => window.__handoff) : null;
  check(
    'the hand-off gets every piece and the bag\'s one code (BUY2 at two pieces)',
    handoff && handoff.products.length === s.lines.length && handoff.products.reduce((t, x) => t + x.quantity, 0) === pieces && handoff.couponCode === 'BUY2' && /[?&]discount=BUY2\b/.test(handoff.fallbackUrl || ''),
    handoff ? `${handoff.products.length} line(s), coupon ${handoff.couponCode}, bag showed ${total}` : 'no hand-off',
  );
  check('the bag gets out of the way once Shiprocket takes over', await until(p, () => !window.__bag(), null, 5000));
  ev = await events(p);
  check('the tap is recorded: bag_checkout_tapped', ev.includes('bag_checkout_tapped'));

  // The empty bag: somewhere to go.
  await openBagFromHeader(p);
  for (let n = (await read(p)).lines.length; n > 0; n -= 1) {
    await p.locator('[data-line] button', { hasText: /^Remove$/ }).first().click();
    await lineCount(p, n - 1);
  }
  await p.waitForTimeout(600);
  const empty = await p.evaluate(() => {
    const bag = window.__bag();
    return {
      text: bag.textContent.replace(/\s+/g, ' '),
      cards: [...bag.querySelectorAll('[data-piece-card]')].map((c) => c.dataset.pieceCard),
      adds: bag.querySelectorAll('[data-piece-card] button').length,
      band: Boolean(bag.querySelector('[data-ladder]')),
      explore: bag.querySelector('a[href="/jewellery"]')?.textContent.trim(),
    };
  });
  check(
    'an empty bag offers the two best-sellers, each with Add, and the way back to the jewellery',
    /Your bag is empty/.test(empty.text) && /Most loved/.test(empty.text) && empty.cards.join(',') === 'prism-riviere-bracelet,woven-gold-hoops' && empty.adds === 2 && empty.explore === 'Explore jewellery',
    `${empty.cards.join(', ')} · ${empty.explore}`,
  );
  check('no offer band over an empty bag', !empty.band);
  await shot(p, '6-empty');
  await p.locator('[data-piece-card] button').first().click();
  check('Add from the empty bag fills it', await lineCount(p, 1));
  ev = await events(p);
  check('recorded: bag_empty_added', ev.includes('bag_empty_added'));

  // Out of the bag by its links: a piece's name opens its page, the bag closes
  // on the way, and the phone's back returns to where the bag was opened.
  await until(p, () => window.__bag()?.querySelector('[data-pair] [data-piece-card]'), null, 15000);
  s = await read(p);
  const from = p.url();
  const pairCard = s.cards[0];
  await p.locator(`[data-pair] [data-piece-card="${pairCard.handle}"] p a`).click();
  const reached = await until(p, (h) => location.pathname === `/jewellery/${h}` && !window.__bag() && document.querySelector('#root h1'), pairCard.handle, 30000);
  const reachedName = await p.evaluate(() => document.querySelector('#root h1')?.textContent.trim());
  check("the add-on's name opens its page, and the bag gets out of the way", reached && reachedName === pairCard.title.split(' · ')[0], `${new URL(p.url()).pathname} · ${reachedName}`);
  await p.goBack();
  await p.waitForTimeout(1200);
  check("the phone's back returns to where the bag was, the bag closed", p.url() === from && (await p.evaluate(() => !window.__bag())), new URL(p.url()).pathname);
  await openBagFromHeader(p);
  const lineHandle = (await read(p)).lines[0]?.handle;
  await p.locator(`[data-line="${lineHandle}"] [data-line-name]`).click();
  check("a piece's name in the bag opens its own page", await until(p, (h) => location.pathname === `/jewellery/${h}` && !window.__bag(), lineHandle, 30000), new URL(p.url()).pathname);
  check('no page errors through the whole visit', errors.length === 0, errors.slice(0, 3).join(' | '));
  check('the visit never left the shop for a real checkout page', log.left.length === 0, log.left.join(' | '));
  await ctx.close();
}

// B. A taller phone and a desktop: the same bag, nothing off the edge.
for (const view of [{ w: 390, h: 844, phone: true, name: '390' }, { w: 1280, h: 800, phone: false, name: 'desktop' }]) {
  const { ctx, p, errors } = await newPage(view);
  await openPdp(p);
  await addFromPdp(p);
  const lay = await p.evaluate(() => {
    const bag = window.__bag();
    const r = bag.getBoundingClientRect();
    const scroller = bag.querySelector('[data-line]').closest('.overflow-y-auto');
    return {
      left: Math.round(r.left),
      width: Math.round(r.width),
      vw: innerWidth,
      vh: innerHeight,
      footBottom: Math.round(bag.querySelector('[data-bag-foot]').getBoundingClientRect().bottom),
      sideways: bag.scrollWidth > bag.clientWidth + 1 || scroller.scrollWidth > scroller.clientWidth + 1,
      parts: ['[data-ladder]', '[data-line]', '[data-pair]', '[data-gift-row]', '[data-checkout]', '[data-trust]'].every((q) => bag.querySelector(q)),
    };
  });
  const ok = lay.parts && !lay.sideways && lay.footBottom <= lay.vh && (view.phone ? lay.width === lay.vw : lay.width <= 420 && Math.abs(lay.left + lay.width - lay.vw) <= 16);
  check(`${view.name}: the whole bag, button on screen, nothing off the edge${view.phone ? '' : ', a 420px panel on the right'}`, ok, JSON.stringify(lay));
  check(`${view.name}: no page errors`, errors.length === 0, errors.slice(0, 2).join(' | '));
  await shot(p, `7-${view.name}`);
  await ctx.close();
}

console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`);
await b.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
