import { chromium } from 'playwright';
/* Screenshots the motion stage and reports what is actually animating, so a
   CSS change can be judged rather than assumed. Also flags the two failure
   modes that matter on a phone: horizontal overflow, and motion that ignores
   prefers-reduced-motion. */
const W = Number(process.env.W || 390);
const URL = 'file://' + process.cwd() + '/shopify/harness/stage/index.html';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const shoot = async (reduced, scrollAll) => {
  const ctx = await b.newContext({ viewport: { width: W, height: 900 },
    reducedMotion: reduced ? 'reduce' : 'no-preference', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 140)));
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  if (scrollAll) {
    await page.evaluate(async () => {
      const step = innerHeight * 0.8;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        scrollTo(0, y);
        await new Promise(r => setTimeout(r, 90));
      }
      scrollTo(0, 0);
    });
  }
  await page.waitForTimeout(1600);
  const r = await page.evaluate(() => {
    const de = document.documentElement, out = { anim: {}, overflow: [] };
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      for (const pseudo of [null, '::before', '::after']) {
        const s = pseudo ? getComputedStyle(el, pseudo) : cs;
        const n = s.animationName;
        if (n && n !== 'none') {
          const k = n + (pseudo || '');
          (out.anim[k] ||= { name: k, count: 0, dur: s.animationDuration });
          out.anim[k].count++;
        }
      }
      const bx = el.getBoundingClientRect();
      if (bx.width && (bx.right > de.clientWidth + 1 || bx.left < -1))
        out.overflow.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 44),
          l: Math.round(bx.left), r: Math.round(bx.right) });
    }
    out.anim = Object.values(out.anim);
    /* A single sample at t=1600ms misses everything: above-fold reveals have
       already finished and cleared, below-fold ones have not fired. Count the
       state classes instead - they persist. */
    out.reveal = {
      tagged: document.querySelectorAll('.nf-r').length,
      revealed: document.querySelectorAll('.nf-in').length,
      settled: document.querySelectorAll('.nf-done').length,
      motionClass: document.documentElement.classList.contains('nf-motion'),
    };
    /* A settled filter is still a containing block. Nothing may keep one. */
    out.lingeringFilter = [...document.querySelectorAll('.nf-r')]
      .filter(el => getComputedStyle(el).filter !== 'none').length;
    /* Sticky dies silently under a transformed ancestor. */
    out.stickyHazards = [...document.querySelectorAll('#shopify-section-main, .product-card, .card-gallery')]
      .filter(el => getComputedStyle(el).transform !== 'none')
      .map(el => el.tagName + '.' + (el.className || '').toString().slice(0, 30));
    out.overflow = out.overflow.slice(0, 8);
    out.scrollW = de.scrollWidth; out.clientW = de.clientWidth;
    /* A webfont that fails to load measures identically to one that loads --
       getComputedStyle returns the declared stack, not the used face. Only
       document.fonts knows the difference. */
    const h1 = document.querySelector('h1');
    out.fontLoaded = { velista: document.fonts.check('16px Velista'),
                       cormorant: document.fonts.check('16px Cormorant'),
                       h1Stack: h1 ? getComputedStyle(h1).fontFamily.slice(0, 46) : null };
    return out;
  });
  await page.screenshot({ path: `/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/stage-${W}${reduced ? '-reduced' : ''}.png`, fullPage: true });
  await ctx.close();
  return { ...r, errs: [...new Set(errs)] };
};
/* Scroll the whole page first so every below-fold reveal actually fires,
   then let them settle. Otherwise the counts only ever describe the top. */
const normal = await shoot(false, true), reduced = await shoot(true, true);
console.log(JSON.stringify({ width: W,
  scroll: `${normal.scrollW}/${normal.clientW}` + (normal.scrollW > normal.clientW ? '  HORIZONTAL OVERFLOW' : '  ok'),
  reveal: normal.reveal,
  lingeringFilter: normal.lingeringFilter,
  stickyHazards: normal.stickyHazards,
  revealUnderReducedMotion: reduced.reveal,
  animations: normal.anim,
  stillAnimatingUnderReducedMotion: reduced.anim,
  overflow: normal.overflow, errors: normal.errs, fonts: normal.fontLoaded }, null, 1));
await b.close();
