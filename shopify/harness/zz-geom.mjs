import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const W = Number(process.env.W||1440);
const c = await b.newContext({ viewport: { width: W, height: 950 } });
await c.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
const p = await c.newPage();
await p.route('**/*', async r => { const u=r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
    const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
for (const arg of process.argv.slice(2)) {
  const [route, selCsv] = arg.split('##');
  const base = route.startsWith('T:') ? 'http://127.0.0.1:4310' : 'http://127.0.0.1:4325';
  await p.goto(base + route.replace(/^T:/,''), { waitUntil: 'networkidle', timeout: 45000 });
  await p.waitForTimeout(1200);
  const out = await p.evaluate((sels) => sels.map(s => {
    const el = document.querySelector(s); if(!el) return s+'  MISSING';
    const r = el.getBoundingClientRect(); const cs=getComputedStyle(el);
    return s.padEnd(34)+` x=${Math.round(r.x)} y=${Math.round(r.y)} w=${Math.round(r.width)} h=${Math.round(r.height)} pad=${cs.padding} mt=${cs.marginTop} gap=${cs.gap} fs=${cs.fontSize} maxw=${cs.maxWidth}`;
  }), selCsv.split(','));
  console.log('==== '+route+' @'+W+'px  docH='+await p.evaluate(()=>document.documentElement.scrollHeight));
  for (const m of out) console.log('  '+m);
}
await b.close();
