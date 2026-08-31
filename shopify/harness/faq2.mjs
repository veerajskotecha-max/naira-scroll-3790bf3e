import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
await p.goto('http://127.0.0.1:4310/page.faqs', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(700);
console.log(JSON.stringify(await p.evaluate(() => {
  const d = document.querySelector('details.nf-faq__item');
  const ans = d.querySelector('.nf-faq__answer');
  const cs = getComputedStyle(ans);
  return { hasOpenAttr: d.hasAttribute('open'), openProp: d.open,
    detailsH: d.getBoundingClientRect().height,
    ansH: ans.getBoundingClientRect().height,
    contentVisibility: cs.contentVisibility, display: cs.display,
    detailsHTMLHead: d.outerHTML.slice(0, 160),
    childTags: [...d.children].map(c => c.tagName) };
}), null, 1));
await b.close();
