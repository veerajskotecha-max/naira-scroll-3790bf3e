// Screenshot the open bag (and wishlist) at phone widths and on desktop.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const [BASE, OUT] = process.argv.slice(2); mkdirSync(OUT, { recursive: true });
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google)/i;
const SIZES = [['344', 344, 882, true], ['360', 360, 780, true], ['390', 390, 844, true], ['412', 412, 915, true], ['desktop', 1280, 860, false]];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [name, w, h, phone] of SIZES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: phone, hasTouch: phone,
    userAgent: phone ? 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' : undefined });
  await ctx.route('**/*', async (route) => { const q = route.request(); if (BLOCK.test(q.url())) return route.abort();
    try { const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
      const hh = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers: hh, body: Buffer.from(await r.arrayBuffer()) }); } catch { await route.abort().catch(() => {}); } });
  const p = await ctx.newPage();
  await p.goto(BASE + '/jewellery/prism-riviere-bracelet', { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => /add to (cart|bag)/i.test(document.body.innerText), null, { timeout: 60000 }); await p.waitForTimeout(1500);
  await p.locator('button', { hasText: /add to (cart|bag)/i }).first().click();
  await p.waitForFunction(() => [...document.querySelectorAll('[role="dialog"]')].some((d) => /your bag/i.test(d.innerText) && d.getAttribute('data-state') === 'open'));
  await p.waitForTimeout(1400);
  writeFileSync(`${OUT}/bag-${name}.png`, await p.screenshot());
  await ctx.close();
  console.log('shot', name);
}
await b.close();
