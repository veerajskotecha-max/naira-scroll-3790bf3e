// Renders new3/specs.json (type B, explicit marks) to new3/<id>-size-guide.jpg with the shared card template.
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/sizing';
const specs = JSON.parse(readFileSync(`${S}/new3/specs.json`, 'utf8'));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: 1 });
await page.goto(`file://${S}/render/card.html`);
for (const spec of specs) {
  const c = { ...spec, img: `file://${S}/${spec.img}` };
  await page.evaluate((card) => window.renderCard(card), c);
  await page.waitForTimeout(400);
  await page.locator('#card').screenshot({ path: `${S}/new3/${c.id}-size-guide.jpg`, type: 'jpeg', quality: 90 });
}
console.log('rendered', specs.length);
await b.close();
