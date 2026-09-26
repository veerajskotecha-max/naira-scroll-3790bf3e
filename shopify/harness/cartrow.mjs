// Measure the checkout button's delivery sub-line as a whole ROW — the outermost
// element that carries the full sentence — against the payment marks beside it.
// cartlocal.mjs's selector grabs whichever span holds the text; once the line is
// split into two spans that is the inner half, which is not a like-for-like
// comparison with the unsplit version. This one always takes the outer row.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
const BASE = process.env.BASE || 'http://localhost:8080';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const PATHNAME = process.env.PDP || '/jewellery/prism-riviere-bracelet';
const PHONES = [['fold-cover',344,882],['android-360',360,640],['android-360t',360,800],
                ['iphone-se',375,667],['iphone-14',390,844],['pixel',412,915]];
const proxy = async (route) => {
  const q = route.request();
  try {
    const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) });
  } catch { await route.abort(); }
};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let bad = 0;
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
    const co = p.locator('button', { hasText: /proceed to checkout/i }).first();
    await co.waitFor({ state: 'visible', timeout: 20000 });
    await p.waitForTimeout(1200);
    const m = await p.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].filter(e => /proceed to checkout/i.test(e.innerText||'')).pop();
      const badge = btn.querySelector('[aria-label*="Paytm, PhonePe"]');
      const rowOf = (btn) => {
        const hit = [...btn.querySelectorAll('*')].reverse()
          .find(e => /free insured delivery/i.test(e.textContent || ''));
        let row = hit;
        // climb until the node covers the whole sentence, stop before the title
        while (row && row !== btn) {
          const t = row.textContent || '';
          if (/prepaid/i.test(t) && !/proceed to checkout/i.test(t)) return row;
          row = row.parentElement;
        }
        return hit;
      };
      const row = rowOf(btn);
      const rr = row.getBoundingClientRect(), br = badge.getBoundingClientRect();
      const lh = parseFloat(getComputedStyle(row).lineHeight) || 0;
      return {
        rowText: row.innerText.replace(/\s+/g,' ').trim(),
        rowW: Math.round(rr.width), rowRight: Math.round(rr.right),
        badgeLeft: Math.round(br.left), badgeW: Math.round(br.width),
        overlapPx: Math.round(rr.right - br.left),   // >0 means the text runs under the marks
        rowH: Math.round(rr.height), lineHeight: Math.round(lh),
        lines: lh ? Math.round(rr.height/lh) : null,
        btnH: Math.round(btn.getBoundingClientRect().height),
        docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    writeFileSync(`${OUT}/${name}.png`, await p.screenshot());
    const ok = m.overlapPx <= 0 && m.docOverflow <= 0;
    if (!ok) bad++;
    console.log(`${ok?'PASS':'FAIL'} ${name.padEnd(13)} ${String(w).padStart(3)}  ${JSON.stringify(m)}`);
  } catch (e) { bad++; console.log(`FAIL ${name} ${e.message.slice(0,120)}`); }
  await ctx.close();
}
await b.close();
console.log(bad ? `\n${bad} viewport(s) still wrong` : '\nall viewports clean');
