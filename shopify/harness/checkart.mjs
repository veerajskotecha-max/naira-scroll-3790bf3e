import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync(process.argv[2],'utf8');
const full = `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1">
<style>:root{color-scheme:light}body{margin:0;padding:0;font:14px -apple-system,sans-serif;background:#faf9f5;color:#141413}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style>
</head><body>${src}</body></html>`;
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const errs=[];
for (const [w,name] of [[1180,'desk'],[390,'phone']]) {
  const page = await b.newPage({ viewport:{width:w,height:1100}, deviceScaleFactor:2 });
  page.on('pageerror', e=>errs.push(`${name}: ${e.message}`));
  page.on('console', m=>{ if(m.type()==='error') errs.push(`${name} console: ${m.text()}`); });
  await page.setContent(full, { waitUntil:'load' });
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(2200);
  const info = await page.evaluate(()=>({
    records: document.querySelectorAll('.rec').length,
    visible: [...document.querySelectorAll('.rec')].filter(r=>!r.hidden).length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    fonts: { cormorant: document.fonts.check('16px Cormorant'), jost: document.fonts.check('16px Jost'), mono: document.fonts.check('16px "IBM Plex Mono"') },
  }));
  console.log(name, JSON.stringify(info));
  writeFileSync(`${process.argv[3]}-${name}.png`, await page.screenshot({ fullPage:false }));
  if (name==='desk') {
    await page.click('button[data-f="bad"]'); await page.waitForTimeout(400);
    const after = await page.evaluate(()=>[...document.querySelectorAll('.rec')].filter(r=>!r.hidden).length);
    console.log('  filter "needs work" ->', after, 'records');
    await page.click('button[data-f="Ring"]'); await page.waitForTimeout(400);
    console.log('  filter "Rings"      ->', await page.evaluate(()=>[...document.querySelectorAll('.rec')].filter(r=>!r.hidden).length), 'records');
    await page.click('button[data-f="all"]'); await page.waitForTimeout(300);
    writeFileSync(`${process.argv[3]}-desk-mid.png`, await page.screenshot({ fullPage:false, clip:{x:0,y:900,width:1180,height:1100} }));
  }
  await page.close();
}
console.log(errs.length ? 'ERRORS:\n'+errs.join('\n') : 'no page errors');
await b.close();
