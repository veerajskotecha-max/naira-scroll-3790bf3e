const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, scheme] of [[360, 'light'], [390, 'dark'], [1440, 'light']]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
    const errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
    await p.goto('file://' + process.cwd() + '/index.html');
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
      const small = [...document.querySelectorAll('button, a, summary, input')].filter(n => { const b = n.getBoundingClientRect(); return b.width && b.height < 32; }).map(n => n.tagName + ':' + (n.textContent || '').slice(0, 20));
      return { sw, cw, cards: document.querySelectorAll('.card').length, patchCards: document.querySelectorAll('#patches .card').length, small: small.slice(0, 8) };
    });
    // approve both account-link options -> clash warning
    await p.click('.card[data-id="landings-ca79b89"] .choice button[data-v="yes"]');
    await p.click('.card[data-id="landings-f56804f"] .choice button[data-v="yes"]');
    const clash = await p.textContent('.card[data-id="landings-f56804f"] .rival');
    // hold a dependency -> warning on dependent
    await p.click('.card[data-id="contrast-108a8d0"] .choice button[data-v="no"]');
    await p.click('.card[data-id="contrast-9a1c33c"] .choice button[data-v="yes"]');
    const dep = await p.textContent('.card[data-id="contrast-9a1c33c"] .needs:not(.rival)');
    // approve-all in checkout skips optional
    await p.click('#sec-checkout .sec-tools .btn');
    const optState = await p.getAttribute('.card[data-id="checkout-98ca8cb"] .choice button[data-v="yes"]', 'aria-pressed');
    const tally = await p.textContent('.tally .count');
    const card = p.locator('.card[data-id="prices-41e1a06"]');
    await card.locator('details').first().evaluate(d => d.open = true);
    await card.scrollIntoViewIfNeeded();
    await card.screenshot({ path: `card-${w}-${scheme}.png` });
    await p.screenshot({ path: `top-${w}-${scheme}.png` });
    const sw2 = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(w, scheme, JSON.stringify(r), '| overflow after open:', sw2, '| tally', tally.trim(), '| optional untouched:', optState, '\n  clash:', clash, '\n  dep:', dep, '\n  errors:', errs.filter(e => !/fonts|ERR_FAILED/.test(e)));
    await p.close();
  }
  await b.close();
})();
