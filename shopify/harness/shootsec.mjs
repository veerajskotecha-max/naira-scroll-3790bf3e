// Screenshot named elements (CSS selectors) instead of the whole page.
import { chromium } from 'playwright';
import fs from 'node:fs';
const SEL = process.argv.slice(3);
const OUT = process.argv[2] || '/tmp/sec';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
for (const view of [{tag:'desktop',w:1440,h:900,dsf:1},{tag:'mobile',w:390,h:844,dsf:2,mob:true}]) {
  const ctx = await b.newContext({ viewport:{width:view.w,height:view.h}, deviceScaleFactor:view.dsf, isMobile:view.mob, hasTouch:view.mob, reducedMotion:'reduce' });
  const p = await ctx.newPage();
  await p.route('**/*', async r => { const u=r.request().url();
    if (u.includes('127.0.0.1')) return r.continue();
    try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
      const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
      await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
  await p.goto('http://127.0.0.1:4310/index',{waitUntil:'networkidle'});
  await p.evaluate(() => { document.querySelectorAll('img[loading="lazy"]').forEach(i=>i.loading='eager'); });
  await p.waitForTimeout(1500);
  for (const s of SEL) {
    const el = await p.$(s);
    if (!el) { console.log(`MISS ${view.tag} ${s}`); continue; }
    await el.scrollIntoViewIfNeeded().catch(()=>{});
    await p.waitForTimeout(400);
    const f = `${OUT}/${s.replace(/[^a-z0-9]/gi,'_')}-${view.tag}.png`;
    await el.screenshot({ path:f, animations:'disabled' }).catch(e=>console.log('ERR',s,e.message));
    if (fs.existsSync(f)) console.log(`${view.tag} ${s} -> ${(fs.statSync(f).size/1024).toFixed(0)}KB`);
  }
  await ctx.close();
}
await b.close();
