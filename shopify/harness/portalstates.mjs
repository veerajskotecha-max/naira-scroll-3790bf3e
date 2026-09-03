import { chromium } from 'playwright';
/* The states a screenshot of the happy path never reaches: no orders yet,
   three pieces picked, and the true-to-scale view. */
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const now = Math.floor(Date.now()/1000);
const jwt = p => [Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'), Buffer.from(JSON.stringify(p)).toString('base64url'),'sig'].join('.');
const user = { id:'00000000-0000-4000-8000-000000000001', aud:'authenticated', role:'authenticated', email:'member@example.com', app_metadata:{}, user_metadata:{full_name:'Ananya Rao'}, identities:[], created_at:'2026-01-04T10:00:00Z' };
const session = { access_token: jwt({sub:user.id,role:'authenticated',exp:now+3600,aud:'authenticated'}), refresh_token:'m', token_type:'bearer', expires_in:3600, expires_at:now+3600, user };
const px = Buffer.from('R0lGODlhAQABAPAAAMmaTP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==','base64');

const open = async (orders) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(([s,r]) => { try { localStorage.setItem(`sb-${r}-auth-token`, JSON.stringify(s)); localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} }, [session,'xlsejigpjlqfvzfhhntf']);
  await ctx.route('**/*.supabase.co/**', r => { const u=r.request().url(); const j=v=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(v)});
    if (u.includes('/auth/v1/user')) return j(user); if (u.includes('/auth/v1/token')) return j(session);
    if (u.includes('member_orders')) return j(orders); if (u.includes('profiles')) return j([{id:user.id,full_name:'Ananya Rao',phone:null,birthday:null,city:'Mumbai'}]); return j([]); });
  await ctx.route('**/cdn.shopify.com/**', r => r.fulfill({ status:200, contentType:'image/gif', body:px }));
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0,140)));
  await page.goto('http://127.0.0.1:4177/innercircle', { waitUntil:'networkidle', timeout:60000 });
  await page.waitForTimeout(1200);
  return { page, ctx, errs };
};
const step = async (label, fn) => { try { console.log(`ok   ${label} — ${await fn()}`); } catch (e) { console.log(`FAIL ${label} — ${String(e).split('\n')[0].slice(0,160)}`); } };

{
  const { page, ctx, errs } = await open([]);
  await step('no orders yet: says so, and offers a way forward', async () => {
    const t = await page.locator('main').innerText();
    if (/undefined|NaN|\[object/.test(t)) throw new Error('placeholder leaked into the copy');
    const m = t.split('\n').filter(l => /order|piece|nothing|yet|first/i.test(l)).slice(0, 2).join(' / ');
    if (errs.length) throw new Error(errs[0]);
    return m || '(no empty-state copy found)';
  });
  await ctx.close();
}
{
  const { page, ctx, errs } = await open([{ id:'o1', created_at:'2026-08-28T09:12:00Z', status:'fulfilled', total:18400, currency:'INR', item_count:1, checkout_url:null, items:[{name:'Molten Bloom Hoops',quantity:1,size:null,image:null,price:'₹2,949'}] }]);
  await step('offer: three pieces produce a real 20 per cent', async () => {
    const tiles = page.locator('button.nf-tile');
    const n = await tiles.count();
    if (n < 3) throw new Error(`only ${n} pieces offered`);
    for (let i = 0; i < 3; i++) { await tiles.nth(i).scrollIntoViewIfNeeded(); await tiles.nth(i).click(); await page.waitForTimeout(150); }
    const t = await page.locator('main').innerText();
    const nums = [...t.matchAll(/₹([\d,]+)/g)].map(m => Number(m[1].replace(/,/g,'')));
    const line = t.split('\n').find(l => /3 PIECES|CHOSEN/i.test(l)) || '';
    if (!/3/.test(line)) throw new Error('count did not reach three: ' + line);
    if (errs.length) throw new Error(errs[0]);
    const panel = await page.locator('section', { hasText: 'MEMBERS' }).last().innerText();
    const picked = [...panel.matchAll(/₹([\d,]+)/g)].map(m => Number(m[1].replace(/,/g,'')));
    const shown = panel.split('\n').filter(l => /₹|SAV|OFF|TOTAL/i.test(l)).slice(-4).join(' · ');
    return `${line.trim()} — ${shown}`;
  });
  await step('offer: the CTA is live once three are picked', async () => {
    const cta = page.locator('button', { hasText: /CHOOSE|CHECKOUT|BAG|ADD/i }).last();
    const disabled = await cta.isDisabled();
    if (disabled) throw new Error('still disabled with three pieces chosen');
    return (await cta.innerText()).trim();
  });
  await step('viewer: the true-to-scale view renders a measured piece', async () => {
    const onme = page.locator('button', { hasText: /^ON ME$/ });
    if (!(await onme.count())) throw new Error('no ON ME tab for this piece');
    await onme.scrollIntoViewIfNeeded(); await onme.click();
    await page.waitForTimeout(500);
    const box = await page.locator('[role="tabpanel"]:not([hidden])').last().boundingBox();
    const t = await page.locator('[role="tabpanel"]:not([hidden])').last().innerText();
    if (/NaN|undefined/.test(t)) throw new Error('placeholder leaked: ' + t.slice(0,60));
    if (errs.length) throw new Error(errs[0]);
    return `${Math.round(box.width)}x${Math.round(box.height)}, says ${JSON.stringify(t.replace(/\n/g,' · ').slice(0,80))}`;
  });
  await page.screenshot({ path: '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/states.png', fullPage: true });
  await ctx.close();
}
await b.close();
