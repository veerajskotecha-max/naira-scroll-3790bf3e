// Where did the renderer main thread spend a time window? Reads a Chrome trace
// (adtrace.mjs TRACE=file), finds the page's main thread, and for every
// top-level task in the window sums its child events by name (self time).
import { readFileSync } from 'node:fs';
const [file, from = '0', to = '999', fcpSeconds] = process.argv.slice(2);
const raw = JSON.parse(readFileSync(file, 'utf8'));
const ev = raw.traceEvents || raw;
const names = ev.filter((e) => e.name === 'thread_name' && e.args?.name === 'CrRendererMain');
// the main thread with the most events is the page's
const count = new Map();
for (const e of ev) { const k = e.pid + ':' + e.tid; if (names.some((n) => n.pid === e.pid && n.tid === e.tid)) count.set(k, (count.get(k) || 0) + 1); }
const [main] = [...count].sort((a, b) => b[1] - a[1])[0];
// navigationStart is not always emitted: fall back to the FCP event minus the
// page's own FCP time (pass it as the 4th argument, in seconds).
const nav = ev.find((e) => e.name === 'navigationStart');
const fcp = ev.find((e) => e.name === 'firstContentfulPaint');
const T0 = nav ? nav.ts : fcp.ts - Number(fcpSeconds) * 1e6;
const lo = T0 + from * 1e6, hi = T0 + to * 1e6;
const X = ev.filter((e) => (e.pid + ':' + e.tid) === main && e.ph === 'X' && e.dur != null).sort((a, b) => a.ts - b.ts || b.dur - a.dur);
// self time: subtract direct children
const stack = []; const self = new Map(); const tasks = [];
for (const e of X) {
  while (stack.length && stack.at(-1).ts + stack.at(-1).dur <= e.ts) stack.pop();
  const parent = stack.at(-1);
  e._self = e.dur;
  if (parent) parent._self -= e.dur; else if (e.dur > 50000 && e.ts >= lo && e.ts <= hi) tasks.push(e);
  stack.push(e);
}
for (const e of X) if (e.ts >= lo && e.ts <= hi && !/^(RunTask|ThreadControllerImpl::RunTask|RunNormalPriorityTask)$/.test(e.name)) self.set(e.name, (self.get(e.name) || 0) + Math.max(0, e._self));
const top = [...self].sort((a, b) => b[1] - a[1]).slice(0, 18);
console.log(`main thread ${main}, window ${from}-${to}s after navigationStart`);
console.log(top.map(([n, us]) => `${(us / 1e6).toFixed(2).padStart(6)}s  ${n}`).join('\n'));
console.log('LONG TASKS (>50 ms):');
for (const t of tasks.slice(0, 40)) {
  const kids = X.filter((e) => e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e !== t);
  const agg = new Map(); for (const k of kids) agg.set(k.name, (agg.get(k.name) || 0) + Math.max(0, k._self));
  const main3 = [...agg].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n, us]) => `${n} ${(us / 1000) | 0}ms`).join(', ');
  const url = kids.find((k) => k.args?.data?.url)?.args.data.url?.split('/').pop()?.slice(0, 30) || '';
  console.log(`  ${((t.ts - T0) / 1e6).toFixed(2)}s  ${(t.dur / 1000) | 0}ms  ${main3}  ${url}`);
}
