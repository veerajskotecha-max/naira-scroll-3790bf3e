// Run adtrace.mjs for a set of variants, one at a time (parallel runs share the
// CPU and distort each other), N repeats each, and print medians.
//   node adsuite.mjs <out.jsonl> [repeats] [profiles] [variants]
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
const [OUT, REPEATS = '3', PROFILES = 'fast4g,slow4g', ONLY = ''] = process.argv.slice(2);
const H = new URL('.', import.meta.url).pathname;
const Q = '?utm_content=Facebook_UA&utm_source=facebook&variant=1';
const P = 'prism-riviere-bracelet';
const AD = `https://nairaflore.com/products/${P}${Q}`, PRE = `https://nairaflore.com/jewellery/${P}${Q}`;
// VARIANTS='{"name":{"url":"…","env":{…}}}' replaces the built-in set.
const VARIANTS = process.env.VARIANTS ? JSON.parse(process.env.VARIANTS) : {
  'ad-today': { url: AD },
  'prebuilt-today': { url: PRE },
  'ad-served-prebuilt': { url: AD, env: { SUBST: PRE } },
  'ad-today-no3d': { url: AD, env: { NO3D: '1' } },
  'ad-served-prebuilt-no3d': { url: AD, env: { SUBST: PRE, NO3D: '1' } },
};
const med = (a) => { const v = a.filter((x) => x != null).sort((x, y) => x - y); return v.length ? v[Math.floor((v.length - 1) / 2)] : null; };
for (const profile of PROFILES.split(',')) for (const [name, v] of Object.entries(VARIANTS)) {
  if (ONLY && !ONLY.split(',').includes(name)) continue;
  const runs = [];
  for (let i = 0; i < +REPEATS; i++) {
    try {
      const out = execFileSync('node', [H + 'adtrace.mjs', v.url, profile], { env: { ...process.env, ...(v.env || {}) }, timeout: 600000, maxBuffer: 1 << 26 }).toString();
      const j = JSON.parse(out.slice(out.indexOf('{')));
      runs.push(j); appendFileSync(OUT, JSON.stringify({ name, profile, i, seconds: j.seconds, longTasks: j.mainThreadLongTasks_s, kB: j.downloadedBeforePhoto_kB, imgkB: j.imagesBeforePhoto_kB }) + '\n');
    } catch (e) { appendFileSync(OUT, JSON.stringify({ name, profile, i, error: String(e).slice(0, 200) }) + '\n'); }
  }
  const keys = ['firstPaint', 'nameFirstOnScreen', 'photoFirstOnScreen', 'reactFirstCommit', 'nameBackFromApp', 'photoBackFromApp', 'blankGap', 'addToCartWorks', 'lcp'];
  const m = Object.fromEntries(keys.map((k) => [k, med(runs.map((r) => r.seconds[k]))]));
  const line = { MEDIAN: name, profile, n: runs.length, ...m, longTasks: med(runs.map((r) => r.mainThreadLongTasks_s)), kB: med(runs.map((r) => r.downloadedBeforePhoto_kB)) };
  appendFileSync(OUT, JSON.stringify(line) + '\n'); console.log(JSON.stringify(line));
}
