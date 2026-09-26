// Classify where each route's first (normalised) difference falls, so a real
// patch-induced change can't hide inside capture noise.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
const [A, B] = process.argv.slice(2);
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : (f === 'index.html' ? [p] : []); });
const RUNTIME = /<link(?=[^>]*\brel="modulepreload")(?=[^>]*\bas="script")[^>]*>/gi;
const canonImg = (s) => s.replace(/<img\b([^>]*)>/g, (_, a) => '<img ' + [...a.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].filter((m) => !/^(loading|decoding)$/.test(m[1])).map((m) => (m[2] === undefined ? m[1] : `${m[1]}="${m[2]}"`)).sort().join(' ') + '>');
const unhash = (s) => s.replace(/(\/assets\/[\w.-]+?)-[\w-]{8}\.(js|css)/g, '$1-HASH.$2');
const norm = (s) => unhash(canonImg(s.replace(RUNTIME, ''))).replace(/<title>[^<]*<\/title>/, '<title>T</title>');
// sort <head> children so pure ordering differences (Helmet commit order) vanish
const headSorted = (s) => s.replace(/<head>([\s\S]*?)<\/head>/, (_, h) => '<head>' + (h.match(/<[^>]+>(?:[^<]*<\/(?:title|style|script)>)?/g) || []).sort().join('') + '</head>');
const buckets = {}; const other = [];
for (const fa of walk(A)) {
  const rel = relative(A, fa), fb = join(B, rel);
  if (!existsSync(fb)) { (buckets['missing'] ??= []).push(rel); continue; }
  const x = norm(readFileSync(fa, 'utf8')), y = norm(readFileSync(fb, 'utf8'));
  if (x === y) continue;
  if (headSorted(x) === headSorted(y)) { (buckets['head: tag order only'] ??= []).push(rel); continue; }
  const xs = headSorted(x), ys = headSorted(y);
  let i = 0; while (i < xs.length && xs[i] === ys[i]) i++;
  const inHead = i < xs.indexOf('</head>');
  const ctx = xs.slice(Math.max(0, i - 160), i + 120);
  let k;
  if (inHead) k = /canonical|og:|twitter:|description|robots|ld\+json/i.test(ctx) ? 'head: meta/canonical content' : 'head: other';
  else if (/opacity|transform|translate|style="/i.test(ctx)) k = 'body: animation/inline style state';
  else if (/review|rating|star/i.test(ctx)) k = 'body: review block';
  else if (/aria-hidden|data-state|aria-expanded/i.test(ctx)) k = 'body: open/closed UI state';
  else { k = 'body: other'; other.push(`${rel}\n      A …${xs.slice(Math.max(0, i - 70), i + 80).replace(/\s+/g, ' ')}…\n      B …${ys.slice(Math.max(0, i - 70), i + 80).replace(/\s+/g, ' ')}…`); }
  (buckets[k] ??= []).push(rel);
}
for (const [k, v] of Object.entries(buckets).sort((a, b) => b[1].length - a[1].length)) console.log(`  ${String(v.length).padStart(3)}  ${k}`);
if (other.length) { console.log('  --- body: other ---'); other.slice(0, 6).forEach((o) => console.log('   ' + o)); }
