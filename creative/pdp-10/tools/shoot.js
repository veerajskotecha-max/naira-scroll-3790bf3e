// Render the prototype as a phone (360x640, the Instagram browser on Android): first screen, full page, measurements.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const dir = process.argv[2];
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + dir + '/prototype.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const m = await p.evaluate(() => {
    const q = s => document.querySelector(s);
    const box = s => { const e = q(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; };
    const fonts = [...new Set([...document.querySelectorAll('body *')].map(e => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '').trim()))];
    const small = [...document.querySelectorAll('button, a, summary')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.height < 40 || r.width < 40); }).map(e => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30));
    const bar = q('.buybar') ? Math.round(q('.buybar').getBoundingClientRect().top) : null;
    const facts = q('#product-facts'); const last = facts && facts.lastElementChild; const fb = last ? Math.round(last.getBoundingClientRect().bottom) : null;
    return { firstScreen: { gallery: box('.gal'), h1: box('h1'), facts: fb, barTop: bar, factsClearOfBar: fb !== null && bar !== null ? fb <= bar : null }, pageHeight: document.documentElement.scrollHeight, fontFamilies: fonts, smallTapTargets: small };
  });
  m.consoleErrors = errors;
  let bytes = 0; for (const f of fs.readdirSync(dir + '/i')) bytes += fs.statSync(dir + '/i/' + f).size;
  m.imageKB = Math.round(bytes / 1024);
  fs.writeFileSync(dir + '/../measure.json', JSON.stringify(m, null, 2));
  console.log(JSON.stringify(m));
  await p.screenshot({ path: dir + '/../fold.png' });
  await p.screenshot({ path: dir + '/../full.png', fullPage: true });
  // the moment after Add to bag (the step where 80% of adds are lost), and an ad landing (message match)
  const add = await p.$('#add');
  if (add) { await p.evaluate(() => window.scrollTo(0, 0)); await add.click(); await p.waitForTimeout(700); await p.screenshot({ path: dir + '/../added.png' }); }
  const p2 = await c.newPage();
  await p2.goto('file://' + dir + '/prototype.html?utm_source=meta&utm_content=prism_sugar_p1&fbclid=TEST', { waitUntil: 'networkidle' });
  await p2.waitForTimeout(600);
  await p2.screenshot({ path: dir + '/../fold-ad.png' });
  await b.close();
})();
