import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const d = JSON.parse(readFileSync(process.argv[2],'utf8'));
// fetch each image through Node so the proxy CA is honoured, hand Chromium data URLs
const imgs = [];
for (const im of d.images) {
  const r = await fetch(im.url);
  const buf = Buffer.from(await r.arrayBuffer());
  imgs.push({ ...im, d:`data:image/jpeg;base64,${buf.toString('base64')}` });
}
const strip = (label, frame, fit) => `
 <h3>${label}</h3>
 <div class="row">${imgs.map(i=>`
   <figure><div class="f" style="aspect-ratio:${frame}">
     <img src="${i.d}" style="object-fit:${fit}"></div>
     <figcaption>${i.ar}</figcaption></figure>`).join('')}</div>`;
const html = `<style>
 body{margin:0;background:#2e2b29;color:#fff;font:13px system-ui;padding:16px}
 h3{font:600 13px system-ui;letter-spacing:.06em;text-transform:uppercase;color:#d8cfc8;margin:18px 0 8px}
 .row{display:flex;gap:10px}
 figure{margin:0;width:190px}
 .f{width:100%;background:#F4EBE2;overflow:hidden}
 .f img{width:100%;height:100%;display:block}
 figcaption{font:11px ui-monospace;color:#9d938c;padding-top:4px}
</style>
<p style="color:#cfc5bd">${d.title} — five gallery images, three different source ratios</p>
${strip('now — mobile PDP: 1/1 frame, object-cover','1/1','cover')}
${strip('option A — 1/1 frame, object-contain on brand ground','1/1','contain')}
${strip('option B — 4/5 frame, object-cover','4/5','cover')}`;
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport:{width:1060,height:900}, deviceScaleFactor:2 });
await page.setContent(html); await page.waitForTimeout(1500);
writeFileSync(process.argv[3], await page.screenshot({ fullPage:true }));
console.log('rendered', imgs.length, 'images');
await b.close();
