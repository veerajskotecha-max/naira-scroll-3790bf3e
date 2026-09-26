// Raw-HTML health of every URL in the live sitemap: status, whether the page got
// its own prerendered HTML or fell back to the homepage's, <h1>, noindex, title.
const origin = 'https://nairaflore.com';
const sm = await (await fetch(origin + '/sitemap.xml')).text();
const routes = [...sm.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
const home = await (await fetch(origin + '/')).text();
const homeH1 = (home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim();
const rows = []; const bad = [];
for (const r of routes) {
  const res = await fetch(origin + r, { redirect: 'manual' });
  const html = res.status === 200 ? await res.text() : '';
  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1] || '';
  const canon = (html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/) || [])[1] || '';
  const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]+>/g, '').trim();
  const noindex = /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html);
  const emptyRoot = /<div id="root">\s*<\/div>/.test(html);
  const homeFallback = r !== '/' && h1 && h1 === homeH1;
  const canonOk = !canon || canon.replace(/\/$/, '') === (origin + r).replace(/\/$/, '') || canon.replace('://www.', '://').replace(/\/$/, '') === (origin + r).replace(/\/$/, '');
  const issue = res.status !== 200 ? `HTTP ${res.status}${res.headers.get('location') ? ' -> ' + res.headers.get('location') : ''}`
    : emptyRoot ? 'empty app shell (no content in HTML)'
    : homeFallback ? 'serves the HOMEPAGE HTML'
    : noindex ? 'noindex' : !h1 ? 'no <h1> in HTML' : !canonOk ? `canonical -> ${canon}` : '';
  rows.push({ r, issue });
  if (issue) bad.push(`  ${r}  —  ${issue}   (title: ${title.slice(0, 50)})`);
}
console.log(`sitemap URLs checked: ${routes.length}   healthy: ${rows.filter((x) => !x.issue).length}   with a problem: ${bad.length}`);
bad.forEach((b) => console.log(b));
for (const f of ['/robots.txt', '/sitemap.xml', '/llms.txt']) console.log(`${f}: HTTP ${(await fetch(origin + f)).status}`);
