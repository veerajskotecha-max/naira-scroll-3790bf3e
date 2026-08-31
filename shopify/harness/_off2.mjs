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
    const art = document.querySelector('article');
    const out = [];
    const walk = (el, d) => {
      for (const ch of el.children) {
        const cs = getComputedStyle(ch), b = ch.getBoundingClientRect();
        out.push(['  '.repeat(d) + ch.tagName.toLowerCase() + '.' + (typeof ch.className==='string'?ch.className:'').split(' ')[0].slice(0,18),
          Math.round(b.top+scrollY), Math.round(b.height),
          `mt${parseFloat(cs.marginTop)} mb${parseFloat(cs.marginBottom)} pt${parseFloat(cs.paddingTop)} pb${parseFloat(cs.paddingBottom)} lh${cs.lineHeight}`,
          (ch.textContent||'').trim().slice(0,20)]);
        if (d < 2) walk(ch, d+1);
      }
    };
    walk(art, 0);
    return out;
  });
  await c.close(); return r;
};
const a = await probe('http://127.0.0.1:4325', '/journal/anti-tarnish-jewellery-guide');
const t = await probe('http://127.0.0.1:4310', '/article');
const fmt = r => r ? `${String(r[1]).padStart(5)} h${String(r[2]).padStart(4)} ${r[3]}` : '—';
console.log('REACT'.padEnd(70) + ' | THEME');
for (let i=0;i<Math.max(a.length,t.length);i++){
  const x=a[i], y=t[i];
  console.log(((x? x[0].padEnd(26)+fmt(x) : '—').padEnd(70)) + ' | ' + (y? y[0].padEnd(26)+fmt(y) : '—'));
}
await b.close();
