import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.route('**/*', async r => { const u=r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
    const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
await p.goto('http://127.0.0.1:4310/index',{waitUntil:'networkidle'});
console.log(JSON.stringify(await p.evaluate(() => {
  const pick = el => { const c=getComputedStyle(el); return { position:c.position, w:c.width, h:c.height,
    top:c.top, left:c.left, right:c.right, bottom:c.bottom, inset:c.inset, objectFit:c.objectFit,
    maxW:c.maxWidth, maxH:c.maxHeight, aspect:c.aspectRatio, display:c.display,
    rect:[Math.round(el.getBoundingClientRect().width),Math.round(el.getBoundingClientRect().height)] }; };
  const a=document.querySelector('[data-zt-face-a]'), bb=document.querySelector('[data-zt-face-b]');
  const card=document.querySelector('.nf-zt__card');
  return { card:pick(card), faceA:pick(a), faceB:pick(bb), sameParent: a.parentElement===bb.parentElement };
}),null,1));
await b.close();
