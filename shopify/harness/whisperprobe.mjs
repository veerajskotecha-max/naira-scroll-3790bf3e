// Asks questions of an unpublished theme's page in a real browser: what font
// a heading resolved to, which requests failed, what a section rendered.
//   node whisperprobe.mjs <themeId> <path> <expression> [--wait=ms] [--phone]
// <expression> is evaluated in the page after load and printed as JSON.
// Session priming and request routing are the same as whispershot.mjs.
import { chromium } from 'playwright';
import { NO_REPORT } from './noreport.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const [THEME, PATH, EXPR] = args.filter((a) => !a.startsWith('--'));
if (!THEME || !PATH || !EXPR) {
  console.error('usage: node whisperprobe.mjs <themeId> <path> <expression> [--wait=ms] [--phone]');
  process.exit(2);
}
const HOST = 'https://nc5eti-gp.myshopify.com';
const FLAGS = '_ab=0&_fd=0&_sc=1';
const UA = 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const jar = new Map();
const keep = (headers) => {
  for (const c of headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(';');
    const i = pair.indexOf('=');
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
};
const cookie = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
const get = async (url) => {
  const r = await fetch(url, { headers: { 'user-agent': UA, cookie: cookie() }, redirect: 'manual' });
  keep(r.headers);
  return r;
};
await get(`${HOST}/?${FLAGS}&preview_theme_id=${THEME}`);
await wait(3000);
await get(`${HOST}/services/access_tokens/create_sharing/${THEME}?return_to=${encodeURIComponent(`/?${FLAGS}`)}`);
await wait(3000);

const phone = 'phone' in flags;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext(phone
  ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA }
  : { viewport: { width: 1440, height: 960 } });
const failed = [];
await ctx.route('**/*', async (route) => {
  const q = route.request();
  let url = q.url();
  if (NO_REPORT.test(url)) return route.abort();
  const ours = url.startsWith(HOST);
  if (ours && !url.includes('_fd=0') && !new URL(url).pathname.startsWith('/cdn/')) url += (url.includes('?') ? '&' : '?') + FLAGS;
  try {
    const headers = { ...q.headers(), ...(ours ? { cookie: cookie() } : {}) };
    delete headers['content-length'];
    const r = await fetch(url, { method: q.method(), headers, body: q.postDataBuffer() || undefined, redirect: 'manual' });
    if (ours) keep(r.headers);
    if (r.status >= 400) failed.push(`${r.status} ${url.slice(0, 160)}`);
    const body = Buffer.from(await r.arrayBuffer());
    const out = Object.fromEntries([...r.headers].filter(([k]) => !/^(content-encoding|content-length|set-cookie)$/i.test(k)));
    await route.fulfill({ status: r.status, headers: out, body });
  } catch (e) {
    failed.push(`ERR ${url.slice(0, 160)} ${e.message}`);
    await route.abort().catch(() => {});
  }
});
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
await p.goto(HOST + PATH, { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(Number(flags.wait || 2500));
const result = await p.evaluate(`(async () => (${EXPR}))()`);
console.log(JSON.stringify({ theme: await p.evaluate(() => window.Shopify?.theme?.id), result, failed, errors }, null, 1));
await b.close();
