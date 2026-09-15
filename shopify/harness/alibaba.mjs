import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--disable-blink-features=AutomationControlled'] });
const ctx = await b.newContext({
  userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  viewport:{width:1440,height:900}, locale:'en-US', timezoneId:'Asia/Kolkata',
  extraHTTPHeaders:{'accept-language':'en-US,en;q=0.9'},
});
await ctx.addInitScript(()=>{ Object.defineProperty(navigator,'webdriver',{get:()=>undefined}); });
const page = await ctx.newPage();
const url = process.argv[2];
try {
  const r = await page.goto(url, { waitUntil:'domcontentloaded', timeout:40000 });
  await page.waitForTimeout(4000);
  const info = await page.evaluate(()=>({
    title: document.title.slice(0,120),
    blocked: /captcha|verify|punish|access denied/i.test(document.body.innerText.slice(0,3000)),
    text: document.body.innerText.replace(/\s+/g,' ').slice(0,400),
  }));
  console.log('status', r && r.status());
  console.log(JSON.stringify(info,null,1));
} catch(e){ console.log('nav failed:', e.message.slice(0,140)); }
await b.close();
