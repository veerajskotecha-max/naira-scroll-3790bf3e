// Phone screenshots of any product page, top to bottom, plus its bag after
// Add to cart: node refshots.mjs <url> <outDir> [label]
// Analytics and ad tags are blocked so a look never reaches anyone's reports.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { NO_REPORT } from './noreport.mjs';
const [URL0, OUT, LABEL = 'page'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|hotjar|monorail-edge|shopifysvc\.com\/v1|\/api\/collect|klaviyo|webengage|moengage|clevertap|tiktok|pinterest|criteo|bat\.bing|\/functions\/v1\/meta-capi|~api\/analytics)/i;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' });
// Look like the phone browser the user agent names: no automation flag, no
// "HeadlessChrome" brand in the client hints (some stores challenge those).
await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
const HINTS = { 'sec-ch-ua': '"Chromium";v="120", "Google Chrome";v="120", "Not?A_Brand";v="99"', 'sec-ch-ua-mobile': '?1', 'sec-ch-ua-platform': '"Android"' };
await ctx.route('**/*', async (route) => { if (NO_REPORT.test(route.request().url())) return route.abort();
  const q = route.request();
  if (BLOCK.test(q.url())) return route.abort();
  try {
    const headers0 = { ...q.headers(), ...HINTS };
    const r = await fetch(q.url(), { method: q.method(), headers: headers0, body: q.postData() || undefined, redirect: 'manual' });
    const body = Buffer.from(await r.arrayBuffer());
    const headers = Object.fromEntries([...r.headers].filter(([h]) => !/^(content-encoding|content-length)$/i.test(h)));
    await route.fulfill({ status: r.status, headers, body });
  } catch { await route.abort().catch(() => {}); }
});
const p = await ctx.newPage();
await p.goto(URL0, { waitUntil: 'domcontentloaded', timeout: 90000 });
await p.waitForTimeout(7000);
// close obvious popups (newsletter / cookie) so the page itself is visible
for (const sel of ['[aria-label*="close" i]', 'button:has-text("Close")', 'button:has-text("No thanks")', '.klaviyo-close-form', '[class*="popup"] [class*="close"]']) {
  try { const el = p.locator(sel).first(); if (await el.isVisible({ timeout: 300 })) await el.click({ timeout: 800 }); } catch {}
}
await p.keyboard.press('Escape').catch(() => {});
// Anything still fixed over most of the screen is a promo overlay: hide it for
// the pictures (headers and sticky buy bars are far smaller than this).
const hideOverlays = () => p.evaluate(() => {
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' || cs.display === 'none') continue;
    if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) continue;
    const r = el.getBoundingClientRect();
    const w = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
    const h = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
    if (w * h > innerWidth * innerHeight * 0.45) el.style.setProperty('display', 'none', 'important');
  }
  document.documentElement.style.overflow = 'auto'; document.body.style.overflow = 'auto';
});
await hideOverlays();
await p.waitForTimeout(800);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
const segs = process.env.BAG_ONLY ? 0 : Math.min(10, Math.ceil(H / 844));
for (let i = 0; i < segs; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), i * 844);
  await p.waitForTimeout(900);
  await hideOverlays();
  writeFileSync(`${OUT}/${LABEL}-${String(i).padStart(2, '0')}.jpg`, await p.screenshot({ type: 'jpeg', quality: 70 }));
}
// page structure: headings and buttons in order, to compare layouts
const outline = segs === 0 ? [] : await p.evaluate(() => {
  const els = [...document.querySelectorAll('h1,h2,h3,summary,button,[role="tab"],details > summary,label,select')];
  return els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
    .map((e) => `${Math.round(e.getBoundingClientRect().top + scrollY)}px ${e.tagName.toLowerCase()}: ${(e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 60)}`)
    .filter((l) => !/: $/.test(l)).slice(0, 120);
});
if (segs) writeFileSync(`${OUT}/${LABEL}-outline.txt`, `height ${H}px\n` + outline.join('\n'));
// bag: pick the first size if one is required, then add to cart
await p.evaluate(() => window.scrollTo(0, 0));
try {
  const size = p.locator('input[type=radio][name*="ize" i]:not([disabled]) + label, fieldset input[type=radio]:not([disabled]) + label').first();
  if (await size.count()) await size.click({ timeout: 2000 }).catch(() => {});
  const add = p.locator('button:has-text("Add to cart"), button:has-text("Add to bag"), button[name="add"]').first();
  await add.scrollIntoViewIfNeeded({ timeout: 3000 });
  await add.click({ timeout: 4000 });
  await p.waitForTimeout(Number(process.env.BAG_WAIT || 4000));
  writeFileSync(`${OUT}/${LABEL}-bag.jpg`, await p.screenshot({ type: 'jpeg', quality: 70 }));
  // the bag's own contents, top to bottom, in case it scrolls
  const bagText = await p.evaluate(() => {
    const cands = [...document.querySelectorAll('body *')].filter((el) => {
      const cs = getComputedStyle(el); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect(); return r.width > innerWidth * 0.6 && r.height > innerHeight * 0.4 && r.left < innerWidth * 0.5;
    });
    const el = cands.sort((a, b) => b.innerText.length - a.innerText.length)[0];
    return el ? el.innerText.replace(/\n{2,}/g, '\n').slice(0, 3000) : '';
  });
  writeFileSync(`${OUT}/${LABEL}-bag.txt`, bagText);
  if (process.env.CART_PAGE) {
    await p.goto(new URL('/cart', URL0).href, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForTimeout(6000);
    await hideOverlays();
    const ch = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let i = 0; i < Math.min(3, Math.ceil(ch / 844)); i++) {
      await p.evaluate((y) => window.scrollTo(0, y), i * 844);
      await p.waitForTimeout(700);
      writeFileSync(`${OUT}/${LABEL}-cart-${i}.jpg`, await p.screenshot({ type: 'jpeg', quality: 70 }));
    }
  }
} catch (e) { console.log('bag: could not add —', String(e).slice(0, 100)); }
console.log(LABEL, 'height', H, 'segments', segs);
await b.close();
