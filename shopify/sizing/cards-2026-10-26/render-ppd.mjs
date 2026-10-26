// Prism Pear Drop Necklace size guide (type B), published 26 Oct 2026 without one.
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad';
const DIR = new URL('.', import.meta.url).pathname.replace(/\/$/, '');
const specs = JSON.parse(readFileSync(`${DIR}/specs-ppd.json`, 'utf8'));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: 1 });
await page.goto(`file://${S}/sizing/render/card.html`);
for (const c of specs) {
  await page.evaluate((card) => window.renderCard(card), c);
  await page.waitForTimeout(500);
  await page.locator('#card').screenshot({ path: `${DIR}/${c.id}-size-guide.jpg`, type: 'jpeg', quality: 90 });
}
await b.close();
console.log('rendered', specs.map((c) => c.id).join(', '));
