// Screenshot every rendered template at mobile + desktop.
import { chromium } from 'playwright';
import fs from 'node:fs';

// Sandbox has Chromium 1194; playwright 1.57 expects 1217. Pin the binary.
const CHROME = '/opt/pw-browsers/chromium';
import path from 'node:path';

const OUT  = process.env.OUT_DIR  || path.join(import.meta.dirname, '..', 'rendered');
const SHOT = process.env.SHOT_DIR || path.join(import.meta.dirname, '..', 'shots');
const PORT = Number(process.env.PORT || 4310);
const VIEWS = [
  { tag: 'mobile',  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { tag: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
];

const names = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(OUT).filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, ''));

fs.mkdirSync(SHOT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const results = [];
for (const v of VIEWS) {
  // reducedMotion activates the theme's own @media (prefers-reduced-motion)
  // rule, which sets .nf-reveal { opacity: 1 !important }. Scroll-reveal
  // sections are opacity:0 until an IntersectionObserver adds .nf-in, and that
  // does not fire reliably during a full-page capture — this uses the theme's
  // real accessibility fallback instead of overriding its styles.
  const ctx = await browser.newContext({ viewport: v.viewport, deviceScaleFactor: v.deviceScaleFactor, isMobile: v.isMobile, hasTouch: v.hasTouch, reducedMotion: 'reduce' });
  const page = await ctx.newPage();

  // Localhost is reachable directly; every external host (Shopify CDN images,
  // Google Fonts) must go through Node fetch — headless Chromium in this
  // sandbox gets ERR_CONNECTION_RESET on direct external navigation.
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.includes('127.0.0.1') || url.includes('localhost')) return route.continue();
    try {
      const res = await fetch(url, { redirect: 'follow' });
      const body = Buffer.from(await res.arrayBuffer());
      const headers = Object.fromEntries(res.headers);
      delete headers['content-encoding']; delete headers['content-length'];
      await route.fulfill({ status: res.status, headers, body });
    } catch { await route.abort(); }
  });
  for (const n of names) {
    const dest = path.join(SHOT, `${n}-${v.tag}.png`);
    process.stdout.write(`  ${n}-${v.tag} ... `);
    try {
      await page.goto(`http://127.0.0.1:${PORT}/${n}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForLoadState('load', { timeout: 20000 }).catch(() => {});
      // Force every lazy image to fetch. Scrolling alone proved unreliable here:
      // images had correct geometry and were visible, yet never requested, so
      // whole sections captured blank. For a full-page shot we want them all.
      await page.evaluate(async () => {
        const imgs = [...document.querySelectorAll('img')];
        imgs.forEach((i) => { i.loading = 'eager'; if (i.dataset.src && !i.src) i.src = i.dataset.src; });
        await Promise.all(imgs.map((i) => i.complete ? null : new Promise((r) => {
          i.addEventListener('load', r, { once: true });
          i.addEventListener('error', r, { once: true });
          setTimeout(r, 8000);
        })));
      }).catch(() => {});

      // Bounded: fixed step count. The old loop used a growing scrollHeight as its
      // guard, so lazy-loading content could keep it spinning forever.
      await page.evaluate(async () => {
        const step = 800, max = 60;
        for (let i = 0; i < max; i++) {
          window.scrollTo(0, i * step);
          if (i * step > document.body.scrollHeight) break;
          await new Promise((r) => setTimeout(r, 30));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(700);
      // A fullPage capture paints position:fixed elements at every scroll band,
      // so a sticky buy bar smears down the whole image and reads as a duplicate
      // CTA. Pin them out for the shot only.
      // Neutralise ONLY position:fixed elements. A blanket
      // *{position:static} also flattens every absolute/relative layout —
      // it collapsed the testimonials collage and craftsmanship overlay and
      // made them look like empty bands in the capture.
      await page.evaluate(() => {
        for (const el of document.querySelectorAll('body *')) {
          if (getComputedStyle(el).position === 'fixed') el.style.setProperty('position', 'absolute', 'important');
        }
      }).catch(() => {});
      await page.waitForTimeout(200);

      // animations:'disabled' freezes the drifting-petal and marquee keyframes —
      // without it Chromium never reaches a stable frame and capture times out.
      // scale:'css' keeps very tall pages within Chromium's capture limits.
      await page.screenshot({ path: dest, fullPage: true, animations: 'disabled', scale: 'css', timeout: 120000 });
      console.log(`${(fs.statSync(dest).size / 1024).toFixed(0)}KB`);
      results.push(`${(n + '-' + v.tag).padEnd(34)} ${String(fs.statSync(dest).size).padStart(8)}b`);
    } catch (e) { results.push(`${(n + '-' + v.tag).padEnd(34)} FAIL ${String(e.message).split('\n')[0].slice(0, 70)}`); }
  }
  await ctx.close();
}
await browser.close();
console.log(results.join('\n'));
