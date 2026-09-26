// How many LIVE prerendered pages ship the generic fallback <title> / homepage canonical?
import { readFileSync } from 'node:fs';
const FALLBACK = 'Naira Flore | Handcrafted Indo-Western Fashion';
const routes = [...readFileSync(process.argv[2] || 'public/sitemap.xml', 'utf8').matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
let fb = 0, canonHome = 0, n = 0; const bad = [];
for (const r of routes) {
  if (r === '/' ) continue;
  const html = await (await fetch('https://nairaflore.com' + r)).text();
  n++;
  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1] || '';
  const canon = (html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/) || [])[1] || '';
  const isFb = title.trim() === FALLBACK, isHome = /^https:\/\/(www\.)?nairaflore\.com\/?$/.test(canon);
  if (isFb) fb++; if (isHome) canonHome++;
  if (isFb || isHome) bad.push(`${r}  title=${isFb ? 'FALLBACK' : 'ok'}  canonical=${isHome ? 'HOMEPAGE' : 'ok'}`);
}
console.log(`live routes checked: ${n}`);
console.log(`generic fallback <title>: ${fb}    canonical pointing at the homepage: ${canonHome}`);
bad.slice(0, 12).forEach((b) => console.log('  ' + b));
