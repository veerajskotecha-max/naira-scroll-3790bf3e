// Where are the review photos, and when does the browser fetch them?
import { chromium } from 'playwright';
const [BASE, PATH = '/jewellery/verdant-eternity-band'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: Number(process.env.W || 390), height: Number(process.env.H || 844) }, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' });
await ctx.route('**/*', async (route) => {
  const q = route.request();
  if (/(facebook\.net|facebook\.com|fbcdn\.net)/i.test(q.url())) return route.abort();
  try {
    const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) });
  } catch { await route.abort().catch(() => {}); }
});
const p = await ctx.newPage();
const t0 = Date.now(); const photoReqs = []; const reqAt = new Map();
p.on('request', (r) => { if (!reqAt.has(r.url())) reqAt.set(r.url(), Date.now() - t0); if (/\/__l5e\//.test(r.url())) photoReqs.push(Date.now() - t0); });
let reactAt = null;
await p.goto(BASE + PATH, { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => { const b2 = [...document.querySelectorAll('button')].find((x) => /add to (cart|bag)/i.test(x.innerText)); return b2 && Object.keys(b2).some((k) => k.startsWith('__react')); }, null, { timeout: 60000 });
reactAt = Date.now() - t0;
await p.waitForTimeout(3000);
const geo = await p.evaluate(() => ({
  docHeight: document.documentElement.scrollHeight,
  photoTops: [...document.querySelectorAll('img[alt="Review photo"]')].map((i) => Math.round(i.getBoundingClientRect().top)),
  attrOrder: (document.querySelector('img[alt="Review photo"]')?.getAttributeNames() || []).join(','),
}));
const srcs = await p.evaluate(() => [...document.querySelectorAll('img[alt="Review photo"]')].map((i) => i.src));
const reviewFetchedBeforeScroll = srcs.filter((u) => reqAt.has(u)).length;
const scrollStart = Date.now() - t0;
for (let y = 0; y < 40; y++) { await p.mouse.wheel(0, 250); await p.waitForTimeout(80); }
await p.waitForTimeout(2500);
const after = await p.evaluate(() => [...document.querySelectorAll('img[alt="Review photo"]')].map((i) => ({ ok: i.complete && i.naturalWidth > 0 })));
console.log(JSON.stringify({ ...geo, reactMountedMs: reactAt, allL5eRequestsMs: photoReqs,
  reviewPhotos: srcs.length, reviewPhotosFetchedBeforeScroll: reviewFetchedBeforeScroll,
  reviewPhotosFetchedAfterScrollAt: srcs.map((u) => reqAt.get(u)).filter((t) => t != null && t >= scrollStart),
  reviewPhotosLoadedAfterScroll: after.filter((a) => a.ok).length }, null, 0));
await b.close();
