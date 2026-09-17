import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const THEME='151142826146', SHOP='https://nc5eti-gp.myshopify.com';
const PREVIEW=`_ab=0&_fd=0&_sc=1&preview_theme_id=${THEME}`;
const jar=new Map(); const ch=()=>[...jar].map(([k,v])=>`${k}=${v}`).join('; ');
const eat=r=>{for(const[k,v]of r.headers)if(k.toLowerCase()==='set-cookie')v.split(/,(?=[^;]+=)/).forEach(c=>{const[a,b]=c.split(';')[0].split('=');if(a&&b)jar.set(a.trim(),b.trim());});};
eat(await fetch(`${SHOP}/?${PREVIEW}`,{redirect:'manual'}));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2});
await ctx.route('**/*',async route=>{const q=route.request();let u=q.url();
 if(u.startsWith(SHOP)&&q.resourceType()==='document')u+=(u.includes('?')?'&':'?')+PREVIEW;
 try{const r=await fetch(u,{method:q.method(),headers:{...q.headers(),cookie:ch()},body:q.postData()||undefined,redirect:'follow'});eat(r);
 const buf=Buffer.from(await r.arrayBuffer());const h=Object.fromEntries([...r.headers].filter(([k])=>!/^(content-encoding|content-length|set-cookie)$/i.test(k)));
 await route.fulfill({status:r.status,headers:h,body:buf});}catch{await route.abort();}});
const p=await ctx.newPage();
await p.goto(SHOP+(process.argv[3]||'/'),{waitUntil:'load',timeout:70000}); await p.waitForTimeout(3500);
await p.evaluate(async()=>{const pw=document.querySelector('.page-wrapper');
  const sc=pw&&getComputedStyle(pw).overflowY!=='visible'?pw:window;
  const H=sc===window?document.body.scrollHeight:sc.scrollHeight;
  for(let y=0;y<H;y+=700){sc.scrollTo(0,y);await new Promise(r=>setTimeout(r,180));}
  sc.scrollTo(0,H);});
await p.waitForTimeout(2000);
console.log(JSON.stringify(await p.evaluate(()=>{
  const f=document.querySelector('footer, [class*="footer"]');
  const r=f?f.getBoundingClientRect():null;
  return {tag:f&&f.tagName, cls:f&&String(f.className).slice(0,60), rect:r&&{t:Math.round(r.top),h:Math.round(r.height)},
    text:(f?.innerText||'').replace(/\n+/g,' | ').slice(0,220)};
})));
writeFileSync(process.argv[2], await p.screenshot());
await b.close();
