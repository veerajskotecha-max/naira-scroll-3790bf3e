// A jewellery product page on a phone: does every control work, and does back?
//   node pdpaudit.mjs <base> [handle=prism-riviere-bracelet] [ring=cushion-halo-ring]
// Journeys: the page's ← and the phone's back from every way a shopper arrives
// (the listing, a fresh tab, another site, an ad link), after the reviews jump
// and the bag, and with each pop-up open (bag, photo zoom, ring size guide,
// menu, search, wishlist). Back closes a pop-up and stays on the piece; the
// page's ← goes back inside Naira, never off the site and never nowhere.
// Sweep: every visible button and link on the page (fold-downs opened), tapped
// one at a time on a fresh load, must visibly do something: open, toggle,
// navigate, add, play or scroll. External links are checked, not followed.
// Network through Node (the sandbox CA); nothing reaches an ad or analytics
// account (noreport.mjs).
//   ONLY=journeys|sweep   one part     SWEEP=<path>   sweep another page
//   LIST=1                with ONLY=sweep: list the controls it would tap, tap none
//   ONLY=listing          the listing and a collection: back lands on the card opened
//   SAMPLE=3              tap at most 3 of each kind of control (a grid's cards, a row's chips)
import { chromium } from 'playwright';
import { NO_REPORT } from './noreport.mjs';
const [BASE, HANDLE = 'prism-riviere-bracelet', RING = 'cushion-halo-ring'] = process.argv.slice(2);
const PDP = `/jewellery/${HANDLE}`;
const RING_PDP = `/jewellery/${RING}`;
const UA = 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const newPage = async (desktop = false) => {
  const ctx = await b.newContext(desktop ? { viewport: { width: 1440, height: 900 } }
    : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA });
  await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
  const traffic = { api: 0 };
  await ctx.route('**/*', async (route) => {
    const q = route.request(); const u = q.url();
    if (NO_REPORT.test(u)) return route.abort();
    if (/graphql\.json|supabase\.co\/(rest|functions)|serviceab|pincode/i.test(u)) traffic.api++;
    try {
      const r = await fetch(u, { method: q.method(), headers: q.headers(), body: q.postDataBuffer() || undefined, redirect: 'manual' });
      const body = Buffer.from(await r.arrayBuffer());
      await route.fulfill({ status: r.status, headers: Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k))), body });
    } catch { await route.abort().catch(() => {}); }
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));
  return { ctx, p, errors, traffic };
};
const pathOf = (p) => { const u = new URL(p.url()); return u.origin === new URL(BASE).origin ? u.pathname : u.href; };
const reactReady = (p) => p.waitForFunction(() => Object.keys(document.getElementById('root')?.firstElementChild || {}).some((k) => k.startsWith('__react')), null, { timeout: 30000 });
const pdpReady = (p) => p.waitForFunction(() => [...document.querySelectorAll('#product-actions button')].some((x) => /add to cart|pre-order|reserve/i.test(x.textContent) && Object.keys(x).some((k) => k.startsWith('__react'))), null, { timeout: 30000 });
const settle = (p, ms = 1200) => p.waitForTimeout(ms);
// big fixed layers on screen: the bag, the menu, a zoom, a dialog
const overlays = (p) => p.evaluate(() => [...document.querySelectorAll('body *')].filter((el) => {
  const cs = getComputedStyle(el);
  if (cs.position !== 'fixed' || cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.1) return false;
  const r = el.getBoundingClientRect();
  return Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) > innerWidth * innerHeight * 0.4;
}).length);
const tapPageBack = async (p) => {
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await settle(p, 300);
  await p.locator('button[aria-label="Go back"]:visible').first().click();
  await settle(p);
};
const fromListing = async (p, desktop = false) => {
  await p.goto(`${BASE}/jewellery`, { waitUntil: 'domcontentloaded' });
  await reactReady(p);
  await settle(p, 1000);
  const card = p.locator(`#root a[href="${PDP}"]:visible`).first();
  const target = (await card.count()) ? card : p.locator('#root a[href^="/jewellery/"]:not([href*="/collections/"]):visible').first();
  const href = await target.getAttribute('href');
  await target.scrollIntoViewIfNeeded();
  await target.click();
  await pdpReady(p);
  await settle(p, 800);
  return href;
};
const addToBag = async (p) => {
  await p.locator('#product-actions button', { hasText: /add to cart|pre-order|reserve/i }).first().click();
  await p.waitForSelector('[role="dialog"][data-state="open"]', { timeout: 15000 });
  await settle(p, 1500);
};

const journeys = async () => {
  {
    const { ctx, p } = await newPage();
    const at = await fromListing(p);
    await tapPageBack(p);
    check('listing → piece → the page’s ← returns to the listing', pathOf(p) === '/jewellery', `${at} → ${pathOf(p)}`);
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    await fromListing(p);
    await p.goBack(); await settle(p);
    check('listing → piece → phone back returns to the listing', pathOf(p) === '/jewellery', pathOf(p));
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    await p.goto(BASE + PDP, { waitUntil: 'domcontentloaded' }); await pdpReady(p); await settle(p, 800);
    await tapPageBack(p);
    const at = pathOf(p);
    check('opened in a new tab → ← goes to Naira jewellery', at.startsWith('/jewellery') && at !== PDP, at);
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    await p.goto('about:blank');
    await p.goto(BASE + PDP, { waitUntil: 'domcontentloaded' }); await pdpReady(p); await settle(p, 800);
    await tapPageBack(p);
    const at = pathOf(p);
    check('came from another site (Google, WhatsApp) → ← stays on Naira', at.startsWith('/jewellery') && at !== PDP, at);
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    await p.goto(`${BASE}/products/${HANDLE}?utm_source=facebook&fbclid=TESTCLICK`, { waitUntil: 'domcontentloaded' }); await pdpReady(p); await settle(p, 800);
    await tapPageBack(p);
    const at = pathOf(p);
    check('ad link → ← goes to Naira jewellery', at.startsWith('/jewellery') && at !== PDP, at);
    await ctx.close();
  }
  for (const how of ['←', 'phone back']) {
    const { ctx, p } = await newPage();
    await fromListing(p);
    const rating = p.locator('#root a[href="#customer-reviews"]:visible').first();
    if (!(await rating.count())) { check(`after the reviews link, ${how} returns to the listing`, true, 'no rating link on this piece'); await ctx.close(); continue; }
    await rating.click(); await settle(p);
    if (how === '←') await tapPageBack(p); else { await p.goBack(); await settle(p); }
    check(`after the reviews link, ${how} returns to the listing`, pathOf(p) === '/jewellery', pathOf(p) + (new URL(p.url()).hash || ''));
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    await fromListing(p);
    await addToBag(p);
    await p.locator('[role="dialog"][data-state="open"] button[aria-label="Back to shopping"]:visible').first().click(); await settle(p);
    const bagGone = !(await p.$('[role="dialog"][data-state="open"]'));
    await tapPageBack(p);
    check('bag opened and closed, then ← returns to the listing', bagGone && pathOf(p) === '/jewellery', `${bagGone ? 'bag closed' : 'bag still open'} · ${pathOf(p)}`);
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    const at = await fromListing(p);
    await addToBag(p);
    await p.goBack(); await settle(p);
    const open = !!(await p.$('[role="dialog"][data-state="open"]'));
    check('phone back closes the bag and stays on the piece', !open && pathOf(p) === at, `${open ? 'bag still open' : 'bag closed'} · ${pathOf(p)}`);
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    const at = await fromListing(p);
    const before = await overlays(p);
    await p.locator('#root button[aria-label$="full screen"]:visible').first().click(); await settle(p);
    const opened = (await overlays(p)) > before;
    await p.goBack(); await settle(p);
    const still = (await overlays(p)) > before;
    check('phone back closes the photo zoom and stays on the piece', opened && !still && pathOf(p) === at, `opened ${opened} · after back ${still ? 'zoom still open' : 'closed'} · ${pathOf(p)}`);
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    await p.goto(`${BASE}/jewellery`, { waitUntil: 'domcontentloaded' }); await reactReady(p);
    await p.goto(BASE + RING_PDP, { waitUntil: 'domcontentloaded' }); await pdpReady(p); await settle(p, 800);
    await p.locator('#root button', { hasText: /^Size guide$/ }).first().click(); await settle(p);
    const opened = await p.locator('[aria-label="Ring size chart"]:visible').count();
    await p.goBack(); await settle(p);
    const still = await p.locator('[aria-label="Ring size chart"]:visible').count();
    check('phone back closes the ring size guide and stays on the ring', opened > 0 && !still && pathOf(p) === RING_PDP, `opened ${opened > 0} · after back ${still ? 'guide still open' : 'closed'} · ${pathOf(p)}`);
    await ctx.close();
  }
  for (const [label, name] of [['Open menu', 'menu'], ['Search', 'search'], ['Open wishlist', 'wishlist'], ['Open cart', 'bag from the header']]) {
    const { ctx, p } = await newPage();
    const at = await fromListing(p);
    const before = await overlays(p);
    await p.locator(`button[aria-label="${label}"]:visible`).first().click(); await settle(p);
    const opened = (await overlays(p)) > before;
    await p.goBack(); await settle(p);
    const still = (await overlays(p)) > before;
    check(`phone back closes the ${name} and stays on the piece`, opened && !still && pathOf(p) === at, `opened ${opened} · after back ${still ? 'still open' : 'closed'} · ${pathOf(p)}`);
    await ctx.close();
  }
  // Closed its own way (the cross), a pop-up leaves no step behind: back still goes to the listing.
  for (const [name, open, close] of [
    ['photo zoom', (p) => p.locator('#root button[aria-label$="full screen"]:visible').first().click(), (p) => p.locator('button[aria-label="Close image viewer"]:visible').first().click()],
    ['search', (p) => p.locator('button[aria-label="Search"]:visible').first().click(), (p) => p.locator('button[aria-label="Close search"]:visible').last().click()],
    ['bag', (p) => addToBag(p), (p) => p.locator('[role="dialog"][data-state="open"] button[aria-label="Back to shopping"]:visible').first().click()],
  ]) {
    const { ctx, p } = await newPage();
    await fromListing(p);
    const before = await overlays(p);
    await open(p); await settle(p);
    await close(p); await settle(p);
    const closed = (await overlays(p)) <= before;
    await p.goBack(); await settle(p);
    check(`${name} closed with its cross, then phone back returns to the listing`, closed && pathOf(p) === '/jewellery', `${closed ? 'closed' : 'still open'} · ${pathOf(p)}`);
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    await p.goto(`${BASE}/jewellery`, { waitUntil: 'domcontentloaded' }); await reactReady(p);
    await p.goto(BASE + RING_PDP, { waitUntil: 'domcontentloaded' }); await pdpReady(p); await settle(p, 800);
    await p.locator('#root button', { hasText: /^Size guide$/ }).first().click(); await settle(p);
    await p.locator('button[aria-label="Close ring size chart"]:visible').first().click(); await settle(p);
    await tapPageBack(p);
    check('size guide closed with its cross, then ← leaves the ring for the listing', pathOf(p) === '/jewellery', pathOf(p));
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    const at = await fromListing(p);
    await p.locator('button[aria-label="Search"]:visible').first().click(); await settle(p, 600);
    await p.locator('input[type="search"]:visible, input[placeholder*="earch" i]:visible').first().fill('ring');
    await settle(p, 1500);
    const hit = p.locator('li > a[href^="/jewellery/"]:visible').first(); // a result row in the search list
    const href = await hit.getAttribute('href').catch(() => null);
    await hit.click(); await settle(p, 1500);
    const landed = pathOf(p);
    await p.goBack(); await settle(p);
    const searchStill = await p.locator('button[aria-label="Close search"]:visible').count();
    check('search → a result → phone back returns to the piece, search closed', landed === href && pathOf(p) === at && !searchStill, `${at} → ${landed} → back → ${pathOf(p)}${searchStill ? ' (search open again)' : ''}`);
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    const first = await fromListing(p);
    const other = p.locator(`#root a[href^="/jewellery/"]:not([href*="/collections/"]):not([href="${first}"])`).first();
    await other.scrollIntoViewIfNeeded();
    const href = await other.getAttribute('href');
    await other.click(); await pdpReady(p); await settle(p, 800);
    await tapPageBack(p);
    check('piece → another piece (complete the look) → ← returns to the first piece', pathOf(p) === first, `${href} → ← → ${pathOf(p)}`);
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage(true);
    await fromListing(p);
    await p.locator('button[aria-label="Go back"]:visible').first().click(); await settle(p);
    check('laptop: listing → piece → Back returns to the listing', pathOf(p) === '/jewellery', pathOf(p));
    await ctx.close();
  }
};

// The listing and a collection: back lands on the card the shopper opened,
// with the filter they chose, after "Show more" too.
const GRID = '#root .grid a[href^="/jewellery/"]:not([href*="/collections/"])';
const openFromGrid = async (p, nth) => {
  const link = p.locator(GRID).nth(nth);
  await link.scrollIntoViewIfNeeded();
  await settle(p, 500);
  const href = await link.getAttribute('href');
  await link.click();
  await pdpReady(p);
  await settle(p, 800);
  return href;
};
const cardOnScreen = (p, href) => p.evaluate((href) => {
  const a = [...document.querySelectorAll(`#root .grid a[href="${href}"]`)].find((x) => x.getBoundingClientRect().height > 0);
  if (!a) return 'not in the grid';
  const r = a.getBoundingClientRect();
  return r.bottom > 60 && r.top < innerHeight - 40 ? 'on screen' : `off screen (top ${Math.round(r.top)}, scrollY ${Math.round(scrollY)})`;
}, href);
const listingJourneys = async () => {
  for (const [label, more, nth] of [['a card in the first 12', 0, 8], ['a card after “Show more”', 1, 17]]) {
    for (const how of ['←', 'phone back']) {
      const { ctx, p } = await newPage();
      await p.goto(`${BASE}/jewellery`, { waitUntil: 'domcontentloaded' }); await reactReady(p); await settle(p, 1500);
      for (let i = 0; i < more; i++) { await p.locator('#root button', { hasText: /^SHOW MORE/ }).first().click(); await settle(p, 900); }
      const href = await openFromGrid(p, nth);
      if (how === '←') await tapPageBack(p); else { await p.goBack(); await settle(p); }
      await settle(p, 800);
      const where = await cardOnScreen(p, href);
      check(`listing → ${label} → ${how} lands back on that card`, pathOf(p) === '/jewellery' && where === 'on screen', `${pathOf(p)} · ${href.split('/').pop()} ${where}`);
      await ctx.close();
    }
  }
  {
    const { ctx, p } = await newPage();
    await p.goto(`${BASE}/jewellery`, { waitUntil: 'domcontentloaded' }); await reactReady(p); await settle(p, 1500);
    await p.locator('#root button', { hasText: /^rings$/i }).first().click(); await settle(p, 900);
    const chosen = new URL(p.url()).search;
    const href = await openFromGrid(p, 3);
    await p.goBack(); await settle(p, 1600);
    const where = await cardOnScreen(p, href);
    check('the Rings filter survives opening a ring and coming back', /rings/i.test(chosen) && new URL(p.url()).search === chosen && where === 'on screen', `${chosen} → ${new URL(p.url()).search} · ${where}`);
    await ctx.close();
  }
  {
    const { ctx, p } = await newPage();
    const coll = '/jewellery/collections/anti-tarnish-jewellery';
    await p.goto(BASE + coll, { waitUntil: 'domcontentloaded' }); await reactReady(p); await settle(p, 1500);
    const href = await openFromGrid(p, 5);
    await p.goBack(); await settle(p, 1600);
    const where = await cardOnScreen(p, href);
    check('collection → a piece → phone back lands back on that card', pathOf(p) === coll && where === 'on screen', `${pathOf(p)} · ${where}`);
    await ctx.close();
  }
};

// Every control, one at a time on a fresh load.
const KEY = `(el) => [el.tagName.toLowerCase(), el.getAttribute('aria-label') || '', (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40), el.getAttribute('href') || ''].join('|')`;
const isPiece = (path) => /^\/jewellery\/(?!collections\/)[^/]+$/.test(path);
const prepare = async (p, path) => {
  await p.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  if (isPiece(path)) await pdpReady(p);
  else await p.waitForFunction(() => document.querySelector('#root h1') && Object.keys(document.getElementById('root')?.firstElementChild || {}).some((k) => k.startsWith('__react')), null, { timeout: 30000 });
  // mount the lazy sections, open the fold-downs, come back to the top
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    document.querySelectorAll('#root details').forEach((d) => { d.open = true; });
    window.scrollTo(0, 0);
  });
  await settle(p, 1500);
};
const sweep = async (path) => {
  const { ctx, p } = await newPage();
  await prepare(p, path);
  const controls = await p.evaluate((KEY) => {
    const key = eval(KEY);
    // a strip that really scrolls sideways (a drawer that only scrolls down reports overflow-x auto too)
    const strip = (el) => { for (let a = el.parentElement; a; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if ((ox === 'auto' || ox === 'scroll') && a.scrollWidth > a.clientWidth + 1) return true; } return false; };
    // a fixed bar slid off the screen (the buy bar before it is needed) can't be tapped until it slides in
    const parked = (el) => { const r = el.getBoundingClientRect(); for (let a = el; a; a = a.parentElement) if (getComputedStyle(a).position === 'fixed') return r.top >= innerHeight || r.bottom <= 0; return false; };
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 4 && r.height > 4 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.pointerEvents !== 'none' && !el.closest('footer') && !el.closest('[aria-hidden="true"]') && !parked(el)
      && el.getAttribute('aria-checked') !== 'true' && el.getAttribute('aria-pressed') !== 'true' // the option already chosen: tapping it again rightly does nothing
      && el.getAttribute('aria-current') !== 'page' && !(el.getAttribute('href') === location.pathname) // a link to this very page
      && ((r.right > 0 && r.left < innerWidth) || strip(el)); };
    const seen = {};
    return [...document.querySelectorAll('#root button, #root a[href], #root summary, #root [role="button"]')].filter(vis).map((el) => {
      const k = key(el); seen[k] = (seen[k] ?? -1) + 1;
      return { key: k, nth: seen[k], kind: `${el.tagName}.${el.className}`, label: el.getAttribute('aria-label') || (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 44) || el.getAttribute('href'), href: el.getAttribute('href'), target: el.getAttribute('target'), disabled: !!el.disabled };
    });
  }, KEY).then((all) => {
    const n = Number(process.env.SAMPLE || 0);
    if (!n) return all;
    const per = {};
    return all.filter((c) => (per[c.kind] = (per[c.kind] ?? 0) + 1) <= n);
  });
  await ctx.close();
  if (process.env.LIST) { console.log(`${path}: ${controls.length} controls\n  ` + controls.map((c) => c.label.slice(0, 40)).join('\n  ')); return; }
  const origin = new URL(BASE).origin;
  const rows = [];
  for (const c of controls) {
    if (c.disabled) { rows.push([c, 'skip', 'disabled']); continue; }
    if (c.href && /^(mailto:|tel:)/.test(c.href)) { rows.push([c, 'ok', c.href.slice(0, 40)]); continue; }
    if (c.href && /^https?:/.test(c.href) && new URL(c.href).origin !== origin) {
      const ok = /^https:\/\/(wa\.me|api\.whatsapp\.com|www\.instagram\.com|instagram\.com)\//.test(c.href) || /^https:\/\//.test(c.href);
      rows.push([c, ok ? 'ok' : 'DEAD', `external ${new URL(c.href).host}${c.target === '_blank' ? ' (new tab)' : ''}`]); continue;
    }
    const { ctx, p, errors, traffic } = await newPage();
    try {
      await prepare(p, path);
      if (/^check$/i.test(c.label)) await p.locator('#root input:visible').first().fill('400001').catch(() => {});
      const handle = await p.evaluateHandle(({ key: k, nth, KEY }) => {
        const key = eval(KEY);
        return [...document.querySelectorAll('#root button, #root a[href], #root summary, #root [role="button"]')].filter((el) => key(el) === k)[nth] ?? null;
      }, { ...c, KEY });
      let el = handle.asElement();
      if (!el) { rows.push([c, 'skip', 'not there on a fresh load']); continue; }
      await el.scrollIntoViewIfNeeded().catch(() => {});
      await settle(p, 250);
      // find it again: a sticky bar re-renders as it sticks, and a stale handle can't be tapped
      el = (await p.evaluateHandle(({ key: k, nth, KEY }) => {
        const key = eval(KEY);
        return [...document.querySelectorAll('#root button, #root a[href], #root summary, #root [role="button"]')].filter((x) => key(x) === k)[nth] ?? null;
      }, { ...c, KEY })).asElement() ?? el;
      if (await el.evaluate((x) => { const r = x.getBoundingClientRect(); return r.width < 2 || r.height < 2; })) { rows.push([c, 'skip', 'hidden on this screen']); continue; }
      const snap = () => p.evaluate((el) => ({
        url: location.href, layers: [...document.querySelectorAll('body *')].filter((x) => { const cs = getComputedStyle(x); return cs.position === 'fixed' && cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.1 && x.getBoundingClientRect().width * x.getBoundingClientRect().height > innerWidth * innerHeight * 0.4; }).length,
        dialogs: document.querySelectorAll('[role="dialog"], [aria-modal="true"]').length,
        state: el && el.isConnected ? [el.getAttribute('aria-expanded'), el.getAttribute('aria-pressed'), el.getAttribute('aria-checked'), el.getAttribute('aria-label'), el.closest('details')?.open].join() : 'gone',
        text: [...document.body.innerText].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7), y: Math.round(scrollY), playing: [...document.querySelectorAll('video')].filter((v) => !v.paused).length,
        x: [...document.querySelectorAll('#root *')].reduce((sum, e) => sum + e.scrollLeft, 0),
      }), el);
      const before = await snap(); const apiBefore = traffic.api;
      let popup = false; ctx.on('page', () => { popup = true; });
      let clickErr = null;
      await el.click({ timeout: 4000 }).catch((e) => { clickErr = String(e).split('\n')[0].slice(0, 80); });
      await settle(p, 1300);
      const after = await snap().catch(() => ({ url: p.url() }));
      const did = [
        after.url !== before.url && `→ ${after.url.replace(origin, '')}`,
        after.layers !== before.layers && 'opened a layer',
        after.dialogs !== before.dialogs && 'dialog',
        after.state !== before.state && 'toggled',
        Math.abs((after.y ?? 0) - before.y) > 40 && 'scrolled',
        Math.abs((after.x ?? 0) - before.x) > 40 && 'slid sideways',
        after.playing !== before.playing && 'video',
        traffic.api > apiBefore && 'asked the server',
        after.text !== before.text && 'changed text',
        popup && 'new tab',
      ].filter(Boolean);
      if (after.url !== before.url && new URL(after.url).origin === origin && !new URL(after.url).hash) {
        const h1 = await p.waitForFunction(() => document.querySelector('#root h1')?.textContent.trim(), null, { timeout: 15000 }).then((x) => x.jsonValue(), () => null);
        if (!h1) did.push('BUT the page it opened has no title');
      }
      rows.push([c, clickErr ? 'DEAD' : did.length && !did.some((d) => d.startsWith('BUT')) ? 'ok' : 'DEAD', clickErr ? `could not tap: ${clickErr}` : did.join(', ') || 'nothing happened', errors.length ? ` · page error: ${errors[0]}` : '']);
    } catch (e) { rows.push([c, 'DEAD', `test error ${String(e).slice(0, 80)}`]); }
    finally { await ctx.close(); }
  }
  const dead = rows.filter((r) => r[1] === 'DEAD');
  console.log(`\nSweep of ${path}: ${rows.length} controls · ${rows.filter((r) => r[1] === 'ok').length} work · ${dead.length} do nothing or fail · ${rows.filter((r) => r[1] === 'skip').length} skipped`);
  for (const [c, verdict, what, err = ''] of rows) console.log(`  ${verdict === 'ok' ? 'ok  ' : verdict === 'skip' ? 'skip' : 'DEAD'}  ${c.label.slice(0, 44).padEnd(44)} ${what}${err}`);
  check(`every control on ${path} does something`, dead.length === 0, dead.map(([c]) => c.label.slice(0, 30)).join(' | '));
};

if (process.env.ONLY === 'listing') { await listingJourneys(); console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`); await b.close(); process.exit(results.every((r) => r.ok) ? 0 : 1); }
if (process.env.ONLY !== 'sweep') await journeys();
if (process.env.ONLY !== 'journeys') { await sweep(process.env.SWEEP || PDP); if (!process.env.SWEEP) await sweep(RING_PDP); }
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`);
await b.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
