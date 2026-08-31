// Side-by-side full-page capture: React | theme, at any width.
// Usage: node sbs.mjs <width> <reactPath> <themePath> <outPng>
import { chromium } from 'playwright';
import fs from 'node:fs';
const [w, rPath, tPath, out] = process.argv.slice(2);
const W = Number(w) || 390;
const LAUNCH = { executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] };
const b = await chromium.launch(LAUNCH);
async function shoot(url, file) {
  const c = await b.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await c.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
  const p = await c.newPage();
  await p.route('**/*', async r => { const u = r.request().url();
    if (u.includes('127.0.0.1')) return r.continue();
    try { const res = await fetch(u, { redirect: 'follow' }); const body = Buffer.from(await res.arrayBuffer());
      const h = Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
      await r.fulfill({ status: res.status, headers: h, body }); } catch { await r.abort(); } });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => p.goto(url, { waitUntil: 'domcontentloaded' }));
  await p.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager'));
  await p.evaluate(async () => { const s = innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += s) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); }
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 500)); });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.screenshot({ path: file, fullPage: true });
  await c.close();
  return h;
}
const hr = await shoot('http://127.0.0.1:4325' + rPath, '/tmp/_r.png');
const ht = await shoot('http://127.0.0.1:4310' + tPath, '/tmp/_t.png');
await b.close();
console.log(JSON.stringify({ width: W, react: rPath, theme: tPath, reactHeight: hr, themeHeight: ht, delta: ht - hr }));
fs.copyFileSync('/tmp/_r.png', out.replace('.png', '-react.png'));
fs.copyFileSync('/tmp/_t.png', out.replace('.png', '-theme.png'));
