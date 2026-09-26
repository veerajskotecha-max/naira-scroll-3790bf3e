// Serve a built dist/ the way a prerender-aware static host does: a route's own
// <route>/index.html first, a real file second, the SPA shell last.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(process.argv[2]);
const PORT = Number(process.argv[3] || 4301);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.wasm': 'application/wasm' };
const isFile = (f) => { try { return fs.statSync(f).isFile(); } catch { return false; } };
http.createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  // Lovable's host serves uploaded assets under /__l5e/ — they are not in dist/,
  // so forward them to the live host the way production would answer them.
  if (url.startsWith('/__l5e/')) {
    try {
      const r = await fetch('https://nairaflore.com' + req.url);
      res.writeHead(r.status, { 'content-type': r.headers.get('content-type') || 'application/octet-stream', 'x-served': 'forwarded' });
      return res.end(Buffer.from(await r.arrayBuffer()));
    } catch (e) { res.writeHead(502); return res.end(String(e)); }
  }
  const safe = path.normalize(url).replace(/^(\.\.[/\\])+/, '');
  const cands = [path.join(ROOT, safe, 'index.html'), path.join(ROOT, safe)];
  let file = cands.find(isFile), kind = 'route';
  if (!file) { file = path.join(ROOT, 'index.html'); kind = 'shell'; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream',
                       'cache-control': 'no-store', 'x-served': kind });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log(`${ROOT} on http://127.0.0.1:${PORT}`));
