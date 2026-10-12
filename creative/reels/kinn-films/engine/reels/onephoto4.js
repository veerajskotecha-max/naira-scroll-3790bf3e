// I ASKED FOR ONE PHOTO, the final cut on track D from its first note. Bars of 2.608 s, every cut on a kick and every graphic on
// a hit: the ask over four posed shots (the Naira line on the bass's entry), the gallery in the breakdown, twelve videos one a
// beat, the fan frozen on its hit, her laugh in the silence, a clap that snaps the camera's focus onto her, the shutter on the
// drop opening on the best frame in the shoot, sparkles on the jewellery with the drum roll, the profile on the heavy kick,
// comments on the snares, and her reply on the sub hit.
window.REEL = (() => {
  const C = D.cues, DROP = C.drop, [G0, G1] = C.gap, [FAN0] = C.fan, [V0] = C.vid, FZ = C.freeze, CLAP = C.clap, ROLL = C.roll;
  const sh = (id, extra = {}) => ({ shot: id, ...extra });
  const OPEN = [['a1', 0], ['a2', 2], ['a3', 4], ['a4', 6]];
  const VIDS = D.shots.filter(s => /^v\d\d$/.test(s.id));
  const GAL = '../img/gallery4.jpg', TH = [106, 526];              // the gallery, and the centre of thumbnail 1 (VIDEO 01)
  const FAN = [850, 1400], FR = 400;                                // the fan on its freeze frame (BD3B07AF 22.60)
  const HOOP = [290, 965], RING = [520, 1370];                       // in the DP frame (62379666 4.00), source px
  const fb = face(SH.dp, DROP) || [328, 564, 814, 1150];
  const DPF = [(fb[0] + fb[2]) / 2, (fb[1] + fb[3]) / 2 + .1 * (fb[3] - fb[1])], DPS = 1.75 * (fb[3] - fb[1]);   // DP crop centre and size
  const DPC = { x: 540, y: 655, r: 290 };
  const SH0 = DROP, SH1 = B(30), SH2 = B(31);                     // the DP holds through bar 7's roll, settles on its beat 4
  let me1, me2, bfDots, bfMsg, ntf, cap, tap, rec, recN, fanCap, pend, shutT, shutB, newdp, toast, cms = [], rep, cta, brk;
  const vidAt = t => { let k = -1; VIDS.forEach((s, i) => { if (t >= s.t0 - 1e-6) k = i; }); return k; };
  function dpLayer(t) {                                             // full frame with a slow push, then eased into the circle
    const p = P(t, SH1, SH2 - SH1, 'io');
    const r = lerp(1120, DPC.r, p), cx = lerp(540, DPC.x, p), cy = lerp(960, DPC.y, p);
    const rect = { x: lerp(0, DPC.x - DPC.r, p), y: lerp(0, DPC.y - DPC.r, p), w: lerp(W, 2 * DPC.r, p), h: lerp(H, 2 * DPC.r, p) };
    const zc = (2 * DPC.r / DPS) / Math.max(2 * DPC.r / W, 2 * DPC.r / H);   // in the circle: DPS source px across
    const push = t < SH1 ? lerp(1.0, 1.07, P(t, SH0, SH1 - SH0, 'out')) : lerp(1.07, zc, p);
    return sh('dp', { rect, circ: { x: cx, y: cy, r }, focus: DPF, z: push, nokick: true });
  }
  function heart(c, x, y, s, rot, col) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = col; c.beginPath();
    c.moveTo(0, 6); c.bezierCurveTo(-14, -6, -8, -18, 0, -9); c.bezierCurveTo(8, -18, 14, -6, 0, 6); c.fill(); c.restore();
  }
  return {
    init() {
      const st = document.createElement('style'); st.textContent = `
        .ntf { position:absolute; left:40px; width:1000px; top:236px; box-sizing:border-box; display:flex; align-items:center; gap:24px; padding:24px 30px;
          background:rgba(251,243,236,.97); border-radius:34px; box-shadow:0 14px 34px rgba(26,22,20,.35); font-family:Jost,'Noto Color Emoji'; color:#1A1614; }
        .ntf .ic { flex:none; width:76px; height:76px; border-radius:18px; background:#FFBDA8; display:flex; align-items:center; justify-content:center; font-size:40px; }
        .ntf .tx { flex:1; font-size:36px; font-weight:500; line-height:1.25; } .ntf .tx b { display:block; font-weight:700; }
        .ntf .tm { align-self:flex-start; font-size:26px; color:#6B625D; }
        .bub .msg { font-size:50px; }
        .bub.bf .dots { background:#FBF3EC; border-radius:40px 40px 40px 10px; }
        .tap { position:absolute; width:150px; height:150px; margin:-75px 0 0 -75px; border-radius:50%; border:8px solid #FBF3EC; background:rgba(251,243,236,.25); }
        .shut { position:absolute; left:0; width:1080px; height:960px; background:#1A1614; }
        .toastw { position:absolute; left:0; width:1080px; top:236px; display:flex; justify-content:center; }
        .toast { display:flex; align-items:center; gap:16px; padding:14px 32px 14px 16px; background:#1A1614; color:#FBF3EC; border-radius:999px;
          font-family:Jost; font-weight:500; font-size:32px; box-shadow:0 12px 30px rgba(26,22,20,.3); white-space:nowrap; }
        .toast i { display:flex; width:46px; height:46px; border-radius:50%; background:#99B4AF; color:#1A1614; align-items:center; justify-content:center;
          font-style:normal; font-weight:700; font-size:28px; }
        .cm { position:absolute; left:80px; width:920px; display:flex; align-items:center; gap:22px; font-family:Jost,'Noto Color Emoji'; transform-origin:0 50%; }
        .cm .av { flex:none; width:72px; height:72px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:30px;
          color:#1A1614; }
        .cm .tx { font-size:39px; font-weight:500; color:#1A1614; line-height:1.25; white-space:nowrap; }
        .cm .tx b { font-weight:600; margin-right:12px; }
        .cm .lk { margin-left:auto; font-size:30px; color:#C9B9AF; }
        .cm.rep { left:170px; width:830px; }
        .cm.rep .tx span { background:#FFBDA8; padding:6px 18px 8px; border-radius:20px; }
        .brk { position:absolute; left:0; top:0; }
        .brk i { position:absolute; width:70px; height:70px; border:0 solid #FBF3EC; filter:drop-shadow(0 0 6px rgba(255,189,168,.9)); }
        .brk i:nth-child(1) { left:0; top:0; border-left-width:7px; border-top-width:7px; }
        .brk i:nth-child(2) { right:0; top:0; border-right-width:7px; border-top-width:7px; }
        .brk i:nth-child(3) { left:0; bottom:0; border-left-width:7px; border-bottom-width:7px; }
        .brk i:nth-child(4) { right:0; bottom:0; border-right-width:7px; border-bottom-width:7px; }`;
      document.head.appendChild(st);
      me1 = el('bub me', '<span class="msg">bas ek photo le le,<br>DP ke liye 🥺</span>', $('ui'), { right: '60px', top: '960px' });
      me2 = el('bub me', '<span class="msg">naira wale hoops pehne hain,<br>dikhne chahiye ✨</span>', $('ui'), { right: '60px', top: '1150px' });
      bfDots = el('bub bf', '<span class="who">bestie</span><div class="dots"><i></i><i></i><i></i></div>', $('ui'), { left: '60px', top: '1350px' });
      bfMsg = el('bub', '<span class="who">bestie</span><span class="msg">haan haan, done ✅</span>', $('ui'), { left: '60px', top: '1350px' });
      ntf = el('ntf', '<div class="ic">📹</div><div class="tx"><b>bestie</b>sent you 27 videos</div><div class="tm">now</div>', $('ui'));
      cap = el('nc bl', '<span>27 videos. 0 photos.</span>', $('ui'), { top: '880px', fontSize: '80px' });
      tap = el('tap', '', $('ui'), { left: TH[0] + 'px', top: TH[1] + 'px' });
      rec = el('rec', '<span><span class="dot"></span>REC</span><span class="n">VIDEO 01/27</span>', $('ui')); recN = rec.querySelector('.n');
      fanCap = el('nc bl', '<span>…she brought a FAN?? 😭</span>', $('ui'), { top: '560px', fontSize: '74px' });
      pend = el('nc', '<span>DP status: still pending ⏳</span>', $('ui'), { top: '1250px', fontSize: '56px' });
      shutT = el('shut', '', $('ui'), { top: '0px' }); shutB = el('shut', '', $('ui'), { top: '960px' });
      newdp = el('serif', 'new DP ✨', $('ui'), { top: '985px', fontSize: '112px', color: '#1A1614', filter: 'none' });
      toast = el('toastw', '<div class="toast"><i>✓</i>profile photo updated</div>', $('ui'));
      [['B', '#FFBDA8', 'bestie', 'worth the 27 videos 💅', 1135], ['M', '#99B4AF', 'mumma', 'nazar na lage 🧿', 1230], ['S', '#50726A', 'stranger', 'HOOPS?? kahan se 😭', 1325]]
        .forEach(([a, bg, who, txt, top]) => cms.push(el('cm', `<div class="av" style="background:${bg};color:${bg === '#50726A' ? '#FBF3EC' : '#1A1614'}">${a}</div>
          <div class="tx"><b>${who}</b>${txt}</div><div class="lk">♡</div>`, $('ui'), { top: top + 'px' })));
      rep = el('cm rep', '<div class="av"></div><div class="tx"><b>me</b><span>@nairaflore ✨ woven gold hoops</span></div>', $('ui'), { top: '1425px' });
      cta = el('nc bl', '<span>tag your bestie 📸</span>', $('ui'), { top: '1545px', fontSize: '56px' });
      brk = el('brk', '<i></i><i></i><i></i><i></i>', $('ui'));
    },
    plan(t) {
      if (t < B(8)) { let id = 'a1'; for (const [s, k] of OPEN) if (t >= B(k) - 1e-6) id = s; return { layers: [sh(id)] }; }
      if (t < V0) {                                                    // the gallery: slides up, drifts, a tap on video 1, zooms in
        return { layers: [], extra: [GAL], pre: (c, tt) => {
          const up = lerp(700, 0, P(tt, B(8), .45)), drift = -40 * P(tt, B(8) + .45, B(11) - B(8) - .45, 'io');
          const u = E.in(clamp((tt - B(11.35)) / (V0 - B(11.35)))), z = lerp(1, 5.6, u);
          c.fillStyle = '#1A1614'; c.fillRect(0, 0, W, H); c.save();
          c.translate(lerp(TH[0], 540, u), lerp(TH[1] + up + drift, 960, u)); c.scale(z, z); c.translate(-TH[0], -TH[1]);
          c.drawImage(im(GAL), 0, 0, W, H); c.restore();
        } };
      }
      if (t < FAN0) return { layers: [sh(VIDS[Math.max(0, vidAt(t))].id)] };
      if (t < B(26)) return { layers: [sh('vfan')] };
      if (t < SH0) return { layers: [sh('vlaugh')] };
      if (t < SH1) return { layers: [dpLayer(t)] };
      const p = P(t, SH1, SH2 - SH1, 'io');
      return { bg: '#FBF3EC', layers: [dpLayer(t)], pre: (c) => {    // a soft shadow under the photo as it settles into the circle
        if (p <= 0) return; const L = dpLayer(t); c.save(); c.fillStyle = '#FBF3EC'; c.shadowColor = `rgba(26,22,20,${(.3 * p).toFixed(3)})`; c.shadowBlur = 60; c.shadowOffsetY = 24;
        c.beginPath(); c.arc(L.circ.x, L.circ.y, L.circ.r, 0, Math.PI * 2); c.fill(); c.restore();
      } };
    },
    draw(t, K) {
      const beatPh = (((t - (D.off || 0)) / D.beat) % 1 + 1) % 1, pulse = Math.exp(-beatPh * 6);
      // ---- the ask: on screen from frame 1; the Naira line lands with the bass
      tf(me1, { op: t < B(8) ? 1 : 0 });
      tf(me2, t < B(4) ? { op: 0 } : popT(t, B(4), B(8), { from: .7, dur: .45, fo: .1 }));
      const dots = t >= B(5.25) && t < B(6.25); tf(bfDots, { op: dots ? 1 : 0 });
      if (dots) bfDots.querySelectorAll('i').forEach((e, i) => { e.style.transform = `translateY(${(-8 * Math.max(0, Math.sin(t * 9 - i * .9))).toFixed(1)}px)`; });
      tf(bfMsg, popT(t, B(6.25), B(8), { from: .7, dur: .45, fo: .1 }));
      tf(ntf, { op: win(t, B(7.5), B(9.5), .1, .2), y: lerp(-260, 0, P(t, B(7.5), .45, 'back')) });
      // ---- the gallery
      tf(cap, popT(t, B(9), B(11.3), { from: .7, dur: .45, fo: .12 }));
      const tp = t >= B(11) && t < B(11.7); tf(tap, { op: tp ? 1 - P(t, B(11) + .1, .4) : 0, s: lerp(.4, 1.2, P(t, B(11), .35)) });
      // ---- the videos: REC and the counter (the fan is video 19, her laugh 27)
      const ro = t >= V0 && t < SH0; tf(rec, { op: ro ? 1 : 0 });
      if (ro) {
        const n = t >= B(26) ? 27 : t >= FAN0 ? 19 : vidAt(t) + 1;
        recN.textContent = `VIDEO ${String(n).padStart(2, '0')}/27`; rec.querySelector('.dot').style.opacity = beatPh < .5 ? 1 : .25;
      }
      // ---- video 19: the fan
      if (t >= FZ && t < B(26)) {
        const L = sh('vfan'), [x, y] = toScr(L, t, FAN[0], FAN[1], K), k = xm(kl(L, K), t).a, r = FR * k + 10, p = P(t, FZ, D.beat / 2, 'io');
        fx.save(); fx.lineCap = 'round';
        fx.strokeStyle = '#FFBDA8'; fx.lineWidth = 22; fx.beginPath(); fx.arc(x, y, r, -Math.PI * .6, -Math.PI * .6 + Math.PI * 2 * p); fx.stroke();
        fx.strokeStyle = '#FBF3EC'; fx.lineWidth = 9; fx.beginPath(); fx.arc(x, y, r, -Math.PI * .6, -Math.PI * .6 + Math.PI * 2 * p); fx.stroke(); fx.restore();
      }
      tf(fanCap, popT(t, FZ, B(26), { from: .7, dur: .4, fo: .08 }));
      // ---- her laugh in the silence: still no DP
      tf(pend, popT(t, B(26), SH0 - .06, { from: .7, dur: .3, fo: .06 }));
      // ---- the clap in the silence: the camera's focus snaps onto her face
      const bo = t >= CLAP && t < SH0 ? 1 : 0; brk.style.display = bo ? '' : 'none';
      if (bo) {
        const L = sh('vlaugh'), fbx = face(SH.vlaugh, t) || [300, 420, 780, 1000];
        const [ax, ay] = toScr(L, t, fbx[0], fbx[1]), [bx, by] = toScr(L, t, fbx[2], fbx[3]);
        const g = lerp(1.35, 1, P(t, CLAP, .14, 'out')), cxb = (ax + bx) / 2, cyb = (ay + by) / 2, wb = (bx - ax) * 1.18 * g, hb = (by - ay) * 1.12 * g;
        Object.assign(brk.style, { left: (cxb - wb / 2).toFixed(1) + 'px', top: (cyb - hb / 2).toFixed(1) + 'px', width: wb.toFixed(1) + 'px', height: hb.toFixed(1) + 'px',
          opacity: Math.min(1, P(t, CLAP, .06) * 1).toFixed(3) });
      }
      // ---- the shutter: closes into the drop, opens on the photo
      const close = P(t, SH0 - .08, .08, 'in'), open = P(t, SH0 + .03, .16, 'out'), sv = t >= SH0 - .08 && t < SH0 + .2;
      const cov = sv ? (t < SH0 ? close : 1 - open) : 0;
      tf(shutT, { op: cov > 0 ? 1 : 0, y: -960 * (1 - cov) }); tf(shutB, { op: cov > 0 ? 1 : 0, y: 960 * (1 - cov) });
      if (t >= SH0 + .05 && t < SH2) {                                 // glints on the hoop and the ring while the photo is full frame
        const L = dpLayer(t), [hx, hy] = toScr(L, t, HOOP[0], HOOP[1]), [rx, ry] = toScr(L, t, RING[0], RING[1]);
        twinkle(fx, t, hx + 24, hy - 30, 26, 1); twinkle(fx, t, rx + 20, ry - 26, 22, 2.4);
        ROLL.forEach((ta, i) => {                                        // each hit of the roll flashes a piece: hoop, kada, hoop, kada
          const a = t - ta; if (a < 0 || a > .45) return; const [px, py] = i % 2 ? [rx + 20, ry - 26] : [hx + 24, hy - 30], e = Math.exp(-a * 7);
          fx.save(); fx.globalAlpha = e; fx.fillStyle = '#FBF3EC'; fx.shadowColor = '#FFBDA8'; fx.shadowBlur = 28; star4(fx, px, py, 34 + 40 * e, a * 3 + i); fx.restore();
          burst(fx, t, ta, px, py, { n: 10, speed: 420, life: .4, size: 11, seed: 70 + i, grav: 200 });
        });
      }
      // ---- the DP: a story ring in sage and blush that breathes on the beat
      const dpo = P(t, SH2 - .05, .3);
      if (dpo > 0) {
        const L = dpLayer(t), R = L.circ.r, rot = (t - SH2) * .8;
        fx.save(); fx.globalAlpha = dpo; fx.lineWidth = 14 + 6 * pulse; fx.shadowColor = 'rgba(255,189,168,.9)'; fx.shadowBlur = 8 + 22 * pulse;
        const g = fx.createConicGradient(rot, L.circ.x, L.circ.y); g.addColorStop(0, '#FFBDA8'); g.addColorStop(.35, '#99B4AF'); g.addColorStop(.7, '#50726A'); g.addColorStop(1, '#FFBDA8');
        fx.strokeStyle = g; fx.beginPath(); fx.arc(L.circ.x, L.circ.y, R + 22, 0, Math.PI * 2 * P(t, SH2 - .05, .45, 'io')); fx.stroke(); fx.restore();
        twinkle(fx, t, DPC.x + DPC.r * .82, DPC.y - DPC.r * .70, 28, 3); twinkle(fx, t, DPC.x - DPC.r * .92, DPC.y + DPC.r * .28, 20, 4);
      }
      tf(newdp, popT(t, SH2 + .05, 99, { from: .75, dur: .5, rise: 24 }));
      tf(toast, { op: win(t, B(32), 99, .14, 0), y: lerp(-40, 0, P(t, B(32), .4, 'back')) });
      // likes: hearts float up off the photo on the heavy kick
      if (t >= B(32) && t < B(32) + 2.2) {
        const R = rng(321);
        for (let i = 0; i < 16; i++) {
          const t0 = B(32) + i * .07, a = t - t0, life = 1.4 + R() * .5, sx = DPC.x + DPC.r * (.55 + R() * .35), sy = DPC.y + DPC.r * (.2 + R() * .5);
          const drift = (R() - .5) * 120, sz = 2.2 + R() * 2.2, col = ['#FFBDA8', '#FFBDA8', '#99B4AF', '#50726A'][Math.floor(R() * 4)];
          if (a < 0 || a > life) continue; const k = a / life;
          fx.globalAlpha = Math.min(1, a / .12) * (1 - k) ** 1.2;
          heart(fx, sx + drift * k + Math.sin(a * 6 + i) * 18, sy - 520 * E.out(k), sz * (1 - .3 * k), (R() - .5) * .5, col);
        }
        fx.globalAlpha = 1;
      }
      // ---- the comments, then her reply on the heaviest hit
      cms.forEach((e, i) => tf(e, popT(t, B(33 + i), 99, { from: .85, dur: .4, rise: 18 })));
      const rq = popT(t, B(36), 99, { from: .85, dur: .4, rise: 18 }); tf(rep, rq);
      if (rq.op > 0) {                                                 // her avatar is her new DP
        const av = rep.querySelector('.av').getBoundingClientRect(), d = Math.min(av.width, av.height), ax = av.left + av.width / 2, ay = av.top + av.height / 2;
        fx.save(); fx.globalAlpha = rq.op; fx.beginPath(); fx.arc(ax, ay, d / 2, 0, Math.PI * 2); fx.clip();
        fx.drawImage(im(fURL(SH.dp, t)), DPF[0] - DPS / 2, DPF[1] - DPS / 2, DPS, DPS, ax - d / 2, ay - d / 2, d, d); fx.restore();
        fx.save(); fx.globalAlpha = rq.op; fx.strokeStyle = '#FFBDA8'; fx.lineWidth = 4; fx.beginPath(); fx.arc(ax, ay, d / 2 + 4, 0, Math.PI * 2); fx.stroke(); fx.restore();
        burst(fx, t, B(36), 640, 1460, { n: 24, speed: 650, life: .7, size: 15, seed: 36, grav: 300 });
      }
      tf(cta, popT(t, B(38), 99, { from: .75, dur: .45 }));
    }
  };
})();
