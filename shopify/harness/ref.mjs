import { chromium } from 'playwright';
/* Reference capture of the React site: what Savor is supposed to become.
   Records geometry, the motion actually running, and a full-page shot. */
const ROUTES = (process.env.ROUTES || '/,/jewellery,/jewellery/molten-bloom-hoops').split(',');
const W = Number(process.env.W || 390);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 1,
  isMobile: W < 700, hasTouch: W < 700 });
await ctx.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
const px = Buffer.from('R0lGODlhAQABAPAAAMmaTP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==','base64');
await ctx.route('**/cdn.shopify.com/**', r => r.fulfill({ status:200, contentType:'image/gif', body:px }));
const out = [];
for (const route of ROUTES) {
  const page = await ctx.newPage();
  try {
    await page.goto('http://127.0.0.1:4177' + route, { waitUntil:'networkidle', timeout:60000 });
  } catch (e) { out.push({ route, error: String(e).slice(0,120) }); await page.close(); continue; }
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const de = document.documentElement;
    const anim = [];
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      const name = cs.animationName, dur = cs.transitionDuration;
      if (name && name !== 'none') anim.push({ kind:'anim', name, dur: cs.animationDuration,
        cls: (el.className||'').toString().slice(0,50), tag: el.tagName });
      else if (dur && dur !== '0s' && cs.transitionProperty !== 'none' && el.children.length === 0)
        anim.push({ kind:'trans', name: cs.transitionProperty.slice(0,40), dur,
          cls: (el.className||'').toString().slice(0,50), tag: el.tagName });
    }
    const byName = {};
    for (const a of anim) { const k = a.kind + ':' + a.name; (byName[k] ||= { k, n:0, ex:a }).n++; }
    const sections = [...document.querySelectorAll('main > section, main > div > section, section')]
      .slice(0, 24).map(s => {
        const r = s.getBoundingClientRect();
        const h = s.querySelector('h1,h2,h3');
        return { h: Math.round(r.height), label: (h?.textContent||'').trim().slice(0,44),
                 cls: (s.className||'').toString().slice(0,60) };
      });
    return { title: document.title, scrollH: de.scrollHeight,
      motion: Object.values(byName).sort((a,b)=>b.n-a.n).slice(0,22),
      canvases: document.querySelectorAll('canvas').length,
      svgs: document.querySelectorAll('svg').length,
      videos: document.querySelectorAll('video, iframe').length,
      sections };
  });
  out.push({ route, ...info });
  await page.screenshot({ path: `/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/ref-${W}-${route.replace(/[^a-z0-9]+/gi,'_')||'home'}.png`, fullPage: true });
  await page.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
