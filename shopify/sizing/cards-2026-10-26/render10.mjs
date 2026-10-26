// Closed rings, 26 Oct 2026. The owner: Chevron Whisper, Pearl Ribbon and
// Whisper Pavé are US 6, with other sizes on pre-order (their cards said US 7,
// 17.3 mm, and about 6½, 17 mm). Vintage Halo, also US 6, gets the same line.
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad';
const OUT = process.argv[2] || dirname(fileURLToPath(import.meta.url));
const caption = 'US 6 · 16.5 mm inside · US 5 and 7 on pre-order';
const cards = [
  { id: 'chevron-whisper-ring', title: 'Chevron Whisper Ring' },
  { id: 'pearl-ribbon-ring', title: 'Pearl Ribbon Ring' },
  { id: 'whisper-pave-band', title: 'Whisper Pavé Band' },
  { id: 'vintage-halo-ring', title: 'Vintage Halo Ring' },
].map((c) => ({ ...c, type: 'R', inner: 16.5, open: false, caption }));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: 1 });
await page.goto(`file://${S}/sizing/render/card.html`);
for (const c of cards) {
  await page.evaluate((card) => window.renderCard(card), c);
  await page.waitForTimeout(400);
  await page.locator('#card').screenshot({ path: `${OUT}/${c.id}-size-guide.jpg`, type: 'jpeg', quality: 90 });
}
await b.close();
console.log('rendered', cards.length);
