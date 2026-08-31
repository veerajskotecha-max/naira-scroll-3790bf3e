// One-shot: lift the React review fixtures into a Liquid snippet.
import fs from 'node:fs';
const SRC = '/home/user/naira-scroll-3790bf3e/src';
const pr = fs.readFileSync(SRC + '/data/productReviews.ts', 'utf8');
const cr = fs.readFileSync(SRC + '/components/CustomerReviews.tsx', 'utf8');

const between = (s, start, end) => {
  const i = s.indexOf(start); if (i < 0) throw new Error('no ' + start);
  const j = s.indexOf(end, i + start.length); if (j < 0) throw new Error('no end for ' + start);
  return s.slice(i + start.length, j);
};

const bank = eval('[' + between(pr, 'const bank: ProductReview[] = [', '\n];') + ']');

// jewellery photo reviews: images reference asset json imports -> theme asset names
const IMG = {
  jewelUgcVine: 'the-vine-ugc.jpg',
  jewelUgcBracelet: 'jewel-review-bracelet.jpg',
  jewelUgcSolitaire: 'jewel-review-solitaire.jpg',
  jewelUgcToiEtMoi: 'jewel-review-toietmoi.jpg',
  jewelUgcBow: 'jewel-review-bow.jpg',
  jewelUgcPearlStuds: 'jewel-review-pearl-studs.jpg',
  jewelUgcBraidedHoop: 'jewel-review-braided-hoop.jpg',
  jewelUgcPearPendant: 'jewel-review-pear-pendant.jpg',
  jewelUgcHaloRing: 'jewel-review-halo-ring.jpg',
};
const jrSrc = between(cr, 'const jewelleryReviews: Review[] = [', '\n];');
const jewelleryReviews = eval('[' + jrSrc.replace(/(\w+)\.url/g, (m, k) => JSON.stringify(IMG[k] || (() => { throw new Error('unmapped ' + k); })())) + ']');

const oneLiner = (name, date, text, rating = 5, verified = true) => ({
  name,
  initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
  verified, rating, date, text, images: [],
});
const liners = eval('[' + between(cr, 'const jewelleryOneLiners: Review[] = [', '\n];') + ']');

const row = r => [
  r.no ?? '', r.name, r.initials, r.verified ? 1 : 0, r.rating, r.date, r.text, (r.images && r.images[0]) || '',
].join('|');

const all = [...bank, ...jewelleryReviews, ...liners];
for (const r of all) for (const f of [r.name, r.initials, r.date, r.text])
  if (String(f).includes('|') || String(f).includes('\n')) throw new Error('delimiter clash: ' + f);

const out = `{%- comment -%}
  Review fixture lifted verbatim from the React app so the Liquid PDP renders
  the identical set: src/data/productReviews.ts (the numbered per-product bank)
  and the jewellery arrays in src/components/CustomerReviews.tsx. Regenerated
  by shopify/harness/zz-revgen.mjs -- edit the React source, not this file.

  One row per line, pipe separated:
    no|name|initials|verified|rating|date|text|photo
  "no" is set only for bank rows (React shows it as the #nnn badge); "photo" is
  a theme asset basename for the nine UGC shots.

  part: "bank"  -> all 260 numbered notes, sliced per product by the same hash
                   getProductReviews() uses
  part: "seed"  -> the nine photo reviews then the thirty jewellery one-liners,
                   in React's order
{%- endcomment -%}
{%- if part == 'bank' -%}
${bank.map(row).join('\n')}
{%- else -%}
${[...jewelleryReviews, ...liners].map(row).join('\n')}
{%- endif -%}
`;
fs.writeFileSync('/home/user/naira-scroll-3790bf3e/shopify/theme/snippets/nf-review-data.liquid', out);
console.log('bank', bank.length, 'photo', jewelleryReviews.length, 'liners', liners.length, 'bytes', out.length);

// sanity: the numbers the page must show for riviere-eternal-necklace
const hash = k => { let h = 0; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0; return h; };
const key = 'Rivière Eternal Necklace'.toLowerCase().trim();
const slot = hash(key) % 52, start = slot * 5, count = slot % 3 === 0 ? 4 : 5;
const own = bank.slice(start, start + count);
const seed = [...own, ...jewelleryReviews, ...liners];
const avg = seed.reduce((s, r) => s + r.rating, 0) / seed.length;
console.log('h', hash(key), 'slot', slot, 'start', start, 'count', count, 'first', own[0].no, own[0].name,
  '| total', seed.length, 'avg', Math.round(avg * 10) / 10,
  '| breakdown', [5,4,3,2,1].map(s => seed.filter(r => r.rating === s).length).join(','));
