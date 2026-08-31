import { chromium } from 'playwright';
const [rp, tp, w, sel] = [process.argv[2], process.argv[3], Number(process.argv[4]||1440), process.argv[5]];
const REACT = process.env.REACT_BASE || 'http://127.0.0.1:4325';
const THEME = 'http://127.0.0.1:4310';
const grab = (root) => {
  const out = [];
  const walk = (el, d) => {
    if (d > 3) return;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const t = (el.innerText||'').replace(/\s+/g,' ').trim().slice(0,30);
    out.push({d, tag: el.tagName.toLowerCase(), cls:(typeof el.className==='string'?el.className:'').slice(0,30),
      h: Math.round(r.height*10)/10, w: Math.round(r.width),
      pt: parseFloat(cs.paddingTop), pb: parseFloat(cs.paddingBottom), mt: parseFloat(cs.marginTop), mb: parseFloat(cs.marginBottom),
      lh: cs.lineHeight, fs: cs.fontSize, t});
    for (const c of el.children) walk(c, d+1);
  };
  const base = document.querySelector(root);
  if (!base) return {err:'no '+root};
  for (const c of base.children) walk(c, 0);
  return { h: base.getBoundingClientRect().height, out };
};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const res = {};
const sels = sel.split(',');
for (const [i,[name, url]] of [['react', REACT+rp], ['theme', THEME+tp]].entries()) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  res[name] = await p.evaluate(grab, sels[i]);
  await p.close();
}
await b.close();
const fmt = r => `${'  '.repeat(r.d)}${r.tag}.${r.cls} h=${r.h} pt=${r.pt} pb=${r.pb} mt=${r.mt} mb=${r.mb} lh=${r.lh} fs=${r.fs} |${r.t}`;
const A = res.react.out||[], B = res.theme.out||[];
console.log('root h: react', res.react.h, 'theme', res.theme.h, 'delta', (res.theme.h-res.react.h).toFixed(1));
for (let i=0;i<Math.max(A.length,B.length);i++) {
  console.log('R ' + (A[i]?fmt(A[i]):'—'));
  console.log('T ' + (B[i]?fmt(B[i]):'—'));
}
