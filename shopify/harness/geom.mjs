import { chromium } from 'playwright';
const W = Number(process.env.W || 1024);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: W, height: 900 } });
const now = Math.floor(Date.now()/1000);
const jwt = p => [Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'), Buffer.from(JSON.stringify(p)).toString('base64url'),'sig'].join('.');
const user = { id:'00000000-0000-4000-8000-000000000001', aud:'authenticated', role:'authenticated', email:'member@example.com', app_metadata:{}, user_metadata:{full_name:'Ananya Rao'}, identities:[], created_at:'2026-01-04T10:00:00Z' };
const session = { access_token: jwt({sub:user.id,role:'authenticated',exp:now+3600,aud:'authenticated'}), refresh_token:'m', token_type:'bearer', expires_in:3600, expires_at:now+3600, user };
const orders = [{ id:'o1', created_at:'2026-08-28T09:12:00Z', status:'fulfilled', total:18400, currency:'INR', item_count:2, checkout_url:null, items:[{name:'Molten Bloom Hoops',quantity:1,size:null,image:null,price:'₹2,949'}] }];
await ctx.addInitScript(([s,r]) => { try { localStorage.setItem(`sb-${r}-auth-token`, JSON.stringify(s)); localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} }, [session,'xlsejigpjlqfvzfhhntf']);
await ctx.route('**/*.supabase.co/**', r => { const u=r.request().url(); const j=b=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(b)});
  if (u.includes('/auth/v1/user')) return j(user); if (u.includes('/auth/v1/token')) return j(session);
  if (u.includes('member_orders')) return j(orders); if (u.includes('profiles')) return j([{id:user.id,full_name:'Ananya Rao',phone:null,birthday:null,city:'Mumbai'}]); return j([]); });
/* A 1x1 gold pixel for every product photo, so geometry is measured against
   real images rather than broken-image boxes. */
const px = Buffer.from('R0lGODlhAQABAPAAAMmaTP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==','base64');
await ctx.route('**/cdn.shopify.com/**', r => r.fulfill({ status:200, contentType:'image/gif', body:px }));
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:4177/innercircle', { waitUntil:'networkidle', timeout:60000 });
await page.waitForTimeout(1500);
const geo = await page.evaluate(() => {
  const pick = (sel) => [...document.querySelectorAll(sel)].map(e => { const r = e.getBoundingClientRect(); return { sel, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left) }; });
  const main = document.querySelector('main');
  const panels = [...main.querySelectorAll('section, [role="tabpanel"]')].map(e => { const r = e.getBoundingClientRect(); const lbl = (e.querySelector('h2,p')?.textContent || '').trim().slice(0,32); return { tag: e.tagName, lbl, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left) }; });
  return { panels, imgs: pick('[role="tabpanel"] img').slice(0,4), doc: { w: document.documentElement.clientWidth, h: document.documentElement.scrollHeight } };
});
console.log(JSON.stringify(geo, null, 1));
await page.screenshot({ path: process.env.SHOT || '/tmp/geom.png', fullPage: true });
await b.close();
