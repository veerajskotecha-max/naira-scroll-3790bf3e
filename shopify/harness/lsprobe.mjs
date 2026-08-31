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
  // walk up from a drifting element to find who first declares the 0.72px
  const el = [...document.querySelectorAll('*')].find(e => e.textContent.trim() === 'New Arrivals' && e.tagName === 'H2');
  if (!el) return { err: 'not found' };
  const chain = [];
  for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
    chain.push({ tag: n.tagName.toLowerCase(), cls: (typeof n.className==='string'?n.className:'').slice(0,50),
      ls: getComputedStyle(n).letterSpacing, fs: getComputedStyle(n).fontSize, lh: getComputedStyle(n).lineHeight });
  }
  return chain;
}), null, 1));
await b.close();
