import { chromium } from 'playwright';
/* The one failure that would be catastrophic: nf-brand.css hides .nf-r at
   opacity 0, so if the class were NOT gated behind html.nf-motion and the
   script failed to load, the whole grid would render blank. Block the script
   and prove everything stays visible. */
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
await ctx.route('**/nf-motion.js', r => r.abort());
const page = await ctx.newPage();
await page.goto('file://' + process.cwd() + '/shopify/harness/stage/index.html', { waitUntil: 'load' });
await page.waitForTimeout(900);
const r = await page.evaluate(() => {
  const items = [...document.querySelectorAll('.resource-list__item')];
  return {
    motionClass: document.documentElement.classList.contains('nf-motion'),
    items: items.length,
    invisible: items.filter(el => getComputedStyle(el).opacity !== '1').length,
    headingVisible: getComputedStyle(document.querySelector('.text-block')).opacity,
  };
});
console.log(JSON.stringify(r));
console.log(r.invisible === 0 && !r.motionClass
  ? `PASS - script blocked, all ${r.items} cards still visible`
  : `FAIL - ${r.invisible} of ${r.items} cards invisible with the script blocked`);
await b.close();
