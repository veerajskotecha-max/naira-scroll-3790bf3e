import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const c = await b.newContext({ viewport: { width: 1440, height: 950 } });
await c.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
const p = await c.newPage();
await p.route('**/*', async r => { const u=r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
    const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
for (const route of process.argv.slice(2)) {
  await p.goto('http://127.0.0.1:4325' + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const info = await p.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.trim().slice(0,60) || null,
    imgs: document.querySelectorAll('img').length,
    height: document.documentElement.scrollHeight,
    body: document.body.innerText.replace(/\s+/g,' ').slice(0,150),
  }));
  console.log(route, JSON.stringify(info));
}
await b.close();
