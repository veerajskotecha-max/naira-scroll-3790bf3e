import { chromium } from 'playwright';
const THEME='151142826146', SHOP='https://nc5eti-gp.myshopify.com';
const PREVIEW=`_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`;
const jar=new Map(); const ch=()=>[...jar].map(([k,v])=>`${k}=${v}`).join('; ');
const eat=r=>{for(const[k,v]of r.headers)if(k.toLowerCase()==='set-cookie')v.split(/,(?=[^;]+=)/).forEach(c=>{const[a,b]=c.split(';')[0].split('=');if(a&&b)jar.set(a.trim(),b.trim());});};
eat(await fetch(`${SHOP}/?${PREVIEW}`,{redirect:'manual'}));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:1440,height:1000}});
await ctx.route('**/*',async route=>{const q=route.request();let u=q.url();
 if(u.startsWith(SHOP)&&(q.resourceType()==='document'||u.includes('/recommendations/')))u+=(u.includes('?')?'&':'?')+PREVIEW;
 try{const r=await fetch(u,{method:q.method(),headers:{...q.headers(),cookie:ch()},body:q.postData()||undefined,redirect:'follow'});eat(r);
 if(u.includes('/recommendations/')) console.error('REC FETCH', r.status, r.headers.get('content-type'), u.slice(40,150));
 const buf=Buffer.from(await r.arrayBuffer());const h=Object.fromEntries([...r.headers].filter(([k])=>!/^(content-encoding|content-length|set-cookie)$/i.test(k)));
 await route.fulfill({status:r.status,headers:h,body:buf});}catch(e){console.error('ABORT',u.slice(0,90),e.message);await route.abort();}});
const p=await ctx.newPage();
p.on('console',m=>{const t=m.text(); if(/recommend|error|fail/i.test(t)) console.error('PAGE:',t.slice(0,140));});
await p.goto(SHOP+'/products/serpentine-whisper-chain',{waitUntil:'load',timeout:70000});
await p.evaluate(()=>{const e=document.querySelector('[id$="__recommendations"]'); e&&e.scrollIntoView();});
await p.waitForTimeout(6000);
console.log(JSON.stringify(await p.evaluate(()=>{
  const pr=document.querySelector('product-recommendations');
  return {performed:pr?.dataset.recommendationsPerformed, url:pr?.dataset.url,
    cards:document.querySelectorAll('[id$="__recommendations"] product-card').length,
    txt:(document.querySelector('[id$="__recommendations"]')?.innerText||'').slice(0,100)};
})));
await b.close();
