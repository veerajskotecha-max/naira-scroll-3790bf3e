// An unpublished Shopify theme, rendered by Shopify, in a real browser at 390
// and 1440 wide: screenshots and the checks a pass needs.
//   node whispershot.mjs <themeId> <outDir> [path ...]
// Default paths: home, a collection, three product pages, the cart.
//
// Previewing an unpublished theme normally bounces through
// /services/access_tokens/create_sharing/ on the PRIMARY domain, which here is
// the Lovable site, so the token is never issued (see a466c89). Requesting that
// same endpoint on the myshopify host issues it into the session instead, and
// `_fd=0` keeps every later request on the myshopify host. Each page is still
// checked for the theme id and the run refuses to shoot a page that is not it.
//
// Per page and width: horizontal overflow, page errors, console errors, tap
// targets under 44 × 44 on the phone, and the theme id. Ad and analytics
// requests are blocked (noreport.mjs); pages are paced to stay under Shopify's
// rate limit.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { NO_REPORT } from './noreport.mjs';

const [THEME, OUT, ...rest] = process.argv.slice(2);
if (!THEME || !OUT) {
  console.error('usage: node whispershot.mjs <themeId> <outDir> [path ...]');
  process.exit(2);
}
mkdirSync(OUT, { recursive: true });
const HOST = 'https://nc5eti-gp.myshopify.com';
const FLAGS = '_ab=0&_fd=0&_sc=1';
const PAGES = rest.length
  ? rest
  : ['/', '/collections/necklaces', '/products/woven-gold-hoops', '/products/tubogas-dome-ring', '/products/baguette-huggies', '/cart'];
const UA = 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const jar = new Map();
const keep = (headers) => {
  const raw = headers.getSetCookie?.() ?? [];
  for (const c of raw) {
    const [pair] = c.split(';');
    const i = pair.indexOf('=');
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
};
const cookie = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
const get = async (url) => {
  const r = await fetch(url, { headers: { 'user-agent': UA, cookie: cookie() }, redirect: 'manual' });
  keep(r.headers);
  return r;
};

// Prime: the preview id into the session, then the sharing token on this host.
await get(`${HOST}/?${FLAGS}&preview_theme_id=${THEME}`);
await wait(4000);
await get(`${HOST}/services/access_tokens/create_sharing/${THEME}?return_to=${encodeURIComponent(`/?${FLAGS}`)}`);
await wait(4000);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const report = [];
for (const [w, h, tag] of [[390, 844, 'phone'], [1440, 960, 'desk']]) {
  const ctx = await b.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: tag === 'phone' ? 2 : 1,
    isMobile: tag === 'phone',
    hasTouch: tag === 'phone',
    userAgent: tag === 'phone' ? UA : undefined,
  });
  await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
  await ctx.route('**/*', async (route) => {
    const q = route.request();
    let url = q.url();
    if (NO_REPORT.test(url)) return route.abort();
    const ours = url.startsWith(HOST);
    // Every page and fetch on the shop keeps the flags, not only documents:
    // the theme's own fetches (header refresh, recommendations, search) are
    // otherwise redirected to the primary domain and fail on CORS. Files on
    // /cdn/ are left alone: the image CDN answers 409 to unknown parameters,
    // which blanked every product card image.
    if (ours && !url.includes('_fd=0') && !new URL(url).pathname.startsWith('/cdn/')) url += (url.includes('?') ? '&' : '?') + FLAGS;
    try {
      const headers = { ...q.headers(), ...(ours ? { cookie: cookie() } : {}) };
      delete headers['content-length'];
      const r = await fetch(url, { method: q.method(), headers, body: q.postDataBuffer() || undefined, redirect: 'manual' });
      if (ours) keep(r.headers);
      const body = Buffer.from(await r.arrayBuffer());
      const out = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length|set-cookie)$/i.test(k)));
      await route.fulfill({ status: r.status, headers: out, body });
    } catch {
      await route.abort().catch(() => {});
    }
  });
  for (const path of PAGES) {
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 160)}`));
    p.on('console', (m) => {
      if (m.type() === 'error' && !/Failed to load resource|net::ERR|monorail|Content Security Policy/i.test(m.text())) errors.push(`console: ${m.text().slice(0, 160)}`);
    });
    const name = `${path.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') || 'home'}-${tag}`;
    try {
      await p.goto(HOST + path, { waitUntil: 'load', timeout: 60000 });
      await p.evaluate(() => document.fonts && document.fonts.ready);
      await p.waitForTimeout(1500);
      // Walk the page so lazy media and sticky bars settle, then return to the top.
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
      });
      await p.waitForTimeout(900);
      const info = await p.evaluate((phone) => {
        const theme = window.Shopify?.theme || {};
        const small = [];
        if (phone) {
          for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, summary, [role=button]')) {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            if (!r.width || !r.height || s.visibility === 'hidden' || s.display === 'none' || el.closest('[hidden], [inert], .visually-hidden, dialog:not([open])')) continue;
            if (r.width < 44 || r.height < 44) {
              const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 40);
              small.push(`${el.tagName.toLowerCase()} "${label}" ${Math.round(r.width)}×${Math.round(r.height)}`);
            }
          }
        }
        return {
          themeId: theme.id ?? null,
          themeName: theme.name ?? null,
          title: document.title.trim().slice(0, 70),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          small,
        };
      }, tag === 'phone');
      const ok = String(info.themeId) === String(THEME);
      if (ok) {
        // The first screen on its own as well: what a shopper sees before scrolling.
        writeFileSync(`${OUT}/${name}-top.png`, await p.screenshot());
        writeFileSync(`${OUT}/${name}.png`, await p.screenshot({ fullPage: true }));
      }
      report.push({ page: path, view: tag, ok, ...info, errors });
      console.log(`${ok ? 'OK  ' : 'WRONG THEME'} ${name}  overflow ${info.overflow}  errors ${errors.length}  small targets ${info.small.length}  ${ok ? '' : info.themeName}`);
    } catch (e) {
      report.push({ page: path, view: tag, ok: false, failed: String(e.message).slice(0, 160) });
      console.log(`FAILED ${name}: ${String(e.message).slice(0, 120)}`);
    }
    await p.close();
    // Shopify answers 429 to the theme's own section fetches when pages come
    // faster than this, which shows up as header-refresh errors.
    await wait(6000);
  }
  await ctx.close();
}
await b.close();
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
process.exit(report.every((r) => r.ok) ? 0 : 1);
