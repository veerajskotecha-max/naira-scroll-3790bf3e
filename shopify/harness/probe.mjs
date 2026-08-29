import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const ctx = await b.newContext({ viewport:{width:1440,height:900} });
const p = await ctx.newPage();
await p.route('**/*', async r => { const u=r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
    const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
await p.goto('http://127.0.0.1:4310/index', { waitUntil:'networkidle' });
await p.waitForTimeout(1200);
const out = await p.evaluate(() => {
  const r = [];
  document.querySelectorAll('.nf-bdband').forEach((el,i) => {
    const inner = el.querySelector('.nf-bdband__inner');
    const bd = el.querySelector('.nf-bd');
    r.push({ band:i, span:el.dataset.nfBdbandSpan, innerH: inner ? Math.round(inner.getBoundingClientRect().height) : null,
             innerZ: inner ? getComputedStyle(inner).zIndex : null,
             bdVisible: bd ? getComputedStyle(bd).display : null,
             washOpacity: el.querySelector('.nf-bd__wash') ? getComputedStyle(el.querySelector('.nf-bd__wash')).opacity : null });
  });
  const onwash = [...document.querySelectorAll('.nf-onwash')].map(e => ({
    tag:e.tagName.toLowerCase(), cls:(e.className||'').toString().slice(0,40),
    bg:getComputedStyle(e).backgroundColor, h:Math.round(e.getBoundingClientRect().height) }));
  const zt = document.querySelector('.nf-zt');
  const card = document.querySelector('.nf-zt__card');
  const faces = [...document.querySelectorAll('.nf-zt__face')].map(f => ({
    src:f.getAttribute('src').split('/').pop(), w:Math.round(f.getBoundingClientRect().width),
    h:Math.round(f.getBoundingClientRect().height), op:getComputedStyle(f).opacity, complete:f.complete, nw:f.naturalWidth }));
  const calls = [...document.querySelectorAll('.nf-zt__call')].map(c => ({
    op:getComputedStyle(c).opacity, x:Math.round(c.getBoundingClientRect().x), w:Math.round(c.getBoundingClientRect().width) }));
  return { bands:r, onwash, zt: zt ? { top:Math.round(zt.getBoundingClientRect().top+scrollY), h:Math.round(zt.getBoundingClientRect().height) } : null,
           card: card ? { w:Math.round(card.getBoundingClientRect().width), t:getComputedStyle(card).transform } : null,
           faces, calls, docH: document.documentElement.scrollHeight };
});
console.log(JSON.stringify(out,null,1));
await b.close();
