import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
for (const w of [1440, 390]) {
  for (const [label, url] of [['react', 'http://127.0.0.1:4325/track-order'], ['theme', 'http://127.0.0.1:4310/page.track-order'],['theme-contact', 'http://127.0.0.1:4310/page.contact'],['react-contact', 'http://127.0.0.1:4325/contact-us']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
    await p.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading='eager'));
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => { const f = document.querySelector('footer, .nf-footer, [class*="footer"]'); const b = f && f.getBoundingClientRect(); return { h: b && Math.round(b.height), y: b && Math.round(b.y + scrollY), doc: document.documentElement.scrollHeight }; });
    console.log(w, label, JSON.stringify(r));
    await ctx.close();
  }
}
await b.close();
