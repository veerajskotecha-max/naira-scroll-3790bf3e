import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
const THEME = '151142826146';
const HOST  = 'https://nc5eti-gp.myshopify.com';
const PREVIEW = `_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`;
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });

const pages = [
  ['home',       '/'],
  ['collection', '/collections/necklaces'],
  ['product',    '/products/serpentine-whisper-chain'],
  ['cart',       '/cart'],
];
const jar = new Map();
const cookieHeader = () => [...jar.entries()].map(([k,v]) => `${k}=${v}`).join('; ');

// Prime the preview cookie first. Without this the first document request
// races the redirect and Shopify serves MAIN instead of the preview.
{
  const r = await fetch(`${HOST}/?${PREVIEW}`, { redirect:'manual' });
  for (const [k,v] of r.headers) if (k.toLowerCase()==='set-cookie')
    v.split(/,(?=[^;]+=)/).forEach(c => { const [kk,vv]=c.split(';')[0].split('='); if(kk&&vv) jar.set(kk.trim(),vv.trim()); });
  console.log('primed cookies:', [...jar.keys()].join(', ') || '(none)');
}
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport:{width:1440,height:1000}, deviceScaleFactor:2,
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' });

await ctx.route('**/*', async (route) => {
  const req = route.request();
  let url = req.url();
  // keep the preview flags on every document request to this shop
  if (url.startsWith(HOST) && req.resourceType() === 'document')
    url += (url.includes('?') ? '&' : '?') + PREVIEW;
  try {
    const r = await fetch(url, {
      method: req.method(),
      headers: { ...req.headers(), cookie: cookieHeader() },
      body: req.postData() || undefined,
      redirect: 'follow',
    });
    for (const [k,v] of r.headers) if (k.toLowerCase()==='set-cookie')
      v.split(/,(?=[^;]+=)/).forEach(c => { const [kk,vv]=c.split(';')[0].split('='); if(kk&&vv) jar.set(kk.trim(),vv.trim()); });
    const buf = Buffer.from(await r.arrayBuffer());
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length|set-cookie)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: buf });
  } catch (e) { await route.abort(); }
});

for (const [name, path] of pages) {
  for (const [w, tag] of [[1440,'desk'],[390,'phone']]) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: w, height: tag==='phone'?844:1000 });
    try {
      await page.goto(HOST + path, { waitUntil:'load', timeout:60000 });
      await page.evaluate(()=>document.fonts && document.fonts.ready);
      await page.waitForTimeout(2600);
      await page.evaluate(()=>window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1200);
      await page.evaluate(()=>window.scrollTo(0,0));
      await page.waitForTimeout(700);
      const info = await page.evaluate(()=>({
        themeId: (window.Shopify && Shopify.theme && Shopify.theme.id) || null,
        themeName: (window.Shopify && Shopify.theme && Shopify.theme.name) || null,
        title: document.title.trim().slice(0,50),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        cream: getComputedStyle(document.body).backgroundColor,
        motion: document.documentElement.classList.contains('nf-motion'),
        sections: [...document.querySelectorAll('[id^="shopify-section-"]')].map(e=>e.id.split('__').pop()),
      }));
      const ok = String(info.themeId) === THEME;
      console.log(`${name}/${tag}`, ok ? 'SAVOR' : `WRONG THEME (${info.themeName})`, JSON.stringify(info));
      if (!ok) { await page.close(); continue; }
      writeFileSync(`${OUT}/${name}-${tag}.png`, await page.screenshot({ fullPage: tag==='phone' }));
    } catch(e){ console.log(`${name}/${tag} FAILED: ${e.message.slice(0,90)}`); }
    await page.close();
  }
}
await b.close();
