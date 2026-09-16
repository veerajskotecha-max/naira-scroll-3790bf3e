import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const b64 = f => 'data:image/webp;base64,' + readFileSync(f).toString('base64');
const blooms = b64('shopify/brand/nf-flora-blooms.webp');
const leaves = b64('shopify/brand/nf-flora-leaves.webp');
const band = (w, pos, size, op) => `
<section class="band" style="--pos:${pos};--size:${size};--op:${op}">
  <div class="inner">
    <div><h3>Waterproof</h3><p>Wear it in the shower, the sea, the monsoon. The plating does not lift.</p></div>
    <div><h3>Non-tarnish</h3><p>18k gold over surgical stainless steel, so it does not green the skin.</p></div>
    <div><h3>Made to last</h3><p>Not plated brass. The difference shows in year two, not week one.</p></div>
  </div>
</section>`;
const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500&family=Jost:wght@300;400&display=swap">
<style>
 body{margin:0;background:#8a8078;font:300 15px Jost,sans-serif;color:#1A1614}
 .wrap{padding:14px}
 .lab{font:600 11px ui-monospace;letter-spacing:.14em;text-transform:uppercase;color:#fff;padding:10px 2px 6px}
 .band{position:relative;isolation:isolate;background:#FFF8F5;padding:54px 28px;overflow:hidden}
 .band::before{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;
   background-image:url('${blooms}'),url('${leaves}');
   background-repeat:no-repeat,no-repeat;
   background-position:var(--pos);
   background-size:var(--size);
   opacity:var(--op);mix-blend-mode:darken}
 .inner{display:flex;gap:40px;max-width:1000px;margin:0 auto}
 h3{font:500 24px Cormorant,serif;margin:0 0 6px}
 p{margin:0;font-size:14px;line-height:1.65;color:#5d534d;max-width:30ch}
 @media(max-width:749px){.inner{flex-direction:column;gap:18px}.band{padding:34px 20px}}
</style>
<div class="wrap">
 <p class="lab">desktop — right -60px top -40px / left -70px bottom -30px · 320+300px · .7</p>
 ${band(1440,'right -60px top -40px, left -70px bottom -30px','320px auto, 300px auto','.8')}
 <p class="lab">same, opacity .45 for comparison</p>
 ${band(1440,'right -60px top -40px, left -70px bottom -30px','320px auto, 300px auto','.55')}
</div>`;
const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
for (const [w,name] of [[1440,'desk'],[390,'phone']]) {
  const page = await br.newPage({ viewport:{width:w,height:820}, deviceScaleFactor:2 });
  await page.setContent(name==='phone'
    ? html.replace('320px auto, 300px auto','190px auto, 176px auto')
          .replace(/right -60px top -40px, left -70px bottom -30px/g,'right -46px top -26px, left -52px bottom -20px')
    : html);
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(1600);
  writeFileSync(`${process.argv[2]}-${name}.png`, await page.screenshot({ fullPage:true }));
  await page.close();
}
console.log('ok'); await br.close();
