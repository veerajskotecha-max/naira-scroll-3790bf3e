import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
const sizes = new Map();
await ctx.route('**/*', async r => { const q=r.request();
  try{const x=await fetch(q.url(),{headers:q.headers()});const buf=Buffer.from(await x.arrayBuffer());
  if(q.resourceType()==='image') sizes.set(q.url(), buf.length);
  const h=Object.fromEntries([...x.headers].filter(([k])=>!/^(content-encoding|content-length)$/i.test(k)));
  await r.fulfill({status:x.status,headers:h,body:buf});}catch{await r.abort();}});
const p = await ctx.newPage();
await p.goto(process.argv[2], { waitUntil:'load', timeout:120000 });
await p.waitForTimeout(3000);
const imgs = await p.evaluate(() => [...document.images].map(i => {
  const r = i.getBoundingClientRect();
  return { src: i.currentSrc || i.src, loading: i.loading, fetchPriority: i.fetchPriority,
    srcset: !!i.srcset, sizes: !!i.sizes, dispW: Math.round(r.width), dispH: Math.round(r.height),
    natW: i.naturalWidth, top: Math.round(r.top + scrollY), above: r.top < 844 && r.bottom > 0 };
}));
let eagerBytes=0, belowBytes=0, over=0;
console.log('img  disp     natural   loading   above  kB   overdraw');
imgs.forEach(i => {
  const kb = (sizes.get(i.src)||0)/1024;
  const ratio = i.dispW ? (i.natW / (i.dispW*2)) : 0;   // dpr 2
  if (i.loading !== 'lazy') eagerBytes += kb;
  if (!i.above) belowBytes += kb;
  if (ratio > 1.4) over++;
  console.log(`${String(i.dispW).padStart(4)}x${String(i.dispH).padEnd(4)} ${String(i.natW).padStart(5)}px  ${String(i.loading||'eager').padEnd(8)} ${i.above?'YES':'no '}  ${kb.toFixed(0).padStart(5)}  ${ratio>1.4?ratio.toFixed(1)+'x too big':''}`);
});
console.log(`\n${imgs.length} images | eager ${eagerBytes.toFixed(0)} kB | below the fold ${belowBytes.toFixed(0)} kB | ${over} oversized | srcset on ${imgs.filter(i=>i.srcset).length}`);
await b.close();
