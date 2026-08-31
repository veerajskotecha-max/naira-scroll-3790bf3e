import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
await p.route('**/*', async r => { const u=r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
    const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
await p.goto('http://127.0.0.1:4310/page.faqs', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(900);
console.log(JSON.stringify(await p.evaluate(() => {
  const d = [...document.querySelectorAll('details.nf-faq__item')];
  const first = d[0];
  const ans = first && [...first.children].find(c => c.tagName !== 'SUMMARY');
  return { total: d.length, open: d.filter(x => x.open).length,
    firstAnswerBox: ans ? ans.getBoundingClientRect().height : null,
    firstAnswerDisplay: ans ? getComputedStyle(ans).display : null,
    detailsDisplay: first ? getComputedStyle(first).display : null };
}), null, 1));
await b.close();
