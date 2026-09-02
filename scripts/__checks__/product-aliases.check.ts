// Prove the mapping picks the right target per handle, including the
// reported SKUs, before running a full build.
import { targetsFromRoutes, redirectsBody } from '../product-aliases';
const routes = [
  { path: '/' }, { path: '/jewellery' },
  { path: '/jewellery/collections/rings' },
  { path: '/jewellery/woven-gold-hoops' },
  { path: '/jewellery/cushion-halo-ring' },
  { path: '/jewellery/heartbead-bracelet' },
  { path: '/product/blush-of-dawn' },
  { path: '/journal/how-to-layer-necklaces' },
];
const t = targetsFromRoutes(routes);
const expect = {
  'woven-gold-hoops': '/jewellery/woven-gold-hoops',
  'cushion-halo-ring': '/jewellery/cushion-halo-ring',
  'heartbead-bracelet': '/jewellery/heartbead-bracelet',
  'blush-of-dawn': '/product/blush-of-dawn',
};
for (const [h, want] of Object.entries(expect)) {
  const got = t.get(h);
  if (got !== want) throw new Error(`${h}: expected ${want}, got ${got}`);
}
if (t.has('collections')) throw new Error('category landing leaked in as a product handle');
if (t.has('how-to-layer-necklaces')) throw new Error('journal article leaked in');
if (t.size !== 4) throw new Error(`expected 4 handles, got ${t.size}`);
console.log('ok — 4 handles, each pointing at its real page, no landings or articles');
console.log(redirectsBody(routes).split('\n').filter(l => l && !l.startsWith('#')).join('\n'));
