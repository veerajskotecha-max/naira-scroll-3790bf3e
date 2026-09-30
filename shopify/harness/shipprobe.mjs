// Behaviour checks for the ad-landing speed work, against a served build:
//   node shipprobe.mjs http://127.0.0.1:4303
// Network goes through Node (the sandbox's Chromium cannot use the proxy CA);
// Facebook, Clarity and Google tags are blocked so no test reaches live
// ad or analytics accounts.
import { chromium } from 'playwright';
const BASE = process.argv[2];
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|\/functions\/v1\/meta-capi)/i;
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const newCtx = async (opts = {}, slowMs = 0, extra = {}) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ...opts });
  await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
  const log = [];
  await ctx.route('**/*', async (route) => {
    const q = route.request(); const u = q.url();
    if (BLOCK.test(u) || (extra.block && extra.block.test(u))) return route.abort();
    log.push({ url: u, type: q.resourceType() });
    try {
      if (slowMs && extra.slow?.test(u)) await new Promise((r) => setTimeout(r, slowMs));
      const r = await fetch(u, { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'manual' });
      const body = Buffer.from(await r.arrayBuffer());
      const headers = Object.fromEntries([...r.headers].filter(([h]) => !/^(content-encoding|content-length)$/i.test(h)));
      await route.fulfill({ status: r.status, headers, body });
    } catch { await route.abort().catch(() => {}); }
  });
  return { ctx, log };
};
const Q = '?utm_source=facebook&utm_content=Facebook_UA&fbclid=TESTCLICK';

// 1. The ad link: the product's own page, the address moved, the click id kept.
{
  const { ctx, log } = await newCtx();
  const p = await ctx.newPage(); const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const docs = [];
  p.on('request', (r) => r.resourceType() === 'document' && r.frame() === p.mainFrame() && docs.push(r.url()));
  await p.goto(`${BASE}/products/prism-riviere-bracelet${Q}`, { waitUntil: 'domcontentloaded' });
  const early = await p.evaluate(() => ({ path: location.pathname + location.search, h1: document.querySelector('#root h1')?.textContent?.trim(), react: Object.keys(document.getElementById('root')?.firstElementChild || {}).some((k) => k.startsWith('__react')) }));
  check('ad link serves the product page itself (not the homepage)', /Prism Rivi/i.test(early.h1 || ''), `h1 "${early.h1}"`);
  check('address bar moves to /jewellery/… and keeps ?fbclid & utm', early.path === `/jewellery/prism-riviere-bracelet${Q}`, early.path);
  await p.waitForFunction(() => [...document.querySelectorAll('button')].some((x) => /add to (cart|bag)/i.test(x.textContent || '') && Object.keys(x).some((k) => k.startsWith('__react'))), null, { timeout: 30000 });
  check('only one page load (no reload, no redirect)', docs.length === 1, docs.join(' | '));
  const ld = await p.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { return JSON.parse(s.textContent); } catch { return {}; } }).filter((j) => j['@type'] === 'Product').map((j) => j.offers?.price));
  check('exactly one Product price block for Google', ld.length === 1, JSON.stringify(ld));
  const photoReqs = log.filter((l) => /naira-u09-prism-riviere-bracelet\.jpg/.test(l.url) && l.type === 'image').map((l) => new URL(l.url).searchParams.get('width'));
  check('first product photo downloaded once', new Set(photoReqs).size === 1, `widths ${photoReqs.join(',')}`);
  check('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  const early3d = log.filter((l) => /\/assets\/(three|scene)-/.test(l.url)).length;
  check('no 3D download in the first seconds', early3d === 0);
  await p.waitForTimeout(8000);
  const late3d = log.filter((l) => /\/assets\/(three|scene)-/.test(l.url)).length;
  check('3D flower still arrives later on a capable phone', late3d > 0, `${late3d} 3D file(s) after ~8 s`);
  const fonts = await p.evaluate(() => document.getElementById('nf-fonts')?.getAttribute('media'));
  check('editorial fonts switched on after the app started', fonts === 'all', `media=${fonts}`);
  await ctx.close();
}

// 2. The phone gallery: in the pre-built HTML, and it still tracks swipes.
{
  const { ctx } = await newCtx();
  const p = await ctx.newPage();
  await p.goto(`${BASE}/jewellery/prism-riviere-bracelet`, { waitUntil: 'domcontentloaded' });
  const preBuilt = await p.evaluate(() => {
    const img = [...document.querySelectorAll('#root .md\\:hidden img')].find((i) => i.getBoundingClientRect().width > 300);
    return { photo: !!img, react: Object.keys(document.getElementById('root')?.firstElementChild || {}).some((k) => k.startsWith('__react')) };
  });
  check('phone photo is in the pre-built HTML', preBuilt.photo, preBuilt.react ? '(app already running)' : 'before the app ran');
  await p.waitForFunction(() => [...document.querySelectorAll('#product-actions button')].some((x) => Object.keys(x).some((k) => k.startsWith('__react'))), null, { timeout: 30000 });
  await p.waitForTimeout(800);
  const counter = await p.evaluate(async () => {
    const strip = document.querySelector('#root .md\\:hidden .snap-x');
    strip.scrollTo({ left: strip.clientWidth * 2, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 400));
    return [...document.querySelectorAll('#root span')].find((x) => /^\d+ \/ \d+$/.test(x.textContent.trim()))?.textContent.trim();
  });
  check('photo counter follows a swipe to photo 3', /^3 \/ \d+$/.test(counter || ''), counter);
  const imgs = await p.evaluate(() => document.querySelectorAll('#root .md\\:hidden .snap-x img').length);
  check('the app draws the full phone gallery', imgs > 1, `${imgs} photos`);
  await ctx.close();
}

// 3. Desktop: the desktop gallery shows; the phone one stays hidden and costs nothing.
{
  const { ctx, log } = await newCtx({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/jewellery/prism-riviere-bracelet`, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const vis = await p.evaluate(() => ({
    desktop: [...document.querySelectorAll('#root .hidden.md\\:block img')].some((i) => i.getBoundingClientRect().width > 300 && i.complete && i.naturalWidth > 0),
    mobileShown: [...document.querySelectorAll('#root .md\\:hidden')].some((d) => d.getBoundingClientRect().height > 0 && d.querySelector('.snap-x')),
  }));
  check('desktop gallery visible at 1440 px', vis.desktop);
  check('phone gallery hidden at 1440 px', !vis.mobileShown);
  const extra = log.filter((l) => /prism-riviere-bracelet-[25]\.jpg/.test(l.url) && /width=(480|720|900|1200)\b/.test(l.url)).length;
  check('hidden phone gallery downloads nothing extra', extra === 0, `${extra} phone-size files`);
  await ctx.close();
}

// 4. Homepage, a collection and a clothing page still render.
for (const [path, re] of [['/', /./], ['/jewellery', /./], ['/jewellery/collections/anti-tarnish-jewellery', /./], ['/product/royal-enigma', /royal enigma/i]]) {
  const { ctx } = await newCtx();
  const p = await ctx.newPage(); const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  const ok = await p.waitForFunction((src) => {
    const h1 = document.querySelector('#root h1');
    return h1 && new RegExp(src, 'i').test(h1.textContent || '') && Object.keys(document.getElementById('root').firstElementChild || {}).some((k) => k.startsWith('__react'));
  }, re.source, { timeout: 45000 }).then(() => true, () => false);
  const h1 = await p.evaluate(() => document.querySelector('#root h1')?.textContent?.trim().slice(0, 40));
  check(`${path} renders in the app`, ok && errors.length === 0, `h1 "${h1}"${errors.length ? ' errors: ' + errors[0] : ''}`);
  await ctx.close();
}

// 5. A failed 3D download no longer reloads the page.
{
  const { ctx } = await newCtx({}, 0, { block: /\/assets\/(three|scene)-/ });
  const p = await ctx.newPage(); const docs = [];
  p.on('request', (r) => r.resourceType() === 'document' && r.frame() === p.mainFrame() && docs.push(r.url()));
  await p.goto(`${BASE}/jewellery/prism-riviere-bracelet`, { waitUntil: 'load' });
  await p.waitForTimeout(12000);
  check('blocked 3D files: no page reload', docs.length === 1, `${docs.length} document load(s)`);
  await ctx.close();
}

// 6. Scrolling the pre-built page before the app takes over is not undone.
{
  const { ctx } = await newCtx({}, 2500, { slow: /\/assets\/.*\.js$/ });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/jewellery/prism-riviere-bracelet`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(300);
  await p.evaluate(() => window.scrollTo(0, 700));
  await p.waitForFunction(() => Object.keys(document.getElementById('root')?.firstElementChild || {}).some((k) => k.startsWith('__react')), null, { timeout: 60000 });
  await p.waitForTimeout(600);
  const y = await p.evaluate(() => window.scrollY);
  check('app takeover keeps the shopper\'s scroll position', y > 500, `scrollY ${y}`);
  await ctx.close();
}

// 7. Reviews: small thumbnails in the strip, the full photo when opened.
{
  const { ctx, log } = await newCtx();
  const p = await ctx.newPage();
  await p.goto(`${BASE}/jewellery/prism-riviere-bracelet`, { waitUntil: 'load' });
  await p.evaluate(() => document.querySelector('[aria-label="Customer photos"]')?.scrollIntoView());
  await p.waitForTimeout(2500);
  const strip = await p.evaluate(() => [...document.querySelectorAll('[aria-label="Customer photos"] img')].map((i) => i.currentSrc || i.src));
  check('review strip uses the small thumbnails', strip.length > 0 && strip.every((s) => /review-thumbs|\.webp/.test(s) || !/__l5e/.test(s)), strip.map((s) => s.split('/').pop()).join(', '));
  const bigBefore = log.filter((l) => /__l5e\/assets-v1\/.*real-/.test(l.url)).length;
  check('no full-size review photo downloaded just to show tiles', bigBefore === 0, `${bigBefore} full-size`);
  await ctx.close();
}

console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`);
await b.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
