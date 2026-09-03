import { chromium } from 'playwright';
/* Every visible text run in the portal, measured against what is actually
   painted behind it. Flags anything under the WCAG AA line for its size. */
const W = Number(process.env.W || 390);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: W, height: 900 } });
const now = Math.floor(Date.now()/1000);
const jwt = p => [Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'), Buffer.from(JSON.stringify(p)).toString('base64url'),'sig'].join('.');
const user = { id:'00000000-0000-4000-8000-000000000001', aud:'authenticated', role:'authenticated', email:'member@example.com', app_metadata:{}, user_metadata:{full_name:'Ananya Rao'}, identities:[], created_at:'2026-01-04T10:00:00Z' };
const session = { access_token: jwt({sub:user.id,role:'authenticated',exp:now+3600,aud:'authenticated'}), refresh_token:'m', token_type:'bearer', expires_in:3600, expires_at:now+3600, user };
const orders = [{ id:'o1', created_at:'2026-08-28T09:12:00Z', status:'fulfilled', total:18400, currency:'INR', item_count:1, checkout_url:'https://example.com/c', items:[{name:'Molten Bloom Hoops',quantity:1,size:null,image:null,price:'₹2,949'}] }];
if (!process.env.SIGNEDOUT) {
  await ctx.addInitScript(([s,r]) => { try { localStorage.setItem(`sb-${r}-auth-token`, JSON.stringify(s)); } catch(e){} }, [session,'xlsejigpjlqfvzfhhntf']);
}
await ctx.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
await ctx.route('**/*.supabase.co/**', r => { const u=r.request().url(); const j=v=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(v)});
  if (u.includes('/auth/v1/user')) return j(user); if (u.includes('/auth/v1/token')) return j(session);
  if (u.includes('member_orders')) return j(orders); if (u.includes('profiles')) return j([{id:user.id,full_name:'Ananya Rao',phone:null,birthday:null,city:'Mumbai'}]); return j([]); });
const px = Buffer.from('R0lGODlhAQABAPAAAMmaTP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==','base64');
await ctx.route('**/cdn.shopify.com/**', r => r.fulfill({ status:200, contentType:'image/gif', body:px }));
const page = await ctx.newPage();
await page.goto(process.env.PATHNAME ? 'http://127.0.0.1:4177' + process.env.PATHNAME : 'http://127.0.0.1:4177/innercircle', { waitUntil:'networkidle', timeout:60000 });
await page.waitForTimeout(1200);

const rows = await page.evaluate(() => {
  const parse = (c) => { const m = c.match(/[\d.]+/g); return m ? m.slice(0,4).map(Number) : null; };
  const lum = ([r,g,b]) => { const f=v=>{v/=255; return v<=.03928? v/12.92 : ((v+.055)/1.055)**2.4;}; return .2126*f(r)+.7152*f(g)+.0722*f(b); };
  const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)]; return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
  const behind = (el) => {           // walk up compositing every translucent layer
    let acc = null;
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (!c) continue;
      const a = c.length === 4 ? c[3] : 1;
      if (a === 0) continue;
      const rgb = c.slice(0,3);
      acc = acc === null ? (a === 1 ? rgb : null) : acc;
      if (a === 1) return acc ?? rgb;
    }
    return [255,255,255];
  };
  const out = [];
  const main = document.querySelector('main') || document.body;
  for (const el of main.querySelectorAll('*')) {
    if (el.closest('footer') || el.closest('header')) continue;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(' ');
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const fg = parse(cs.color); if (!fg) continue;
    const alpha = fg.length === 4 ? fg[3] : 1;
    const bg = behind(el);
    const eff = fg.slice(0,3).map((v,i) => v*alpha + bg[i]*(1-alpha));
    const size = parseFloat(cs.fontSize), weight = Number(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const got = ratio(eff, bg);
    if (got < need) out.push({ txt: own.slice(0,44), size, weight, got: +got.toFixed(2), need, color: cs.color });
  }
  return out;
});
console.log(rows.length ? rows.map(r => `${r.got}:1 (needs ${r.need})  ${r.size}px/${r.weight}  ${JSON.stringify(r.txt)}`).join('\n') : 'every text run meets AA');
await b.close();
