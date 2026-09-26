// Open the live cart on a range of real phone viewports and photograph it.
// Chromium here has no direct network access, so every request is proxied.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });

// Widths that actually show up in Indian mobile traffic, plus the two edges.
const PHONES = [
  ['fold-cover',  344, 882, 'Galaxy Z Fold cover screen — narrowest in the wild'],
  ['android-360', 360, 640, 'Galaxy A / Redmi baseline — the most common Android'],
  ['android-360t',360, 800, 'Galaxy A tall'],
  ['iphone-se',   375, 667, 'iPhone SE — smallest current iOS'],
  ['iphone-14',   390, 844, 'iPhone 14/15'],
  ['pixel',       412, 915, 'Pixel / large Android'],
];

const proxy = async (route) => {
  const q = route.request();
  try {
    const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
    const buf = Buffer.from(await r.arrayBuffer());
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: buf });
  } catch { await route.abort(); }
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [name, w, h, note] of PHONES) {
  const ctx = await b.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: name.startsWith('iphone')
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  });
  await ctx.route('**/*', proxy);
  const p = await ctx.newPage();
  try {
    await p.goto('https://nairaflore.com/jewellery/prism-riviere-bracelet', { waitUntil: 'load', timeout: 120000 });
    await p.waitForTimeout(3500);
    // add to cart, however the button is labelled
    const add = p.locator('button', { hasText: /add to (cart|bag)/i }).first();
    await add.click({ timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(2500);
    // the drawer usually opens itself; if not, hit the cart icon
    let open = await p.locator('text=/checkout|proceed/i').first().isVisible().catch(() => false);
    if (!open) {
      await p.locator('[aria-label*="cart" i], button:has(svg)').last().click({ timeout: 8000 }).catch(() => {});
      await p.waitForTimeout(2000);
    }
    await p.waitForTimeout(1500);
    writeFileSync(`${OUT}/${name}.png`, await p.screenshot());

    // measure the checkout button and whatever sits near it
    const m = await p.evaluate(() => {
      const btns = [...document.querySelectorAll('button, a')].filter(e => /checkout|proceed to/i.test(e.innerText || ''));
      const co = btns[btns.length - 1];
      if (!co) return { found: false };
      const r = co.getBoundingClientRect();
      const cs = getComputedStyle(co);
      // anything overlapping the button's box that is not its own child
      const clash = [...document.querySelectorAll('body *')].filter(e => {
        if (e === co || co.contains(e) || e.contains(co)) return false;
        const b2 = e.getBoundingClientRect();
        if (!b2.width || !b2.height) return false;
        const over = !(b2.right < r.left || b2.left > r.right || b2.bottom < r.top || b2.top > r.bottom);
        return over && getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)';
      }).slice(0, 4).map(e => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 34)}`);
      return {
        found: true,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        offBottom: Math.round(r.bottom - innerHeight),
        offRight: Math.round(r.right - innerWidth),
        fontSize: cs.fontSize, padding: cs.padding,
        text: (co.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 48),
        overlapping: clash,
        docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    console.log(`${name.padEnd(13)} ${String(w).padStart(3)}x${h}  ${JSON.stringify(m)}`);
  } catch (e) {
    console.log(`${name} FAILED ${e.message.slice(0, 90)}`);
  }
  await ctx.close();
}
await b.close();
