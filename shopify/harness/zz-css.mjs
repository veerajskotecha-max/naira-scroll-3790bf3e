import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const c = await b.newContext({ viewport: { width: 390, height: 900 } });
const p = await c.newPage();
await p.goto('http://127.0.0.1:4310/product', { waitUntil: 'networkidle' });
console.log(await p.evaluate(() => {
  const stack = document.querySelector('.nf-pdp__detailstack');
  if (!stack) return 'no stack';
  return [...stack.children].map(e => {
    const cs = getComputedStyle(e);
    return e.tagName + '.' + e.className + ' mt=' + cs.marginTop + ' mb=' + cs.marginBottom + ' top=' + Math.round(e.getBoundingClientRect().top);
  }).join('\n');
}));
await b.close();
