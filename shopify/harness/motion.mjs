// Compare running animations/transitions on both sides at a given width.
// Reports every element with a CSS animation, and the animation name/duration/timing.
import { chromium } from 'playwright';
const [w, base, path] = process.argv.slice(2);
const W = Number(w) || 390;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
// NOT reducedMotion:reduce here -- we want to see the motion the user sees.
const c = await b.newContext({ viewport: { width: W, height: 900 } });
await c.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
const p = await c.newPage();
await p.route('**/*', async r => { const u = r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res = await fetch(u,{redirect:'follow'}); const body = Buffer.from(await res.arrayBuffer());
    const h = Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
await p.goto(base + path, { waitUntil: 'networkidle', timeout: 90000 }).catch(()=>{});
await p.evaluate(async () => { const s = innerHeight*0.8;
  for (let y=0; y<document.documentElement.scrollHeight; y+=s) { scrollTo(0,y); await new Promise(r=>setTimeout(r,70)); }
  scrollTo(0,0); await new Promise(r=>setTimeout(r,400)); });
const res = await p.evaluate(() => {
  const anims = [], trans = new Map();
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.animationName && cs.animationName !== 'none') {
      for (const n of cs.animationName.split(', ')) anims.push(n + ' ' + cs.animationDuration.split(', ')[0] + ' ' + cs.animationTimingFunction.split(', ')[0] + ' ' + cs.animationIterationCount.split(', ')[0]);
    }
    if (cs.transitionProperty && cs.transitionProperty !== 'none' && cs.transitionProperty !== 'all') {
      const k = cs.transitionProperty + ' | ' + cs.transitionDuration + ' | ' + cs.transitionTimingFunction;
      trans.set(k, (trans.get(k)||0)+1);
    }
  }
  const count = a => { const m = new Map(); for (const x of a) m.set(x,(m.get(x)||0)+1); return [...m].sort(); };
  return { animations: count(anims), transitions: [...trans].sort() };
});
console.log(JSON.stringify(res, null, 1));
await b.close();
