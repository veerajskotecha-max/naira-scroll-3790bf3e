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
await p.goto(SHOP+'/',{waitUntil:'load',timeout:70000}); await p.waitForTimeout(3000);
console.log(JSON.stringify(await p.evaluate(()=>{
  const out={};
  const btn=document.querySelector('[id$="__hero"] a.button-primary, [id$="__hero"] .button, [id$="__hero"] a[class*=button]');
  if(btn){const s=getComputedStyle(btn);out.btn={cls:btn.className,tag:btn.tagName,bg:s.backgroundColor,color:s.color,border:s.border,pad:s.padding,bgImg:s.backgroundImage.slice(0,60),display:s.display,w:btn.offsetWidth,h:btn.offsetHeight};}
  else out.btn='NOT FOUND: '+[...document.querySelectorAll('[id$="__hero"] a')].map(a=>a.className).join(' | ');
  // card title box
  const t=document.querySelector('.product-card [class*="__card_title"]');
  if(t){const s=getComputedStyle(t);out.title={cls:t.className.slice(0,80),font:s.fontFamily.split(',')[0],size:s.fontSize,minH:s.minHeight,mt:s.marginTop,pt:s.paddingTop};
    const g=t.closest('.group-block-content')?.parentElement; if(g) out.group={pt:getComputedStyle(g).paddingTop};}
  // footer menus
  out.footer=[...document.querySelectorAll('[id*="footer"] ul')].map(u=>({items:u.querySelectorAll('li').length}));
  out.footerText=(document.querySelector('[id*="footer"]')?.innerText||'').slice(0,300);
  return out;
}),null,1));
await b.close();
