import { chromium } from 'playwright';
const THEME='151142826146', HOST='https://nc5eti-gp.myshopify.com';
const PREVIEW=`_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`;
const jar=new Map(); const ck=()=>[...jar].map(([k,v])=>`${k}=${v}`).join('; ');
{ const r=await fetch(`${HOST}/?${PREVIEW}`,{redirect:'manual'});
  for(const [k,v] of r.headers) if(k.toLowerCase()==='set-cookie')
    v.split(/,(?=[^;]+=)/).forEach(c=>{const[a,b]=c.split(';')[0].split('=');if(a&&b)jar.set(a.trim(),b.trim());}); }
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
await ctx.route('**/*', async route=>{
  const rq=route.request(); let u=rq.url();
  if(u.startsWith(HOST)&&rq.resourceType()==='document') u+=(u.includes('?')?'&':'?')+PREVIEW;
  try{ const r=await fetch(u,{method:rq.method(),headers:{...rq.headers(),cookie:ck()},body:rq.postData()||undefined,redirect:'follow'});
    const buf=Buffer.from(await r.arrayBuffer());
    const h=Object.fromEntries([...r.headers].filter(([k])=>!/^(content-encoding|content-length|set-cookie)$/i.test(k)));
    await route.fulfill({status:r.status,headers:h,body:buf});
  }catch{ await route.abort(); }
});
const p=await ctx.newPage();
await p.goto(HOST+'/',{waitUntil:'load',timeout:60000});
await p.waitForTimeout(3500);
const out = await p.evaluate(()=>{
  const pts=[[1000,400],[1200,700],[700,500],[1300,180]];
  const describe=el=>{ const cs=getComputedStyle(el);
    return {tag:el.tagName.toLowerCase(), id:el.id||null, cls:(el.className&&el.className.toString().slice(0,70))||null,
            bgImage:cs.backgroundImage.slice(0,120), bg:cs.backgroundColor,
            rect:(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(el.getBoundingClientRect())}; };
  const res={};
  for(const [x,y] of pts){ const el=document.elementFromPoint(x,y);
    if(!el){res[`${x},${y}`]='(none)';continue;}
    const chain=[]; let n=el; for(let i=0;i<4&&n;i++,n=n.parentElement) chain.push(describe(n));
    res[`${x},${y}`]=chain; }
  res._iframes=[...document.querySelectorAll('iframe')].map(f=>({src:(f.src||'').slice(0,90),
    rect:(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(f.getBoundingClientRect())}));
  res._bigImgs=[...document.querySelectorAll('img,svg,canvas')].map(e=>({t:e.tagName.toLowerCase(),
    src:(e.currentSrc||e.src||'').split('/').pop()||'',
    rect:(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(e.getBoundingClientRect())}))
    .filter(o=>o.rect.w>300&&o.rect.h>300);
  return res;
});
console.log('IFRAMES:',JSON.stringify(out._iframes));
console.log('BIG ELEMENTS:',JSON.stringify(out._bigImgs,null,1));
console.log('AT 1000,400:',JSON.stringify(out['1000,400'],null,1).slice(0,900));
await b.close();
