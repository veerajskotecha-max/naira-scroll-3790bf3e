import { chromium } from 'playwright';
const width = Number(process.argv[2] || 1440);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
async function grab(url, label, sel) {
  const ctx = await b.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.route('**/*', async r => { const u = r.request().url();
    if (u.includes('127.0.0.1')) return r.continue();
    try { const res = await fetch(u, { redirect: 'follow' }); const buf = Buffer.from(await res.arrayBuffer());
      return r.fulfill({ status: res.status, headers: { 'content-type': res.headers.get('content-type')||'' }, body: buf }); } catch { return r.abort(); } });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
  await p.waitForTimeout(1200);
  const out = await p.evaluate((sels) => sels.map(s => {
    const el = document.querySelector(s); if (!el) return s + ' -> (none)';
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return `${s} -> x=${Math.round(r.x)} y=${Math.round(r.y+scrollY)} w=${Math.round(r.width)} h=${Math.round(r.height)} pad=${cs.padding} pos=${cs.position} disp=${cs.display}`;
  }), sel);
  console.log('==== '+label); out.forEach(l=>console.log('  '+l));
  await ctx.close();
}
await grab('http://127.0.0.1:4325/jewellery/riviere-eternal-necklace','REACT',
  ['.max-w-\\[1400px\\]','main','#root>div','#product-price','#product-actions']);
await grab('http://127.0.0.1:4310/product','THEME',
  ['.nf-pdp','.nf-pdp__layout','.nf-pdp__gallery','.nf-pdp__rail','.nf-pdp__details','main','#MainContent','#product-price','#product-actions','.nf-pdp__related-grid']);
await b.close();
