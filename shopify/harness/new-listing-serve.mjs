// Serves a built dist/ the way the live host does: /a/b gets a/b/index.html
// (or a/b.html, or the file itself) when the build wrote one, and the
// homepage file, dist/index.html, for every address it did not. Text files go
// out brotli-compressed when the browser accepts it, as the CDN sends them.
//   node new-listing-serve.mjs <distDir> <port>
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

const [DIST, PORT = '8100'] = process.argv.slice(2);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4' };
const TEXT = new Set(['.html', '.js', '.css', '.json', '.svg', '.xml', '.txt', '.webmanifest']);
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
const cache = new Map();
const packed = (file, enc) => {
  const key = enc + ':' + file;
  if (!cache.has(key)) {
    const raw = readFileSync(file);
    cache.set(key, enc === 'br' ? brotliCompressSync(raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } }) : gzipSync(raw, { level: 6 }));
  }
  return cache.get(key);
};

createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const base = join(DIST, path);
  const hit = [base, join(base, 'index.html'), base.replace(/\/$/, '') + '.html'].find((p) => p.startsWith(DIST) && isFile(p));
  const file = hit ?? join(DIST, 'index.html');
  const ext = extname(file);
  const accept = String(req.headers['accept-encoding'] || '');
  const enc = TEXT.has(ext) ? (/\bbr\b/.test(accept) ? 'br' : /\bgzip\b/.test(accept) ? 'gzip' : null) : null;
  const headers = { 'content-type': TYPES[ext] ?? 'application/octet-stream', 'cache-control': 'no-store', 'x-served': hit ? 'file' : 'fallback', vary: 'accept-encoding' };
  if (enc) headers['content-encoding'] = enc;
  res.writeHead(200, headers);
  res.end(enc ? packed(file, enc) : readFileSync(file));
}).listen(Number(PORT), '127.0.0.1');
