// Make scripts/_prerender_verify.ts from scripts/prerender.ts — identical except
// that the capture browser's requests are fulfilled through Node's fetch.
// Chromium in this sandbox reaches the network through the agent proxy but does
// not trust its CA; Node does (NODE_EXTRA_CA_CERTS). TLS is verified either way,
// just by Node instead of Chromium. The HTML transform under test — clean() —
// is untouched, so the output is what the real prerender would write.
import { readFileSync, writeFileSync } from 'node:fs';
const dir = process.argv[2];
const src = readFileSync(`${dir}/scripts/prerender.ts`, 'utf8');
const anchor = 'await page.route(/(facebook\\.net|facebook\\.com|fbcdn\\.net)/i, (r) => r.abort());';
if (src.split(anchor).length !== 2) throw new Error('anchor not found exactly once — prerender.ts changed shape');
const shim = `
  // ---- VERIFY-ONLY network shim (not part of the real prerender) ----
  await page.route(/.*/, async (r) => {
    const q = r.request();
    if (/(facebook\\.net|facebook\\.com|fbcdn\\.net)/i.test(q.url())) return r.abort();
    try {
      const res = await fetch(q.url(), { method: q.method(), headers: q.headers(), body: q.postData() || undefined, redirect: "follow" });
      const body = Buffer.from(await res.arrayBuffer());
      const headers = Object.fromEntries([...res.headers].filter(([k]) => !/^(content-encoding|content-length)$/i.test(k)));
      await r.fulfill({ status: res.status, headers, body });
    } catch { await r.abort(); }
  });
  // ---- end shim ----`;
writeFileSync(`${dir}/scripts/_prerender_verify.ts`, src.replace(anchor, anchor + shim));
console.log('wrote scripts/_prerender_verify.ts');
