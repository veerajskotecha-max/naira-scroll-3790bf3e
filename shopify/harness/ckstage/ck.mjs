import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const logo = 'data:image/png;base64,' + readFileSync(new URL('./logo.txt', import.meta.url), 'utf8').trim();
const logoBrand = 'data:image/png;base64,' + readFileSync(new URL('./logo-brand.txt', import.meta.url), 'utf8').trim();

// Shopify's stock checkout, as it renders today
const NOW = {
  ground:'#FFFFFF', summary:'#F5F5F5', text:'#000000', muted:'#6A6A6A',
  link:'#005BD1', border:'#DEDEDE', field:'#FFFFFF', radius:'8px',
  head:"-apple-system, 'Segoe UI', Roboto, sans-serif", body:"-apple-system, 'Segoe UI', Roboto, sans-serif",
  headWeight:700, brandMark:'text', btn:'#1A1614', btnText:'#FFFFFF', caseT:'none', track:'0',
};
// The same page with Naira's brand book applied
const AFTER = {
  ground:'#FFF8F5', summary:'#E8EEEC', text:'#1A1614', muted:'#6E645E',
  link:'#4F7268', border:'#C7D3CF', field:'#FFFFFF', radius:'0px',
  head:"'Cormorant', Georgia, serif", body:"'Jost', -apple-system, sans-serif",
  headWeight:400, brandMark:'logoBrand', btn:'#99B4AF', btnText:'#1A1614',
  caseT:'uppercase', track:'.1em', mark:'#FFBDA8',
};

const panel = (t, label) => `
<section class="phone">
  <div class="tag">${label}</div>
  <div class="screen" style="background:${t.ground};color:${t.text};font-family:${t.body}">
    <header class="hd">${t.brandMark === 'text'
      ? `<span style="font:700 26px ${t.head}">Naira</span>`
      : `<img class="logo" src="${t.brandMark === 'logoBrand' ? logoBrand : logo}" alt="Naira">`}</header>
    <div class="sum" style="background:${t.summary};border-color:${t.border}">
      <span style="color:${t.link};${t.link==='#1A1614'?'text-decoration:underline;text-underline-offset:3px;':''}">Order summary <b>&#9662;</b></span>
      <strong style="font-family:${t.body}">&#8377;1,999.00</strong>
    </div>
    ${t.mark ? `<div style="height:2px;background:${t.mark}"></div>` : ''}
    <div class="body">
      <div class="rowhead">
        <h2 style="font:${t.headWeight} 25px ${t.head}">Contact</h2>
        <a style="color:${t.link};text-decoration:underline;text-underline-offset:3px">Sign in</a>
      </div>
      <div class="f" style="border-color:${t.border};border-radius:${t.radius};background:${t.field}">
        <span style="color:${t.muted}">Email</span><i class="ic" style="border-color:${t.muted};color:${t.muted}">?</i>
      </div>
      <label class="cb"><i style="border-color:${t.border};border-radius:${t.radius==='0px'?'0':'4px'}"></i>
        <span>Email me with news and offers</span></label>
      <h2 style="font:${t.headWeight} 25px ${t.head};margin:26px 0 12px">Delivery</h2>
      <div class="f sel" style="border-color:${t.border};border-radius:${t.radius};background:${t.field}">
        <span><small style="color:${t.muted}">Country/Region</small><br>India</span><b style="color:${t.muted}">&#9662;</b>
      </div>
      ${['First name','Last name'].map(p => `<div class="f" style="border-color:${t.border};border-radius:${t.radius};background:${t.field}"><span style="color:${t.muted}">${p}</span></div>`).join('')}
      <div class="f" style="border-color:${t.border};border-radius:${t.radius};background:${t.field}">
        <span style="color:${t.muted}">Address</span><b style="color:${t.muted}">&#9906;</b></div>
      <div class="f" style="border-color:${t.border};border-radius:${t.radius};background:${t.field}"><span style="color:${t.muted}">Apartment, suite, etc. (optional)</span></div>
      <div class="f" style="border-color:${t.border};border-radius:${t.radius};background:${t.field}"><span style="color:${t.muted}">City</span></div>
      <button class="pay" style="background:${t.btn};color:${t.btnText};border-radius:${t.radius};
        text-transform:${t.caseT};letter-spacing:${t.track};font-family:${t.body}">Pay now</button>
    </div>
  </div>
</section>`;

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant:wght@400;600&family=Jost:wght@300;400;500&display=swap">
<style>
 body{margin:0;background:#33312f;font-family:system-ui;display:flex;gap:26px;padding:26px;align-items:flex-start}
 .phone{width:390px}
 .tag{color:#fff;font:600 13px system-ui;letter-spacing:.08em;text-transform:uppercase;padding:0 0 10px 2px}
 .screen{width:390px;border:1px solid #000}
 .hd{padding:22px 20px 18px}
 .logo{width:132px;display:block}
 .sum{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;
   border-top:1px solid;border-bottom:1px solid;font-size:17px}
 .body{padding:22px 20px 26px}
 .rowhead{display:flex;justify-content:space-between;align-items:baseline}
 h2{margin:0 0 12px}
 .f{display:flex;justify-content:space-between;align-items:center;border:1px solid;
    padding:15px 14px;margin:10px 0;font-size:15px;min-height:22px}
 .sel{padding:9px 14px}.sel small{font-size:11px}
 .ic{width:19px;height:19px;border:1px solid;border-radius:50%;display:grid;place-items:center;font-size:11px;font-style:normal}
 .cb{display:flex;gap:11px;align-items:center;font-size:15px;margin:14px 0 0}
 .cb i{width:19px;height:19px;border:1px solid;display:block;flex:none}
 .pay{width:100%;border:0;padding:17px;margin-top:24px;font-size:14px;font-weight:500;cursor:pointer}
</style>` + panel(NOW, 'now — Shopify stock') + panel(AFTER, 'sage + peach — the brand colours');

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 880, height: 1000 }, deviceScaleFactor: 2 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2500);
const got = await page.evaluate(() => ({
  cormorant: document.fonts.check("16px Cormorant"),
  jost: document.fonts.check("16px Jost"),
}));
console.log('fonts loaded:', JSON.stringify(got));
writeFileSync(process.argv[2], await page.screenshot({ fullPage: true }));
await b.close();
