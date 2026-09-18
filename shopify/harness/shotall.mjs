// Shoot Savor (unpublished preview) and the live Lovable site for the same
// journeys, so the two can be put side by side. Every request is proxied
// through Node fetch because Chromium here cannot reach external hosts.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const THEME   = '151142826146';
const SHOP    = 'https://nc5eti-gp.myshopify.com';
const LIVE    = 'https://nairaflore.com';
const PREVIEW = `_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`;
const OUT     = process.argv[2];
const ONLY    = process.argv[3];            // 'savor' | 'live' | undefined
const PAGEF   = process.argv[4];            // comma list of page names
mkdirSync(OUT, { recursive: true });

// name, savor path, live path  (null = page does not exist on that side)
const PAGES = [
  ['home',    '/',                                   '/'],
  ['shopall', '/collections/shop-all',               '/jewellery'],
  ['collect', '/collections/necklaces',              '/jewellery/collections/necklaces'],
  ['product', '/products/serpentine-whisper-chain',  '/jewellery/serpentine-whisper-chain'],
  ['cart',    '/cart',                               null],
  ['journal', '/blogs/journal',                      '/journal'],
  ['about',   '/pages/about',                        '/about'],
  ['contact', '/pages/contact',                      '/contact'],
  ['search',  '/search?q=ring',                      null],
  ['notfound','/pages/does-not-exist-xyz',           null],
  ['colls',   '/collections',                        null],
];

const jar = new Map();
const cookieHeader = () => [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
const eat = (r) => { for (const [k, v] of r.headers) if (k.toLowerCase() === 'set-cookie')
  v.split(/,(?=[^;]+=)/).forEach(c => { const [kk, vv] = c.split(';')[0].split('='); if (kk && vv) jar.set(kk.trim(), vv.trim()); }); };

// Prime the preview cookie: the first document request otherwise races the
// primary-domain redirect and Shopify serves MAIN instead of the preview.
eat(await fetch(`${SHOP}/?${PREVIEW}`, { redirect: 'manual' }));
console.log('primed:', [...jar.keys()].join(', ') || '(none)');

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({
  viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
});

await ctx.route('**/*', async (route) => {
  const req = route.request();
  let url = req.url();
  // The preview flags have to ride on the section-rendering XHRs too, not just
  // documents. product-recommendations fetches /recommendations/products?...
  // and without them Shopify 302s to the primary domain and answers from the
  // LIVE theme, where this section id does not exist -- so the section rendered
  // as four empty skeleton boxes and looked like a broken page.
  if (url.startsWith(SHOP) && (req.resourceType() === 'document' || /\/(recommendations|search|collections|cart)\//.test(url) || url.includes('section_id=')))
    url += (url.includes('?') ? '&' : '?') + PREVIEW;
  try {
    const r = await fetch(url, {
      method: req.method(),
      headers: { ...req.headers(), cookie: url.startsWith(SHOP) ? cookieHeader() : '' },
      body: req.postData() || undefined, redirect: 'follow',
    });
    if (url.startsWith(SHOP)) eat(r);
    const buf = Buffer.from(await r.arrayBuffer());
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length|set-cookie)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: buf });
  } catch { await route.abort(); }
});

const shoot = async (side, name, path) => {
  for (const [w, tag] of [[1440, 'desk'], [390, 'phone']]) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: w, height: tag === 'phone' ? 844 : 1000 });
    try {
      await page.goto((side === 'savor' ? SHOP : LIVE) + path, { waitUntil: 'load', timeout: 70000 });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      await page.waitForTimeout(2800);
      // walk the page so lazy images and reveal animations fire
      await page.evaluate(async () => {
        const pw = document.querySelector('.page-wrapper');
        const sc = pw && getComputedStyle(pw).overflowY !== 'visible' ? pw : window;
        const H = (sc === window ? document.body.scrollHeight : sc.scrollHeight);
        for (let y = 0; y < H; y += window.innerHeight * 0.8) { sc.scrollTo(0, y); await new Promise(r => setTimeout(r, 220)); }
        sc.scrollTo(0, H);
      });
      // Product recommendations and other below-the-fold sections fetch their
      // own markup on intersection. 1.4s was not enough and they screenshotted
      // as four empty skeleton boxes.
      await page.waitForTimeout(2600);
      // Product recommendations fetch their markup on intersection and need to
      // STAY in view while it resolves; a scroll that sweeps past them leaves
      // four empty skeleton boxes in the capture.
      // Wait for the fetch to actually land rather than guessing a duration --
      // a fixed timeout screenshotted four empty skeleton boxes more than once.
      const rec = await page.$('product-recommendations');
      if (rec) {
        await rec.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForFunction(
          () => { const r = document.querySelector('product-recommendations');
                  return !r || r.querySelectorAll('product-card, .product-card').length > 0; },
          { timeout: 15000 },
        ).catch(() => console.log('  (recommendations never populated)'));
        await page.waitForTimeout(1200);
      }
      await page.evaluate(() => { const pw = document.querySelector('.page-wrapper'); (pw||window).scrollTo(0,0); window.scrollTo(0,0); });
      await page.waitForTimeout(900);
      // Above 990px Horizon scrolls .page-wrapper, not the window, so Playwright's
      // fullPage capture stops at the viewport. Unlock the scroller for the shot only.
      // Above 990px Horizon scrolls .page-wrapper, not the window, so Playwright's
      // fullPage capture stops at the viewport. Unlock the scroller for the shot
      // only -- and unlock ONLY overflow and height. Zeroing min-height as well
      // collapsed the footer group's children, which made the footer screenshot
      // as an empty band while the live page rendered it correctly.
      await page.addStyleTag({ content: `
        html, body { overflow: visible !important; height: auto !important; }
        .page-wrapper { overflow: visible !important; height: auto !important; }
        /* Chromium skips painting content-visibility:auto subtrees that are
           off-screen, and a fullPage capture does not force them on. Without
           this the footer group screenshots as an empty band. */
        * { content-visibility: visible !important; contain-intrinsic-size: auto !important; }
      ` });
      await page.waitForTimeout(700);
      const info = await page.evaluate(() => ({
        themeId: (window.Shopify && Shopify.theme && Shopify.theme.id) || null,
        title: document.title.trim().slice(0, 44),
        h: document.body.scrollHeight,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bg: getComputedStyle(document.body).backgroundColor,
        imgs: document.images.length,
        broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length,
        placeholder: !!document.querySelector('svg.placeholder-svg, .hero__media svg'),
      }));
      if (side === 'savor' && String(info.themeId) !== THEME) {
        console.log(`${side}/${name}/${tag} WRONG-THEME ${info.themeId}`); await page.close(); continue;
      }
      console.log(`${side}/${name}/${tag}`, JSON.stringify(info));
      writeFileSync(`${OUT}/${side}-${name}-${tag}.png`, await page.screenshot({ fullPage: true }));
    } catch (e) { console.log(`${side}/${name}/${tag} FAILED ${e.message.slice(0, 80)}`); }
    await page.close();
  }
};

for (const [name, sp, lp] of PAGES) {
  if (PAGEF && !PAGEF.split(',').includes(name)) continue;
  if (sp && ONLY !== 'live')  await shoot('savor', name, sp);
  if (lp && ONLY !== 'savor') await shoot('live',  name, lp);
}
await b.close();
