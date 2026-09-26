// How long after a page's <h1> appears does Helmet write its <head>, when four
// pages share one headless browser the way the prerender runs them — and are
// animation frames being rationed?
import { chromium } from 'playwright';
const [BASE, N = '4'] = process.argv.slice(2);
const ROUTES = ['/jewellery/prism-riviere-bracelet', '/journal', '/about', '/jewellery/baroque-shell-bracelet',
                '/faqs', '/jewellery/charm-box-chain', '/journal/zirconia-vs-diamond', '/jewellery/collections/bridal-jewellery'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const run = async (path) => {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: process.env.RM || 'no-preference' });
  await p.route(/.*/, async (route) => {
    const q = route.request();
    if (/(facebook\.net|facebook\.com|fbcdn\.net)/i.test(q.url())) return route.abort();
    try {
      const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
      const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) });
    } catch { await route.abort().catch(() => {}); }
  });
  await p.addInitScript(() => {
    window.__raf = 0; const tick = () => { window.__raf++; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  });
  const t0 = Date.now();
  await p.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForSelector('h1', { state: 'attached', timeout: 60000 });
  const tH1 = Date.now() - t0;
  const firstH1 = await p.evaluate(() => { const h = document.querySelector('h1'); return (h?.innerText || h?.textContent || '').trim().slice(0, 28) + ' <' + (h?.closest('header,nav,footer,[class*=skeleton],[aria-busy]')?.tagName || 'page') + '>'; });
  const raf0 = await p.evaluate(() => window.__raf);
  await p.waitForFunction((path) => { const h = document.querySelector('link[rel="canonical"]')?.getAttribute('href'); return !!h && new URL(h, location.origin).pathname.replace(/\/+$/, '') === path.replace(/\/+$/, ''); }, path, { timeout: 60000, polling: 50 }).catch(() => {});
  const tHead = Date.now() - t0;
  const s = await p.evaluate(() => ({ vis: document.visibilityState, raf: window.__raf }));
  await p.close();
  return { path, firstH1, h1Ms: tH1, headMs: tHead, lagMs: tHead - tH1, visibility: s.vis, framesPerSecDuringLag: tHead > tH1 ? Math.round((s.raf - raf0) / ((tHead - tH1) / 1000)) : null };
};
const n = Number(N);
for (let i = 0; i < ROUTES.length; i += n) {
  const res = await Promise.all(ROUTES.slice(i, i + n).map(run));
  for (const r of res) console.log(`${String(n)} at once  ${r.path.padEnd(42)} first h1 ${JSON.stringify(r.firstH1).padEnd(34)} h1 ${String(r.h1Ms).padStart(5)} ms  head +${String(r.lagMs).padStart(5)} ms  ${r.visibility}  frames/s ${r.framesPerSecDuringLag ?? '-'}`);
}
await b.close();
