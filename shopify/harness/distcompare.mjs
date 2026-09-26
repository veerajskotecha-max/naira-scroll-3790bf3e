// Compare two prerendered dist/ trees route by route.
// Expected differences from the catalogue-load patch, and nothing else:
//   1. runtime <link rel="modulepreload" as="script"> gone
//   2. review thumbnails gain loading="lazy" decoding="async"
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
const [A, B] = process.argv.slice(2);
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : (f === 'index.html' ? [p] : []);
});
const RUNTIME = /<link(?=[^>]*\brel="modulepreload")(?=[^>]*\bas="script")[^>]*>/gi;
const ANY_MP  = /<link[^>]*\brel="modulepreload"[^>]*>/gi;
const n = (s, re) => (s.match(re) || []).length;
// normalise away the two intended changes, then anything left is unexplained
const FALLBACK = '<title>Naira Flore | Handcrafted Indo-Western Fashion</title>';
// hashed asset names change whenever a module inside them changes — expected
const unhash = (s) => s.replace(/(\/assets\/[\w.-]+?)-[\w-]{8}\.(js|css)/g, '$1-HASH.$2');
const untitle = (s) => s.replace(/<title>[^<]*<\/title>/, '<title>T</title>');
// canonical <img>: drop loading/decoding, sort the rest — attribute ORDER and
// those two hints are exactly what the patch changes on review photos
const canonImg = (s) => s.replace(/<img\b([^>]*)>/g, (_, attrs) => {
  const list = [...attrs.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)]
    .filter((m) => !/^(loading|decoding)$/.test(m[1]))
    .map((m) => (m[2] === undefined ? m[1] : `${m[1]}="${m[2]}"`)).sort();
  return `<img ${list.join(' ')}>`;
});
const norm = (s) => untitle(unhash(canonImg(s.replace(RUNTIME, ''))));
let fbA = 0, fbB = 0, photosA = 0, routes = 0, same = 0, rtA = 0, rtB = 0, keptA = 0, keptB = 0, lazyB = 0, bytesA = 0, bytesB = 0;
const odd = [];
for (const fa of walk(A)) {
  const rel = relative(A, fa), fb = join(B, rel);
  if (!existsSync(fb)) { odd.push(`${rel}: missing in B`); continue; }
  const a = readFileSync(fa, 'utf8'), b = readFileSync(fb, 'utf8');
  routes++; bytesA += a.length; bytesB += b.length;
  rtA += n(a, RUNTIME); rtB += n(b, RUNTIME);
  keptA += n(a, ANY_MP) - n(a, RUNTIME); keptB += n(b, ANY_MP) - n(b, RUNTIME);
  lazyB += (b.match(/<img[^>]*alt="Review photo"[^>]*>/g) || []).filter((t) => /loading="lazy"/.test(t)).length;
  photosA += n(a, /alt="Review photo"/g);
  if (a.includes(FALLBACK)) fbA++;
  if (b.includes(FALLBACK)) fbB++;
  if (norm(a) === norm(b)) same++;
  else {
    const x = norm(a), y = norm(b);
    let i = 0; while (i < x.length && x[i] === y[i]) i++;
    odd.push(`${rel}: first difference at ${i}\n    A: …${x.slice(Math.max(0, i - 60), i + 90).replace(/\s+/g, ' ')}…\n    B: …${y.slice(Math.max(0, i - 60), i + 90).replace(/\s+/g, ' ')}…`);
  }
}
console.log(`routes compared            ${routes}`);
console.log(`runtime modulepreloads     A ${rtA}   ->  B ${rtB}`);
console.log(`build-time modulepreloads  A ${keptA}   ->  B ${keptB}`);
console.log(`review imgs lazy in B      ${lazyB}`);
console.log(`html bytes                 A ${(bytesA/1024).toFixed(0)} kB  ->  B ${(bytesB/1024).toFixed(0)} kB`);
console.log(`review photos present in A   ${photosA}`);
console.log(`routes captured with the generic fallback <title>:  A ${fbA}   B ${fbB}`);
console.log(`identical after removing the intended changes, asset hashes and <title>: ${same}/${routes}`);
if (odd.length) { console.log(`\nunexplained differences (${odd.length}):`); odd.slice(0, 12).forEach((o) => console.log('  ' + o)); }
