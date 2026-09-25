// Render the local artifact and screenshot the WebGL stage.
// Chromium here cannot reach cdnjs directly, so every request is proxied
// through Node fetch, same as the storefront harness.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const FILE = process.argv[2], OUT = process.argv[3];
const VIEW = process.argv[4] || '';
const W = +(process.argv[5] || 1280), H = +(process.argv[6] || 860);

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
});
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await ctx.route('**/*', async (route) => {
  const u = route.request().url();
  if (u.startsWith('file:')) return route.continue();
  try {
    const r = await fetch(u, { headers: route.request().headers() });
    const buf = Buffer.from(await r.arrayBuffer());
    const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: h, body: buf });
  } catch (e) { console.error('  proxy fail', u.slice(0, 70), e.message.slice(0, 40)); await route.abort(); }
});

const page = await ctx.newPage();
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR ' + e.message.slice(0, 160)));
page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)); });

// the publish skeleton is added server-side; mimic it so the local file matches
const body = readFileSync(FILE, 'utf8');
await page.setContent(
  `<!doctype html><html><head><meta charset="utf-8">` +
  `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">` +
  `<style>:root{color-scheme:light}body{margin:0;font:14px system-ui;background:#faf9f7}` +
  `img{max-width:100%}[hidden]{display:none!important}</style></head><body>${body}</body></html>`,
  { waitUntil: 'load' });

await page.waitForTimeout(3500);
if (VIEW) {
  try { await page.$eval(`.views button[data-view="${VIEW}"]`, b => b.click()); }
  catch (e) { console.log('  view click failed:', e.message.slice(0, 80)); }
  await page.waitForTimeout(2800);
}
await page.waitForTimeout(1200);

const info = await page.evaluate(() => {
  const c = document.querySelector('.stage canvas');
  const g = c && (c.getContext('webgl2') || c.getContext('webgl'));
  return {
    canvas: c ? `${c.width}x${c.height}` : 'NONE',
    webgl: !!g,
    loadingGone: !document.getElementById('loading'),
    three: typeof THREE !== 'undefined' ? THREE.REVISION : 'ABSENT',
    title: document.title,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
});
console.log(JSON.stringify(info));
if (errs.length) console.log(errs.slice(0, 6).join('\n'));
// Element.screenshot() waits for the element to be "stable", and a canvas
// that is auto-spinning never stops changing -- it times out every time the
// default view is up. A clipped page screenshot does not wait for stability.
const box = await (await page.$('.stage')).boundingBox();
writeFileSync(OUT, await page.screenshot({ clip: box }));
console.log('wrote', OUT);
await b.close();
