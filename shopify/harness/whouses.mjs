// Which elements on the page use the same URLs as the review thumbnails?
import { chromium } from 'playwright';
const [BASE, PATH = '/jewellery/verdant-eternity-band'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
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
await p.goto(BASE + PATH, { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(5000);
const rows = await p.evaluate(() => {
  const review = new Set([...document.querySelectorAll('img[alt="Review photo"]')].map((i) => i.src));
  const all = [...document.querySelectorAll('img')].filter((i) => review.has(i.src) || /\/__l5e\//.test(i.src));
  return all.map((i) => ({
    file: i.src.split('/').pop().slice(0, 34), alt: (i.alt || '').slice(0, 26), loading: i.getAttribute('loading') || '(eager)',
    top: Math.round(i.getBoundingClientRect().top), w: Math.round(i.getBoundingClientRect().width),
    inside: (i.closest('section,[class*="review" i],[id]')?.className || i.closest('[id]')?.id || '').toString().slice(0, 40),
    sharedWithReview: review.has(i.src),
  }));
});
console.table(rows);
await b.close();
