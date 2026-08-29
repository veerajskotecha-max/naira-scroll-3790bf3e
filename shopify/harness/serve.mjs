// Static server for rendered templates + theme assets. Playwright hits localhost,
// so no external-host proxying is needed for the Liquid side.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const THEME = process.env.THEME_DIR || path.join(import.meta.dirname, '..', 'theme');
const OUT   = process.env.OUT_DIR   || path.join(import.meta.dirname, '..', 'rendered');
const PORT  = Number(process.env.PORT || 4310);

const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'application/javascript',
  '.woff2':'font/woff2', '.ttf':'font/ttf', '.svg':'image/svg+xml', '.png':'image/png',
  '.webp':'image/webp', '.jpg':'image/jpeg', '.gif':'image/gif', '.json':'application/json' };

http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  let file;
  if (url.startsWith('/assets/')) file = path.join(THEME, 'assets', path.basename(url));
  else {
    const name = url === '/' ? 'index' : url.replace(/^\//, '').replace(/\.html$/, '');
    file = path.join(OUT, name + '.html');
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('404 ' + url);
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`harness on http://127.0.0.1:${PORT}`));
