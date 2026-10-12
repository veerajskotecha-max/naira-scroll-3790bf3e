// I ASKED FOR ONE PHOTO, on the owner's new track. She asks her friend for one photo for her DP, because her Naira hoops have
// to show. The friend sends 27 videos (this shoot). The gallery holds on the song's silence, a snare pickup zooms into video 1,
// all 27 fire on the drop under a REC counter, video 19 freezes on the fan. Her laugh: DP still pending. Then, on the song's
// next bass hit, a shutter closes and opens on the DP she wanted, which shrinks into a profile circle with the hoops tagged.
window.REEL = (() => {
  const C = D.cues, [G0, G1] = C.gap, DROP = C.drop, [F0, F1] = C.fan, DPT = C.dp;
  const sh = (id, extra = {}) => ({ shot: id, ...extra });
  const OB = D.shots.filter(s => s.id.startsWith('ob'));
  const GAL = '../img/gallery.jpg', TH = [106, 526];             // the gallery, and the centre of thumbnail 1 on it
  const FAN = [850, 1400], FR = 400, FZ = F0 + .3;               // the fan on its freeze frame (BD3B07AF 22.60), held from FZ
  const DPC = { x: 540, y: 690, r: 320 }, DPF = [580, 640], DPZ = 1.15;   // the DP circle on screen; the still's centre and zoom in it (whole head in)
  const HOOP = [370, 974];                                       // the hoop in the DP still (041FCDC6 8.50), source px
  const SH0 = DPT, SH1 = DPT + B(1), SH2 = DPT + B(2);           // shutter at the bass hit; full-frame beat; then into the circle
  let me1, me2, bfDots, bfMsg, ntf, cap, tap, rec, recN, fanCap, pend, shutT, shutB, newdp, worth, tag, toast;
  const obAt = t => { let k = -1; OB.forEach((s, i) => { if (t >= s.t0 - 1e-6) k = i; }); return k; };
  function dpLayer(t) {                                          // full frame until SH1, then eased into the circle by SH2
    const p = P(t, SH1, SH2 - SH1, 'io');
    const r = lerp(1120, DPC.r, p), cx = lerp(540, DPC.x, p), cy = lerp(960, DPC.y, p);
    const rect = { x: lerp(0, DPC.x - DPC.r, p), y: lerp(0, DPC.y - DPC.r, p), w: lerp(W, 2 * DPC.r, p), h: lerp(H, 2 * DPC.r, p) };
    const push = t < SH1 ? lerp(1.0, 1.05, P(t, SH0, SH1 - SH0, 'out')) : lerp(1.05, DPZ, p);
    return sh('dp', { rect, circ: { x: cx, y: cy, r }, focus: [lerp(540, DPF[0], p), lerp(960, DPF[1], p)], z: push, nokick: true });
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
        .pin.ig .tx { border-radius:22px; padding:14px 26px 16px; line-height:1.2; text-align:left; font-size:34px; }
        .pin.ig .tx b { color:#1A1614; font-weight:600; } .pin.ig .tx small { display:block; font-size:26px; font-weight:500; color:#50726A; letter-spacing:.02em; }
        .toastw { position:absolute; left:0; width:1080px; top:236px; display:flex; justify-content:center; }
        .toast { display:flex; align-items:center; gap:16px; padding:14px 32px 14px 16px; background:#1A1614; color:#FBF3EC; border-radius:999px;
          font-family:Jost; font-weight:500; font-size:32px; letter-spacing:.01em; box-shadow:0 12px 30px rgba(26,22,20,.3); white-space:nowrap; }
        .toast i { display:flex; width:46px; height:46px; border-radius:50%; background:#99B4AF; color:#1A1614; align-items:center; justify-content:center;
          font-style:normal; font-weight:700; font-size:28px; }`;
      document.head.appendChild(st);
      me1 = el('bub me', '<span class="msg">bas ek photo le le,<br>DP ke liye 🥺</span>', $('ui'), { right: '60px', top: '890px' });
      me2 = el('bub me', '<span class="msg">naira wale hoops pehne hain,<br>dikhne chahiye ✨</span>', $('ui'), { right: '60px', top: '1080px' });
      bfDots = el('bub bf', '<span class="who">bestie</span><div class="dots"><i></i><i></i><i></i></div>', $('ui'), { left: '60px', top: '1290px' });
      bfMsg = el('bub', '<span class="who">bestie</span><span class="msg">haan haan, done ✅</span>', $('ui'), { left: '60px', top: '1290px' });
      ntf = el('ntf', '<div class="ic">📹</div><div class="tx"><b>bestie</b>sent you 27 videos</div><div class="tm">now</div>', $('ui'));
      cap = el('nc bl', '<span>27 videos. 0 photos.</span>', $('ui'), { top: '880px', fontSize: '80px' });
      tap = el('tap', '', $('ui'), { left: TH[0] + 'px', top: TH[1] + 'px' });
      rec = el('rec', '<span><span class="dot"></span>REC</span><span class="n">VIDEO 01/27</span>', $('ui')); recN = rec.querySelector('.n');
      fanCap = el('nc bl', '<span>…she brought a FAN?? 😭</span>', $('ui'), { top: '560px', fontSize: '74px' });
      pend = el('nc', '<span>DP status: still pending ⏳</span>', $('ui'), { top: '1250px', fontSize: '56px' });
      shutT = el('shut', '', $('ui'), { top: '0px' }); shutB = el('shut', '', $('ui'), { top: '960px' });
      newdp = el('serif', 'new DP ✨', $('ui'), { top: '1150px', fontSize: '116px', color: '#1A1614', filter: 'none' });
      worth = el('nc bl', '<span>worth the 27 videos 💅</span>', $('ui'), { top: '1308px', fontSize: '54px' });
      tag = mkPin('<b>Woven Gold Hoops</b><small>@nairaflore</small>'); tag.classList.add('ig');
      toast = el('toastw', '<div class="toast"><i>✓</i>profile photo updated</div>', $('ui'));
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
      if (t < SH.o40.t0) { const i = obAt(t); return { layers: [sh(OB[Math.max(0, i)].id)] }; }
      if (t < SH0) return { layers: [sh('o40')] };
      if (t < SH1) return { layers: [dpLayer(t)] };
      const p = P(t, SH1, SH2 - SH1, 'io');
      return { bg: '#FBF3EC', layers: [dpLayer(t)], pre: (c) => {   // a soft shadow under the photo as it settles into the circle
        if (p <= 0) return; const L = dpLayer(t); c.save(); c.fillStyle = '#FBF3EC'; c.shadowColor = `rgba(26,22,20,${(.32 * p).toFixed(3)})`; c.shadowBlur = 60; c.shadowOffsetY = 24;
        c.beginPath(); c.arc(L.circ.x, L.circ.y, L.circ.r, 0, Math.PI * 2); c.fill(); c.restore();
      } };
    },
    draw(t, K) {
      // ---- the ask, and the reason
      tf(me1, { op: t < B(8) ? 1 : 0 });
      tf(me2, t < B(2) ? { op: 0 } : popT(t, B(2), B(8), { from: .5, fo: .06 }));
      const dots = t >= B(3.5) && t < B(5); tf(bfDots, { op: dots ? 1 : 0 });
      if (dots) bfDots.querySelectorAll('i').forEach((e, i) => { e.style.transform = `translateY(${(-8 * Math.max(0, Math.sin(t * 14 - i * .9))).toFixed(1)}px)`; });
      tf(bfMsg, popT(t, B(5), B(8), { from: .5, fo: .06 }));
      tf(ntf, { op: win(t, B(6), B(8) + .2, .08, .1), y: lerp(-260, 0, P(t, B(6), .3, 'back')) });
      // ---- the gallery
      tf(cap, popT(t, B(10), G1, { from: .5, fo: .08 }));
      const tp = t >= G0 && t < G1 + .25; tf(tap, { op: tp ? 1 - P(t, G0 + .1, .35) : 0, s: lerp(.4, 1.2, P(t, G0, .3)) });
      // ---- the burst: REC and the counter
      const i = obAt(t), ro = t >= DROP && t < SH.o40.t0; tf(rec, { op: ro ? 1 : 0 });
      if (ro) { recN.textContent = `VIDEO ${String(Math.max(1, i + 1)).padStart(2, '0')}/27`; rec.querySelector('.dot').style.opacity = Math.floor(t * 4) % 2 ? .25 : 1; }
      // ---- video 19: the fan
      if (t >= FZ && t < F1) {
        const L = sh('ob18'), [x, y] = toScr(L, t, FAN[0], FAN[1], K), k = xm(kl(L, K), t).a, r = FR * k + 10, p = P(t, FZ, .2, 'io');
        fx.save(); fx.lineCap = 'round';
        fx.strokeStyle = '#FFBDA8'; fx.lineWidth = 22; fx.beginPath(); fx.arc(x, y, r, -Math.PI * .6, -Math.PI * .6 + Math.PI * 2 * p); fx.stroke();
        fx.strokeStyle = '#FBF3EC'; fx.lineWidth = 9; fx.beginPath(); fx.arc(x, y, r, -Math.PI * .6, -Math.PI * .6 + Math.PI * 2 * p); fx.stroke(); fx.restore();
      }
      tf(fanCap, popT(t, FZ, F1 + B(1), { from: .5, fo: .06 }));
      // ---- the laugh: still no DP
      tf(pend, popT(t, SH.o40.t0 + .04, SH0 - .08, { from: .6, fo: .06 }));
      // ---- the shutter: closes into the bass hit, opens on the photo she wanted
      const close = P(t, SH0 - .08, .08, 'in'), open = P(t, SH0 + .03, .16, 'out'), sv = t >= SH0 - .08 && t < SH0 + .2;
      const cov = sv ? (t < SH0 ? close : 1 - open) : 0;
      tf(shutT, { op: cov > 0 ? 1 : 0, y: -960 * (1 - cov) }); tf(shutB, { op: cov > 0 ? 1 : 0, y: 960 * (1 - cov) });
      // ---- the DP: a story ring in Naira's sage and blush, the hoop tagged, the line
      const dpo = P(t, SH2 - .05, .25);
      if (dpo > 0) {
        const L = dpLayer(t), R = L.circ.r, rot = (t - SH2) * .9, bp = ((t - SH0) / D.beat) % 1, pulse = Math.exp(-bp * 7);
        fx.save(); fx.globalAlpha = dpo; fx.lineWidth = 15 + 7 * pulse; fx.shadowColor = 'rgba(255,189,168,.9)'; fx.shadowBlur = 10 + 26 * pulse;
        const g = fx.createConicGradient(rot, L.circ.x, L.circ.y); g.addColorStop(0, '#FFBDA8'); g.addColorStop(.35, '#99B4AF'); g.addColorStop(.7, '#50726A'); g.addColorStop(1, '#FFBDA8');
        fx.strokeStyle = g; fx.beginPath(); fx.arc(L.circ.x, L.circ.y, R + 22, 0, Math.PI * 2); fx.stroke(); fx.restore();
      }
      tf(newdp, popT(t, SH2 + .05, 99, { from: .6, rise: 24 })); tf(worth, popT(t, SH2 + .45, 99, { from: .6 }));
      if (t >= SH2 + .7) { const L = dpLayer(t), [hx, hy] = toScr(L, t, HOOP[0], HOOP[1]); drawPin(tag, t, SH2 + .7, 99, hx, hy, 235, 1078); twinkle(fx, t, hx + 18, hy - 22, 26, 1); }
      else tag.style.display = 'none';
      tf(toast, { op: win(t, SH2 + 1.0, 99, .12, 0), y: lerp(-40, 0, P(t, SH2 + 1.0, .3, 'back')) });
      if (t >= SH0 && t < SH1) { const L = dpLayer(t), [hx, hy] = toScr(L, t, HOOP[0], HOOP[1]); twinkle(fx, t, hx + 26, hy - 30, 40, 2); }
      if (t >= SH0 && t < SH0 + .7) { const [hx, hy] = toScr(dpLayer(t), t, HOOP[0], HOOP[1]); burst(fx, t, SH0 + .04, hx, hy, { n: 22, speed: 620, life: .55, size: 15, seed: 34, grav: 300 }); }
      burst(fx, t, SH2, DPC.x + DPC.r * .78, DPC.y - DPC.r * .66, { n: 20, speed: 700, life: .7, size: 16, seed: 36, grav: 300 });
      burst(fx, t, SH2 + .05, DPC.x - DPC.r * .80, DPC.y - DPC.r * .60, { n: 16, speed: 600, life: .7, size: 14, seed: 37, grav: 300 });
      if (dpo > 0) { twinkle(fx, t, DPC.x + DPC.r * .80, DPC.y - DPC.r * .70, 30, 3); twinkle(fx, t, DPC.x + DPC.r * .95, DPC.y + DPC.r * .25, 20, 4); }
    }
  };
})();
