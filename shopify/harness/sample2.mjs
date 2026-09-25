// Sample real colours out of the product photograph: k-means over the pixels
// that are actually saturated, so the pastels are measured rather than guessed.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const src = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage();
await p.setContent(`<canvas id=c></canvas><img id=i src="data:image/jpeg;base64,${readFileSync(src).toString('base64')}">`);
await p.waitForFunction(() => i.complete && i.naturalWidth);
console.log(JSON.stringify(await p.evaluate(() => {
  const w = 520, h = Math.round(i.naturalHeight * (520 / i.naturalWidth));
  c.width = w; c.height = h;
  const x = c.getContext('2d'); x.drawImage(i, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data;
  const hsl = (r, g, bl) => { r/=255; g/=255; bl/=255;
    const mx = Math.max(r,g,bl), mn = Math.min(r,g,bl), l = (mx+mn)/2, dd = mx-mn;
    if (!dd) return [0,0,l];
    const s = l > .5 ? dd/(2-mx-mn) : dd/(mx+mn);
    let hh = mx===r ? (g-bl)/dd + (g<bl?6:0) : mx===g ? (bl-r)/dd+2 : (r-g)/dd+4;
    return [hh*60, s, l]; };
  const buckets = { aqua: [], pink: [], yellow: [], metal: [] };
  for (let k = 0; k < d.length; k += 4) {
    const [hh, s, l] = hsl(d[k], d[k+1], d[k+2]);
    if (l < .25 || l > .93) continue;
    if (s < .10) { if (l > .55 && l < .88) buckets.metal.push([d[k],d[k+1],d[k+2]]); continue; }
    if (s < .16) continue;
    if (hh >= 160 && hh <= 215) buckets.aqua.push([d[k],d[k+1],d[k+2]]);
    else if ((hh >= 300 && hh <= 360) || hh < 20) buckets.pink.push([d[k],d[k+1],d[k+2]]);
    else if (hh >= 35 && hh <= 65) buckets.yellow.push([d[k],d[k+1],d[k+2]]);
  }
  const avg = a => { if (!a.length) return null;
    const m = a.reduce((p,q)=>[p[0]+q[0],p[1]+q[1],p[2]+q[2]],[0,0,0]).map(v=>Math.round(v/a.length));
    return '#' + m.map(v=>v.toString(16).padStart(2,'0')).join(''); };
  // also the brightest decile of each, which is what the table facet shows
  const bright = a => { if (!a.length) return null;
    const s = a.slice().sort((p,q)=>(q[0]+q[1]+q[2])-(p[0]+p[1]+p[2])).slice(0, Math.max(1, a.length>>3));
    return avg(s); };
  const out = {};
  for (const k in buckets) out[k] = { n: buckets[k].length, mean: avg(buckets[k]), bright: bright(buckets[k]) };
  return out;
}), null, 1));
await b.close();
