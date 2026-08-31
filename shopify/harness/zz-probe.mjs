import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const p = await b.newPage({ viewport:{width:Number(process.argv[3]||1440),height:900} });
await p.goto(process.argv[2], { waitUntil:'networkidle' });
await p.waitForTimeout(2500);
const r = await p.evaluate(()=>({
  h:document.documentElement.scrollHeight,
  imgs:[...document.querySelectorAll('img')].filter(i=>i.getBoundingClientRect().width>2).map(i=>(i.currentSrc||i.src).split('/').pop().slice(0,40)),
  txt:[...document.querySelectorAll('body *')].filter(e=>{const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')return false;const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return false;let o='';for(const n of e.childNodes)if(n.nodeType===3)o+=n.nodeValue;return o.replace(/\s+/g,' ').trim().length>1;}).map(e=>{let o='';for(const n of e.childNodes)if(n.nodeType===3)o+=n.nodeValue;return e.tagName+'|'+o.replace(/\s+/g,' ').trim().slice(0,80);})
}));
console.log(JSON.stringify(r,null,1));
await b.close();
