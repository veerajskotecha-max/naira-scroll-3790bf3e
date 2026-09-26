// Which main commits are actually live? For each commit, take string literals it
// ADDED under src/ that did not exist anywhere in its parent's src/, and look for
// them in every JS chunk the live site serves. Minifiers keep string literals
// verbatim, so a hit is strong evidence; a commit that only changed numbers or
// logic has no usable marker and is reported as such.
import { execSync } from 'node:child_process';
const [REPO, ...COMMITS] = process.argv.slice(2);
const sh = (c) => execSync(c, { cwd: REPO, maxBuffer: 256 * 1024 * 1024 }).toString();

// every live chunk: entry + everything __vite__mapDeps and import() name
const origin = 'https://nairaflore.com';
const html = await (await fetch(origin + '/?cb=' + Date.now())).text();
const entry = html.match(/<script type="module"[^>]*src="([^"]+)"/)[1];
const seen = new Set(); const queue = [entry]; let corpus = '';
for (const m of html.matchAll(/href="(\/assets\/[^"]+\.js)"/g)) queue.push(m[1]);
while (queue.length) {
  const u = queue.shift(); if (seen.has(u)) continue; seen.add(u);
  const js = await (await fetch(origin + u)).text(); corpus += '\n' + js;
  for (const m of js.matchAll(/["'`](?:\.\/|\/assets\/|assets\/)([\w.-]+\.js)["'`]/g)) queue.push('/assets/' + m[1]);
}
console.log(`live chunks fetched: ${seen.size}  (${(corpus.length / 1048576).toFixed(1)} MB)  entry ${entry}\n`);

const headSrc = sh(`git grep -h -I -F -e "" HEAD -- src/ | head -c 200000000`);
const VITE_OWN = ['vite:preloadError'];   // Vite's own helper uses this string in every build
for (const c of COMMITS) {
  const subject = sh(`git log -1 --format=%s ${c}`).trim();
  const diff = sh(`git show ${c} --format= -U0 -- src/`);
  const added = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1)).filter((l) => !/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(l));   // comments never reach the bundle
  const lits = [...new Set(added.flatMap((l) => [...l.matchAll(/"([^"\\]{14,})"|'([^'\\]{14,})'/g)].map((m) => m[1] || m[2])))]
    .filter((s) => !/^(\.|@\/|\/)/.test(s) && !s.includes('${'));
  const parentSrc = sh(`git grep -h -I -F -e "" ${c}~1 -- src/ | head -c 200000000`);
  // only strings that still exist on main today — later commits may have replaced the rest
  const fresh = lits.filter((s) => !parentSrc.includes(s) && headSrc.includes(s) && !VITE_OWN.some((v) => s.includes(v))).slice(0, 12);
  const hits = fresh.filter((s) => corpus.includes(s));
  const verdict = !fresh.length ? 'no marker' : hits.length ? `LIVE (${hits.length}/${fresh.length} markers)` : `not live (0/${fresh.length} markers)`;
  console.log(`${c}  ${verdict.padEnd(26)} ${subject.slice(0, 64)}`);
  if (hits.length) console.log(`          found:   ${hits.slice(0, 3).map((h) => JSON.stringify(h.slice(0, 48))).join('  ')}`);
  const miss = fresh.filter((s) => !corpus.includes(s));
  if (miss.length) console.log(`          missing: ${miss.slice(0, 3).map((h) => JSON.stringify(h.slice(0, 48))).join('  ')}`);
}
