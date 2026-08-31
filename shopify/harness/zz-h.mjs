import { chromium } from 'playwright';
const R='http://127.0.0.1:4325', T='http://127.0.0.1:4310';
const pairs=[['/faqs','/page.faqs'],['/privacy','/page.privacy-policy'],['/terms','/page.terms'],['/exchange-return-policy','/page.exchange-return']];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
for (const w of [1440, 390]) {
  for (const [rp, tp] of pairs) {
    const hs = [];
    for (const u of [R+rp, T+tp]) {
      const p = await b.newPage({ viewport:{width:w,height:900} });
      await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(300);
      hs.push(await p.evaluate(()=>document.documentElement.scrollHeight));
      await p.close();
    }
    console.log(`${w} ${rp.padEnd(26)} react ${hs[0]}  theme ${hs[1]}  delta ${hs[1]-hs[0]}`);
  }
}
await b.close();
