import { chromium } from 'playwright';
const url = process.argv[2], width = Number(process.argv[3] || 1440);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args:['--no-sandbox','--disable-dev-shm-usage'] });
const ctx = await b.newContext({ viewport: { width, height: 1000 } });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await p.waitForTimeout(600);
const out = await p.evaluate(() => {
  const h1 = document.querySelector('h1'); const root = (h1 && h1.closest('main')) || (h1 && h1.parentElement.parentElement) || document.body;
  const res = [];
  const walk = (el, d) => {
    if (el.closest('footer')) return;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    let own=''; for (const n of el.childNodes) if (n.nodeType===3) own += n.nodeValue;
    res.push({ d, tag: el.tagName.toLowerCase(), cls:(typeof el.className==='string'?el.className:'').slice(0,90),
      text: own.replace(/\s+/g,' ').trim().slice(0,40),
      box: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`,
      f: `${cs.fontFamily.split(',')[0]} ${cs.fontSize}/${cs.lineHeight} w${cs.fontWeight} ${cs.fontStyle} ls${cs.letterSpacing} ${cs.textTransform}`,
      c: cs.color, bg: cs.backgroundColor,
      m: `m:${cs.marginTop} ${cs.marginRight} ${cs.marginBottom} ${cs.marginLeft} p:${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      b: cs.borderTopWidth==='0px'&&cs.borderBottomWidth==='0px' ? '' : `bd:${cs.borderTopWidth}/${cs.borderBottomWidth} ${cs.borderTopColor} ${cs.borderBottomColor}`,
      extra: `mw:${cs.maxWidth} disp:${cs.display} ta:${cs.textAlign}` });
    for (const c of el.children) walk(c, d+1);
  };
  walk(root, 0);
  return { res, h: document.documentElement.scrollHeight, imgs: [...document.images].map(i=>i.currentSrc.split('/').pop()) };
});
for (const n of out.res) console.log(`${'  '.repeat(n.d)}${n.tag}.${n.cls}\n${'  '.repeat(n.d)}   [${n.box}] "${n.text}"\n${'  '.repeat(n.d)}   ${n.f} | ${n.c} | bg ${n.bg}\n${'  '.repeat(n.d)}   ${n.m} ${n.b} ${n.extra}`);
console.log('docH', out.h, 'imgs', out.imgs.length, out.imgs.join(','));
await b.close();
