// Ad engine: one page per ad. window.renderAt(t) draws the footage layer on a canvas and poses every overlay from its
// keyframes, so any frame can be rendered alone and the output does not depend on wall-clock time.
// Data comes in as window.AD (built by tools/build.py).
(() => {
  const AD = window.AD, FPS = AD.fps, W = 1080, H = 1920;
  const cv = document.getElementById('v'), cx = cv.getContext('2d');
  const cache = new Map();
  const load = src => {
    if (cache.has(src)) return cache.get(src);
    const p = new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('img ' + src)); im.src = src; });
    cache.set(src, p);
    if (cache.size > 90) cache.delete(cache.keys().next().value);
    return p;
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const E = {
    lin: u => u, io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
    out: u => 1 - Math.pow(1 - u, 3), in: u => u * u * u, step: u => (u < 1 ? 0 : 1),
    back: u => { const c = 1.6; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); },
    expo: u => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * u)),
  };
  const frameSrc = (sh, t) => {
    const m = AD.meta[sh.id]; const loc = (t - sh.t0) * (sh.speed || 1) + (sh.off || 0);
    const k = clamp(Math.floor(loc * m.fps + 1e-6), 0, m.n - 1);
    return `${AD.frames}/${sh.id}/f_${String(k + 1).padStart(4, '0')}.jpg`;
  };
  const zoomAt = (sh, t) => {
    const u = clamp((t - sh.t0) / (sh.t1 - sh.t0), 0, 1); const z = sh.zoom || [1, 1];
    let s = z[0] + (z[1] - z[0]) * E[sh.zease || 'lin'](u);
    if (sh.punch) { const p = clamp((t - sh.t0) / sh.punch[1], 0, 1); s *= 1 + (sh.punch[0] - 1) * (1 - E.out(p)); }
    return s;
  };
  function drawShot(sh, t, alpha, blurX) {
    return load(frameSrc(sh, t)).then(im => {
      const s = zoomAt(sh, t), ax = sh.ax ?? .5, ay = sh.ay ?? .5;
      cx.save(); cx.globalAlpha = alpha;
      if (AD.meta[sh.id].sq) {                                   // a 1:1 studio clip: its own frame, blurred, fills the rest
        cx.filter = 'blur(38px)'; cx.drawImage(im, -420, 0, 1920, 1920); cx.filter = 'none';
        cx.fillStyle = 'rgba(251,243,236,.10)'; cx.fillRect(0, 0, W, H);
        const side = W * s, y0 = (sh.sqY ?? 420) - (side - W) * ay, x0 = -(side - W) * ax;
        const oc = sqCanvas(); const ox = oc.getContext('2d'); ox.clearRect(0, 0, 1080, 1080);
        ox.drawImage(im, 0, 0, 1080, 1080);
        ox.globalCompositeOperation = 'destination-in';
        const m = ox.createLinearGradient(0, 0, 0, 1080); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(.16, 'rgba(0,0,0,1)'); m.addColorStop(.84, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
        ox.fillStyle = m; ox.fillRect(0, 0, 1080, 1080); ox.globalCompositeOperation = 'source-over';
        drawBlur(oc, x0, y0, side, side, blurX);
      } else {
        const fb = fblurAt(t); if (fb > .3) cx.filter = `blur(${fb.toFixed(1)}px)`;
        const w = W * s, h = H * s; drawBlur(im, -(w - W) * ax, -(h - H) * ay, w, h, blurX); cx.filter = 'none';
      }
      cx.restore();
    });
  }
  let _sq = null; const sqCanvas = () => (_sq ||= Object.assign(document.createElement('canvas'), { width: 1080, height: 1080 }));
  function drawBlur(im, x, y, w, h, bx) {
    if (!bx || Math.abs(bx) < 1) { cx.drawImage(im, x, y, w, h); return; }
    const n = 9, a0 = cx.globalAlpha;                            // whip: directional smear
    for (let i = 0; i < n; i++) { cx.globalAlpha = a0 / n * 1.0; cx.drawImage(im, x + bx * (i / (n - 1) - .5), y, w, h); }
    cx.globalAlpha = a0;
  }
  function fblurAt(t) {
    const F = AD.fblur || []; if (!F.length || t <= F[0][0] || t >= F[F.length - 1][0]) return 0;
    for (let i = 1; i < F.length; i++) if (t < F[i][0]) { const u = (t - F[i - 1][0]) / (F[i][0] - F[i - 1][0]); return F[i - 1][1] + (F[i][1] - F[i - 1][1]) * E.io(u); }
    return 0;
  }
  function drawMG(bg, t) {                                        // flat colour + drifting glows, the reference's single light
    cx.fillStyle = bg.color; cx.fillRect(0, 0, W, H);
    for (const g of bg.glows || []) {
      const u = (t - (g.t0 ?? 0)) / ((g.t1 ?? AD.dur) - (g.t0 ?? 0));
      if (u < 0 || u > 1) continue;
      const x = g.x[0] + (g.x[1] - g.x[0]) * E.io(clamp(u, 0, 1)), y = g.y[0] + (g.y[1] - g.y[0]) * E.io(clamp(u, 0, 1));
      const a = g.a * Math.min(1, u * 6, (1 - u) * 6);
      const r = cx.createRadialGradient(x, y, 0, x, y, g.r); r.addColorStop(0, g.c.replace('A', a)); r.addColorStop(1, g.c.replace('A', 0));
      cx.fillStyle = r; cx.fillRect(0, 0, W, H);
    }
  }
  // overlays
  const els = [...document.querySelectorAll('[data-k]')].map(el => {
    const K = JSON.parse(el.dataset.k).sort((a, b) => a[0] - b[0]); const props = new Set(); K.forEach(k => Object.keys(k[1]).forEach(p => props.add(p)));
    return { el, K, props: [...props], base: el.style.transform || '' };
  });
  const val = (o, p, t) => {
    let a = null, b = null;
    for (const k of o.K) { if (!(p in k[1])) continue; if (k[0] <= t) a = k; else { b = k; break; } }
    if (!a) return b[1][p]; if (!b) return a[1][p];
    const u = E[b[2] || 'io'](clamp((t - a[0]) / (b[0] - a[0]), 0, 1)); return a[1][p] + (b[1][p] - a[1][p]) * u;
  };
  function pose(t) {
    for (const o of els) {
      const v = {}; for (const p of o.props) v[p] = val(o, p, t);
      const op = v.o ?? 1; o.el.style.opacity = op; o.el.style.visibility = op < .003 ? 'hidden' : 'visible';
      if (op < .003) continue;
      let tr = `translate(${v.x || 0}px,${v.y || 0}px)`;
      if ('rx' in v || 'ry' in v) tr = `perspective(1400px) ${tr} rotateX(${v.rx || 0}deg) rotateY(${v.ry || 0}deg)`;
      tr += ` scale(${v.s ?? 1}) rotate(${v.r || 0}deg)`; o.el.style.transform = tr;
      o.el.style.filter = (v.b || 0) > .05 ? `blur(${v.b.toFixed(2)}px)` : 'none';
      if ('w' in v) o.el.style.width = v.w + '%';
      if ('cw' in v) o.el.style.clipPath = `inset(0 ${100 - v.cw}% 0 0)`;
    }
    // captions: one line at a time, the spoken word lit
    for (const c of document.querySelectorAll('.cap')) {
      const lines = JSON.parse(c.dataset.lines); let cur = -1;
      lines.forEach((ln, i) => { if (t >= ln.t0 - .06 && t < ln.t1 + .12) cur = i; });
      if (cur < 0) { c.style.visibility = 'hidden'; continue; }
      const ln = lines[cur]; c.style.visibility = 'visible'; c.classList.toggle('dark', !!ln.dark);
      const key = cur + ':' + ln.w.map(w => (t >= w[0] ? 1 : 0)).join('');
      if (c.dataset.key !== key) {
        c.dataset.key = key;
        c.innerHTML = ln.w.map(w => `<span class="${t >= w[0] && t < (w[1] + .02) ? 'on' : (t >= w[0] ? 'said' : '')}">${w[2]}</span>`).join(' ');
      } else {
        [...c.children].forEach((s, i) => { const w = ln.w[i]; s.className = t >= w[0] && t < (w[1] + .02) ? 'on' : (t >= w[0] ? 'said' : ''); });
      }
      const fi = clamp((t - (ln.t0 - .06)) / .12, 0, 1); c.style.opacity = fi;
    }
    // swapped text (counters, prices): show the value whose window holds t
    for (const s of document.querySelectorAll('[data-swap]')) {
      const V = JSON.parse(s.dataset.swap); let txt = V[0][1]; for (const [tt, x] of V) if (t >= tt) txt = x;
      if (s.textContent !== txt) s.textContent = txt;
    }
  }
  window.renderAt = async t => {
    const tasks = [];
    cx.clearRect(0, 0, W, H);
    const bgs = AD.bg.filter(b => t >= b.t0 && t < b.t1);
    for (const b of bgs) drawMG(b, t);
    const act = AD.shots.filter(s => t >= s.t0 - (s.xin || 0) && t < s.t1 + (s.xout || 0));
    for (const sh of act) {
      let a = 1, bx = 0;
      if (sh.whip) {                                             // smear in from the right over the first frames
        const u = clamp((t - sh.t0) / sh.whip, 0, 1); bx = 260 * (1 - E.out(u));
      }
      if (sh.fadeIn) a *= clamp((t - sh.t0) / sh.fadeIn, 0, 1);
      if (sh.fadeOut) a *= clamp((sh.t1 - t) / sh.fadeOut, 0, 1);
      if (sh.whipOut) { const u = clamp((t - (sh.t1 - sh.whipOut)) / sh.whipOut, 0, 1); bx = Math.max(bx, 260 * E.in(u)); }
      await drawShot(sh, t, a, bx);
    }
    for (const f of AD.flash || []) {                            // white flash on an impact
      const u = (t - f.t) / f.d; if (u >= 0 && u < 1) { cx.fillStyle = `rgba(251,243,236,${(f.a || .85) * (1 - E.out(u))})`; cx.fillRect(0, 0, W, H); }
    }
    for (const d of AD.dim || []) {                              // darken under graphics so type reads
      if (t < d.t0 || t >= d.t1) continue;
      const a = d.a * Math.min(1, (t - d.t0) / .2, (d.t1 - t) / .2);
      const g = cx.createLinearGradient(0, d.y0, 0, d.y1); g.addColorStop(0, `rgba(26,22,20,${d.top || d.flat ? a : 0})`); g.addColorStop(1, `rgba(26,22,20,${d.top && !d.flat ? 0 : a})`);
      cx.fillStyle = g; cx.fillRect(0, d.y0, W, d.y1 - d.y0);
    }
    pose(t);
    // framed clips inside overlays (end cards): <img data-clip="id" data-t0="..">
    for (const im of document.querySelectorAll('img[data-clip]')) {
      const id = im.dataset.clip, m = AD.meta[id], t0 = +im.dataset.t0;
      const k = clamp(Math.floor((t - t0) * m.fps * (+im.dataset.speed || 1)), 0, m.n - 1);
      const src = `${AD.frames}/${id}/f_${String(k + 1).padStart(4, '0')}.jpg`;
      if (!im.src.endsWith(src.split('/').slice(-2).join('/'))) { im.src = src; tasks.push(im.decode().catch(() => {})); }
    }
    await Promise.all(tasks);
    await document.fonts.ready;
    return true;
  };
  window.ready = (async () => { await document.fonts.ready; for (const s of AD.shots.slice(0, 3)) await load(frameSrc(s, s.t0)); return true; })();
})();
