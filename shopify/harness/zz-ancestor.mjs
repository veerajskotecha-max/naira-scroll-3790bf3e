import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await p.goto(process.argv[2], { waitUntil: 'networkidle' });
console.log(await p.evaluate(() => {
  let el = document.querySelector('.nf-reviews__head');
  const out = [];
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    out.push(`${el.tagName}.${(el.className||'').toString().slice(0,40)} [${Math.round(r.width)}] display:${cs.display} float:${cs.float} pos:${cs.position} w:${cs.width} maxW:${cs.maxWidth} gtc:${cs.gridTemplateColumns} contain:${cs.contain} writing:${cs.writingMode}`);
    el = el.parentElement;
  }
  return out.join('\n');
}));
await b.close();
