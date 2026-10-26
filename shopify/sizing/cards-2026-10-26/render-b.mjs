// Renders specs-b.json (type B, explicit marks) with the shared card template to <id>-size-guide.jpg,
// as shopify/sizing/cards-2026-10-22/render3.mjs. Usage: node render.mjs [id ...]
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad';
const OUT = dirname(fileURLToPath(import.meta.url));
const only = process.argv.slice(2);
const specs = JSON.parse(readFileSync(`${OUT}/specs-b.json`, 'utf8')).filter((c) => !only.length || only.includes(c.id));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: 1 });
await page.goto(`file://${S}/sizing/render/card.html`);
for (const c of specs) {
  await page.evaluate((card) => window.renderCard(card), c);
  await page.waitForTimeout(400);
  await page.locator('#card').screenshot({ path: `${OUT}/${c.id}-size-guide.jpg`, type: 'jpeg', quality: 90 });
}
console.log('rendered', specs.map((c) => c.id).join(', '));
await b.close();
