import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
for (const [label, url] of [['theme','http://127.0.0.1:4310/index'], ['react','http://127.0.0.1:4325/']]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.route('**/*', async r => { const u=r.request().url();
    if (u.includes('127.0.0.1')) return r.continue();
    try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
      const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
      await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
  await p.waitForTimeout(1500);
  console.log(label, JSON.stringify(await p.evaluate(async () => {
    await document.fonts.ready;
    const faces = [...document.fonts].map(f => f.family + ':' + f.status);
    return { velistaUsable: document.fonts.check('26px Velista'),
             faces: faces.filter(f => /Velista/i.test(f)) };
  })));
  await p.close();
}
await b.close();
