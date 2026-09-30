// A store's bag on a phone, filled with one piece, top to bottom:
//   node cartshots.mjs <product url> <outDir> <label>
// Network goes through Node (the sandbox CA) with the browser's own cookies
// carried both ways, so a store's cart survives from page to page. Ad and
// analytics tags are blocked so a look never reaches anyone's reports.
//   PICK="css"   click this first (a size, say) before adding
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const [URL0, OUT, LABEL] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|hotjar|monorail-edge|shopifysvc\.com\/v1|\/api\/collect|klaviyo|webengage|moengage|clevertap|tiktok|pinterest|criteo|bat\.bing|gokwik|snapchat|twitter|lightboxcdn|wigzo|netcore|smartech)/i;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' });
await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
const HINTS = { 'sec-ch-ua': '"Chromium";v="120", "Google Chrome";v="120", "Not?A_Brand";v="99"', 'sec-ch-ua-mobile': '?1', 'sec-ch-ua-platform': '"Android"' };
const cookiesFrom = (setCookies, url) => setCookies.map((line) => {
  const [pair, ...attrs] = line.split(';'); const i = pair.indexOf('=');
  const c = { name: pair.slice(0, i).trim(), value: pair.slice(i + 1).trim(), path: '/' };
  let domain = null;
  for (const a of attrs) { const [k, ...v] = a.split('='); const key = k.trim().toLowerCase(); const val = v.join('=').trim();
    if (key === 'domain') domain = val; else if (key === 'path') c.path = val || '/'; else if (key === 'max-age') c.expires = Math.floor(Date.now() / 1000) + Number(val);
    else if (key === 'expires' && c.expires === undefined) { const t = Date.parse(val); if (!Number.isNaN(t)) c.expires = Math.floor(t / 1000); }
    else if (key === 'secure') c.secure = true; else if (key === 'httponly') c.httpOnly = true;
    else if (key === 'samesite') c.sameSite = /none/i.test(val) ? 'None' : /strict/i.test(val) ? 'Strict' : 'Lax'; }
  if (domain) c.domain = domain; else c.domain = new URL(url).hostname;
  if (c.sameSite === 'None') c.secure = true;
  return c;
}).filter((c) => c.name && !(c.expires !== undefined && c.expires < Date.now() / 1000));
await ctx.route('**/*', async (route) => {
  const q = route.request();
  if (BLOCK.test(q.url())) return route.abort();
  try {
    const r = await fetch(q.url(), { method: q.method(), headers: { ...(await q.allHeaders()), ...HINTS }, body: q.postDataBuffer() || undefined, redirect: 'manual' });
    const body = Buffer.from(await r.arrayBuffer());
    const set = r.headers.getSetCookie?.() ?? [];
    if (set.length) await ctx.addCookies(cookiesFrom(set, q.url())).catch(() => {});
    const headers = Object.fromEntries([...r.headers].filter(([h]) => !/^(content-encoding|content-length|set-cookie)$/i.test(h)));
    await route.fulfill({ status: r.status, headers, body });
  } catch { await route.abort().catch(() => {}); }
});
const p = await ctx.newPage();
await p.goto(URL0, { waitUntil: 'domcontentloaded', timeout: 90000 });
await p.waitForTimeout(7000);
const closePopups = async () => {
  for (const sel of ['[aria-label*="close" i]:visible', 'button:has-text("Close"):visible', 'button:has-text("No thanks"):visible', '.klaviyo-close-form']) {
    try { const el = p.locator(sel).first(); if (await el.isVisible({ timeout: 300 })) await el.click({ timeout: 800 }); } catch {}
  }
};
await closePopups();
const overlays = () => p.evaluate(() => {
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (el.closest('[data-bag-keep]')) continue;
    const r = el.getBoundingClientRect(); const w = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)); const h = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
    if (w * h > innerWidth * innerHeight * 0.45 && !/cart|bag|drawer|minicart/i.test(el.className + ' ' + el.id)) el.style.setProperty('display', 'none', 'important');
  }
});
await overlays();
if (process.env.PICK) { try { await p.locator(process.env.PICK).first().click({ timeout: 4000 }); await p.waitForTimeout(800); } catch (e) { console.log('pick failed', String(e).slice(0, 80)); } }
// the store's own Add to cart, as a shopper would
const add = p.locator('button:has-text("Add to cart"):visible, button:has-text("Add to bag"):visible, button:has-text("ADD TO CART"):visible, button[name="add"]:visible, [data-add-to-cart]:visible').first();
let added = false;
try { await add.scrollIntoViewIfNeeded({ timeout: 4000 }); await add.click({ timeout: 5000 }); added = true; } catch (e) { console.log('add click failed', String(e).slice(0, 100)); }
await p.waitForTimeout(6000);
const count = await p.evaluate(() => fetch('/cart.js').then((r) => r.json()).then((c) => c.item_count).catch(() => -1));
console.log(LABEL, 'clicked add:', added, 'items in cart:', count);
if (count === 0) {
  // fall back to the Ajax API with the first available variant, then open the bag
  const ok = await p.evaluate(async (u) => {
    const prod = await fetch(`${new URL(u).pathname.replace(/\/$/, '')}.js`).then((r) => r.json());
    const v = prod.variants.find((x) => x.available) ?? prod.variants[0];
    const r = await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: v.id, quantity: 1 }] }) });
    return r.ok;
  }, URL0).catch(() => false);
  console.log('ajax add:', ok);
  await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(6000); await closePopups(); await overlays();
  for (const sel of ['a[href$="/cart"]:visible', '[aria-label*="cart" i]:visible', '[class*="cart-icon"]:visible', '[href*="cart"]:visible']) {
    try { await p.locator(sel).first().click({ timeout: 2500 }); break; } catch {}
  }
  await p.waitForTimeout(5000);
}
// Is the bag open? A fixed panel, most of the screen, with a checkout button.
const bagOpen = () => p.evaluate(() => [...document.querySelectorAll('body *')].some((el) => {
  const cs = getComputedStyle(el); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.5) return false;
  const r = el.getBoundingClientRect(); if (r.width < innerWidth * 0.6 || r.height < innerHeight * 0.5 || r.left > innerWidth * 0.3) return false;
  return /check ?out/i.test(el.innerText || '');
}));
if (!(await bagOpen())) {
  for (const sel of ['button:has-text("View"):visible', 'a:has-text("View cart"):visible', 'a:has-text("View bag"):visible', 'header a[href$="/cart"]:visible', 'a[href$="/cart"]:visible', '[aria-label*="cart" i]:visible', '[aria-label*="bag" i]:visible', '[class*="cart-icon"]:visible', '[class*="CartIcon"]:visible']) {
    try { await p.locator(sel).first().click({ timeout: 2000 }); await p.waitForTimeout(4500); if (await bagOpen()) { console.log('opened bag with', sel); break; } } catch {}
  }
}
let where = 'drawer';
if (!(await bagOpen())) {
  where = 'cart page';
  await p.goto(new URL('/cart', URL0).href, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(7000); await closePopups(); await overlays();
}
await p.waitForTimeout(1500);
console.log(LABEL, 'bag shown as', where);
writeFileSync(`${OUT}/${LABEL}-bag-0.jpg`, await p.screenshot({ type: 'jpeg', quality: 72 }));
// scroll the bag's own list if it scrolls (inside the open panel), else the page
const scroller = await p.evaluateHandle((where) => {
  const inPanel = (el) => { for (let e = el; e; e = e.parentElement) { if (getComputedStyle(e).position === 'fixed') return true; } return false; };
  const cands = [...document.querySelectorAll('body *')].filter((el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    return /(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 40 && r.width > innerWidth * 0.6 && r.height > 200 && (where !== 'drawer' || inPanel(el)); });
  return cands.sort((a, c) => c.scrollHeight - a.scrollHeight)[0] ?? document.scrollingElement;
}, where);
for (let i = 1; i <= 3; i++) {
  const moved = await scroller.evaluate((el, i) => { const before = el.scrollTop; el.scrollTop = i * (el.clientHeight - 120); return el.scrollTop !== before; }, i);
  if (!moved) break;
  await p.waitForTimeout(900);
  writeFileSync(`${OUT}/${LABEL}-bag-${i}.jpg`, await p.screenshot({ type: 'jpeg', quality: 72 }));
}
const text = await scroller.evaluate((el) => (el === document.scrollingElement ? document.body : el).innerText.replace(/\n{2,}/g, '\n').slice(0, 2500));
writeFileSync(`${OUT}/${LABEL}-bag.txt`, text);
await b.close();
