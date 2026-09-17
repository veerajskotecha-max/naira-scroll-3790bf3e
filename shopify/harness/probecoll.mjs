import { chromium } from 'playwright';
const THEME='151142826146', SHOP='https://nc5eti-gp.myshopify.com';
const PREVIEW=`_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`;
const jar=new Map(); const ch=()=>[...jar].map(([k,v])=>`${k}=${v}`).join('; ');
const eat=r=>{for(const[k,v]of r.headers)if(k.toLowerCase()==='set-cookie')v.split(/,(?=[^;]+=)/).forEach(c=>{const[a,b]=c.split(';')[0].split('=');if(a&&b)jar.set(a.trim(),b.trim());});};
eat(await fetch(`${SHOP}/?${PREVIEW}`,{redirect:'manual'}));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:1440,height:1000}});
await ctx.route('**/*',async route=>{const q=route.request();let u=q.url();
 if(u.startsWith(SHOP)&&q.resourceType()==='document')u+=(u.includes('?')?'&':'?')+PREVIEW;
 try{const r=await fetch(u,{method:q.method(),headers:{...q.headers(),cookie:ch()},body:q.postData()||undefined,redirect:'follow'});eat(r);
 const buf=Buffer.from(await r.arrayBuffer());const h=Object.fromEntries([...r.headers].filter(([k])=>!/^(content-encoding|content-length|set-cookie)$/i.test(k)));
 await route.fulfill({status:r.status,headers:h,body:buf});}catch{await route.abort();}});
for (const path of ['/collections/necklaces','/products/serpentine-whisper-chain']) {
  const p=await ctx.newPage();
  await p.goto(SHOP+path,{waitUntil:'load',timeout:70000}); await p.waitForTimeout(3000);
  console.log('\n===',path);
  console.log(JSON.stringify(await p.evaluate(()=>{
    const info={sections:[...document.querySelectorAll('[id^="shopify-section-"]')].map(e=>({id:e.id.split('__').pop(),cls:String(e.className).slice(0,44),h:e.offsetHeight}))};
    const svg=document.querySelector('svg.placeholder-svg, .placeholder-svg');
    if(svg){const r=svg.getBoundingClientRect();let up=svg,chain=[];for(let i=0;i<5&&up;i++){chain.push(up.tagName.toLowerCase()+'.'+String(up.className.baseVal??up.className).trim().split(/\s+/).slice(0,3).join('.'));up=up.parentElement;}
      info.placeholder={rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},chain};}
    const bar=[...document.querySelectorAll('*')].find(e=>{const s=getComputedStyle(e);const bg=s.backgroundColor;return /rgb\(2[0-9], 2[0-9], 2[0-9]\)|rgb\(0, 0, 0\)|rgb\(26, 22, 20\)/.test(bg)&&e.offsetHeight>30&&e.offsetHeight<90&&e.offsetWidth>1000;});
    if(bar) info.darkBar={tag:bar.tagName,cls:String(bar.className).slice(0,90),bg:getComputedStyle(bar).backgroundColor,h:bar.offsetHeight};
    const grid=document.querySelector('.product-grid, .resource-list--grid, [class*="product-grid"]');
    if(grid){const s=getComputedStyle(grid);const r=grid.getBoundingClientRect();
      info.grid={cls:String(grid.className).slice(0,80),gap:s.gap,cols:s.gridTemplateColumns.split(' ').length,pad:s.padding,x:Math.round(r.x),w:Math.round(r.width)};}
    const gal=document.querySelector('media-gallery, .media-gallery');
    if(gal){const r=gal.getBoundingClientRect();info.gallery={cls:String(gal.className).slice(0,60),x:Math.round(r.x),w:Math.round(r.width)};}
    const rec=document.querySelector('[id$="__recommendations"], [id*="recommendation"]');
    if(rec){info.rec={id:rec.id.slice(0,50),h:rec.offsetHeight,text:(rec.innerText||'').slice(0,80),cards:rec.querySelectorAll('.product-card, product-card').length,imgs:rec.querySelectorAll('img').length};}
    return info;
  }),null,1));
  await p.close();
}
await b.close();
