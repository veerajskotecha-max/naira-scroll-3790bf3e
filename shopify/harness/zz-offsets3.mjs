import { chromium } from 'playwright';
const W = Number(process.argv[2]) || 390;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const [lo, hi] = [Number(process.argv[5]), Number(process.argv[6])];
async function go(url, off) {
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
  const out = await p.evaluate(([lo,hi]) => {
    const res = [];
    for (const el of document.querySelectorAll('body *')) {
      if (/^(SCRIPT|STYLE|SVG|PATH|NOSCRIPT|TEMPLATE)$/.test(el.tagName)) continue;
      const r = el.getBoundingClientRect();
      const top = Math.round(r.top + window.scrollY);
      if (top < lo || top > hi) continue;
      let own = ''; for (const n of el.childNodes) if (n.nodeType === 3) own += n.nodeValue;
      own = own.replace(/\s+/g,' ').trim();
      if (!own) continue;
      res.push({ top, h: Math.round(r.height), t: own.slice(0, 50) });
    }
    return res;
  }, [lo, hi]);
  await c.close(); return out;
}
const R = await go('http://127.0.0.1:4325' + process.argv[3], 0);
const T = await go('http://127.0.0.1:4310' + process.argv[4], 0);
const n = Math.max(R.length, T.length);
for (let i=0;i<n;i++){
  const r=R[i]||{}, t=T[i]||{};
  console.log(String(r.top??'-').padStart(5), String(r.h??'-').padStart(4), (r.t??'').padEnd(50).slice(0,50), ' | ',
              String(t.top??'-').padStart(5), String(t.h??'-').padStart(4), (t.t??'').slice(0,50));
}
await b.close();
