import { chromium } from 'playwright';
const width = Number(process.argv[3] || 1440);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
await ctx.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
await page.goto(process.argv[2], { waitUntil: 'networkidle', timeout: 90000 });
await page.evaluate(async () => { const s=innerHeight*0.8; for(let y=0;y<document.documentElement.scrollHeight;y+=s){scrollTo(0,y);await new Promise(r=>setTimeout(r,60));} scrollTo(0,0); await new Promise(r=>setTimeout(r,400)); });
const out = await page.evaluate(() => {
  const root = document.querySelector('#customer-reviews');
  if (!root) return 'NO SECTION';
  const P=['fontFamily','fontSize','fontWeight','letterSpacing','lineHeight','color','backgroundColor','textTransform','display','flexDirection','gap','padding','margin','marginTop','marginBottom','width','height','border','borderColor','borderWidth','textAlign','gridTemplateColumns','maxWidth','alignItems','justifyContent','overflow','objectFit','opacity','borderRadius','flex','order','marginLeft','paddingTop','paddingBottom','paddingLeft','paddingRight','columnGap','rowGap'];
  const lines=[];
  const walk=(el,d)=>{
    const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
    let own=''; for(const n of el.childNodes) if(n.nodeType===3) own+=n.nodeValue;
    own=own.replace(/\s+/g,' ').trim();
    const st=P.map(p=>p+':'+cs[p]).join('; ');
    lines.push('  '.repeat(d)+'<'+el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?' class="'+el.className+'"':'')+(el.src?' src='+el.src.split('/').pop():'')+'> ['+Math.round(r.width)+'x'+Math.round(r.height)+'] '+(own?JSON.stringify(own.slice(0,90)):'') );
    lines.push('  '.repeat(d)+'   {'+st+'}');
    if(d<9) for(const c of el.children) walk(c,d+1);
  };
  walk(root,0);
  return lines.join('\n');
});
console.log(out);
await browser.close();
