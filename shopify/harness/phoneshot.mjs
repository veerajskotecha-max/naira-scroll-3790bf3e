import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium',
  args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'] });
const ctx = await b.newContext({ viewport:{width:400,height:900}, deviceScaleFactor:2 });
await ctx.route('**/*', async r => { const u=r.request().url(); if(u.startsWith('file:')) return r.continue();
  try{const x=await fetch(u,{headers:r.request().headers()});const buf=Buffer.from(await x.arrayBuffer());
  const h=Object.fromEntries([...x.headers].filter(([k])=>!/^(content-encoding|content-length)$/i.test(k)));
  await r.fulfill({status:x.status,headers:h,body:buf});}catch{await r.abort();}});
const p = await ctx.newPage();
const body = readFileSync(process.argv[2],'utf8');
await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui;background:#faf9f7}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${body}</body></html>`,{waitUntil:'load'});
await p.waitForTimeout(5000);
console.log(JSON.stringify(await p.evaluate(()=>({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  h: document.body.scrollHeight,
  canvas: (()=>{const c=document.querySelector('.stage canvas');return c?c.getBoundingClientRect().width|0:0;})(),
  gutter: getComputedStyle(document.querySelector('.wrap')).paddingLeft,
}))));
writeFileSync(process.argv[3], await p.screenshot({fullPage:true}));
await b.close();
