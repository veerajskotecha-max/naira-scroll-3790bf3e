// End-to-end: serve dist/ the way a static host does, hit the plural Shopify
// URL, and assert the browser lands on the real page rather than the homepage.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const DIST = path.resolve('/home/user/naira-scroll-3790bf3e/dist');
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'application/javascript', '.css':'text/css',
  '.webp':'image/webp', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg',
  '.woff2':'font/woff2', '.ttf':'font/ttf', '.json':'application/json', '.ico':'image/x-icon' };
const srv = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  let f = path.join(DIST, url);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) f = path.join(DIST, 'index.html');   // SPA fallback, like the host
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
}).listen(4501, '127.0.0.1');

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const p = await b.newPage();
await p.route('**/*', async r => { const u = r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res = await fetch(u, { redirect: 'follow' }); const body = Buffer.from(await res.arrayBuffer());
    const h = Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({ status: res.status, headers: h, body }); } catch { await r.abort(); } });

let bad = 0;
for (const handle of ['woven-gold-hoops', 'cushion-halo-ring']) {
  await p.goto(`http://127.0.0.1:4501/products/${handle}`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1200);
  const landed = new URL(p.url()).pathname;
  const want = `/jewellery/${handle}`;
  const ok = landed === want;
  if (!ok) bad++;
  console.log(`  /products/${handle.padEnd(20)} -> ${landed.padEnd(34)} ${ok ? 'OK' : 'WRONG, wanted ' + want}`);
}
// query and hash must survive the hop
await p.goto('http://127.0.0.1:4501/products/woven-gold-hoops?utm_source=meta#reviews', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(900);
const u = new URL(p.url());
const kept = u.pathname === '/jewellery/woven-gold-hoops' && u.search === '?utm_source=meta' && u.hash === '#reviews';
console.log(`  query+hash preserved: ${kept ? 'OK' : 'LOST — ' + u.pathname + u.search + u.hash}`);
if (!kept) bad++;
await b.close(); srv.close();
console.log(bad ? `FAIL (${bad})` : 'ok — the plural Shopify URL now lands on the real page');
process.exit(bad ? 1 : 0);
