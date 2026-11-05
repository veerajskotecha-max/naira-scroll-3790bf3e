// fx7.js: procedural colour for the colour campaign, drawn on the engine's canvas. Deterministic: every particle's
// position is a closed-form function of t (seeded random, exponential drag, gravity), so any frame renders alone and
// a 4K pass matches the proof pass exactly. Layers: 'under' (after the footage, before dims) and 'over' (after flashes,
// before the type). Kinds:
//   powder  a gulal burst or drift: dense grains plus soft cloud puffs, expanding and settling
//   petals  falling petals; near ones (depth > .7) are big and defocused, like petals passing the lens
//   wipe    a wall of powder that sweeps across and carries the cut (the next shot shows behind it)
//   glow    a soft coloured light that breathes (a colour world behind a piece)
(() => {
  const AD = window.AD, W = 1080, H = 1920, DPR = AD.dpr || 1;
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, v) => { const u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  // ---- sprites, cached per colour ----
  const sprites = new Map();
  function blob(c, soft) {                                        // a soft round grain; soft 1 = a cloud puff
    const k = c + soft; if (sprites.has(k)) return sprites.get(k);
    const S = 64, cv = Object.assign(document.createElement('canvas'), { width: S, height: S }), g = cv.getContext('2d');
    const [r, gg, b] = hex(c), gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(soft ? .25 : .55, `rgba(${r},${gg},${b},${soft ? .55 : .9})`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, S, S); sprites.set(k, cv); return cv;
  }
  function petal(c) {                                             // one petal, lit from the top left
    const k = 'p' + c; if (sprites.has(k)) return sprites.get(k);
    const S = 96, cv = Object.assign(document.createElement('canvas'), { width: S, height: S }), g = cv.getContext('2d');
    const [r, gg, b] = hex(c); g.translate(S / 2, S / 2);
    const p = new Path2D('M0 -40C22 -30 30 -4 20 18C13 32 4 40 0 42C-4 40 -13 32 -20 18C-30 -4 -22 -30 0 -40Z');
    const gr = g.createLinearGradient(-30, -40, 30, 40);
    gr.addColorStop(0, `rgb(${Math.min(255, r + 40)},${Math.min(255, gg + 40)},${Math.min(255, b + 40)})`); gr.addColorStop(.6, `rgb(${r},${gg},${b})`);
    gr.addColorStop(1, `rgb(${r * .62 | 0},${gg * .62 | 0},${b * .62 | 0})`);
    g.fillStyle = gr; g.fill(p); g.strokeStyle = `rgba(${r * .5 | 0},${gg * .5 | 0},${b * .5 | 0},.35)`; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(0, -30); g.quadraticCurveTo(3, 4, 0, 36); g.stroke(); sprites.set(k, cv); return cv;
  }
  // ---- particle sets, built once per effect ----
  const built = new Map();
  function build(F, i) {
    if (built.has(i)) return built.get(i);
    const R = rng(F.seed ?? (i * 7919 + 13)), P = [], cols = F.colors;
    if (F.kind === 'powder') {
      const n = F.n ?? 900, [a0, a1] = F.angle ?? [0, 360];
      for (let j = 0; j < n; j++) {
        const cloud = R() < (F.cloud ?? .18), ang = (a0 + (a1 - a0) * R()) * Math.PI / 180, sp = (F.speed ?? 900) * (.25 + .75 * Math.pow(R(), .6));
        P.push({ x: F.x + (R() - .5) * (F.spread ?? 60), y: F.y + (R() - .5) * (F.spread ?? 60), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
          k: (F.drag ?? 2.6) * (cloud ? 1.6 : .8 + .5 * R()), g: (F.gravity ?? 160) * (cloud ? .25 : .7 + .6 * R()), c: cols[j % cols.length],
          r: cloud ? (F.cloudSize ?? 70) * (.6 + .8 * R()) : (F.size ?? 7) * (.4 + 1.2 * R()), grow: cloud ? 2.4 : .6, a: cloud ? .22 : .9 * (.5 + .5 * R()),
          life: (F.life ?? 2.4) * (.6 + .6 * R()), soft: cloud ? 1 : 0, d: R() * (F.stagger ?? .12) });
      }
    } else if (F.kind === 'petals') {
      const n = F.n ?? 40;
      for (let j = 0; j < n; j++) {
        const z = R();                                             // depth: 0 far and small, 1 at the lens
        P.push({ x: R() * (W + 200) - 100, y0: -120 - R() * H * (F.fill ?? 1), z, vy: (F.fall ?? 260) * (.55 + .9 * z), sw: 30 + 60 * R(), w: .8 + 1.4 * R(),
          ph: R() * 6.28, rot: R() * 6.28, vr: (R() - .5) * 2.4, flip: 1.2 + 2 * R(), c: cols[j % cols.length], s: (F.size ?? 34) * (.5 + 1.6 * z) });
      }
    } else if (F.kind === 'wipe') {
      const n = F.n ?? 1400;
      for (let j = 0; j < n; j++) {
        const cloud = R() < .3;
        P.push({ u: R(), v: R(), c: cols[j % cols.length], r: cloud ? 90 + 120 * R() : 6 + 14 * R(), a: cloud ? .5 : .95, soft: cloud ? 1 : 0, lag: R() * .35, curl: (R() - .5) * 2 });
      }
    }
    built.set(i, P); return P;
  }
  function powder(cx, F, P, t) {
    const T = t - F.t0, fade = F.t1 ? 1 - smooth(F.t1 - (F.fadeOut ?? .6), F.t1, t) : 1;
    cx.save(); cx.globalCompositeOperation = F.blend || 'source-over';
    for (const p of P) {
      const tau = T - p.d; if (tau <= 0 || tau > p.life) continue;
      const e = 1 - Math.exp(-p.k * tau), x = p.x + p.vx / p.k * e, y = p.y + p.vy / p.k * e + p.g / p.k * (tau - e / p.k);
      const u = tau / p.life, r = p.r * (1 + p.grow * Math.sqrt(u)), a = p.a * fade * Math.min(1, tau * 12) * (1 - u * u);
      if (a < .01) continue; cx.globalAlpha = a; cx.drawImage(blob(p.c, p.soft), x - r, y - r, 2 * r, 2 * r);
    }
    cx.restore();
  }
  function petals(cx, F, P, t) {
    const T = t - F.t0, fade = Math.min(smooth(0, F.fadeIn ?? .4, T), F.t1 ? 1 - smooth(F.t1 - (F.fadeOut ?? .5), F.t1, t) : 1);
    const order = P.map((p, j) => j).sort((a, b) => P[a].z - P[b].z);
    for (const j of order) {
      const p = P[j], y = p.y0 + p.vy * T; if (y < -150 || y > H + 150) continue;
      const x = p.x + p.sw * Math.sin(p.w * T + p.ph), fl = Math.cos(p.flip * T + p.ph), s = p.s;
      const blur = p.z > .7 ? (p.z - .7) * 40 * (F.defocus ?? 1) : (F.far ?? 0) * (.7 - p.z) * 10;
      cx.save(); cx.globalAlpha = fade * (.55 + .45 * Math.min(1, p.z * 1.6)); if (blur > .5) cx.filter = `blur(${(blur * DPR).toFixed(1)}px)`;   // canvas blur ignores the DPR transform
      cx.translate(x, y); cx.rotate(p.rot + p.vr * T); cx.scale(1, Math.max(.12, Math.abs(fl)));
      cx.drawImage(petal(p.c), -s / 2, -s / 2, s, s); cx.restore();
    }
  }
  function wipe(cx, F, P, t) {                                    // the front crosses from one side in F.d seconds
    const u = (t - F.t) / F.d; if (u < -.1 || u > 1.6) return;
    const dir = F.dir ?? 1, span = W + 700;
    cx.save(); cx.globalCompositeOperation = 'source-over';
    for (const p of P) {
      const front = (u - p.lag) * span - 350;                       // where this grain's front is, in px from the start side
      const band = 420 * p.u;                                       // grains spread behind the front
      let x = front - band; if (x < -350) continue;
      const life = clamp((u - p.lag) / 1.1, 0, 1); const a = p.a * Math.sin(Math.PI * clamp(life * 1.15, 0, 1));
      if (a < .01) continue;
      x = dir > 0 ? x : W - x; const y = p.v * H + p.curl * 140 * Math.sin(3.1 * u + p.u * 6);
      const r = p.r * (1 + 1.6 * life); cx.globalAlpha = a; cx.drawImage(blob(p.c, p.soft), x - r, y - r, 2 * r, 2 * r);
    }
    cx.restore();
  }
  function glow(cx, F, t) {
    const T = t - F.t0; if (T < 0 || (F.t1 && t > F.t1)) return;
    const a = F.a * smooth(0, .5, T) * (F.t1 ? 1 - smooth(F.t1 - .5, F.t1, t) : 1) * (1 + .12 * Math.sin(T * 1.7));
    const [r, g, b] = hex(F.color), gr = cx.createRadialGradient(F.x, F.y, 0, F.x, F.y, F.r);
    gr.addColorStop(0, `rgba(${r},${g},${b},${a})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    cx.save(); cx.globalCompositeOperation = F.blend || 'screen'; cx.fillStyle = gr; cx.fillRect(0, 0, W, H); cx.restore();
  }
  window.drawFX = (cx, t, layer) => {
    (AD.fx || []).forEach((F, i) => {
      if ((F.layer || 'over') !== layer) return;
      if (F.kind === 'glow') return glow(cx, F, t);
      if (F.kind === 'wipe') return wipe(cx, F, build(F, i), t);
      if (t < F.t0 || (F.t1 && t > F.t1)) return;
      const P = build(F, i); if (F.kind === 'powder') powder(cx, F, P, t); else if (F.kind === 'petals') petals(cx, F, P, t);
    });
  };
})();
