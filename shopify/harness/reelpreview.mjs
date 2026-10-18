// The reel rail and a product page's gallery as they will be once new edits
// are uploaded at /admin/reels, before they are: the live reels list with the
// edits added the way the studio stores them (uploads/<time>-<file name>),
// their videos and posters answered from disk.
//   node reelpreview.mjs <base> <dir of prepared files> [outDir]
// The dir holds <name>.mp4 and <name>-poster.jpg for each edit in NEW below.
// Nothing is written anywhere: the list read is the live one plus these rows,
// and only the existing reels' URLs are signed by storage. Ad and analytics
// requests are blocked (noreport.mjs); a phone, 390 × 844.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { NO_REPORT } from './noreport.mjs';

const [BASE, DIR, OUT] = process.argv.slice(2);
if (!BASE || !DIR) {
  console.error('usage: node reelpreview.mjs <base> <dir of prepared files> [outDir]');
  process.exit(2);
}
if (OUT) mkdirSync(OUT, { recursive: true });

const STAMP = 1792350000000;
const NEW = [
  { name: 'ananya-where-is-this-from', caption: 'Where is this from?', handles: ['halo-curve-ring', 'baroque-pearl-lariat'] },
  { name: 'sonal-doing-all-the-work', caption: 'These hoops are doing all the work', handles: ['woven-gold-hoops'] },
];
const pathOf = (item, i) => `uploads/${STAMP + i}-${item.name}.mp4`;
const posterOf = (item, i) => `uploads/${STAMP + i}-poster-${item.name}-poster.jpg`;
const ANDROID = 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const passThrough = async (route, q, body) => {
  const headers = Object.fromEntries(Object.entries(q.headers()).filter(([k]) => k.toLowerCase() !== 'content-length'));
  const r = await fetch(q.url(), { method: q.method(), headers, body: body ?? (q.postDataBuffer() || undefined), redirect: 'manual' });
  return { status: r.status, headers: Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k))), body: Buffer.from(await r.arrayBuffer()) };
};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const newPage = async () => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: ANDROID });
  await ctx.addInitScript({ content: "Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});" });
  const served = [];
  await ctx.route('**/*', async (route) => {
    const q = route.request();
    const u = q.url();
    if (NO_REPORT.test(u)) return route.abort();
    try {
      // The reels list: the live rows, then the edits as the studio would add them.
      if (/\/rest\/v1\/reels\?/.test(u) && q.method() === 'GET') {
        const live = await passThrough(route, q);
        const rows = JSON.parse(live.body.toString());
        const last = rows.reduce((m, r) => Math.max(m, r.sort_order), -1);
        NEW.forEach((item, i) =>
          rows.push({
            id: `preview-${item.name}`,
            title: null,
            caption: item.caption,
            video_path: pathOf(item, i),
            poster_path: posterOf(item, i),
            sort_order: last + 1 + i,
            published: true,
            reel_products: item.handles.map((handle, position) => ({ id: `${item.name}-${position}`, handle, title: handle, price_label: null, image_url: null, variant_id: null, position })),
          }),
        );
        return route.fulfill({ status: 200, headers: { ...live.headers, 'content-type': 'application/json' }, body: JSON.stringify(rows) });
      }
      // Signing: storage signs the live reels; the edits get a URL answered below.
      if (/\/storage\/v1\/object\/sign\/reels$/.test(u) && q.method() === 'POST') {
        const asked = JSON.parse(q.postData() || '{}');
        const mine = (asked.paths || []).filter((p) => p.startsWith(`uploads/${String(STAMP).slice(0, 6)}`));
        const theirs = (asked.paths || []).filter((p) => !mine.includes(p));
        const live = theirs.length ? JSON.parse((await passThrough(route, q, JSON.stringify({ ...asked, paths: theirs }))).body.toString()) : [];
        const signed = [...live, ...mine.map((p) => ({ error: null, path: p, signedURL: `/object/sign/reels/${p}?token=preview` }))];
        return route.fulfill({ status: 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }, body: JSON.stringify(signed) });
      }
      const local = u.match(/\/storage\/v1\/object\/sign\/reels\/uploads\/\d+-(?:poster-)?([^?]+)\?token=preview/);
      if (local) {
        const file = local[1];
        const body = readFileSync(`${DIR}/${file}`);
        served.push({ file, bytes: body.length });
        return route.fulfill({ status: 200, headers: { 'content-type': file.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg', 'access-control-allow-origin': '*', 'cache-control': 'max-age=21600' }, body });
      }
      if (q.resourceType() === 'media') {
        // the live reels' own videos: not needed to judge the new ones
        return route.abort();
      }
      const r = await passThrough(route, q);
      return route.fulfill(r);
    } catch {
      return route.abort().catch(() => {});
    }
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  return { ctx, p, errors, served };
};

const open = async (p, handle) => {
  await p.goto(`${BASE}/jewellery/${handle}`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => [...document.querySelectorAll('#product-actions button')].some((x) => Object.keys(x).some((k) => k.startsWith('__react'))), null, { timeout: 90000 });
};
// The rail, read as a shopper meets it.
const rail = (p) =>
  p.evaluate(() =>
    [...document.querySelectorAll('[data-reel-slide]')].map((slide) => ({
      cover: slide.querySelector('img')?.getAttribute('src') || '',
      coverDone: Boolean(slide.querySelector('img')?.complete && slide.querySelector('img')?.naturalWidth),
      video: slide.querySelector('video')?.getAttribute('src') || '',
      pieces: [...slide.querySelectorAll('li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim()),
    })),
  );

for (const [handle, own, slideIndex] of [['woven-gold-hoops', 'sonal-doing-all-the-work', 3], ['halo-curve-ring', 'ananya-where-is-this-from', 2]]) {
  const { ctx, p, errors, served } = await newPage();
  await open(p, handle);
  // The gallery's last slide is the piece's own reel, its cover bundled. The
  // reels load once the page has settled, so the slide joins a moment later.
  await p.waitForSelector('[aria-label$=" in a Naira reel"] img', { timeout: 30000 }).catch(() => {});
  const galleryCover = await p.evaluate(() => document.querySelector('[aria-label$=" in a Naira reel"] img')?.getAttribute('src') || '');
  const coverName = own.split('-')[0];
  check(`${handle}: the gallery ends on its own reel, cover bundled`, new RegExp(`reel-cover-${coverName}-[\\w-]+\\.webp`).test(galleryCover), galleryCover);

  // Scroll to the rail; time from its first tile to every cover painted.
  await p.evaluate(() => document.getElementById('shop-reels-title')?.scrollIntoView({ block: 'start' }));
  await p.waitForFunction(() => document.querySelectorAll('[data-reel-slide]').length > 0, null, { timeout: 30000 });
  let slides = await rail(p);
  check(
    `${handle}: four reels in the rail, the new two with their own bundled covers`,
    slides.length === 4 && /reel-cover-ananya-[\w-]+\.webp$/.test(slides[2]?.cover) && /reel-cover-sonal-[\w-]+\.webp$/.test(slides[3]?.cover),
    slides.map((s) => s.cover.split('/').pop()).join(', '),
  );

  // Bring this piece's reel to the front: its cover is already painted, and
  // only then is its video asked for.
  const before = served.filter((s) => s.file === `${own}.mp4`).length;
  await p.locator('[data-reel-slide]').nth(slideIndex).click();
  const t0 = Date.now();
  await p.waitForFunction((i) => {
    const img = document.querySelectorAll('[data-reel-slide]')[i]?.querySelector('img');
    return img && img.complete && img.naturalWidth > 0;
  }, slideIndex, { timeout: 10000 }).catch(() => {});
  const paintMs = Date.now() - t0;
  slides = await rail(p);
  check(`${handle}: the reel's cover is on screen as it comes to the front (${paintMs} ms)`, slides[slideIndex].coverDone && paintMs < 1000);
  for (let i = 0; i < 40 && served.filter((s) => s.file === `${own}.mp4`).length === before; i++) await p.waitForTimeout(250);
  const fetched = served.filter((s) => s.file === `${own}.mp4`).length > before;
  // This sandbox's Chromium has no H.264 decoder (canPlayType is empty), so
  // playback itself is checked on the file with ffmpeg, not here.
  check(`${handle}: becoming the active reel loads its prepared file, and not before`, before === 0 && fetched, `${own}.mp4 requested ${served.filter((s) => s.file === `${own}.mp4`).length}×`);
  const pieces = slides[slideIndex].pieces;
  if (handle === 'halo-curve-ring') {
    check('Ananya: Halo Curve Ring to add at ₹2,049, the sold-out lariat to reserve', /^Halo Curve Ring\s*₹2,049.*Add$/.test(pieces[0] || '') && /^Baroque Pearl Lariat\s*Pre-order\s*Reserve$/.test(pieces[1] || ''), pieces.join(' | '));
  } else {
    check('Sonal: the Woven Gold Hoops at ₹1,499 to add', /^Woven Gold Hoops\s*₹1,499.*Add$/.test(pieces[0] || ''), pieces.join(' | '));
  }
  const video = served.find((s) => s.file === `${own}.mp4`);
  check(`${handle}: the reel is the web-sized file (${video ? (video.bytes / 1e6).toFixed(1) : '?'} MB)`, video && video.bytes < 8e6);
  if (OUT) {
    await p.locator('[data-reel-slide]').nth(slideIndex).screenshot({ path: `${OUT}/rail-${own}.png` });
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(400);
    // the gallery's reel slide
    await p.evaluate(() => {
      const strip = document.querySelector('[aria-label$=" in a Naira reel"]')?.parentElement;
      strip?.scrollTo({ left: strip.scrollWidth, behavior: 'instant' });
    });
    await p.waitForTimeout(1500);
    writeFileSync(`${OUT}/gallery-${handle}.png`, await p.screenshot());
  }
  check(`${handle}: no page errors`, errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await b.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
