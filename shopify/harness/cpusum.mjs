// Summarise a .cpuprofile: self time by script and by function, optionally
// only for samples between two page times (seconds after the profile starts).
import { readFileSync } from 'node:fs';
const [file, from = '0', to = '999'] = process.argv.slice(2);
const p = JSON.parse(readFileSync(file, 'utf8'));
const byId = new Map(p.nodes.map((n) => [n.id, n]));
const self = new Map();
let t = 0; const lo = +from * 1e6, hi = +to * 1e6;
p.samples.forEach((id, i) => {
  t += p.timeDeltas[i];
  if (t < lo || t > hi) return;
  self.set(id, (self.get(id) || 0) + (p.timeDeltas[i + 1] ?? 0));
});
const byUrl = new Map(), byFn = new Map();
for (const [id, us] of self) {
  const n = byId.get(id); const cf = n.callFrame;
  const url = cf.url ? cf.url.split('/').pop().slice(0, 40) : '(' + (cf.functionName || 'native') + ')';
  byUrl.set(url, (byUrl.get(url) || 0) + us);
  const fn = (cf.functionName || '(anon)') + ' @' + url + ':' + cf.lineNumber;
  byFn.set(fn, (byFn.get(fn) || 0) + us);
}
const top = (m, k) => [...m].sort((a, b) => b[1] - a[1]).slice(0, k).map(([n, us]) => `${(us / 1e6).toFixed(2).padStart(6)}s  ${n}`);
const total = [...self.values()].reduce((a, b) => a + b, 0);
console.log(`window ${from}-${to}s, sampled ${(total / 1e6).toFixed(2)}s`);
console.log('BY SCRIPT\n' + top(byUrl, 14).join('\n'));
console.log('BY FUNCTION\n' + top(byFn, 22).join('\n'));
