// Hover the SHOP entry on both sides and compare the mega panel.
import { chromium } from 'playwright';
const LAUNCH = { executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] };
// Headless chromium can't reach external hosts here; proxy them through Node fetch.
const proxy = (p) => p.route('**/*', async r => {
  const u = r.request().url();
  if (u.includes('127.0.0.1')) return r.continue();
  try {
    const res = await fetch(u, { redirect: 'follow' });
    const body = Buffer.from(await res.arrayBuffer());
    const h = Object.fromEntries(res.headers); delete h['content-encoding']; delete h['content-length'];
    await r.fulfill({ status: res.status, headers: h, body });
  } catch { await r.abort(); }
});
const b = await chromium.launch(LAUNCH);

const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
await proxy(p);
await p.goto('http://127.0.0.1:4310/index', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
const shop = p.locator('.nf-header__item--mega');
console.log('THEME  trigger:', await shop.count());
await shop.first().hover();
await p.waitForTimeout(600);
const panel = p.locator('.nf-mega__inner').first();
console.log('THEME  panel visible:', await panel.isVisible(), 'box:', JSON.stringify(await panel.boundingBox()));
console.log('THEME  tiles:', await p.locator('.nf-mega__tile').count(),
            'imgs:', await p.locator('.nf-mega__tile-img').count(),
            'cols:', await p.locator('.nf-mega__col').count(),
            'links:', await p.locator('.nf-mega__link').count());
await p.screenshot({ path: '/tmp/mega-theme.png' });

const c2 = await b.newContext({ viewport: { width: 1440, height: 950 } });
await c2.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen','1'); } catch(e){} });
const p2 = await c2.newPage();
await proxy(p2);
await p2.goto('http://127.0.0.1:4325/', { waitUntil: 'networkidle' });
await p2.locator('a', { hasText: /^SHOP$/ }).first().hover();
await p2.waitForTimeout(800);
const rp = p2.locator('div').filter({ hasText: /^SHOP BY CATEGORY/ }).last();
console.log('REACT  panel box:', JSON.stringify(await rp.boundingBox().catch(() => null)));
await p2.screenshot({ path: '/tmp/mega-react.png' });
await b.close();
