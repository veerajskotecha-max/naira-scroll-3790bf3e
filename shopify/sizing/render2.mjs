// Renders the explicit card specs in sizing/data2.json (N, W, R, C) to sizing/cards/<id>.jpg.
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad';
const specs = JSON.parse(readFileSync(`${S}/sizing/${process.env.SPECS || 'data2.json'}`, 'utf8'));
const titles = Object.fromEntries(JSON.parse(readFileSync(`${S}/catalogue/products.json`, 'utf8')).map((p) => [p.handle, p.title]));
Object.assign(titles, JSON.parse(readFileSync(`${S}/sizing/draft-titles.json`, 'utf8')));
const only = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: 1 });
await page.goto(`file://${S}/sizing/render/card.html`);
let n = 0;
for (const spec of specs) {
  if (only.length && !only.includes(spec.id)) continue;
  const c = { ...spec, title: (spec.title || titles[spec.id]).replace(/\s+[–—-]\s+Silver$/i, '') };
  if (c.type === 'W') { c.fitLo = c.length - 2.5; c.fitHi = c.length + (c.ext || 0) - 1.5; }
  if (c.img) c.img = 'file://' + c.img;
  await page.evaluate((card) => window.renderCard(card), c);
  await page.waitForTimeout(120);
  await page.locator('#card').screenshot({ path: `${S}/sizing/cards/${c.id}.jpg`, type: 'jpeg', quality: 90 });
  n++;
}
console.log('rendered', n);
await b.close();
