import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const c = await b.newContext({ viewport: { width: Number(process.env.W||1440), height: 950 } });
await c.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
const p = await c.newPage();
await p.route('**/*', async r => { const u=r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
    const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
for (const route of process.argv.slice(2)) {
  const base = route.startsWith('T:') ? 'http://127.0.0.1:4310' : 'http://127.0.0.1:4325';
  await p.goto(base + route.replace(/^T:/,''), { waitUntil: 'networkidle', timeout: 45000 });
  await p.waitForTimeout(1200);
  const out = await p.evaluate(() => [...document.querySelectorAll('img')].map(el => {
    const r = el.getBoundingClientRect();
    let anc = el.closest('section,header,footer,nav,article,dialog') ;
    return { f:(el.currentSrc||el.src||'').split('/').pop().split('?')[0].slice(0,40), w:Math.round(r.width), h:Math.round(r.height),
      cls:(typeof el.className==='string'?el.className:'').slice(0,40), anc: anc? anc.tagName+'.'+(typeof anc.className==='string'?anc.className:'').slice(0,30):'-' };
  }));
  console.log('==== '+route+'  ('+out.length+' imgs)');
  for (const m of out) console.log(`  ${String(m.w).padStart(4)}x${String(m.h).padStart(4)}  ${m.f.padEnd(42)} ${m.cls.padEnd(30)} ${m.anc}`);
}
await b.close();
