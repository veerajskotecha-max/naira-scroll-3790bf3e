// Size guides after the owner's ring-size decisions of 23 Oct 2026: adjustable rings fit
// US 5 to 8, and seven sized rings gained US 5.
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
const S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/sizing';
const FIT = ['5', '6', '6½', '7', '8'];
const adjustable = (id, title, inner) => ({
  id, type: 'R', title, inner, open: true, sizes: FIT,
  sub: 'INNER DIAMETER AT REST · OPEN BACK',
  caption: 'Open back · fits US 5 to 8',
  note: 'Measured at rest; it adjusts from about 15.7 mm to 18.1 mm.',
});
const photo = (id, title, img, caption) => ({ id, type: 'A', title, img: `file://${S}/clean/${img}`, caption });
const cards = [
  adjustable('cushion-halo-ring', 'Cushion Halo Ring', 17),
  adjustable('rose-verdant-band', 'Rose Verdant Band', 16.5),
  adjustable('verdant-eternity-band', 'Verdant Eternity Band', 16.5),
  adjustable('petite-pave-band', 'Petite Pavé Band', 17),
  adjustable('granule-dome-ring', 'Granule Dome Ring', 17.3),
  adjustable('silver-dome-ring', 'Pavé Dome Ring', 17.3),
  photo('halo-curve-ring', 'Halo Curve Ring', 'r55_c8_65.jpg', '17 mm inside · open, fits US 5 to 8'),
  photo('droplet-open-ring', 'Droplet Open Ring', 'r23_c8_48.jpg', 'Teardrop 6.6 mm · open, fits US 5 to 8'),
  photo('baguette-eternity-band', 'Baguette Eternity Band', 'r65_c8_71.jpg', 'Band 6.8 mm wide · US 5, 6, 7, 8'),
  photo('tubogas-dome-ring', 'Tubogas Dome Ring', 'r10_c8_40.jpg', 'Band 5.8 mm wide · US 5, 6, 7, 8'),
  photo('crystal-baguette-eternity-ring', 'Crystal Baguette Eternity Ring', 'r36_c8_68.jpg', 'Band 8 mm wide · US 5, 6, 7, 8'),
  photo('watch-link-ring', 'Watch Link Ring', 'r38_c8_54.jpg', 'Band 7.5 mm wide · US 5, 6, 7, 8'),
  photo('mesh-band-ring', 'Mesh Band Ring', 'r44_c8_58.jpg', 'Band 8 mm wide · US 5, 6, 7, 8'),
  { id: 'linked-trio-ring', type: 'R', title: 'Linked Pair Ring', inner: 17.3, open: false, sizes: ['5', '6', '7', '8'],
    sub: 'US 7 SHOWN · ALSO IN US 5, 6 AND 8', caption: 'US 5, 6, 7, 8 · two linked bands' },
];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 1600, height: 1600 }, deviceScaleFactor: 1 });
await page.goto(`file://${S}/render/card.html`);
for (const c of cards) {
  await page.evaluate((card) => window.renderCard(card), c);
  await page.waitForTimeout(400);
  await page.locator('#card').screenshot({ path: `${S}/new5/${c.id}-size-guide.jpg`, type: 'jpeg', quality: 90 });
}
await b.close();
console.log('rendered', cards.length);
