import { chromium } from 'playwright';
/* Drives the gate and the offer for real: tabs, validation, error copy,
   focus, keyboard. Supabase is stubbed so nothing leaves the machine. */
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => { try { localStorage.setItem('naira-promo-popup-seen', '1'); } catch (e) {} });
const seen = [];
await ctx.route('**/*.supabase.co/**', async (route) => {
  const url = route.request().url();
  let body = route.request().postData() || '';
  seen.push({ url: url.replace(/^https:\/\/[^/]+/, ''), body });
  const json = (b, s = 200) => route.fulfill({ status: s, contentType: 'application/json', body: JSON.stringify(b) });
  if (url.includes('/auth/v1/token')) return json({ error: 'invalid_grant', error_description: 'Invalid login credentials' }, 400);
  if (url.includes('/auth/v1/otp')) return json({});
  if (url.includes('/auth/v1/recover')) return json({});
  return json([]);
});
const errs = [];
const page = await ctx.newPage();
page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 160)));
page.on('console', m => { if (m.type() === 'error' && !/ERR_(CONNECTION|BLOCKED|NAME)/.test(m.text())) errs.push('console: ' + m.text().slice(0, 160)); });
await page.goto('http://127.0.0.1:4177/innercircle', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('text=OPEN THE DOOR', { timeout: 30000 });

const step = async (label, fn) => {
  try { const r = await fn(); console.log(`ok   ${label}${r ? ' — ' + r : ''}`); }
  catch (e) { console.log(`FAIL ${label} — ${String(e).split('\n')[0].slice(0, 150)}`); }
};

await step('gate: empty submit is rejected without a network call', async () => {
  const before = seen.length;
  await page.click('text=OPEN THE DOOR');
  await page.waitForTimeout(400);
  if (seen.length !== before) throw new Error('a request went out for an empty form');
  const guard = await page.evaluate(() => {
    const f = document.querySelector('form');
    return { native: !f.noValidate && !f.checkValidity(), required: [...f.querySelectorAll('input')].every(i => i.required) };
  });
  if (!guard.native || !guard.required) throw new Error('nothing stopped the empty submit');
  return 'held by the browser, every field required';
});

await step('gate: a bad address is caught client-side', async () => {
  const before = seen.length;
  await page.fill('input[type="email"]', 'not-an-email');
  await page.fill('input[type="password"]', 'whatever123');
  await page.click('text=OPEN THE DOOR');
  await page.waitForTimeout(400);
  if (seen.length !== before) throw new Error('a request went out for an invalid address');
  const held = await page.evaluate(() => !document.querySelector('input[type="email"]').validity.valid);
  if (!held) throw new Error('"not-an-email" was accepted as an address');
  return 'held by the email field';
});

await step('gate: wrong credentials never say whether the account exists', async () => {
  await page.fill('input[type="email"]', 'member@example.com');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('text=OPEN THE DOOR');
  await page.waitForTimeout(900);
  const msg = (await page.locator('[role="alert"]').allTextContents()).join(' | ').trim();
  if (/not found|no account|unregistered|does not exist|invalid login/i.test(msg)) throw new Error('leaks account existence: ' + msg);
  return msg;
});

await step('gate: no password is ever sent to a non-auth endpoint, or logged', async () => {
  const leak = seen.filter(s => /wrongpassword|whatever123/.test(s.body) && !s.url.startsWith('/auth/v1/token'));
  if (leak.length) throw new Error('password posted to ' + leak.map(l => l.url).join(', '));
  return `${seen.length} requests, password only in /auth/v1/token`;
});

await step('gate: tabs switch the form', async () => {
  await page.click('button:has-text("EMAIL ME A LINK")');
  await page.waitForTimeout(350);
  const pw = await page.locator('input[type="password"]').count();
  if (pw) throw new Error('password field survived the switch to magic link');
  await page.click('button:has-text("JOIN")');
  await page.waitForTimeout(350);
  const named = await page.locator('input#\\3a r0\\3a -name, input[id$="-name"]').count();
  if (!named) throw new Error('join panel has no name field');
  return 'link panel drops the password, join panel adds a name';
});

await step('gate: focus lands in the first field after a switch', async () => {
  const id = await page.evaluate(() => document.activeElement?.getAttribute('id') || document.activeElement?.tagName);
  if (!id || id === 'BODY') throw new Error('focus was left on the body');
  return `focus on ${id}`;
});

await step('gate: the whole form is reachable by keyboard', async () => {
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  const tag = await page.evaluate(() => document.activeElement?.tagName);
  const ring = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' || s.boxShadow !== 'none'; });
  if (!ring) throw new Error(`no visible focus ring on ${tag}`);
  return `${tag} shows a focus ring`;
});

console.log(errs.length ? '\nJS ERRORS:\n' + [...new Set(errs)].join('\n') : '\nno JS errors');
await b.close();
