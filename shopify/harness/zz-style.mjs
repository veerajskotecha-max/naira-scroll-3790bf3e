import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const ctx = await b.newContext({ viewport:{width:Number(process.argv[3]||1440),height:1000}, reducedMotion:'reduce' });
await ctx.addInitScript(()=>{ try{localStorage.setItem('naira-promo-popup-seen','1')}catch(e){} });
const p = await ctx.newPage();
await p.goto(process.argv[2], { waitUntil:'networkidle' });
await p.waitForTimeout(2000);
const sel = process.argv[4] || 'main, body';
const r = await p.evaluate((sel)=>{
  const out=[];
  const root = document.querySelector(sel) || document.body;
  const walk=(el,d)=>{
    const cs=getComputedStyle(el); const rc=el.getBoundingClientRect();
    let own=''; for(const n of el.childNodes) if(n.nodeType===3) own+=n.nodeValue;
    own=own.replace(/\s+/g,' ').trim();
    out.push({d, tag:el.tagName, cls:(typeof el.className==='string'?el.className:'').slice(0,90),
      txt:own.slice(0,50), w:Math.round(rc.width), h:Math.round(rc.height), x:Math.round(rc.x), y:Math.round(rc.y),
      f:cs.fontFamily.split(',')[0].replace(/["']/g,''), fs:cs.fontSize, fw:cs.fontWeight, fst:cs.fontStyle, tt:cs.textTransform,
      ls:cs.letterSpacing, lh:cs.lineHeight, c:cs.color, bg:cs.backgroundColor, ta:cs.textAlign,
      pad:cs.padding, mar:cs.margin, disp:cs.display, gap:cs.gap });
    if(d<12) for(const c of el.children) walk(c,d+1);
  };
  walk(root,0); return out;
},sel);
for(const n of r) console.log(' '.repeat(n.d)+`${n.tag}.${n.cls} [${n.w}x${n.h} @${n.x},${n.y}] ${n.disp} f=${n.f} ${n.fs}/${n.lh} w=${n.fw} ${n.fst} tt=${n.tt} ls=${n.ls} c=${n.c} bg=${n.bg} ta=${n.ta} p=${n.pad} m=${n.mar} gap=${n.gap} :: ${n.txt}`);
await b.close();
