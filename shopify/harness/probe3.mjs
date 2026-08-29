import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const p = await (await b.newContext({viewport:{width:1440,height:900}, reducedMotion:'reduce'})).newPage();
await p.route('**/*', async r => { const u=r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
    const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
await p.goto('http://127.0.0.1:4310/index',{waitUntil:'networkidle'});
await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(() => {
  return [...document.querySelectorAll('main > section, body > section')].map(s => {
    const r = s.getBoundingClientRect();
    const imgs = [...s.querySelectorAll('img')];
    return { cls: s.className.replace(/nf-onwash|nf /g,'').trim().slice(0,26),
      h: Math.round(r.height), children: s.children.length,
      text: (s.innerText||'').trim().replace(/\s+/g,' ').slice(0,70),
      imgs: imgs.length, imgOk: imgs.filter(i=>i.naturalWidth>0).length };
  });
}),null,1));
await b.close();
