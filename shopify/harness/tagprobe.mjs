// Install the prerender's deferred-preload tagging in a real page and list what
// it tags. Must run against a plain SPA build: baked preloads in prerendered
// HTML are parsed, not appended, and would hide what the helper does.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const [BASE, PRERENDER] = process.argv.slice(2);
const script = readFileSync(PRERENDER, 'utf8').match(/const MARK_DEFERRED_PRELOADS = `([\s\S]*?)`;/)[1];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const path of ['/jewellery/prism-riviere-bracelet', '/']) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });   // the prerender's own viewport
  await p.route(/.*/, async (route) => {
    const q = route.request();
    if (/(facebook\.net|facebook\.com|fbcdn\.net)/i.test(q.url())) return route.abort();
    try {
      const r = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: 'follow' });
      const h = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) });
    } catch { await route.abort().catch(() => {}); }
  });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript({ content: script });
  await p.goto(BASE + path, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(9000);   // past load + idle, like the capture's settle
  const links = await p.evaluate(() => [...document.head.querySelectorAll('link[rel="modulepreload"]')].map((l) => ({
    chunk: (l.getAttribute('href') || '').split('/').pop().replace(/-[\w-]{8}\.js$/, ''),
    runtime: l.getAttribute('as') === 'script', tagged: l.hasAttribute('data-deferred-preload') })));
  const rt = links.filter((l) => l.runtime);
  console.log(`${path}\n  runtime preloads: ${rt.length}   tagged as deferred (will be stripped): ${rt.filter((l) => l.tagged).length}`);
  console.log('  STRIP: ' + (rt.filter((l) => l.tagged).map((l) => l.chunk).join(', ') || '(none)'));
  console.log('  KEEP:  ' + (rt.filter((l) => !l.tagged).map((l) => l.chunk).join(', ') || '(none)'));
  console.log('  page errors: ' + (errs.length ? errs.join(' | ') : 'none'));
  await p.close();
}
await b.close();
