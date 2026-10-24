// Size guides after the owner's word of 24 Oct 2026: Cushion Halo fits US 5 to 7, and
// Blush Cluster is an open ring (KAVNAR's sample), fitting US 5 to 8 like the others.
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
const S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/sizing';
const cards = [
  { id: 'cushion-halo-ring', type: 'R', title: 'Cushion Halo Ring', inner: 17, open: true, sizes: ['5', '6', '6½', '7'],
    sub: 'INNER DIAMETER AT REST · OPEN BACK', caption: 'Open back · fits US 5 to 7',
    note: 'Measured at rest; it adjusts from about 15.7 mm to 17.3 mm.' },
  { id: 'blush-cluster-ring', type: 'R', title: 'Blush Cluster Ring', inner: 17, open: true, sizes: ['5', '6', '6½', '7', '8'],
    sub: 'INNER DIAMETER AT REST · OPEN BACK', caption: 'Open back · fits US 5 to 8',
    note: 'Measured at rest; it adjusts from about 15.7 mm to 18.1 mm.' },
];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: 1 });
await page.goto(`file://${S}/render/card.html`);
for (const c of cards) {
  await page.evaluate((card) => window.renderCard(card), c);
  await page.waitForTimeout(400);
  await page.locator('#card').screenshot({ path: `${S}/new6/${c.id}-size-guide.jpg`, type: 'jpeg', quality: 90 });
}
await b.close();
console.log('rendered', cards.length);
