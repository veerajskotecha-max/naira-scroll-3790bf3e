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
const p=await ctx.newPage();
await p.goto(SHOP+'/',{waitUntil:'load',timeout:70000}); await p.waitForTimeout(3500);
console.log(JSON.stringify(await p.evaluate(()=>{
  const ul=document.querySelectorAll('[id*="footer"] ul')[0];
  if(!ul) return 'no footer ul';
  const chain=[]; let e=ul;
  while(e && e!==document.documentElement){
    const s=getComputedStyle(e);
    chain.push({tag:e.tagName.toLowerCase(), id:e.id.slice(0,44), cls:String(e.className).slice(0,70),
      disp:s.display, vis:s.visibility, op:s.opacity, h:e.offsetHeight, w:e.offsetWidth,
      ov:s.overflow, clip:s.clipPath, pos:s.position, z:s.zIndex, cv:s.contentVisibility});
    e=e.parentElement;
  }
  return chain;
}),null,1));
await b.close();
