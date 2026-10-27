// Checks a LOCAL build served like the live host (new-listing-serve.mjs):
//  A. every live jewellery piece has its own pre-built page at both the shop
//     address and the catalogue ad's address (/products/<handle>?variant=…);
//  B. catalogue ad links open on the colour the ad showed, that colour's photo
//     first, the size left at the page's default;
//  C. the shop grid shows no photo twice;
//  D. suggestion cards link to the colour they show.
// Read-only: no cart, no checkout. Hosts outside the allow-list are aborted.
//   BASE=http://127.0.0.1:8100 node links-verify.mjs <storefront-nodes.json> <outDir>
import { chromium, devices } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const [NODES, OUT] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://127.0.0.1:8100';
mkdirSync(OUT, { recursive: true });
const nodes = JSON.parse(readFileSync(NODES, 'utf8')).filter((n) => (n.vendor || '').trim().toLowerCase() === 'naira petite');
const AD = 'utm_content=Facebook_UA&utm_source=facebook';
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const report = { pages: [], ads: [], grid: {}, cards: [] };

/* A. A page of its own for every piece, at both addresses. */
const ONLY = process.env.ONLY || 'ABCD';
let bad = 0;
for (const n of ONLY.includes('A') ? nodes : []) {
  const vid = n.variants.edges[0].node.id.split('/').pop();
  for (const path of [`/products/${n.handle}?${AD}&variant=${vid}`, `/jewellery/${n.handle}`]) {
    const res = await fetch(BASE + path, { headers: { 'accept-encoding': 'identity' } });
    const html = await res.text();
    const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
    const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? '';
    const ok = res.status === 200 && res.headers.get('x-served') === 'file' && title.includes(n.title) && canonical.endsWith(`/jewellery/${n.handle}`) && /cdn\.shopify\.com/.test(og);
    if (!ok) bad++;
    report.pages.push({ path, ok, status: res.status, served: res.headers.get('x-served'), title, canonical, og: og.slice(0, 90) });
  }
}
console.log(`A. own page: ${nodes.length * 2 - bad}/${nodes.length * 2} addresses OK across ${nodes.length} pieces`);
for (const p of report.pages.filter((p) => !p.ok)) console.log('   FAIL', p.path, p.status, p.served, p.title);

const ALLOW = /^127\.0\.0\.1$|(^|\.)(shopify\.com|myshopify\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } });
const phone = (({ defaultBrowserType, ...rest }) => rest)(devices['Pixel 7']);
const fresh = async () => {
  const ctx = await browser.newContext(phone);
  await ctx.route('**/*', (r) => (ALLOW.test(new URL(r.request().url()).hostname) ? r.continue() : r.abort()));
  return ctx;
};
const file = (u) => (u || '').split('?')[0].split('/').pop();

/* B. Catalogue ad links open on the ad's colour. */
const variantOf = (handle, title) => nodes.find((n) => n.handle === handle).variants.edges.map((e) => e.node).find((v) => v.title === title);
const CASES = [
  { handle: 'tubogas-dome-ring', variant: 'Silver / 7', metal: 'Silver', photo: '0d36743d', size: '6' },
  { handle: 'tubogas-dome-ring', variant: 'Gold / 8', metal: 'Gold', photo: 'tubogas-dome-ring-on-hand', size: '6' },
  { handle: 'droplet-open-cuff', variant: 'Silver', metal: 'Silver', photo: 'droplet-open-cuff_3_silver' },
  { handle: 'star-point-band', variant: 'Silver / 5', metal: 'Silver', photo: 'hf_20261021_081012_d4d39a26', size: '6' },
  { handle: 'north-star-bangle', variant: 'Gold', metal: 'Gold', photo: 'b8a96ec4' },
  { handle: 'baguette-huggies', variant: 'Emerald', metal: 'Emerald', option: 'Stone', photo: 'bff78c83' },
  { handle: 'prism-riviere-bracelet', variant: 'Default Title' },
  { handle: 'lotus-pear-drop-studs', variant: 'Default Title' },
];
for (const c of ONLY.includes('B') ? CASES : []) {
  const v = variantOf(c.handle, c.variant);
  const url = `${BASE}/products/${c.handle}?${AD}&variant=${v.id.split('/').pop()}`;
  const ctx = await fresh();
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#product-price', { timeout: 15000 }).catch(() => {});
  // live data merges within a second or two; give it time, then read
  await page.waitForTimeout(3500);
  const seen = await page.evaluate((option) => {
    const metal = document.querySelector(`[data-option="${option}"] [role=radio][aria-checked=true]`)?.textContent?.trim()
      ?? document.querySelector(`[data-option="${option}"] select`)?.value;
    const sizeBox = document.querySelector('[data-option="Size"]');
    const size = sizeBox?.querySelector('[role=radio][aria-checked=true]')?.textContent?.trim() ?? sizeBox?.querySelector('select')?.value;
    const first = document.querySelector('button[aria-label$="image 1 full screen"] img');
    return { path: location.pathname + location.search, h1: document.querySelector('#root h1')?.textContent?.trim(), metal, size, first: first?.currentSrc || first?.src };
  }, c.option ?? 'Metal');
  const ok = seen.h1 && (!c.metal || seen.metal === c.metal) && (!c.photo || file(seen.first).includes(c.photo)) && (!c.size || seen.size === c.size) && seen.path.startsWith(`/jewellery/${c.handle}`) && !errors.length;
  report.ads.push({ ...c, url, ok, seen: { ...seen, first: file(seen.first) }, errors });
  console.log(`B. ${ok ? 'OK  ' : 'FAIL'} ${c.handle} ad for ${c.variant} → ${seen.path.split('?')[0]} | chosen ${seen.metal ?? '-'} / size ${seen.size ?? '-'} | first photo ${file(seen.first)}${errors.length ? ' | errors ' + errors.join(' ; ') : ''}`);
  if (c.handle === 'tubogas-dome-ring' && c.metal === 'Silver') await page.screenshot({ path: `${OUT}/ad-tubogas-silver.png` });
  await ctx.close();
}

/* C. The shop grid: no photo twice, and the two-colour pieces in both colours. */
{
  const ctx = await fresh();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/jewellery`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  // The grid shows 30 at a time behind SHOW MORE.
  for (let i = 0; i < 12; i++) {
    const more = page.getByRole('button', { name: /show more/i });
    if (!(await more.count())) break;
    await more.first().scrollIntoViewIfNeeded();
    await more.first().click();
    await page.waitForTimeout(700);
  }
  for (let y = 0; y < 80; y++) { await page.mouse.wheel(0, 2400); await page.waitForTimeout(100); }
  await page.waitForTimeout(1500);
  const cards = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="/jewellery/"]')]
      .filter((a) => !a.href.includes('/collections/') && a.querySelector('img'))
      .map((a) => ({ href: a.getAttribute('href'), img: (a.querySelector('img').currentSrc || a.querySelector('img').src || '').split('?')[0].split('/').pop() })),
  );
  const byHref = new Map(cards.map((c) => [c.href, c.img]));
  const byImg = new Map();
  for (const [href, img] of byHref) byImg.set(img, [...(byImg.get(img) ?? []), href]);
  const dups = [...byImg].filter(([, hrefs]) => hrefs.length > 1);
  report.grid = { cards: byHref.size, dups, colourCards: [...byHref].filter(([h]) => h.includes('?colour=')) };
  console.log(`C. shop grid: ${byHref.size} cards, ${dups.length} photo(s) shown twice${dups.length ? ': ' + JSON.stringify(dups) : ''}`);
  for (const h of ['tubogas-dome-ring', 'droplet-open-cuff', 'star-point-band'])
    console.log(`   ${h}: ${[...byHref].filter(([k]) => k.startsWith(`/jewellery/${h}?`)).map(([k, v]) => `${k.split('=')[1]} → ${v}`).join('  |  ')}`);
  await ctx.close();
}

/* D. Suggestion cards link to the colour they show. */
for (const anchor of ['droplet-open-ring?colour=silver', 'triple-coil-wrap-bangle?colour=silver', 'star-point-band?colour=gold']) {
  const ctx = await fresh();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/jewellery/${anchor}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.evaluate(() => document.getElementById('complete-the-look')?.scrollIntoView());
  await page.waitForTimeout(1500);
  const look = await page.evaluate(() =>
    [...document.querySelectorAll('section[aria-labelledby="complete-the-look"] article')].map((a) => ({
      href: a.querySelector('a')?.getAttribute('href'),
      shows: a.getAttribute('data-variant'),
      img: (a.querySelector('img')?.currentSrc || '').split('?')[0].split('/').pop(),
    })),
  );
  report.cards.push({ anchor, look });
  console.log(`D. ${anchor} — complete the look:`);
  for (const l of look) console.log(`   ${l.href} | shows ${l.shows ?? '-'} | ${l.img}`);
  await ctx.close();
}
await browser.close();
writeFileSync(`${OUT}/links-verify.json`, JSON.stringify(report, null, 1));
