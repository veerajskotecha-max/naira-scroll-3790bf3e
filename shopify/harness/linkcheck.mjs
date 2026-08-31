// Every internal href in the rendered theme, checked against what the live
// store actually has. A link to a page/collection/product that does not exist
// is a 404 for a real shopper, and no style diff will ever catch it.
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.env.OUT_DIR || path.join(import.meta.dirname, '..', 'rendered');
const known = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'store-routes.json'), 'utf8'));

const SHOPIFY_BUILTIN = [
  /^\/$/, /^\/cart$/, /^\/search$/, /^\/account/, /^\/checkout/,
  /^\/collections\/all$/, /^\/policies\//, /^\/challenge$/, /^\/password$/,
];

const hrefs = new Map();               // href -> Set(page)
for (const f of fs.readdirSync(OUT).filter(x => x.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(OUT, f), 'utf8');
  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/gi)) {
    const h = m[1].trim();
    if (!h || h.startsWith('#') || /^(https?:|mailto:|tel:|javascript:|data:)/i.test(h)) continue;
    if (!hrefs.has(h)) hrefs.set(h, new Set());
    hrefs.get(h).add(f.replace(/\.html$/, ''));
  }
}

const bad = [];
for (const [href, pages] of [...hrefs].sort()) {
  const clean = href.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  if (SHOPIFY_BUILTIN.some(r => r.test(clean))) continue;
  let ok = false, kind = null;
  let m;
  if ((m = clean.match(/^\/pages\/(.+)$/)))            { kind = 'page';       ok = known.pages.includes(m[1]); }
  else if ((m = clean.match(/^\/collections\/([^/]+)$/))) { kind = 'collection'; ok = known.collections.includes(m[1]); }
  else if ((m = clean.match(/^\/products\/(.+)$/)))    { kind = 'product';    ok = known.products.includes(m[1]); }
  else if ((m = clean.match(/^\/blogs\/([^/]+)$/)))    { kind = 'blog';       ok = known.blogs.includes(m[1]); }
  else if ((m = clean.match(/^\/blogs\/([^/]+)\/(.+)$/))) { kind = 'article'; ok = known.blogs.includes(m[1]) && known.articles.includes(m[2]); }
  else { kind = 'unrecognised route'; ok = false; }
  if (!ok) bad.push({ href, kind, pages: [...pages].sort() });
}

console.log(`checked ${hrefs.size} distinct internal links across ${fs.readdirSync(OUT).filter(x=>x.endsWith('.html')).length} rendered pages`);
if (!bad.length) { console.log('  every one resolves to something the store has'); }
else {
  console.log(`  ${bad.length} that do NOT resolve:\n`);
  for (const b of bad) console.log(`  ${b.kind.padEnd(19)} ${b.href.padEnd(52)} on: ${b.pages.slice(0,4).join(', ')}${b.pages.length>4?` +${b.pages.length-4}`:''}`);
}
