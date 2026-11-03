// node timeline.mjs <adDir> <out.md> <title>: the timeline as BUILT - shots (source + source in-time), every text element with
// its on-screen window, every voice line (file + source window + ad time), every sound cue. For reviewers.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
const [dirA, out, title] = process.argv.slice(2); const dir = resolve(dirA);
const au = JSON.parse(readFileSync(`${dir}/audio.json`, 'utf8'));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('file://' + dir + '/index.html'); await p.evaluate(() => window.ready);
const info = await p.evaluate(() => {
  const AD = window.AD;
  const els = [...document.querySelectorAll('[data-k]')].filter(e => !e.parentElement.closest('[data-k]') || e.parentElement.closest('#hbag, [id]'));
  const rows = [];
  for (const e of document.querySelectorAll('[data-k]')) {
    const K = JSON.parse(e.dataset.k); const os = K.filter(k => 'o' in k[1]);
    if (!os.length) continue;
    const on = os.filter(k => k[1].o > 0.5).map(k => k[0]); if (!on.length) continue;
    const t0 = Math.min(...on), offs = os.filter(k => k[1].o === 0 && k[0] > t0).map(k => k[0]); const t1 = offs.length ? Math.min(...offs) : AD.dur;
    const txt = (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim(); if (!txt) continue;
    const r = e.getBoundingClientRect();
    rows.push({ t0: +t0.toFixed(2), t1: +Math.min(t1, AD.dur).toFixed(2), txt: txt.slice(0, 120), cls: (e.firstElementChild?.className || e.className || '').toString().slice(0, 30), y: Math.round(r.top) });
  }
  return { shots: AD.shots, dur: AD.dur, rows };
});
await b.close();
let md = `# ${title}\n\nLength ${info.dur} s, 1080x1920, 30 fps.\n\n## Picture (shot list as built)\n\n| Ad time (s) | Frames dir (source) | Source in-time offset (s, from the dir start) | Zoom |\n| --- | --- | --- | --- |\n`;
for (const s of info.shots) md += `| ${s.t0.toFixed(3)}-${s.t1.toFixed(3)} | ${s.id} | ${(s.off || 0).toFixed(3)} | ${s.zoom ? s.zoom.join('-') : '1'} |\n`;
md += `\nFrame dirs: k_<clip>_<in*100> = Kinn clip from that in-time; h_riya_talk = Riya 4K from 0.80 (native 125% crop); h_riya_brace = Riya 4K from 20.40 (crop);\nriya_full / pk_full / ana = the whole source from 0 (Pankti is mirrored by the HLG pipeline).\n\n## Text on screen (as built; y = top edge in px)\n\n| On (s) | Off (s) | y | Text |\n| --- | --- | --- | --- |\n`;
const seen = new Set();
for (const r of info.rows.sort((a, b) => a.t0 - b.t0)) { const k = r.t0 + r.txt; if (seen.has(k)) continue; seen.add(k); md += `| ${r.t0} | ${r.t1} | ${r.y} | ${r.txt.replace(/\|/g, '/')} |\n`; }
md += `\n## Voice (as placed)\n\n| Ad time (s) | File | Source window (s) |\n| --- | --- | --- |\n`;
for (const v of au.vo) md += `| ${v.at.toFixed(2)} | ${v.file} | ${v.src0.toFixed(2)}-${v.src1.toFixed(2)} |\n`;
md += `\nFiles: riya = Riya's own voice; ana = Ananaya's own voice; hv*_N = the film's voice (Nyra, new VO).\n\n## Music\n\n\`\`\`\n${JSON.stringify(au.music, null, 1)}\n\`\`\`\n\n## Sound cues\n\n${au.sfx.map(c => `- ${c.t.toFixed(2)} ${c.k}${c.t1 ? ' to ' + c.t1.toFixed(2) : ''}${c.music ? ' (score only)' : ''}`).join('\n')}\n`;
writeFileSync(out, md); console.log('wrote', out, info.rows.length, 'text rows');
