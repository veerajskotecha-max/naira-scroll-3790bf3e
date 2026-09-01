// Smoke check for nf-shop-all's client-side filter/sort. Fails loudly if the
// grid stops responding to the sidebar controls.
import assert from 'node:assert';
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const p = await (await b.newContext({ viewport:{width:1440,height:1000} })).newPage();
await p.goto('http://127.0.0.1:4310/page.shop', { waitUntil:'domcontentloaded' });
const shown = () => p.$$eval('[data-nf-cell]', c => c.filter(x => !x.hidden).length);
const order = () => p.$$eval('[data-nf-cell]', c => c.filter(x=>!x.hidden).map(x => +x.dataset.price));
const all = await shown();
assert.ok(all > 1, 'grid rendered cells');

await p.click('[data-nf-f="size"][data-value="S"]');
const sized = await shown();
assert.ok(sized > 0 && sized < all, `size filter narrowed ${all} -> ${sized}`);
await p.click('[data-nf-f="size"][data-value="S"]');
assert.equal(await shown(), all, 'size filter toggles off');

await p.click('input[data-nf-f="avail"][value="Sold Out"]');
const soldout = await shown();
assert.ok(soldout > 0 && soldout < all, `availability filter narrowed ${all} -> ${soldout}`);
await p.click('[data-nf-clear]');
assert.equal(await shown(), all, 'reset restores every cell');

await p.click('.nf-shop-sort__trigger');
await p.click('[data-nf-sort="price-low"]');
const asc = await order();
assert.deepEqual(asc, [...asc].sort((x,y)=>x-y), 'price-low sorts ascending');
await p.click('.nf-shop-sort__trigger');
await p.click('[data-nf-sort="price-high"]');
const desc = await order();
assert.deepEqual(desc, [...desc].sort((x,y)=>y-x), 'price-high sorts descending');
assert.equal(await p.textContent('[data-nf-count]'), `${all} Products`, 'count text');

await p.$eval('[data-nf-f="price"]', el => { el.value = 20000; el.dispatchEvent(new Event('input', {bubbles:true})); });
const cheap = await shown();
assert.ok(cheap < all && (await order()).every(v => v <= 20000), `price cap kept ${cheap} cells, all <= 20000`);
console.log(`ok — ${all} cells; size ${sized}, sold-out ${soldout}, <=20k ${cheap}; sort + reset + count all pass`);
await b.close();
