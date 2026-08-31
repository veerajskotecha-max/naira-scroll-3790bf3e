import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const c = await b.newContext({ viewport: { width: Number(process.env.W||1440), height: 950 } });
await c.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
const p = await c.newPage();
await p.route('**/*', async r => { const u=r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try { const res=await fetch(u,{redirect:'follow'}); const body=Buffer.from(await res.arrayBuffer());
    const h=Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({status:res.status,headers:h,body}); } catch { await r.abort(); } });
const [arg] = process.argv.slice(2);
const [route, sel] = arg.split('##');
const base = route.startsWith('T:') ? 'http://127.0.0.1:4310' : 'http://127.0.0.1:4325';
await p.goto(base + route.replace(/^T:/,''), { waitUntil: 'networkidle', timeout: 45000 });
await p.waitForTimeout(1000);
console.log(await p.evaluate((sel) => {
  const el = document.querySelector(sel); if (!el) return 'MISSING';
  const out = [];
  const r0 = el.getBoundingClientRect();
  out.push(`PARENT ${sel} h=${r0.height} ${getComputedStyle(el).display} lh=${getComputedStyle(el).lineHeight} fs=${getComputedStyle(el).fontSize}`);
  for (const n of el.childNodes) {
    if (n.nodeType === 3) { out.push(`  TEXT ${JSON.stringify(n.nodeValue.slice(0,30))}`); continue; }
    if (n.nodeType !== 1) continue;
    const r = n.getBoundingClientRect(); const cs = getComputedStyle(n);
    out.push(`  ${n.tagName}.${(typeof n.className==='string'?n.className:'').slice(0,26)} y=${Math.round(r.y)} h=${Math.round(r.height)} disp=${cs.display} pos=${cs.position} va=${cs.verticalAlign}`);
  }
  return out.join('\n');
}, sel));
await b.close();
