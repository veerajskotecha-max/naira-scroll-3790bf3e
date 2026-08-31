// Find elements wider than the viewport — the cause of horizontal scroll on mobile.
import { chromium } from 'playwright';
const [w, base, path] = process.argv.slice(2);
const W = Number(w) || 390;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const c = await b.newContext({ viewport: { width: W, height: 900 } });
await c.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
const p = await c.newPage();
await p.route('**/*', async r => { const u = r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res = await fetch(u,{redirect:'follow'}); const body = Buffer.from(await res.arrayBuffer());
    const h = Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
await p.goto(base + path, { waitUntil: 'networkidle', timeout: 90000 }).catch(()=>{});
await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate((W) => {
  const out = { docWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, offenders: [] };
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.right <= W + 1 && r.left >= -1) continue;
    if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' && cs.visibility === 'hidden') continue;
    // report only the outermost offenders: skip if an ancestor already overflows
    let anc = el.parentElement, covered = false;
    while (anc && anc !== document.body) { const ar = anc.getBoundingClientRect();
      if (ar.right > W + 1 || ar.left < -1) { covered = true; break; } anc = anc.parentElement; }
    if (covered) continue;
    out.offenders.push({ tag: el.tagName.toLowerCase(), cls: (typeof el.className==='string'?el.className:'').slice(0,70),
      left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
      overflow: cs.overflowX, pos: cs.position, txt: (el.textContent||'').replace(/\s+/g,' ').trim().slice(0,40) });
  }
  return out;
}, W), null, 1));
await b.close();
