import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const ctx = await b.newContext({ viewport:{width:Number(process.argv[3]),height:1000}, reducedMotion:'reduce' });
await ctx.addInitScript(()=>{try{localStorage.setItem('naira-promo-popup-seen','1')}catch(e){}});
const p = await ctx.newPage(); await p.goto(process.argv[2],{waitUntil:'networkidle'}); await p.waitForTimeout(2500);
console.log(await p.evaluate(sels=>sels.map(s=>{const e=document.querySelector(s);if(!e)return s+': --';const r=e.getBoundingClientRect();return `${s}: ${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.y+scrollY)}`}).join('\n'), process.argv.slice(4)));
await b.close();
