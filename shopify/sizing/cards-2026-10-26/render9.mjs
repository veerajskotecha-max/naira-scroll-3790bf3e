// Bracelet size guides (type W) for the two listings that had none, 26 Oct 2026.
// Prism Rivière: the owner, 25 Oct 2026: it fits wrists 15 to 19 cm. Bougainvillea
// Vine: 17 cm, so wrists of about 14.5 to 15.5 cm, as for the other 17 cm bracelet.
// Only Prism's went to Shopify: the Bougainvillea card already in Files said the
// same, so that file was attached as it was.
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
const S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad';
const OUT = process.argv[2] || `${S}/sizecharts/w`;
const cards = [
  { id: 'prism-riviere-bracelet', type: 'W', title: 'Prism Rivière Bracelet', length: 18, fitLo: 15, fitHi: 19,
    how: 'Measure around your wrist bone.', caption: '18 cm · fits wrists 15 to 19 cm' },
  { id: 'bougainvillea-vine-bracelet', type: 'W', title: 'Bougainvillea Vine Bracelet', length: 17, fitLo: 14.5, fitHi: 15.5,
    caption: '17 cm · fits wrists about 14.5–15.5 cm' },
];
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
