// Fetch a theme asset straight off the preview CDN (no admin API needed).
const THEME='151142826146', SHOP='https://nc5eti-gp.myshopify.com';
const PREVIEW=`_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`;
const r = await fetch(`${SHOP}/?${PREVIEW}`);
const html = await r.text();
const pat = process.argv[2];
const urls = [...new Set([...html.matchAll(/https:\/\/cdn\.shopify\.com\/[^"'\s)]+/g)].map(m=>m[0]))].filter(u=>u.includes(pat));
console.log(urls.slice(0,5).join('\n'));
for (const u of urls.slice(0,1)) {
  const t = await (await fetch(u)).text();
  const needle = process.argv[3];
  if (needle) {
    const i = t.indexOf(needle);
    console.log('--- match at', i, '---');
    let k = 0, from = 0;
    while ((from = t.indexOf(needle, from)) !== -1 && k < 6) { console.log('...' + t.slice(Math.max(0,from-380), from+280).replace(/\s+/g,' ')); from += needle.length; k++; }
  }
}
