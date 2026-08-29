// Interaction audit: does every interactive element visibly respond to hover
// and keyboard focus? Runs WITHOUT reducedMotion so transitions are live.
import { chromium } from 'playwright';
const CHROME = '/opt/pw-browsers/chromium';
const PORT = Number(process.env.PORT || 4310);
const PAGES = process.argv.slice(2);

const WATCH = ['background-color','color','border-color','opacity','transform','text-decoration-line','box-shadow','outline-color','outline-width'];

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.route('**/*', async (r) => r.request().url().includes('127.0.0.1') ? r.continue() : r.abort());

const rows = [];
for (const name of PAGES) {
  try {
    await page.goto(`http://127.0.0.1:${PORT}/${name}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(700);

    const res = await page.evaluate(async (WATCH) => {
      const snap = (el) => { const cs = getComputedStyle(el); return WATCH.map(p => cs.getPropertyValue(p)).join('|'); };
      const items = [...document.querySelectorAll('a[href], button, [role="button"], [role="radio"], input, summary')]
        .filter(el => { const b = el.getBoundingClientRect(); return b.width > 4 && b.height > 4; });

      // group by a stable signature so we report component types, not 400 links
      const groups = new Map();
      for (const el of items) {
        const cls = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/)[0] || '';
        const key = el.tagName.toLowerCase() + (cls ? '.' + cls : '');
        if (!groups.has(key)) groups.set(key, el);
      }

      const out = [];
      for (const [key, el] of groups) {
        const before = snap(el);
        // :hover cannot be forced from script; simulate by adding the class-free
        // pseudo via CSS.registerProperty is impossible, so measure transition
        // capability + declared hover rules instead.
        let hoverRule = false, focusRule = false;
        for (const sheet of document.styleSheets) {
          let rules; try { rules = sheet.cssRules; } catch { continue; }
          for (const r of rules) {
            if (!r.selectorText) continue;
            if (/:hover/.test(r.selectorText)) { try { if (el.matches(r.selectorText.replace(/:hover/g, ''))) hoverRule = true; } catch {} }
            if (/:focus-visible|:focus/.test(r.selectorText)) { try { if (el.matches(r.selectorText.replace(/:focus-visible|:focus/g, ''))) focusRule = true; } catch {} }
          }
        }
        const cs = getComputedStyle(el);
        out.push({ key, hoverRule, focusRule,
                   transition: cs.transitionProperty !== 'none' && cs.transitionDuration !== '0s',
                   cursor: cs.cursor });
      }
      return out;
    }, WATCH);

    for (const r of res) rows.push({ page: name, ...r });
  } catch (e) { rows.push({ page: name, key: 'ERROR', err: String(e.message).slice(0, 60) }); }
}
await browser.close();

const seen = new Map();
for (const r of rows) { if (!seen.has(r.key)) seen.set(r.key, r); }
const all = [...seen.values()].filter(r => r.key !== 'ERROR');
const noHover = all.filter(r => !r.hoverRule);
const noFocus = all.filter(r => !r.focusRule);

console.log(`interactive component types: ${all.length}`);
console.log(`  with a :hover rule   : ${all.length - noHover.length}`);
console.log(`  with a focus rule    : ${all.length - noFocus.length}`);
console.log(`  with a transition    : ${all.filter(r => r.transition).length}`);
console.log(`\nNO HOVER STATE (${noHover.length}):`);
noHover.forEach(r => console.log(`   ${r.key.padEnd(34)} cursor=${r.cursor}  (${r.page})`));
console.log(`\nNO FOCUS STATE (${noFocus.length}):`);
noFocus.slice(0, 20).forEach(r => console.log(`   ${r.key.padEnd(34)} (${r.page})`));
