// Screenshot the cover page at 1080x1920 once its fonts have loaded.
// Usage: node shot.mjs <page.html> <out.png>   (needs playwright-core; Chromium at /opt/pw-browsers)
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--allow-file-access-from-files', '--force-color-profile=srgb'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await p.goto('file://' + process.argv[2]); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
await p.screenshot({ path: process.argv[3] }); await b.close();
