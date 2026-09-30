// How heavy a product page is once a shopper has scrolled all of it:
//   node pdpweight.mjs <url> [label]
// Phone viewport; the page is loaded, scrolled to the bottom in steps (so lazy
// photos, reels and 3D load as they would for a shopper), then left for
// SETTLE_S seconds. Sizes are what the phone downloads (text gzip-sized).
// Analytics and ad tags are blocked so no run reaches anyone's reports.
import { chromium } from 'playwright';
import { gzipSync } from 'node:zlib';
import { NO_REPORT } from './noreport.mjs';
const [URL0, LABEL = 'page'] = process.argv.slice(2);
const SETTLE_S = Number(process.env.SETTLE_S || 12);
const BLOCK = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|hotjar|monorail-edge|shopifysvc\.com|klaviyo|webengage|moengage|clevertap|tiktok|pinterest|criteo|bat\.bing|\/api\/collect|trekkie|web-pixels|wpm@|snapchat|sc-static|quora|ads-twitter|linkedin|\/functions\/v1\/meta-capi|~api\/analytics)/i;
const TEXT = /(javascript|css|html|json|svg|xml|text\/plain)/i;
const HINTS = { 'sec-ch-ua': '"Chromium";v="120", "Google Chrome";v="120", "Not?A_Brand";v="99"', 'sec-ch-ua-mobile': '?1', 'sec-ch-ua-platform': '"Android"' };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' });
await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
const log = [];
let phase = 'load';
await ctx.route('**/*', async (route) => { if (NO_REPORT.test(route.request().url())) return route.abort();
  const q = route.request();
  if (BLOCK.test(q.url())) return route.abort();
  try {
    const r = await fetch(q.url(), { method: q.method(), headers: { ...q.headers(), ...HINTS }, body: q.postData() || undefined, redirect: 'manual' });
    const body = Buffer.from(await r.arrayBuffer());
    const headers = Object.fromEntries([...r.headers].filter(([h]) => !/^(content-encoding|content-length)$/i.test(h)));
    const ct = r.headers.get('content-type') || '';
    const wire = TEXT.test(ct) && body.length > 1024 ? gzipSync(body, { level: 6 }).length : body.length;
    log.push({ url: q.url(), type: q.resourceType(), ct, wire, phase });
    await route.fulfill({ status: r.status, headers, body });
  } catch { await route.abort().catch(() => {}); }
});
const p = await ctx.newPage();
await p.goto(URL0, { waitUntil: 'load', timeout: 120000 }).catch(() => {});
await p.waitForTimeout(6000);
phase = 'scroll';
let y = 0, H = await p.evaluate(() => document.documentElement.scrollHeight);
while (y < H) {
  y += 600; await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(700);
  H = await p.evaluate(() => document.documentElement.scrollHeight);
}
phase = 'settle';
await p.waitForTimeout(SETTLE_S * 1000);
// Routing turns Chrome's cache off, so a file the page asks for twice is
// fetched twice here but only once on a phone: count each address once.
{
  const seen = new Map();
  for (const l of log) { const k = l.url; if (!seen.has(k) || seen.get(k).wire < l.wire) seen.set(k, l); }
  log.splice(0, log.length, ...seen.values());
}
const kinds = (l) => /\/(three|scene|RoomEnvironment)-[\w-]+\.js|\.glb|\.hdr|\.ktx2/.test(l.url) ? '3d'
  : l.type === 'media' || /video|mp4|m3u8|webm/.test(l.ct) ? 'video'
  : l.type === 'image' ? 'image' : l.type === 'script' ? 'script' : l.type === 'stylesheet' ? 'css' : l.type === 'font' ? 'font'
  : l.type === 'document' ? 'html' : 'data/other';
const sum = (a) => Math.round(a.reduce((t, l) => t + l.wire, 0) / 1024);
const by = {}; for (const l of log) (by[kinds(l)] ??= []).push(l);
const origins = {}; for (const l of log) { const o = new URL(l.url).hostname; (origins[o] ??= []).push(l); }
const out = {
  label: LABEL, url: URL0.replace(/\?.*/, ''), pageHeight_px: H, requests: log.length,
  total_kB: sum(log), firstScreen_kB: sum(log.filter((l) => l.phase === 'load')),
  byKind_kB: Object.fromEntries(Object.entries(by).map(([k, a]) => [k, sum(a)]).sort((a, c) => c[1] - a[1])),
  byHost_kB: Object.fromEntries(Object.entries(origins).map(([k, a]) => [k, sum(a)]).sort((a, c) => c[1] - a[1]).slice(0, 8)),
  largest: log.slice().sort((a, c) => c.wire - a.wire).slice(0, 14).map((l) => `${String(Math.round(l.wire / 1024)).padStart(5)} kB ${kinds(l).padEnd(6)} ${l.phase.padEnd(6)} ${new URL(l.url).hostname.replace(/^www\./, '')}${new URL(l.url).pathname.split('/').slice(-1)[0].slice(0, 60)}`),
};
console.log(JSON.stringify(out, null, 1));
if (process.env.ALL) for (const l of log.slice().sort((a, c) => c.wire - a.wire)) console.log(`${String(Math.round(l.wire / 1024)).padStart(5)} kB ${kinds(l).padEnd(10)} ${l.phase.padEnd(6)} ${l.url.slice(0, 150)}`);
await b.close();
