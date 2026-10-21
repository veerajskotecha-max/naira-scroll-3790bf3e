// The real site, run locally, showing chosen products with their size image
// added to the gallery and the size lines added to Details. Shopify is not
// touched: the storefront response is edited in the browser only.
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { NO_REPORT } from '/home/user/naira-scroll-3790bf3e/shopify/harness/noreport.mjs';
import { readFileSync } from 'node:fs';
const S = process.env.NF_WORK || process.cwd();
const data = Object.fromEntries(JSON.parse(readFileSync(`${S}/sizing/data.json`, 'utf8')).map((d) => [d.handle, d]));
const SITE = 'http://127.0.0.1:5199';
const targets = process.argv.slice(2);
const BOUNDARY = /(?=\b[A-Z][A-Za-z]*(?: [a-z]+){0,2}:\s)/;

const editDescription = (text, propose) => {
  if (!/Details\s/.test(text)) return propose.length ? `${text.trim()}Details ${propose.join(' ')}` : text;
  const m = text.match(/^([\s\S]*?Details\s+)([\s\S]*?)((?:Care(?=[A-Z])[\s\S]*)?)$/);
  if (!m) return text;
  const specs = m[2].split(BOUNDARY).map((s) => s.trim()).filter(Boolean);
  const label = (s) => s.slice(0, s.indexOf(':')).trim().toLowerCase();
  const out = [...specs];
  const first = [];
  for (const p of propose) {
    const i = out.findIndex((s) => label(s) === label(p));
    if (i >= 0) out[i] = p;
    else if (/^(size|length|width|inner diameter|bands?|drop|knot|teardrop|necklace)/i.test(p)) first.push(p);
    else out.push(p);
  }
  return m[1] + [...first, ...out].join(' ') + ' ' + m[3];
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await ctx.route('**/*', async (route) => {
  const url = route.request().url();
  if (NO_REPORT.test(url)) return route.abort();
  if (url.startsWith('https://size-demo.invalid/')) {
    const f = url.split('/').pop();
    return route.fulfill({ status: 200, contentType: 'image/jpeg', body: readFileSync(`${S}/sizing/cards/${f}`) });
  }
  if (url.includes('/api/2025-07/graphql.json')) {
    const resp = await route.fetch();
    let json;
    try { json = await resp.json(); } catch { return route.fulfill({ response: resp }); }
    const nodes = json?.data?.products?.edges?.map((e) => e.node) ?? (json?.data?.product ? [json.data.product] : []);
    for (const n of nodes) {
      if (!targets.includes(n.handle)) continue;
      const d = data[n.handle];
      const edges = n.images.edges;
      const at = Math.min(edges.length, 5); // inside the first six the site shows
      edges.splice(at, 0, { node: { url: `https://size-demo.invalid/${n.handle}.jpg`, altText: `${n.title} size guide` } });
      if (edges.length > 6) edges.length = 6;
      n.description = editDescription(n.description, d.propose);
    }
    return route.fulfill({ response: resp, json });
  }
  return route.continue();
});
// the welcome offer pop-up would cover the page after 9 s; mark it as already seen
await ctx.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen', '1'); } catch {} });
const page = await ctx.newPage();
// Arrive the way most visitors do: the catalogue is already loaded when the
// product page opens (client-side navigation from the listing).
await page.goto(`${SITE}/jewellery`, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(2500);
for (const h of targets) {
  await page.evaluate((h) => { window.history.pushState({}, '', `/jewellery/${h}`); window.dispatchEvent(new PopStateEvent('popstate')); }, h);
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 0));
  // gallery: go to the size image
  const idx = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')].filter((i) => i.src.includes('size-demo.invalid') && i.offsetParent !== null);
    const img = imgs[0];
    if (!img) return -1;
    const sc = img.closest('.snap-x');
    const slides = [...sc.children];
    const i = slides.indexOf(img.closest('button'));
    return i;
  });
  // the page holds two copies of the gallery; use the visible one's own dot button
  // JewelDetail renders {Gallery} twice and its scroll ref lands on the hidden
  // copy, so the dot sets the counter and the visible copy is scrolled here.
  await page.locator(`button[aria-label="View image ${idx + 1}"]:visible`).first().click();
  await page.waitForTimeout(600);
  await page.evaluate((i) => { const sc = [...document.querySelectorAll('.snap-x')].find((x) => x.offsetParent !== null); sc.style.scrollBehavior = 'auto'; sc.scrollLeft = i * sc.offsetWidth; }, idx);
  await page.waitForTimeout(700);
  console.log(h, await page.evaluate(() => { const sc = [...document.querySelectorAll('.snap-x')].find((x) => x.offsetParent !== null); const c = [...document.querySelectorAll('span')].find((x) => /^·\s*\d+\/\d+$/.test(x.textContent.trim())); return `scrollLeft ${sc.scrollLeft} counter ${c ? c.textContent.trim() : '?'}`; }));
  await page.screenshot({ path: `${S}/sizing/preview/${h}-gallery.png` });
  // details
  const needle = (data[h].propose[0] || '').split(':').slice(1).join(':').trim().split(' ').slice(0, 2).join(' ');
  const ok = await page.evaluate((needle) => {
    const dd = [...document.querySelectorAll('dd')].find((d) => d.textContent.includes(needle));
    if (!dd) return false;
    dd.closest('dl').scrollIntoView({ block: 'center' });
    return true;
  }, needle);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${S}/sizing/preview/${h}-details.png` });
  console.log(h, 'size image at slide', idx + 1, 'details', ok);
}
await b.close();
