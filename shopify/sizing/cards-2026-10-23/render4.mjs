// Re-renders the Cushion Halo Ring size guide as adjustable, US 5 to 8 (owner, 23 Oct 2026).
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
const S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/sizing';
const card = {
  id: 'cushion-halo-ring', type: 'R', title: 'Cushion Halo Ring',
  inner: 17, open: false, sizes: ['5', '6', '6½', '7', '8'],
  sub: 'INNER DIAMETER AT REST · ADJUSTABLE',
  caption: 'Adjustable · fits US 5 to 8',
  note: 'Measured at rest; it adjusts from about 15.7 mm to 18.1 mm.',
};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: 1 });
await page.goto(`file://${S}/render/card.html`);
await page.evaluate((c) => window.renderCard(c), card);
await page.waitForTimeout(500);
await page.locator('#card').screenshot({ path: `${S}/new4/cushion-halo-ring-size-guide.jpg`, type: 'jpeg', quality: 90 });
await b.close();
console.log('rendered');
