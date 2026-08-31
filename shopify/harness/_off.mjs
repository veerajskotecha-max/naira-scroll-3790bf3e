import { chromium } from 'playwright';
const W = Number(process.argv[2] || 1440);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const probe = async (base, path) => {
  const c = await b.newContext({ viewport: { width: W, height: 950 } });
  await c.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
  const p = await c.newPage();
  await p.route('**/*', async r => { const u=r.request().url();
    if (u.includes('127.0.0.1')) return r.continue();
    try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
      const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
      await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
  await p.goto(base + path, { waitUntil: 'networkidle', timeout: 45000 });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const out = [];
    const push = (label, el) => { if (!el) return out.push([label, null, null]);
      const b = el.getBoundingClientRect(); out.push([label, Math.round(b.top + scrollY), Math.round(b.height)]); };
    const art = document.querySelector('article');
    push('article', art);
    push('nav-crumb', art?.querySelector('nav'));
    push('header', art?.querySelector('header'));
    push('h1', art?.querySelector('h1'));
    push('lead', art?.querySelector('header p + h1 + p') || art?.querySelector('.nf-article__excerpt') || art?.querySelector('.journal-intro'));
    const h2s = [...(art?.querySelectorAll('h2')||[])];
    h2s.forEach((h,i)=>push('h2#'+i+' '+h.textContent.trim().slice(0,18), h));
    push('dl', art?.querySelector('dl'));
    push('aside', art?.querySelector('aside'));
    push('morenav', art?.querySelector('nav[aria-label*="ore" i]') || [...art.querySelectorAll('nav')].at(-1));
    push('footer', document.querySelector('footer'));
    return { rows: out, docH: document.documentElement.scrollHeight };
  });
  await c.close(); return r;
};
const a = await probe('http://127.0.0.1:4325', '/journal/anti-tarnish-jewellery-guide');
const t = await probe('http://127.0.0.1:4310', '/article');
console.log('W='+W, 'docH react', a.docH, 'theme', t.docH, 'delta', t.docH - a.docH);
for (let i=0;i<Math.max(a.rows.length,t.rows.length);i++){
  const x=a.rows[i]||[], y=t.rows[i]||[];
  const dt = (x[1]!=null&&y[1]!=null)? y[1]-x[1] : '?';
  const dh = (x[2]!=null&&y[2]!=null)? y[2]-x[2] : '?';
  console.log(String(x[0]||y[0]).padEnd(28), 'react t='+x[1]+' h='+x[2], ' theme t='+y[1]+' h='+y[2], ' Δtop='+dt+' Δh='+dh);
}
await b.close();
