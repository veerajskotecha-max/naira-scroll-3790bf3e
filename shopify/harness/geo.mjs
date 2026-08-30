import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
await p.route('**/*', async r => { const u=r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
    const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
await p.goto('http://127.0.0.1:4310/index', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1200);
console.log(JSON.stringify(await p.evaluate(() => {
  const g = s => { const e = document.querySelector(s); if (!e) return null;
    const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), pos: getComputedStyle(e).position }; };
  return { ab: g('.nf-ab'), header: g('.nf-header'), item: g('.nf-header__item--mega'), links: g('.nf-header__links') };
}), null, 1));
await b.close();
