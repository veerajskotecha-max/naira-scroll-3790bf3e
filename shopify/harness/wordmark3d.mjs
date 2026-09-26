// Does the deferred 3D wordmark still arrive and go live — and when, relative
// to the page's load event?
import { chromium } from 'playwright';
const [BASE, PATH = '/'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.route('**/*', async (route) => {
  const q = route.request();
  if (/(facebook\.net|facebook\.com|fbcdn\.net)/i.test(q.url())) return route.abort();
  try {
    const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) });
  } catch { await route.abort().catch(() => {}); }
});
const p = await ctx.newPage();
const t0 = Date.now(); const seen = {}; const errs = [];
p.on('request', (r) => { const m = r.url().match(/\/assets\/(RoomEnvironment|scene)-/); if (m && !seen[m[1]]) seen[m[1]] = Date.now() - t0; });
p.on('pageerror', (e) => errs.push(e.message.slice(0, 120)));
await p.goto(BASE + PATH, { waitUntil: 'load', timeout: 120000 });
const loadAt = Date.now() - t0;
await p.waitForTimeout(12000);
const state = await p.evaluate(() => {
  const cs = [...document.querySelectorAll('canvas')];
  return { canvases: cs.length, drawn: cs.filter((c) => c.width > 0 && c.height > 0).length,
           webgl: cs.some((c) => { try { return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }) };
});
const baked = await p.evaluate(() => [...document.querySelectorAll('link[rel="modulepreload"]')].filter((l) => /RoomEnvironment|scene/.test(l.href) && !l.hasAttribute('data-deferred-preload')).length);
console.log(JSON.stringify({ path: PATH, loadEventMs: loadAt, threeRequestedMs: seen.RoomEnvironment ?? 'never', sceneRequestedMs: seen.scene ?? 'never',
  requestedAfterLoad: seen.RoomEnvironment != null ? seen.RoomEnvironment > loadAt : null, ...state, pageErrors: errs }));
await b.close();
