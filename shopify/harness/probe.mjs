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
  const base = route.startsWith('T:') ? 'http://127.0.0.1:4310' : 'http://127.0.0.1:4325';
  const path = route.replace(/^T:/, '');
  try {
    await p.goto(base + path, { waitUntil: 'networkidle', timeout: 45000 });
    await p.waitForTimeout(1200);
    const i = await p.evaluate(() => ({ h1: document.querySelector('h1')?.textContent?.trim().slice(0,44) || null,
      imgs: document.querySelectorAll('img').length, h: document.documentElement.scrollHeight,
      txt: document.body.innerText.replace(/\s+/g,' ').slice(140, 240) }));
    console.log(route.padEnd(42), JSON.stringify(i));
  } catch (e) { console.log(route.padEnd(42), 'ERR ' + String(e.message).slice(0,60)); }
}
await b.close();
