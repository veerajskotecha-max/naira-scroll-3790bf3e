// Per route: which runtime modulepreloads (by chunk name, hash stripped) does B
// drop or add compared with A? The deferred-only rule should drop 3D/deferred
// chunks and nothing else, and never add anything.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
const [A, B] = process.argv.slice(2);
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : (f === 'index.html' ? [p] : []); });
const runtime = (html) => (html.match(/<link(?=[^>]*\brel="modulepreload")(?=[^>]*\bas="script")[^>]*>/gi) || [])
  .map((t) => ((t.match(/href="\/assets\/([^"]+)"/) || [])[1] || '').replace(/-[\w-]{8}\.js$/, ''));
const buildTime = (html) => (html.match(/<link[^>]*rel="modulepreload"[^>]*>/gi) || []).filter((t) => !/\bas="script"/.test(t)).length;
const dropped = {}, added = {}; let routes = 0, leftoverTags = 0, btA = 0, btB = 0, rtA = 0, rtB = 0;
for (const fa of walk(A)) {
  const rel = relative(A, fa), fb = join(B, rel);
  if (!existsSync(fb)) continue;
  const a = readFileSync(fa, 'utf8'), b = readFileSync(fb, 'utf8'); routes++;
  leftoverTags += (b.match(/data-deferred-preload/g) || []).length;
  btA += buildTime(a); btB += buildTime(b);
  const ra = runtime(a), rb = runtime(b); rtA += ra.length; rtB += rb.length;
  const count = (arr) => arr.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {});
  const ca = count(ra), cb = count(rb);
  for (const k of new Set([...Object.keys(ca), ...Object.keys(cb)])) {
    const d = (ca[k] || 0) - (cb[k] || 0);
    if (d > 0) (dropped[k] ??= new Set()).add(rel);
    if (d < 0) (added[k] ??= new Set()).add(rel);
  }
}
console.log(`routes ${routes}   runtime preloads A ${rtA} -> B ${rtB}   build-time A ${btA} -> B ${btB}   leftover tags in B: ${leftoverTags}`);
console.log('dropped in B (chunk: routes):');
for (const [k, v] of Object.entries(dropped).sort((x, y) => y[1].size - x[1].size)) console.log(`  ${k.padEnd(22)} ${v.size}`);
console.log('present in B but not A (chunk: routes):');
const ad = Object.entries(added).sort((x, y) => y[1].size - x[1].size);
if (!ad.length) console.log('  (none)'); else for (const [k, v] of ad) console.log(`  ${k.padEnd(22)} ${v.size}   e.g. ${[...v].slice(0, 3).join(', ')}`);
