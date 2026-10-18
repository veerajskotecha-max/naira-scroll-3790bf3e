// The metals, stones, sizes and months Shopify sells a piece in, end to end on
// a 390×844 Android phone: chosen on the product page, shown in the bag, and
// carried into the real Shopify cart as that variant; then the one-tap adds,
// and the catalogue-ad links of the new pieces.
//   node variantflow.mjs <base> [outDir]
// SRC=<dir> is the site's source (default /tmp/mainwt): its generated
// first-paint catalogue gives the variant ids and photos to expect, and its
// shopify.ts the public Storefront token for reading the cart back.
// Real Shopify carts, never an order. Ad and analytics requests and
// Shiprocket's checkout script are blocked (noreport.mjs), and window.open is
// a stand-in, so nothing reaches WhatsApp.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { NO_REPORT } from './noreport.mjs';

const [BASE, OUT] = process.argv.slice(2);
if (!BASE) {
  console.error('usage: node variantflow.mjs <base> [outDir]');
  process.exit(2);
}
if (OUT) mkdirSync(OUT, { recursive: true });
const SRC = process.env.SRC || '/tmp/mainwt';

const snapshotSrc = readFileSync(`${SRC}/src/data/jewellerySnapshot.ts`, 'utf8');
const catalogue = JSON.parse(snapshotSrc.slice(snapshotSrc.indexOf('= [') + 2, snapshotSrc.lastIndexOf('];') + 1));
const byHandle = new Map(catalogue.map((p) => [p.handle, p]));
const variantOf = (handle, options) =>
  byHandle.get(handle).variants.find((v) => Object.entries(options).every(([name, value]) => v.options[name] === value));
const shopifySrc = readFileSync(`${SRC}/src/lib/shopify.ts`, 'utf8');
const STOREFRONT = {
  url: `https://${shopifySrc.match(/SHOPIFY_STORE_PERMANENT_DOMAIN = "([^"]+)"/)[1]}/api/${shopifySrc.match(/SHOPIFY_API_VERSION = "([^"]+)"/)[1]}/graphql.json`,
  token: shopifySrc.match(/SHOPIFY_STOREFRONT_TOKEN = "([^"]+)"/)[1],
};
const SHIPROCKET = /fastrr-boost-ui\.pickrr\.com/i;
const ANDROID = 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};
const pathOf = (url) => String(url || '').split('?')[0].replace(/_(\d+x\d*|\d*x\d+)(?=\.\w+$)/, '');
const fileOf = (url) => pathOf(url).split('/').pop();

const STAND_INS = `
  Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
  window.__opened = [];
  window.open = function (url) { window.__opened.push(String(url)); return null; };
  window.__bag = function () {
    return [].slice.call(document.querySelectorAll('[role="dialog"][data-state="open"]'))
      .find(function (d) { return d.querySelector('[data-bag-foot], [data-ladder]') || /Your bag/.test((d.querySelector('h2') || {}).textContent || ''); }) || null;
  };
  // What a shopper sees after an ad tap: the URLs the page had, and whether the
  // piece's page ever waited ("Loading piece") or the apparel page mounted
  // first ("Loading product").
  window.__seen = { paths: [location.pathname], loading: false, apparel: false };
  new MutationObserver(function () {
    var s = window.__seen;
    if (s.paths[s.paths.length - 1] !== location.pathname) s.paths.push(location.pathname);
    var root = document.getElementById('root');
    var text = (root ? root.textContent || '' : '') + ' ' + document.title;
    if (/Loading piece/i.test(text)) s.loading = true;
    if (/Loading product/i.test(text)) s.apparel = true;
  }).observe(document, { subtree: true, childList: true, characterData: true });`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const newPage = async () => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: ANDROID });
  await ctx.addInitScript({ content: STAND_INS });
  await ctx.route('**/*', async (route) => {
    const q = route.request();
    const u = q.url();
    if (NO_REPORT.test(u) || SHIPROCKET.test(u) || q.resourceType() === 'media') return route.abort();
    try {
      const r = await fetch(u, { method: q.method(), headers: q.headers(), body: q.postDataBuffer() || undefined, redirect: 'manual' });
      const body = Buffer.from(await r.arrayBuffer());
      const headers = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers, body });
    } catch {
      await route.abort().catch(() => {});
    }
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  p.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (/Failed to load resource|net::ERR|payment manifest|^WebSocket connection to 'wss:\/\/[^']*supabase\.co\/realtime\/|^SSL certificate is not valid|CanMakePayment/.test(text)) return;
    if (/^Warning: React does not recognize the `%s` prop[\s\S]*\bfetchPriority\b/.test(text)) return;
    errors.push(text.slice(0, 200));
  });
  return { ctx, p, errors };
};

const shot = async (p, name) => {
  if (OUT) writeFileSync(`${OUT}/${name}.png`, await p.screenshot());
};
const until = (p, fn, arg, timeout = 30000) => p.waitForFunction(fn, arg, { timeout }).then(() => true, () => false);

const openPiece = async (p, handle) => {
  await p.goto(`${BASE}/jewellery/${handle}`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(
    () => [...document.querySelectorAll('#product-actions button')].some((x) => Object.keys(x).some((k) => k.startsWith('__react'))),
    null,
    { timeout: 90000 },
  );
  await p.waitForTimeout(1200);
};
// The option pickers as a shopper reads them.
const pickers = (p) =>
  p.evaluate(() =>
    [...document.querySelectorAll('[data-option]')].map((o) => ({
      name: o.dataset.option,
      label: (o.querySelector('span')?.textContent || '').replace(/\s+/g, ' ').trim(),
      radios: [...o.querySelectorAll('[role="radio"]')].map((r) => ({
        text: r.textContent.replace(/\s+/g, ' ').trim(),
        checked: r.getAttribute('aria-checked') === 'true',
        swatch: Boolean(r.querySelector('span[aria-hidden="true"][style*="background"]')),
      })),
      select: o.querySelector('select') && { value: o.querySelector('select').value, options: [...o.querySelectorAll('option')].map((x) => x.textContent.trim()) },
      guide: [...o.querySelectorAll('button')].some((x) => /size guide/i.test(x.textContent)),
    })),
  );
const legacyRingSizes = (p) => p.evaluate(() => Boolean(document.querySelector('[role="radiogroup"][aria-label="Ring size, US"]')));
const pick = async (p, option, value) => {
  const group = p.locator(`[data-option="${option}"]`);
  if (await group.locator('select').count()) await group.locator('select').selectOption(value);
  else await group.locator('[role="radio"]').filter({ hasText: new RegExp(`^\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*Pre-order)?\\s*$`) }).first().click();
  await p.waitForTimeout(500);
};
const pickLegacySize = async (p, size) => {
  await p.locator('[role="radiogroup"][aria-label="Ring size, US"] [role="radio"]').filter({ hasText: new RegExp(`^\\s*${size}`) }).first().click();
  await p.waitForTimeout(300);
};
const page = (p) =>
  p.evaluate(() => {
    const t = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
    const photo = [...document.querySelectorAll('button[aria-label$=" image 1 full screen"] img')].find((img) => img.offsetParent);
    const status = [...document.querySelectorAll('p')].map(t).find((x) => /is in stock and ships now|is sold out for now/.test(x)) || '';
    return {
      price: t(document.querySelector('#product-price span')),
      photo: photo?.getAttribute('src') || '',
      button: t(document.querySelector('#product-actions button')),
      sticky: t([...document.querySelectorAll('.fixed.bottom-0 button')].find((x) => /add to cart|reserve now/i.test(x.textContent))),
      status,
    };
  });
const stored = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('naira-shopify-cart') || '{"items":[]}'));
const pieces = async (p) => (await stored(p)).items.reduce((t, i) => t + i.quantity, 0);
const addToBag = async (p) => {
  const before = await pieces(p);
  await p.locator('#product-actions button', { hasText: /add to cart/i }).first().click();
  const added = await until(p, (n) => JSON.parse(localStorage.getItem('naira-shopify-cart') || '{"items":[]}').items.reduce((t, i) => t + i.quantity, 0) > n, before);
  await until(p, () => window.__bag()?.querySelector('[data-line]'), null, 15000);
  await p.waitForTimeout(700);
  return added;
};
const closeBag = async (p) => {
  await p.keyboard.press('Escape');
  await until(p, () => !window.__bag(), null, 10000);
  await p.waitForTimeout(400);
};
const bagLines = (p) =>
  p.evaluate(() =>
    [...(window.__bag()?.querySelectorAll('[data-line]') ?? [])].map((li) => {
      const t = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
      const after = li.querySelector('[data-line-name] + p');
      return {
        handle: li.dataset.line,
        variant: li.dataset.variant,
        options: after && !after.hasAttribute('data-line-price') ? t(after) : '',
        price: t(li.querySelector('[data-line-price] > span')),
        qty: Number(t(li.querySelector('[aria-label^="Quantity"]'))) || 1,
        img: li.querySelector('img')?.getAttribute('src') || '',
      };
    }),
  );
// The cart as Shopify holds it: what checkout will charge for.
const shopifyCart = async (p) => {
  const { cartId } = await stored(p);
  if (!cartId) return [];
  return p.evaluate(
    async ({ url, token, id }) => {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
        body: JSON.stringify({
          query: 'query($id: ID!) { cart(id: $id) { lines(first: 50) { edges { node { quantity attributes { key value } merchandise { ... on ProductVariant { id title product { handle } } } } } } } }',
          variables: { id },
        }),
      });
      const json = await r.json();
      return (json.data?.cart?.lines.edges ?? []).map(({ node }) => ({
        handle: node.merchandise.product.handle,
        variant: node.merchandise.id,
        title: node.merchandise.title,
        qty: node.quantity,
        attrs: Object.fromEntries(node.attributes.map((a) => [a.key, a.value])),
      }));
    },
    { url: STOREFRONT.url, token: STOREFRONT.token, id: cartId },
  );
};

// A. Baguette Huggies: four stones, each its own variant, photo and line.
{
  const { ctx, p, errors } = await newPage();
  const H = 'baguette-huggies';
  const ruby = variantOf(H, { Stone: 'Ruby' });
  const emerald = variantOf(H, { Stone: 'Emerald' });
  await openPiece(p, H);
  let ui = await pickers(p);
  const stone = ui.find((o) => o.name === 'Stone');
  check(
    'Huggies: a Stone picker with Ruby, Crystal, Emerald, Amethyst, each with its colour; opens on Ruby',
    ui.length === 1 && stone?.radios.map((r) => r.text).join(',') === 'Ruby,Crystal,Emerald,Amethyst' && stone.radios.every((r) => r.swatch) && stone.radios[0].checked,
    JSON.stringify(ui),
  );
  await pick(p, 'Stone', 'Emerald');
  ui = await pickers(p);
  let view = await page(p);
  check(
    'choosing Emerald checks it, names it, and leads the gallery with the Emerald photo',
    ui[0].radios.find((r) => r.text === 'Emerald')?.checked && /Emerald/.test(ui[0].label) && fileOf(view.photo) === fileOf(emerald.image),
    `${ui[0].label} · ${fileOf(view.photo)} vs ${fileOf(emerald.image)}`,
  );
  check('the price stays ₹1,199', view.price === '₹1,199', view.price);
  await shot(p, 'a-huggies-emerald');
  await addToBag(p);
  let lines = await bagLines(p);
  check(
    'Add to cart puts Emerald in the bag, named and pictured as Emerald',
    lines.length === 1 && lines[0].variant === emerald.id && lines[0].options === 'Stone: Emerald' && fileOf(lines[0].img) === fileOf(emerald.image),
    JSON.stringify(lines),
  );
  await closeBag(p);
  await pick(p, 'Stone', 'Ruby');
  await addToBag(p);
  lines = await bagLines(p);
  check(
    'a Ruby pair goes on its own line beside the Emerald (they used to merge into one line)',
    lines.length === 2 && lines.some((l) => l.variant === ruby.id && l.options === 'Stone: Ruby' && l.qty === 1) && lines.some((l) => l.variant === emerald.id && l.qty === 1),
    JSON.stringify(lines.map((l) => [l.options, l.qty])),
  );
  await shot(p, 'a-huggies-bag');
  await closeBag(p);
  await addToBag(p);
  lines = await bagLines(p);
  check('a second Ruby pair counts on the Ruby line', lines.length === 2 && lines.find((l) => l.variant === ruby.id)?.qty === 2, JSON.stringify(lines.map((l) => [l.options, l.qty])));
  const cart = await shopifyCart(p);
  check(
    'Shopify\'s cart holds the Emerald variant ×1 and the Ruby variant ×2, no size note',
    cart.length === 2 && cart.find((l) => l.variant === emerald.id)?.qty === 1 && cart.find((l) => l.variant === ruby.id)?.qty === 2 && cart.every((l) => !l.attrs.Size),
    JSON.stringify(cart.map((l) => [l.title, l.qty, l.attrs])),
  );
  // The piece beside it in the anchor's stone: "Complete the look" offers the
  // tennis bracelet in Ruby now that Ruby is chosen.
  await p.waitForSelector('section[aria-labelledby="complete-the-look"] article', { timeout: 15000 }).catch(() => {});
  const look = await p.evaluate(() =>
    [...document.querySelectorAll('section[aria-labelledby="complete-the-look"] article')].map((a) => ({ href: a.querySelector('a')?.getAttribute('href') || '', variant: a.dataset.variant || '' })),
  );
  const withStone = look.filter((c) => {
    const h = c.href.split('/').pop();
    return byHandle.get(h)?.options?.some((o) => o.name === 'Stone' && o.values.includes('Ruby')) && c.variant;
  });
  check(
    '"Complete the look" offers a piece sold in stones in the stone chosen here',
    withStone.every((c) => c.variant.split(' · ')[0] === 'Ruby'),
    withStone.length ? withStone.map((c) => `${c.href} → ${c.variant}`).join(', ') : `no stone piece in the row (${look.map((c) => c.href).join(', ')})`,
  );
  check('Huggies: no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// B. Tubogas Dome Ring: a metal and a US size, one variant for the pair.
{
  const { ctx, p, errors } = await newPage();
  const H = 'tubogas-dome-ring';
  const silver7 = variantOf(H, { Metal: 'Silver', Size: '7' });
  await openPiece(p, H);
  let ui = await pickers(p);
  check(
    'Tubogas: Metal (Gold, Silver) and Size · US (6, 7, 8) with the size guide; no second size list',
    ui.map((o) => o.name).join(',') === 'Metal,Size' &&
      ui[0].radios.map((r) => r.text).join(',') === 'Gold,Silver' &&
      ui[1].radios.map((r) => r.text).join(',') === '6,7,8' &&
      /^Size · US/.test(ui[1].label) &&
      ui[1].guide &&
      !(await legacyRingSizes(p)),
    JSON.stringify(ui.map((o) => [o.name, o.label, o.radios.map((r) => r.text)])),
  );
  let view = await page(p);
  check('opens on Gold, size 6: "US 6 is in stock and ships now."', ui[0].radios[0].checked && ui[1].radios[0].checked && view.status === 'US 6 is in stock and ships now.', view.status);
  await pick(p, 'Metal', 'Silver');
  await pick(p, 'Size', '7');
  view = await page(p);
  check('Silver, 7: the status follows, the Silver photo leads', view.status === 'US 7 is in stock and ships now.' && fileOf(view.photo) === fileOf(silver7.image), `${view.status} · ${fileOf(view.photo)}`);
  await shot(p, 'b-tubogas-silver-7');
  await addToBag(p);
  const lines = await bagLines(p);
  check('the bag line reads "Metal: Silver · Size: 7" for the Silver/7 variant', lines.length === 1 && lines[0].options === 'Metal: Silver · Size: 7' && lines[0].variant === silver7.id, JSON.stringify(lines));
  const cart = await shopifyCart(p);
  check('Shopify\'s cart holds Silver / 7 itself, with no size note', cart.length === 1 && cart[0].variant === silver7.id && cart[0].title === 'Silver / 7' && !cart[0].attrs.Size, JSON.stringify(cart));
  await shot(p, 'b-tubogas-bag');
  check('Tubogas: no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// C. Triple Coil Wrap Bangle: priced by metal.
{
  const { ctx, p, errors } = await newPage();
  const H = 'triple-coil-wrap-bangle';
  await openPiece(p, H);
  let view = await page(p);
  check('Coil bangle: opens on Gold at ₹1,899', view.price === '₹1,899', view.price);
  await pick(p, 'Metal', 'Silver');
  view = await page(p);
  check('Silver shows ₹1,799 on the page and on the phone\'s buy bar', view.price === '₹1,799' && /₹1,799/.test(view.sticky), `${view.price} · ${view.sticky}`);
  await addToBag(p);
  const lines = await bagLines(p);
  check('the bag charges ₹1,799 for "Metal: Silver"', lines.length === 1 && lines[0].price === '₹1,799' && lines[0].options === 'Metal: Silver', JSON.stringify(lines));
  check('Coil bangle: no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// D. Birthstone Heart Necklace: twelve months in a list.
{
  const { ctx, p, errors } = await newPage();
  const H = 'birthstone-heart-necklace';
  const may = variantOf(H, { Month: 'May · Emerald' });
  await openPiece(p, H);
  let ui = await pickers(p);
  check(
    'Birthstone: a Month list of all twelve, opening on January · Garnet',
    ui.length === 1 && ui[0].select?.options.length === 12 && ui[0].select.value === 'January · Garnet',
    JSON.stringify(ui[0]?.select),
  );
  await pick(p, 'Month', 'May · Emerald');
  const view = await page(p);
  check('May leads with the May photo', fileOf(view.photo) === fileOf(may.image), fileOf(view.photo));
  await shot(p, 'd-birthstone-may');
  await addToBag(p);
  const lines = await bagLines(p);
  check('the bag line reads "Month: May · Emerald"', lines.length === 1 && lines[0].options === 'Month: May · Emerald' && lines[0].variant === may.id, JSON.stringify(lines));
  check('Birthstone: no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// E. Golden Duet Ring: sizes 7 and 8 sold out — reserved, not added.
{
  const { ctx, p, errors } = await newPage();
  const H = 'golden-duet-ring';
  await openPiece(p, H);
  const ui = await pickers(p);
  check(
    'Duet ring: Ring size 6 to buy, 7 and 8 marked Pre-order',
    ui.length === 1 && ui[0].radios.map((r) => r.text).join(',') === '6,7Pre-order,8Pre-order' && !(await legacyRingSizes(p)),
    JSON.stringify(ui[0]?.radios),
  );
  await pick(p, 'Ring size', '7');
  const view = await page(p);
  check(
    'size 7: "Reserve now", and the line says it is sold out',
    /^Reserve now/.test(view.button) && view.status === 'Size 7 is sold out for now. Reserve it and we will confirm the date on WhatsApp.',
    `${view.button} · ${view.status}`,
  );
  await p.locator('#product-actions button', { hasText: /reserve now/i }).first().click();
  await p.waitForTimeout(500);
  const opened = await p.evaluate(() => window.__opened);
  const text = decodeURIComponent((opened[0] || '').split('text=')[1] || '');
  check('Reserve opens WhatsApp for the piece in size 7, and nothing goes in the bag', /Golden Duet Ring" in size 7 \(₹1,399\)/.test(text) && (await pieces(p)) === 0, text.slice(0, 120));
  await shot(p, 'e-duet-7');
  check('Duet ring: no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// F. Star Point Band: gold or silver from Shopify, a US size from the list.
{
  const { ctx, p, errors } = await newPage();
  const H = 'star-point-band';
  await openPiece(p, H);
  const live = await until(p, () => document.querySelector('[data-option="Metal"]'), null, 30000);
  check('Star Point Band: the Metal choice arrives with the live catalogue, beside the US size list', live && (await legacyRingSizes(p)));
  await pick(p, 'Metal', 'Silver');
  await pickLegacySize(p, '6');
  await addToBag(p);
  const lines = await bagLines(p);
  check('the bag line reads "Metal: Silver · Size: US 6"', lines.length === 1 && lines[0].options === 'Metal: Silver · Size: US 6', JSON.stringify(lines));
  const cart = await shopifyCart(p);
  check('Shopify holds the Silver variant with the size note "US 6"', cart.length === 1 && cart[0].title === 'Silver' && cart[0].attrs.Size === 'US 6', JSON.stringify(cart));
  check('Star Point Band: no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// G. Cushion Halo Ring, sold one way: as before, a size note on the one variant.
{
  const { ctx, p, errors } = await newPage();
  await openPiece(p, 'cushion-halo-ring');
  const ui = await pickers(p);
  check('Cushion Halo Ring: the US size list, no option pickers', ui.length === 0 && (await legacyRingSizes(p)), JSON.stringify(ui));
  await pickLegacySize(p, '6');
  await addToBag(p);
  const lines = await bagLines(p);
  const cart = await shopifyCart(p);
  check('the line reads "Size: US 6" and Shopify carries the note', lines[0]?.options === 'Size: US 6' && cart[0]?.attrs.Size === 'US 6', `${JSON.stringify(lines)} · ${JSON.stringify(cart)}`);
  check('Cushion Halo Ring: no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// H. One-tap adds on the listing: a size goes to the page, a stone is added as
// the shopper will see it in the bag.
{
  const { ctx, p, errors } = await newPage();
  await p.goto(`${BASE}/jewellery`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => [...document.querySelectorAll('article button')].some((x) => Object.keys(x).some((k) => k.startsWith('__react'))), null, { timeout: 90000 });
  // The whole live catalogue, thirty at a time.
  await until(p, () => [...document.querySelectorAll('button')].some((x) => /^SHOW MORE/.test(x.textContent.trim())), null, 30000);
  for (let i = 0; i < 6; i++) {
    const more = p.locator('button', { hasText: /^SHOW MORE/ }).first();
    if (!(await more.count())) break;
    await more.click();
    await p.waitForTimeout(800);
  }
  const find = (name) => p.evaluate((name) => {
    const card = [...document.querySelectorAll('article')].find((a) => a.querySelector(`a[aria-label="View ${name}"]`));
    if (!card) return null;
    const choose = card.querySelector('a[aria-label^="Choose a "]');
    return { choose: choose ? { text: choose.textContent.trim(), href: choose.getAttribute('href') } : null, add: Boolean([...card.querySelectorAll('button')].find((x) => /add to cart/i.test(x.textContent))) };
  }, name);
  const ring = await find('Tubogas Dome Ring');
  const month = await find('Birthstone Heart Necklace');
  const metal = await find('Triple Coil Wrap Bangle');
  check(
    'listing: Tubogas asks for a size, the birthstone for a month, the bangle adds',
    ring?.choose?.text === 'CHOOSE SIZE' && ring.choose.href === '/jewellery/tubogas-dome-ring' && month?.choose?.text === 'CHOOSE MONTH' && metal?.add && !metal.choose,
    JSON.stringify({ ring, month, metal }),
  );
  if (metal?.add) {
    const card = p.locator('article', { has: p.locator('a[aria-label="View Triple Coil Wrap Bangle"]') }).first();
    await card.scrollIntoViewIfNeeded();
    await card.locator('button', { hasText: /add to cart/i }).click();
    await until(p, () => JSON.parse(localStorage.getItem('naira-shopify-cart') || '{"items":[]}').items.length > 0);
    await until(p, () => window.__bag()?.querySelector('[data-line]'), null, 15000);
    await p.waitForTimeout(600);
    const lines = await bagLines(p);
    const gold = variantOf('triple-coil-wrap-bangle', { Metal: 'Gold' });
    check('the bangle goes in as Gold, named on the line', lines.length === 1 && lines[0].variant === gold.id && lines[0].options === 'Metal: Gold' && lines[0].price === '₹1,899', JSON.stringify(lines));
    await shot(p, 'h-listing-bag');
  }
  check('listing: no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// I. Catalogue-ad links of the new pieces: straight to the piece, no apparel
// page, no "Loading piece".
{
  const ADS = (process.env.ADS || 'baguette-huggies,tubogas-dome-ring,birthstone-heart-necklace,silk-mesh-cuff,crystal-pear-ear-cuff,emerald-square-ear-cuff').split(',');
  for (const h of ADS) {
    const { ctx, p, errors } = await newPage();
    const name = byHandle.get(h)?.name;
    const t0 = Date.now();
    await p.goto(`${BASE}/products/${h}?fbclid=variantflow`, { waitUntil: 'domcontentloaded' });
    const drawn = await until(p, (name) => document.querySelector('#root h1')?.textContent.trim() === name, name, 60000);
    const ms = Date.now() - t0;
    await p.waitForTimeout(800);
    const seen = await p.evaluate(() => ({ ...window.__seen, path: location.pathname, search: location.search }));
    check(
      `ad link /products/${h}: lands on /jewellery/${h} with the piece drawn, never "Loading piece"`,
      drawn &&
        seen.path === `/jewellery/${h}` &&
        seen.search === '?fbclid=variantflow' &&
        !seen.loading &&
        !seen.apparel &&
        seen.paths.slice(1).every((x) => x === `/jewellery/${h}`),
      `${ms} ms · paths ${seen.paths.join(' → ')}${seen.loading ? ' · showed Loading piece' : ''}`,
    );
    if (errors.length) check(`ad link ${h}: no page errors`, false, errors.join(' | '));
    await ctx.close();
  }
}

await b.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
