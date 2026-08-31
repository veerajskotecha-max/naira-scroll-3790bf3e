import { chromium } from 'playwright';
const W = Number(process.argv[2]) || 390;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
async function go(url, sel) {
  const c = await b.newContext({ viewport: { width: W, height: 900 }, reducedMotion: 'reduce' });
  await c.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
  const p = await c.newPage();
  await p.route('**/*', async r => { const u=r.request().url();
    if (u.includes('127.0.0.1')) return r.continue();
    try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
      const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
      await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(900);
  const out = await p.evaluate((sel) => {
    return [...document.querySelectorAll(sel)].map(e => {
      const r = e.getBoundingClientRect();
      return { h: Math.round(r.height), n: (e.textContent||'').trim().length, t: (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,45) };
    });
  }, sel);
  await c.close(); return out;
}
const R = await go('http://127.0.0.1:4325' + process.argv[3], process.argv[5]);
const T = await go('http://127.0.0.1:4310' + process.argv[4], process.argv[6]);
console.log('REACT'); R.forEach(x=>console.log('  h='+String(x.h).padStart(4), 'chars='+String(x.n).padStart(4), x.t));
console.log('THEME'); T.forEach(x=>console.log('  h='+String(x.h).padStart(4), 'chars='+String(x.n).padStart(4), x.t));
console.log('sum react', R.reduce((a,x)=>a+x.h,0), ' sum theme', T.reduce((a,x)=>a+x.h,0));
await b.close();
