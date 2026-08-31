import { chromium } from 'playwright';
const width = Number(process.argv[2] || 1440);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
async function grab(url, label) {
  const ctx = await b.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.route('**/*', async r => {
    const u = r.request().url();
    if (u.includes('127.0.0.1')) return r.continue();
    try { const res = await fetch(u, { redirect: 'follow' });
      const buf = Buffer.from(await res.arrayBuffer());
      return r.fulfill({ status: res.status, headers: { 'content-type': res.headers.get('content-type') || '' }, body: buf });
    } catch { return r.abort(); }
  });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
  await p.waitForTimeout(1500);
  await p.evaluate(async () => { await new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollTo(0,y);y+=800;if(y>document.body.scrollHeight){clearInterval(t);window.scrollTo(0,0);r();}},30);}); });
  await p.waitForTimeout(800);
  const out = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')].map(el => {
      const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      return { f: (el.currentSrc||el.src||'').split('/').pop().split('?')[0].slice(0,44),
        x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height),
        fit: cs.objectFit, ar: (r.width/Math.max(r.height,1)).toFixed(2) };
    }).filter(m => m.w > 2);
    const sections = [...document.querySelectorAll('section, main > div, body > div > div, [class*=related], [id]')].slice(0,0);
    return { imgs, docH: document.documentElement.scrollHeight };
  });
  await ctx.close();
  console.log('==== ' + label + ' @' + width + '  docH=' + out.docH);
  out.imgs.forEach(m => console.log(`  ${String(m.w).padStart(5)}x${String(m.h).padStart(5)} ar=${m.ar} fit=${m.fit} @(${m.x},${m.y})  ${m.f}`));
  return out;
}
await grab('http://127.0.0.1:4325/jewellery/riviere-eternal-necklace', 'REACT');
await grab('http://127.0.0.1:4310/product', 'THEME');
await b.close();
