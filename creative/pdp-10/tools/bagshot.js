const { chromium } = require('playwright');
(async () => {
  const dir = process.argv[2];
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage();
  await p.goto('file://' + dir + '/proto/prototype.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  await p.click('#add'); await p.waitForTimeout(500);
  // add the ring from the card, then open the bag from the bar
  const ringAdd = await p.$('.added .add, .added button.add');
  if (ringAdd) { await ringAdd.click(); await p.waitForTimeout(500); }
  await p.screenshot({ path: dir + '/added2.png' });
  await p.click('#add'); await p.waitForTimeout(800);
  await p.screenshot({ path: dir + '/bag.png' });
  const t = await p.evaluate(() => document.body.innerText.match(/Total[\s\S]{0,80}/)?.[0]);
  console.log(t);
  await b.close();
})();
