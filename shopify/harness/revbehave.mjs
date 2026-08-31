// Drives the reviews block through the same clicks on both sides and prints
// the visible state after each, so React and the port can be diffed directly.
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
await ctx.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
const p = await ctx.newPage();
await p.route('**/*', r => r.request().url().includes('127.0.0.1') ? r.continue() : r.abort());
await p.goto(process.argv[2], { waitUntil: 'domcontentloaded' });
await p.waitForSelector('#customer-reviews');
await p.waitForTimeout(1500);

const state = () => p.evaluate(() => {
  const sec = document.querySelector('#customer-reviews');
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const cards = [...sec.querySelectorAll('div')].filter(d => {
    const h = d.firstElementChild, n = h && h.firstElementChild;
    return n && /^#\d+$/.test((n.textContent || '').trim());
  });
  const shown = cards.filter(vis);
  const chips = [...sec.querySelectorAll('button')].filter(bt => /^(All Reviews|With Photos|[1-5]★)$/.test(bt.textContent.trim()));
  const activeChip = chips.filter(c => getComputedStyle(c).backgroundColor !== 'rgba(0, 0, 0, 0)').map(c => c.textContent.trim());
  const loadMore = [...sec.querySelectorAll('button')].find(bt => bt.textContent.trim() === 'Load More Reviews');
  const none = [...sec.querySelectorAll('p')].find(x => x.textContent.trim() === 'No reviews match this filter.');
  return {
    shown: shown.length,
    badges: shown.slice(0, 4).map(c => c.firstElementChild.firstElementChild.textContent.trim()).join(' '),
    names: shown.slice(0, 2).map(c => c.querySelector('p').textContent.trim()).join(' / '),
    active: activeChip.join(','),
    loadMore: !!(loadMore && vis(loadMore)),
    none: !!(none && vis(none)),
  };
});
const click = async (label) => {
  await p.evaluate(t => {
    const sec = document.querySelector('#customer-reviews');
    const bt = [...sec.querySelectorAll('button')].find(x => x.textContent.trim() === t);
    if (!bt) throw new Error('no button ' + t);
    bt.click();
  }, label);
  await p.waitForTimeout(900);
};
const clickBar = async (stars) => {
  await p.evaluate(s => {
    const sec = document.querySelector('#customer-reviews');
    const bt = [...sec.querySelectorAll('button')].find(x => x.textContent.trim().startsWith(s + ' ★'));
    if (!bt) throw new Error('no bar ' + s);
    bt.click();
  }, stars);
  await p.waitForTimeout(900);
};

const log = async (step) => console.log(step.padEnd(22), JSON.stringify(await state()));
await log('initial');
await click('With Photos');   await log('chip With Photos');
await click('4★');            await log('chip 4 star');
await click('3★');            await log('chip 3 star');
await click('All Reviews');   await log('chip All Reviews');
await click('Load More Reviews'); await log('load more');
await clickBar('5');          await log('bar 5 star');
await clickBar('5');          await log('bar 5 star again');
await b.close();
