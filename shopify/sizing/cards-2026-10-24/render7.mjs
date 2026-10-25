// Golden Duet as one adjustable ring (owner, 24 Oct 2026): open toi et moi, fits US 5 to 8.
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
const S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/sizing';
const card = { id: 'golden-duet-ring', type: 'R', title: 'Golden Duet Ring', inner: 17.3, open: true, sizes: ['5', '6', '6½', '7', '8'],
  sub: 'US 7 SHOWN · OPEN BACK', caption: 'Open back · fits US 5 to 8',
  note: 'Pick your size and we send the closest fit; the open back eases the rest.' };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: 1 });
await page.goto(`file://${S}/render/card.html`);
await page.evaluate((c) => window.renderCard(c), card);
await page.waitForTimeout(400);
await page.locator('#card').screenshot({ path: `${S}/new7/golden-duet-ring-size-guide.jpg`, type: 'jpeg', quality: 90 });
await b.close();
console.log('rendered');
