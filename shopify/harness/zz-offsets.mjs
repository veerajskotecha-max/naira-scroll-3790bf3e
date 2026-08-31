// throwaway: landmark y-offsets on both pages, to localise a height gap
import { chromium } from 'playwright';
const W = Number(process.argv[2]) || 390;
const rPath = process.argv[3], tPath = process.argv[4];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
async function go(url) {
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
  const out = await p.evaluate(() => {
    const marks = {};
    const want = ['customer reviews','you may also like','from the collection','the details','care','shipping','description','materials','styling','delivery','free shipping','why women','pin','check','frequently','faq','you might'];
    for (const el of document.querySelectorAll('h1,h2,h3,h4,button,summary,p,dt,legend')) {
      const t = (el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      const hit = want.find(w => t === w || t.startsWith(w));
      if (hit && marks[hit] === undefined) marks[hit] = Math.round(el.getBoundingClientRect().top + window.scrollY);
    }
    marks.__doc = document.documentElement.scrollHeight;
    return marks;
  });
  await c.close();
  return out;
}
const R = await go('http://127.0.0.1:4325' + rPath);
const T = await go('http://127.0.0.1:4310' + tPath);
const keys = [...new Set([...Object.keys(R), ...Object.keys(T)])].sort((a,b)=>(R[a]??T[a]??0)-(R[b]??T[b]??0));
for (const k of keys) console.log(String(k).padEnd(24), 'react', String(R[k]).padStart(6), ' theme', String(T[k]).padStart(6), ' Δ', (T[k]??0)-(R[k]??0));
await b.close();
