// After the bag closes, does a scroll land where it was sent? Trace scrollY
// and the scroll lock over time, for different ways of closing.
import { chromium } from 'playwright';
const [BASE, HOW = 'cross'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await ctx.route('**/*', async (route) => { const q = route.request(); if (/(facebook|clarity|google-analytics|googletagmanager)/i.test(q.url())) return route.abort();
  try { const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) }); } catch { await route.abort().catch(() => {}); } });
const p = await ctx.newPage();
await p.goto(BASE + '/jewellery'); await p.waitForTimeout(2000);
await p.locator('a[href="/jewellery/prism-riviere-bracelet"]').first().click();
await p.waitForFunction(() => /add to (cart|bag)/i.test(document.body.innerText)); await p.waitForTimeout(1500);
await p.evaluate(() => scrollTo(0, 900)); await p.waitForTimeout(700);
await p.locator('[aria-label="Open cart"]').first().click(); await p.waitForTimeout(1000);
await p.evaluate(() => { window.__t = []; const t0 = performance.now(); const tick = () => { window.__t.push([Math.round(performance.now() - t0), Math.round(scrollY), document.body.style.overflow || getComputedStyle(document.body).overflow, (document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName || '').slice(0, 18)]); if (performance.now() - t0 < 2200) requestAnimationFrame(tick); }; tick(); });
if (HOW === 'back') await p.goBack();
if (HOW === 'cross') await p.locator('[role="dialog"] button:has(.sr-only:text-is("Close"))').click({ force: true });
if (HOW === 'arrow') await p.getByRole('button', { name: 'Back to shopping' }).click();
await p.waitForTimeout(600);
await p.evaluate(() => scrollTo(0, 1300));
await p.waitForTimeout(1700);
const t = await p.evaluate(() => window.__t);
const pick = t.filter((r, i) => i === 0 || r[1] !== t[i - 1][1] || r[2] !== t[i - 1][2] || r[3] !== t[i - 1][3]);
console.log(`close by ${HOW}: final scrollY ${t[t.length - 1][1]}`);
for (const r of pick.slice(0, 14)) console.log(`   +${String(r[0]).padStart(4)} ms  y=${String(r[1]).padStart(5)}  body overflow=${r[2].padEnd(7)} focus=${r[3]}`);
await b.close();
