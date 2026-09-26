// Photograph the cart drawer on real phone widths against a LOCAL build, so the
// checkout-button layout can be verified before the change is pushed.
//
// cartphones.mjs does the same thing against the live site; this is its twin,
// pointed at a dev server, and it additionally *measures* the thing that was
// broken instead of leaving it to the eye: the delivery sub-line used to run
// underneath the payment marks and clip mid-word.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:8080';
const OUT = process.argv[2];
const PATHNAME = process.env.PDP || '/jewellery/prism-riviere-bracelet';
mkdirSync(OUT, { recursive: true });

const PHONES = [
  ['fold-cover',  344, 882],
  ['android-360', 360, 640],
  ['android-360t',360, 800],
  ['iphone-se',   375, 667],
  ['iphone-14',   390, 844],
  ['pixel',       412, 915],
];

// Chromium has no direct egress here; Node does. Everything goes through fetch,
// including localhost — the dev server answers it the same way.
const proxy = async (route) => {
  const q = route.request();
  try {
    const r = await fetch(q.url(), {
      method: q.method(), headers: q.headers(),
      body: q.postData() || undefined, redirect: 'follow',
    });
    const buf = Buffer.from(await r.arrayBuffer());
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: buf });
  } catch { await route.abort(); }
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let bad = 0;

for (const [name, w, h] of PHONES) {
  const ctx = await b.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: name.startsWith('iphone')
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  });
  await ctx.route('**/*', proxy);
  const p = await ctx.newPage();
  try {
    await p.goto(BASE + PATHNAME, { waitUntil: 'load', timeout: 120000 });
    await p.waitForTimeout(4000);
    const add = p.locator('button', { hasText: /add to (cart|bag)/i }).first();
    await add.click({ timeout: 25000 });
    await p.waitForTimeout(2500);
    const co = p.locator('button', { hasText: /proceed to checkout/i }).first();
    if (!(await co.isVisible().catch(() => false))) {
      await p.locator('[aria-label*="cart" i]').last().click({ timeout: 8000 }).catch(() => {});
      await p.waitForTimeout(2000);
    }
    await co.waitFor({ state: 'visible', timeout: 20000 });
    await p.waitForTimeout(1200);

    writeFileSync(`${OUT}/${name}.png`, await p.screenshot());

    const m = await p.evaluate(() => {
      const co = [...document.querySelectorAll('button')]
        .filter(e => /proceed to checkout/i.test(e.innerText || '')).pop();
      if (!co) return { found: false };
      const rowOf = (co) => {
        const hit = [...co.querySelectorAll('*')].reverse()
          .find(e => /free insured delivery/i.test(e.textContent || ''));
        let row = hit;
        // climb until the node covers the whole sentence, stop before the title
        while (row && row !== co) {
          const t = row.textContent || '';
          if (/prepaid/i.test(t) && !/proceed to checkout/i.test(t)) return row;
          row = row.parentElement;
        }
        return hit;
      };
      const sub = rowOf(co);
      const badge = co.querySelector('[aria-label*="Paytm, PhonePe"]');
      const r = co.getBoundingClientRect();
      const sr = sub ? sub.getBoundingClientRect() : null;
      const br = badge ? badge.getBoundingClientRect() : null;
      // horizontal overlap between the text line and the payment marks
      const overlapPx = sr && br ? Math.round(Math.min(sr.right, br.right) - Math.max(sr.left, br.left)) : null;
      return {
        found: true,
        btn: { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) },
        subText: sub ? sub.innerText.replace(/\s+/g, ' ').trim() : null,
        // > clientWidth means the browser is hiding characters
        subClipped: sub ? sub.scrollWidth > sub.clientWidth + 1 : null,
        subLines: sr && sub ? Math.round(sr.height / parseFloat(getComputedStyle(sub).lineHeight || '0')) : null,
        badgeOverlapPx: overlapPx,
        docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    const ok = m.found && m.subClipped === false && (m.badgeOverlapPx ?? -1) <= 0 && m.docOverflow <= 0;
    if (!ok) bad++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name.padEnd(13)} ${String(w).padStart(3)}x${h}  ${JSON.stringify(m)}`);
  } catch (e) {
    bad++;
    console.log(`FAIL ${name} ${e.message.slice(0, 120)}`);
  }
  await ctx.close();
}
await b.close();
console.log(bad ? `\n${bad} viewport(s) still wrong` : '\nall viewports clean');
process.exit(bad ? 1 : 0);
