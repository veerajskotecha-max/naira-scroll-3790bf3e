import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:1440,height:1000}});
await ctx.route('**/*',async route=>{const q=route.request();
 try{const r=await fetch(q.url(),{method:q.method(),headers:q.headers(),body:q.postData()||undefined,redirect:'follow'});
 const buf=Buffer.from(await r.arrayBuffer());const h=Object.fromEntries([...r.headers].filter(([k])=>!/^(content-encoding|content-length|set-cookie)$/i.test(k)));
 await route.fulfill({status:r.status,headers:h,body:buf});}catch{await route.abort();}});
for (const url of ['https://nc5eti-gp.myshopify.com/?_ab=0&_fd=0&_sc=1']) {
  const p=await ctx.newPage();
  await p.goto(url,{waitUntil:'load',timeout:70000}); await p.waitForTimeout(3000);
  console.log(url, JSON.stringify(await p.evaluate(()=>({
    theme:(window.Shopify&&Shopify.theme&&Shopify.theme.id)||null,
    htmlOv:getComputedStyle(document.documentElement).overflow,
    bodyOv:getComputedStyle(document.body).overflow,
    bodyDisp:getComputedStyle(document.body).display,
    bodySH:document.body.scrollHeight,
    pw:(()=>{const e=document.querySelector('.page-wrapper');return e?{ov:getComputedStyle(e).overflow,h:getComputedStyle(e).height,sh:e.scrollHeight}:null;})(),
  }))));
  await p.close();
}
await b.close();
