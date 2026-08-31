import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const p = await (await b.newContext({ viewport:{width:1440,height:950} })).newPage();
await p.goto('http://127.0.0.1:4310/page.gifting', { waitUntil:'networkidle' });
await p.waitForTimeout(600);
console.log(await p.evaluate(() => {
  const el = document.querySelector('.nf-jc__front');
  let total=0, matchSel=[];
  for (const ss of document.styleSheets) {
    let rules; try { rules = ss.cssRules; } catch { matchSel.push('BLOCKED '+ss.href); continue; }
    const walk = (rs) => { for (const r of rs) {
      if (r.cssRules) { walk(r.cssRules); continue; }
      if (!r.selectorText) continue;
      total++;
      if (r.selectorText.includes('nf-jc__front')) matchSel.push((ss.href||'inline').split('/').pop()+' :: '+r.selectorText+' { '+r.style.cssText+' }');
    } };
    walk(rules);
  }
  return 'computed='+getComputedStyle(el).display+' cls='+el.className+' rules='+total+'\n'+matchSel.join('\n');
}));
await b.close();
