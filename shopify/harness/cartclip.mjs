// Screenshot the cart footer CLIPPED to the checkout button, so before/after
// crops line up even though the button changes height between the two.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
const BASE = process.env.BASE || 'http://localhost:8080';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const PATHNAME = process.env.PDP || '/jewellery/prism-riviere-bracelet';
const PHONES = [['fold-cover',344,882],['android-360',360,640],['android-360t',360,800],
                ['iphone-se',375,667],['iphone-14',390,844],['pixel',412,915]];
const PAD_TOP = 34, PAD_BOTTOM = 34;   // enough for TOTAL AMOUNT above, Shiprocket below
const proxy = async (route) => {
  const q = route.request();
  try {
    const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) });
  } catch { await route.abort(); }
};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [name, w, h] of PHONES) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:2, isMobile:true, hasTouch:true,
    userAgent: name.startsWith('iphone')
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' });
  await ctx.route('**/*', proxy);
  const p = await ctx.newPage();
  try {
    await p.goto(BASE + PATHNAME, { waitUntil: 'load', timeout: 120000 });
    await p.waitForTimeout(4000);
    await p.locator('button', { hasText: /add to (cart|bag)/i }).first().click({ timeout: 25000 });
    await p.waitForTimeout(2500);
    await p.locator('button', { hasText: /proceed to checkout/i }).first().waitFor({ state: 'visible', timeout: 20000 });
    await p.waitForTimeout(1200);
    const box = await p.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].filter(e => /proceed to checkout/i.test(e.innerText||'')).pop();
      const r = btn.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    const clip = {
      x: 0, y: Math.max(0, box.y - PAD_TOP), width: w,
      height: Math.min(h - Math.max(0, box.y - PAD_TOP), box.h + PAD_TOP + PAD_BOTTOM),
    };
    writeFileSync(`${OUT}/${name}.png`, await p.screenshot({ clip }));
    console.log(`${name.padEnd(13)} ${w}px  button ${Math.round(box.h)}px tall  clip ${Math.round(clip.height)}px`);
  } catch (e) { console.log(`FAIL ${name} ${e.message.slice(0,110)}`); }
  await ctx.close();
}
await b.close();
