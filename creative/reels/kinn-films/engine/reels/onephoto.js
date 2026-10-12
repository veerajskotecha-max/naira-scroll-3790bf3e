// I ASKED FOR ONE PHOTO : she asks her friend for one photo for her DP; the friend sends 27 videos, which is exactly what this
// shoot is. Her gallery of the 27 real clips holds on the song's silence, zooms into video 1 on the riser, and all 27 fire on
// the drop, one per eighth note under a REC counter. Video 19 freezes on the fan. Her laugh becomes the new DP.
window.REEL = (() => {
  const C = D.cues, [G0, G1] = C.gap, DROP = C.drop, [F0, F1] = C.fan;
  const sh = (id, extra = {}) => ({ shot: id, ...extra });
  const OB = D.shots.filter(s => s.id.startsWith('ob'));
  const GAL = '../img/gallery.jpg', TH = [106, 526];             // the gallery, and the centre of thumbnail 1 on it
  const FAN = [850, 1400], FR = 400, FZ = F0 + .3;               // the fan on its freeze frame (BD3B07AF 22.60), held from FZ
  const O40 = SH.o40, DPF = O40.map[1][0];                       // the laugh freezes here and becomes the DP
  const DPC = { x: 540, y: 760, r: 330 };
  let me, bfDots, bfMsg, ntf, cap, tap, rec, recN, fanCap, pend, ring, newdp, shot24, hnd;
  const obAt = t => { let k = -1; OB.forEach((s, i) => { if (t >= s.t0 - 1e-6) k = i; }); return k; };
  return {
    init() {
      const st = document.createElement('style'); st.textContent = `
        .ntf { position:absolute; left:40px; width:1000px; top:236px; box-sizing:border-box; display:flex; align-items:center; gap:24px; padding:24px 30px;
          background:rgba(251,243,236,.97); border-radius:34px; box-shadow:0 14px 34px rgba(26,22,20,.35); font-family:Jost,'Noto Color Emoji'; color:#1A1614; }
        .ntf .ic { flex:none; width:76px; height:76px; border-radius:18px; background:#FFBDA8; display:flex; align-items:center; justify-content:center; font-size:40px; }
        .ntf .tx { flex:1; font-size:36px; font-weight:500; line-height:1.25; } .ntf .tx b { display:block; font-weight:700; }
        .ntf .tm { align-self:flex-start; font-size:26px; color:#6B625D; }
        .bub.bf .dots { background:#FBF3EC; border-radius:40px 40px 40px 10px; }
        .tap { position:absolute; width:150px; height:150px; margin:-75px 0 0 -75px; border-radius:50%; border:8px solid #FBF3EC; background:rgba(251,243,236,.25); }`;
      document.head.appendChild(st);
      me = el('bub me', '<span class="msg">bas ek photo le le,<br>DP ke liye 🥺</span>', $('ui'), { right: '60px', top: '1090px' });
      bfDots = el('bub bf', '<span class="who">bestie</span><div class="dots"><i></i><i></i><i></i></div>', $('ui'), { left: '60px', top: '1330px' });
      bfMsg = el('bub', '<span class="who">bestie</span><span class="msg">haan done ✅</span>', $('ui'), { left: '60px', top: '1330px' });
      ntf = el('ntf', '<div class="ic">📹</div><div class="tx"><b>bestie</b>sent you 27 videos</div><div class="tm">now</div>', $('ui'));
      cap = el('nc bl', '<span>27 videos. 0 photos.</span>', $('ui'), { top: '880px', fontSize: '80px' });
      tap = el('tap', '', $('ui'), { left: TH[0] + 'px', top: TH[1] + 'px' });
      rec = el('rec', '<span><span class="dot"></span>REC</span><span class="n">VIDEO 01/27</span>', $('ui')); recN = rec.querySelector('.n');
      fanCap = el('nc bl', '<span>…she brought a FAN?? 😭</span>', $('ui'), { top: '560px', fontSize: '74px' });
      pend = el('nc', '<span>DP status: still pending ⏳</span>', $('ui'), { top: '1250px', fontSize: '56px' });
      ring = el('dpring', '', $('ui'), { left: DPC.x - DPC.r + 'px', top: DPC.y - DPC.r + 'px', width: 2 * DPC.r + 'px', height: 2 * DPC.r + 'px' });
      newdp = el('serif', 'new DP ✨', $('ui'), { top: '1150px', fontSize: '110px', color: '#1A1614', filter: 'none' });
      shot24 = el('nc bl', '<span>a screenshot from video 24 😭</span>', $('ui'), { top: '1300px', fontSize: '54px' });
      hnd = el('hnd', '@nairaflore', $('ui'), { top: '1470px', color: '#50726A', filter: 'none' });
    },
    plan(t) {
      if (t < B(8)) return { layers: [sh('o01')] };
      if (t < DROP) {                                            // the gallery: slides up, drifts, holds on the silence, zooms into video 1
        return { layers: [], extra: [GAL], pre: (c, tt) => {
          const up = lerp(700, 0, P(tt, B(8), .3)), drift = -46 * P(tt, B(8) + .3, G0 - B(8) - .3, 'io');
          const u = tt < G1 ? 0 : E.in(clamp((tt - G1) / (DROP - G1))), z = lerp(1, 5.6, u);
          c.fillStyle = '#1A1614'; c.fillRect(0, 0, W, H); c.save();
          c.translate(lerp(TH[0], 540, u), lerp(TH[1] + up + drift, 960, u)); c.scale(z, z); c.translate(-TH[0], -TH[1]);
          c.drawImage(im(GAL), 0, 0, W, H); c.restore();
        } };
      }
      if (t < O40.t0) { const i = obAt(t); return { layers: [sh(OB[Math.max(0, i)].id)] }; }
      if (t < DPF) return { layers: [sh('o40')] };
      const p = P(t, DPF, .45, 'io');                            // the laugh shrinks into the DP circle
      const r = lerp(1120, DPC.r, p), cxp = lerp(540, DPC.x, p), cyp = lerp(960, DPC.y, p);
      const rect = { x: lerp(0, DPC.x - DPC.r, p), y: lerp(0, DPC.y - DPC.r, p), w: lerp(W, 2 * DPC.r, p), h: lerp(H, 2 * DPC.r, p) };
      const fb = face(O40, DPF) || [340, 380, 740, 900];
      return { bg: '#FBF3EC', layers: [sh('o40', { rect, circ: { x: cxp, y: cyp, r }, focus: [(fb[0] + fb[2]) / 2, (fb[1] + fb[3]) / 2 + 60], nokick: true })] };
    },
    draw(t, K) {
      // ---- the ask
      tf(me, { op: t < B(8) ? 1 : 0 });
      const dots = t >= B(2) && t < B(4); tf(bfDots, { op: dots ? 1 : 0 });
      if (dots) bfDots.querySelectorAll('i').forEach((e, i) => { e.style.transform = `translateY(${(-8 * Math.max(0, Math.sin(t * 14 - i * .9))).toFixed(1)}px)`; });
      tf(bfMsg, popT(t, B(4), B(8), { from: .5, fo: .06 }));
      tf(ntf, { op: win(t, B(6), B(8) + .2, .08, .1), y: lerp(-260, 0, P(t, B(6), .3, 'back')) });
      // ---- the gallery
      tf(cap, popT(t, B(10), G1, { from: .5, fo: .08 }));
      const tp = t >= G0 && t < G1 + .25; tf(tap, { op: tp ? 1 - P(t, G0 + .1, .35) : 0, s: lerp(.4, 1.2, P(t, G0, .3)) });
      // ---- the burst: REC and the counter
      const i = obAt(t), ro = t >= DROP && t < O40.t0; tf(rec, { op: ro ? 1 : 0 });
      if (ro) { recN.textContent = `VIDEO ${String(Math.max(1, i + 1)).padStart(2, '0')}/27`; rec.querySelector('.dot').style.opacity = Math.floor(t * 4) % 2 ? .25 : 1; }
      // ---- video 19: the fan
      if (t >= FZ && t < F1) {
        const L = sh('ob18'), [x, y] = toScr(L, t, FAN[0], FAN[1], K), k = xm(kl(L, K), t).a, r = FR * k + 10, p = P(t, FZ, .2, 'io');
        fx.save(); fx.lineCap = 'round';
        fx.strokeStyle = '#FFBDA8'; fx.lineWidth = 22; fx.beginPath(); fx.arc(x, y, r, -Math.PI * .6, -Math.PI * .6 + Math.PI * 2 * p); fx.stroke();
        fx.strokeStyle = '#FBF3EC'; fx.lineWidth = 9; fx.beginPath(); fx.arc(x, y, r, -Math.PI * .6, -Math.PI * .6 + Math.PI * 2 * p); fx.stroke(); fx.restore();
      }
      tf(fanCap, popT(t, FZ, F1 + B(1), { from: .5, fo: .06 }));
      // ---- the laugh becomes the DP
      tf(pend, popT(t, O40.t0 + .05, DPF, { from: .6, fo: .08 }));
      const dp = t >= DPF + .4; tf(ring, { op: dp ? P(t, DPF + .4, .15) : 0, s: lerp(.9, 1, P(t, DPF + .4, .3, 'back')) });
      tf(newdp, popT(t, DPF + .5, 99, { from: .6 })); tf(shot24, popT(t, DPF + .75, 99, { from: .6 })); tf(hnd, popT(t, DPF + 1.1, 99, { from: .8 }));
      if (dp) { twinkle(fx, t, DPC.x + DPC.r * .78, DPC.y - DPC.r * .72, 30, 1); twinkle(fx, t, DPC.x - DPC.r * .86, DPC.y + DPC.r * .55, 22, 2); }
      burst(fx, t, DPF + .4, DPC.x, DPC.y, { n: 50, speed: 1200, life: .9, seed: 40 });
    }
  };
})();
