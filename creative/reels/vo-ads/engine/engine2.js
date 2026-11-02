// Ad engine v2. window.renderAt(t) draws the footage on a canvas and poses every overlay from keyframes, so any frame
// renders alone and the output never depends on wall-clock time. v2 adds clip reveals, drawn SVG strokes, counters,
// word-by-word captions, callouts that follow the piece, light leaks, harder whips, and a zoom through the brand flower
// into each end card. Data arrives as window.AD (tools/build2.py).
(() => {
  const AD = window.AD, W = 1080, H = 1920;
  const cv = document.getElementById('v'), cx = cv.getContext('2d');
  const cache = new Map();
  const load = src => {
    if (cache.has(src)) return cache.get(src);
    const p = new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('img ' + src)); im.src = src; });
    cache.set(src, p); if (cache.size > 120) cache.delete(cache.keys().next().value); return p;
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const E = {
    lin: u => u, io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
    out: u => 1 - Math.pow(1 - u, 3), in: u => u * u * u, step: u => (u < 1 ? 0 : 1),
    back: u => { const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); },
    expo: u => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * u)), sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  };
  const frameSrc = (sh, t) => {
    const m = AD.meta[sh.id]; const loc = (t - sh.t0) * (sh.speed || 1) + (sh.off || 0);
    const k = clamp(Math.floor(loc * m.fps + 1e-6), 0, m.n - 1);
    return `${AD.frames}/${sh.id}/f_${String(k + 1).padStart(4, '0')}.jpg`;
  };
  const zoomAt = (sh, t) => {
    const u = clamp((t - sh.t0) / (sh.t1 - sh.t0), 0, 1); const z = sh.zoom || [1, 1];
    let s = z[0] + (z[1] - z[0]) * u;
    if (sh.punch) { const p = clamp((t - sh.t0) / sh.punch[1], 0, 1); s *= 1 + (sh.punch[0] - 1) * (1 - E.out(p)); }
    return s;
  };
  let _sq = null; const sqCanvas = () => (_sq ||= Object.assign(document.createElement('canvas'), { width: 1080, height: 1080 }));
  function smear(im, x, y, w, h, bx, rot) {
    if (rot) { cx.translate(W / 2, H / 2); cx.rotate(rot); cx.translate(-W / 2, -H / 2); }
    if (!bx || Math.abs(bx) < 1) { cx.drawImage(im, x, y, w, h); return; }
    const n = 12, a0 = cx.globalAlpha;                           // whip: a directional smear with a touch of roll
    for (let i = 0; i < n; i++) { cx.globalAlpha = a0 / n; cx.drawImage(im, x + bx * (i / (n - 1) - .5), y, w, h); }
    cx.globalAlpha = a0;
  }
  function fblurAt(t) {
    const F = AD.fblur || []; if (!F.length || t <= F[0][0] || t >= F[F.length - 1][0]) return 0;
    for (let i = 1; i < F.length; i++) if (t < F[i][0]) { const u = (t - F[i - 1][0]) / (F[i][0] - F[i - 1][0]); return F[i - 1][1] + (F[i][1] - F[i - 1][1]) * E.io(u); }
    return 0;
  }
  function drawShot(sh, t, alpha, bx, rot) {
    return load(frameSrc(sh, t)).then(im => {
      const s = zoomAt(sh, t), ax = sh.ax ?? .5, ay = sh.ay ?? .5;
      cx.save(); cx.globalAlpha = alpha;
      if (AD.meta[sh.id].sq) {                                   // a 1:1 studio clip over a blurred copy of itself
        cx.filter = 'blur(38px)'; cx.drawImage(im, -420, 0, 1920, 1920); cx.filter = 'none';
        cx.fillStyle = 'rgba(251,243,236,.10)'; cx.fillRect(0, 0, W, H);
        const side = W * s, y0 = (sh.sqY ?? 420) - (side - W) * ay, x0 = -(side - W) * ax;
        const oc = sqCanvas(), ox = oc.getContext('2d'); ox.clearRect(0, 0, 1080, 1080); ox.drawImage(im, 0, 0, 1080, 1080);
        ox.globalCompositeOperation = 'destination-in';
        const m = ox.createLinearGradient(0, 0, 0, 1080); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(.16, 'rgba(0,0,0,1)'); m.addColorStop(.84, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
        ox.fillStyle = m; ox.fillRect(0, 0, 1080, 1080); ox.globalCompositeOperation = 'source-over';
        smear(oc, x0, y0, side, side, bx, rot);
      } else {
        const fb = fblurAt(t); if (fb > .3) cx.filter = `blur(${fb.toFixed(1)}px)`;
        const w = W * s, h = H * s; smear(im, -(w - W) * ax, -(h - H) * ay, w, h, bx, rot); cx.filter = 'none';
      }
      cx.restore();
    });
  }
  function drawMG(bg, t) {
    cx.fillStyle = bg.color; cx.fillRect(0, 0, W, H);
    for (const g of bg.glows || []) {
      const u = (t - (g.t0 ?? 0)) / ((g.t1 ?? AD.dur) - (g.t0 ?? 0)); if (u < 0 || u > 1) continue;
      const x = g.x[0] + (g.x[1] - g.x[0]) * E.io(u), y = g.y[0] + (g.y[1] - g.y[0]) * E.io(u);
      const a = g.a * Math.min(1, u * 6, (1 - u) * 6);
      const r = cx.createRadialGradient(x, y, 0, x, y, g.r); r.addColorStop(0, g.c.replace('A', a)); r.addColorStop(1, g.c.replace('A', 0));
      cx.fillStyle = r; cx.fillRect(0, 0, W, H);
    }
  }
  function drawLeaks(t) {                                         // warm light sweeping across on a section change
    for (const L of AD.leaks || []) {
      const u = (t - L.t) / L.d; if (u < 0 || u > 1) continue;
      const a = L.a * Math.sin(Math.PI * u), x = L.x0 + (L.x1 - L.x0) * E.io(u), y = L.y0 + (L.y1 - L.y0) * E.io(u);
      cx.save(); cx.globalCompositeOperation = 'screen';
      const g = cx.createRadialGradient(x, y, 0, x, y, L.r); g.addColorStop(0, L.c.replace('A', a)); g.addColorStop(.45, L.c.replace('A', a * .5)); g.addColorStop(1, L.c.replace('A', 0));
      cx.fillStyle = g; cx.fillRect(0, 0, W, H); cx.restore();
    }
  }
  // ---- the zoom through the flower: the end card shows through a flower-shaped hole that pops, then dives into a petal ----
  function irisAt(I, t) {
    const dt = t - I.t0; if (dt < 0) return { hide: true }; if (dt >= I.tz) return { done: true };
    let S;
    if (dt < I.tp) S = I.s0 * E.back(dt / I.tp);
    else if (dt < I.th) S = I.s0 + (I.s1 - I.s0) * E.sine((dt - I.tp) / (I.th - I.tp));
    else { const u = (dt - I.th) / (I.tz - I.th); S = I.s1 * Math.pow(I.s2 / I.s1, u * u); }
    return { S: Math.max(S, .5), rot: (I.r0 || 0) * (1 - E.out(clamp(dt / I.tz, 0, 1))) * Math.PI / 180 };
  }
  function flowerD(I, S, rot) {
    const c = Math.cos(rot), s = Math.sin(rot); let d = '';
    for (const sp of AD.flower) {
      for (let i = 0; i < sp.length; i += 2) {
        const dx = (sp[i] - I.cx) * S, dy = (sp[i + 1] - I.cy) * S;
        d += (i ? 'L' : 'M') + (I.ox + dx * c - dy * s).toFixed(1) + ' ' + (I.oy + dx * s + dy * c).toFixed(1);
      }
      d += 'Z';
    }
    return d;
  }
  // ---- overlays ----
  const els = [...document.querySelectorAll('[data-k]')].map(el => {
    const K = JSON.parse(el.dataset.k).sort((a, b) => a[0] - b[0]); const props = new Set(); K.forEach(k => Object.keys(k[1]).forEach(p => props.add(p)));
    return { el, K, props: [...props], paths: [...el.querySelectorAll(':scope > svg .draw, :scope > div > svg .draw')] };
  });
  els.forEach(o => o.paths.forEach(p => { const L = p.getTotalLength ? p.getTotalLength() : 1000; p.dataset.len = L; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; }));
  const val = (o, p, t) => {
    let a = null, b = null;
    for (const k of o.K) { if (!(p in k[1])) continue; if (k[0] <= t) a = k; else { b = k; break; } }
    if (!a) return b[1][p]; if (!b) return a[1][p];
    const u = E[b[2] || 'io'](clamp((t - a[0]) / (b[0] - a[0]), 0, 1)); return a[1][p] + (b[1][p] - a[1][p]) * u;
  };
  const inr = n => { n = Math.round(n); const s = String(Math.abs(n)); if (s.length <= 3) return s; const last = s.slice(-3); const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ','); return rest + ',' + last; };
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
      if ('cl' in v) o.el.style.clipPath = v.cl >= 99.9 ? 'none' : `inset(-60px ${(100 - v.cl).toFixed(2)}% -60px -60px)`;     // wipe from the left
      if ('ct' in v) o.el.style.clipPath = v.ct >= 99.9 ? 'none' : `inset(${(100 - v.ct).toFixed(2)}% -60px -60px -60px)`;   // rise from the bottom
      if ('d' in v) for (const p of o.paths) p.style.strokeDashoffset = (+p.dataset.len) * (1 - clamp(v.d, 0, 1));
    }
    for (const c of document.querySelectorAll('[data-count]')) {           // prices that count
      const C = JSON.parse(c.dataset.count); let a = null, b = null;
      for (const k of C.k) { if (k[0] <= t) a = k; else { b = k; break; } }
      const n = !a ? b[1] : !b ? a[1] : a[1] + (b[1] - a[1]) * E[b[2] || 'expo'](clamp((t - a[0]) / (b[0] - a[0]), 0, 1));
      const txt = (C.pre || '') + inr(n) + (C.post || ''); if (c.textContent !== txt) c.textContent = txt;
    }
    for (const s of document.querySelectorAll('[data-swap]')) {
      const V = JSON.parse(s.dataset.swap); let txt = V[0][1]; for (const [tt, x] of V) if (t >= tt) txt = x;
      if (s.innerHTML !== txt) s.innerHTML = txt;
    }
    for (const b of document.querySelectorAll('[data-bob]')) {             // typing dots
      const B = JSON.parse(b.dataset.bob), u = t - B.t0;
      const y = u >= 0 && t < B.t1 ? -B.a * Math.max(0, Math.sin(2 * Math.PI * u / B.p - B.ph)) : 0;
      b.style.transform = `translateY(${y.toFixed(1)}px)`;
    }
    for (const c of document.querySelectorAll('.cap2')) {              // captions: each word rises in as it is said
      const lines = JSON.parse(c.dataset.lines); let cur = -1;
      lines.forEach((ln, i) => { if (t >= ln.t0 - .08 && t < ln.t1 + .2) cur = i; });
      if (cur < 0) { c.style.visibility = 'hidden'; continue; }
      const ln = lines[cur];
      if (c.dataset.cur !== String(cur)) { c.dataset.cur = cur; c.innerHTML = ln.w.map(w => `<span class="wd${w[3] ? ' em' : ''}">${w[2]}</span>`).join(' '); c.classList.toggle('dark', !!ln.dark); }
      c.style.visibility = 'visible';
      const out = clamp((t - ln.t1 - .08) / .12, 0, 1);
      [...c.children].forEach((s, i) => {
        const w = ln.w[i], u = E.out(clamp((t - w[0] + .06) / .16, 0, 1));
        s.style.opacity = (u * (1 - out)).toFixed(3);
        s.style.transform = `translateY(${((1 - u) * 22 - out * 12).toFixed(1)}px) scale(${(.86 + .14 * u).toFixed(3)})`;
        s.style.filter = u < .99 ? `blur(${((1 - u) * 5).toFixed(2)}px)` : 'none';
        s.classList.toggle('on', t >= w[0] - .02 && t < w[1] + .05);
      });
    }
    for (const g of document.querySelectorAll('[data-callout]')) {     // a line from a card to the piece, following it
      const C = JSON.parse(g.dataset.callout), tr = C.track; let p = tr[0];
      if (t <= tr[0][0]) p = tr[0]; else if (t >= tr[tr.length - 1][0]) p = tr[tr.length - 1];
      else for (let i = 1; i < tr.length; i++) if (t < tr[i][0]) { const u = (t - tr[i - 1][0]) / (tr[i][0] - tr[i - 1][0]); p = [t, tr[i - 1][1] + (tr[i][1] - tr[i - 1][1]) * u, tr[i - 1][2] + (tr[i][2] - tr[i - 1][2]) * u]; break; }
      const vis = t >= C.t0 && t < C.t1; g.style.visibility = vis ? 'visible' : 'hidden'; if (!vis) continue;
      const din = E.out(clamp((t - C.t0) / .3, 0, 1)), dout = clamp((C.t1 - t) / .18, 0, 1);
      const [ax, ay] = C.from, x = ax + (p[1] - ax) * din, y = ay + (p[2] - ay) * din;
      const ln = g.querySelector('line'); ln.setAttribute('x1', ax); ln.setAttribute('y1', ay); ln.setAttribute('x2', x); ln.setAttribute('y2', y);
      g.style.opacity = dout;
      const dot = g.querySelector('.dot'), ring = g.querySelector('.ring');
      const pop = E.back(clamp((t - C.t0 - .22) / .26, 0, 1));
      const R = C.r || 11;                                              // v3 passes a smaller dot
      dot.setAttribute('cx', p[1]); dot.setAttribute('cy', p[2]); dot.setAttribute('r', Math.max(0, R * pop));
      const ph = ((t - C.t0 - .3) % .9 + .9) % .9 / .9;                // a ring that keeps pulsing outwards
      ring.setAttribute('cx', p[1]); ring.setAttribute('cy', p[2]); ring.setAttribute('r', R * 1.27 + R * 3.1 * ph); ring.style.opacity = t > C.t0 + .3 ? (1 - ph) * .9 : 0;
    }
  }
  window.renderAt = async t => {
    const tasks = [];
    cx.clearRect(0, 0, W, H);
    for (const b of AD.bg.filter(b => t >= b.t0 && t < b.t1)) drawMG(b, t);
    for (const sh of AD.shots.filter(s => t >= s.t0 && t < s.t1)) {
      let a = 1, bx = 0, rot = 0; const dir = sh.dir || 1;
      if (sh.whip) { const u = clamp((t - sh.t0) / sh.whip, 0, 1); bx = 420 * (1 - E.out(u)) * dir; rot = .02 * (1 - E.out(u)) * dir; }
      if (sh.whipOut) { const u = clamp((t - (sh.t1 - sh.whipOut)) / sh.whipOut, 0, 1); if (u > 0) { bx = -420 * E.in(u) * dir; rot = -.02 * E.in(u) * dir; } }
      if (sh.fadeIn) a *= clamp((t - sh.t0) / sh.fadeIn, 0, 1);
      if (sh.fadeOut) a *= clamp((sh.t1 - t) / sh.fadeOut, 0, 1);
      await drawShot(sh, t, a, bx, rot);
    }
    for (const d of AD.dim || []) {
      if (t < d.t0 || t >= d.t1) continue;
      const a = d.a * Math.min(1, (t - d.t0) / .25, (d.t1 - t) / .25);
      cx.fillStyle = `rgba(26,22,20,${a})`; cx.fillRect(0, d.y0 ?? 0, W, (d.y1 ?? H) - (d.y0 ?? 0));
    }
    drawLeaks(t);
    for (const f of AD.flash || []) { const u = (t - f.t) / f.d; if (u >= 0 && u < 1) { cx.fillStyle = `rgba(251,243,236,${(f.a || .8) * (1 - E.out(u))})`; cx.fillRect(0, 0, W, H); } }
    const irises = (AD.iris || []).map(I => [I, irisAt(I, t)]);
    for (const [I, st] of irises) {                               // a blush rim just outside the hole, on the canvas below it
      if (st.hide || st.done) continue;
      cx.save(); cx.lineJoin = 'round'; cx.lineWidth = I.rim || 18; cx.strokeStyle = '#FFBDA8';
      cx.shadowColor = 'rgba(255,189,168,.95)'; cx.shadowBlur = 34; cx.stroke(new Path2D(flowerD(I, st.S, st.rot))); cx.restore();
    }
    pose(t);
    for (const [I, st] of irises) {
      const el = document.getElementById(I.el);
      el.style.clipPath = st.hide ? 'path("M0 0Z")' : st.done ? 'none' : `path("${flowerD(I, st.S, st.rot)}")`;
    }
    for (const im of document.querySelectorAll('img[data-clip]')) {
      const id = im.dataset.clip, m = AD.meta[id], t0 = +im.dataset.t0;
      const k = clamp(Math.floor((t - t0) * m.fps * (+im.dataset.speed || 1)), 0, m.n - 1);
      const src = `${AD.frames}/${id}/f_${String(k + 1).padStart(4, '0')}.jpg`;
      if (!im.src.endsWith(src.split('/').slice(-2).join('/'))) { im.src = src; tasks.push(im.decode().catch(() => {})); }
    }
    await Promise.all(tasks); await document.fonts.ready; return true;
  };
  window.ready = (async () => { await document.fonts.ready; for (const s of AD.shots.slice(0, 3)) await load(frameSrc(s, s.t0)); return true; })();
})();
