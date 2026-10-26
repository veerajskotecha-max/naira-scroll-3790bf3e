// Size guides after the owner's word of 25 Oct 2026: every adjustable ring fits
// US 5 to 9 (it was 5 to 8, and Cushion Halo 5 to 7). Same layouts as before,
// with US 9 marked and the captions saying 5 to 9.
import { chromium } from '/home/user/naira-scroll-3790bf3e/node_modules/playwright/index.mjs';
const S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad';
const OUT = process.argv[2] || `${S}/rings59/new`;
const FIT = ['5', '6', '6½', '7', '8', '9'];
const atRest = (id, title, inner) => ({
  id, type: 'R', title, inner, open: true, sizes: FIT,
  sub: 'INNER DIAMETER AT REST · OPEN BACK',
  caption: 'Open back · fits US 5 to 9',
  note: 'Measured at rest; it adjusts from about 15.7 mm to 18.9 mm.',
});
const range = (id, title, detail) => ({
  id, type: 'R', title, inner: 17.3, label: '15.7–18.9 mm', open: false, sizes: FIT,
  sub: 'INNER DIAMETER', caption: `Adjustable · fits US 5 to 9 · ${detail}`,
});
const photo = (id, title, img, caption) => ({ id, type: 'A', title, img: `file://${S}/sizing/clean/${img}`, caption });
const cards = [
  atRest('cushion-halo-ring', 'Cushion Halo Ring', 17),
  atRest('blush-cluster-ring', 'Blush Cluster Ring', 17),
  atRest('rose-verdant-band', 'Rose Verdant Band', 16.5),
  atRest('verdant-eternity-band', 'Verdant Eternity Band', 16.5),
  atRest('petite-pave-band', 'Petite Pavé Band', 17),
  atRest('granule-dome-ring', 'Granule Dome Ring', 17.3),
  atRest('silver-dome-ring', 'Pavé Dome Ring', 17.3),
  { id: 'golden-duet-ring', type: 'R', title: 'Golden Duet Ring', inner: 17.3, open: true, sizes: FIT,
    sub: 'US 7 SHOWN · OPEN BACK', caption: 'Open back · fits US 5 to 9',
    note: 'Pick your size and we send the closest fit; the open back eases the rest.' },
  photo('halo-curve-ring', 'Halo Curve Ring', 'r55_c8_65.jpg', '17 mm inside · open, fits US 5 to 9'),
  photo('droplet-open-ring', 'Droplet Open Ring', 'r23_c8_48.jpg', 'Teardrop 6.6 mm · open, fits US 5 to 9'),
  range('asscher-solitaire-ring', 'Asscher Solitaire Ring', '8 mm stone'),
  range('lumiere-oval-solitaire-ring', 'Lumière Oval Solitaire Ring', '7 × 5 mm stone'),
  range('pave-zigzag-ring', 'Pavé Zigzag Ring', 'zigzag 9 mm tall'),
  range('cushion-solitaire-ring', 'Cushion Solitaire Ring', '12 × 8 mm stone'),
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
