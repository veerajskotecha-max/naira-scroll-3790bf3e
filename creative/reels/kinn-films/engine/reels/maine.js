// "KISNE DIYA?" "MAINE." : the Diwali-party aunty asks who gave her the jewellery, and whether it was mummy or the in-laws. She
// holds the look, typing, into the song's bass gap, and answers on the lift: "Maine." (I did.) Earned it, bought it.
window.REEL = (() => {
  const C = D.cues, LIFT = C.lift;
  const sh = (id, extra = {}) => ({ shot: id, ...extra });
  const cut = [['m01', 0], ['m02', 2], ['m03', 4], ['m04', 8], ['m05', 12], ['m06', 16], ['m07', 20]];
  const which = t => { let c = cut[0]; for (const x of cut) if (t >= B(x[1]) - 1e-6) c = x; return c[0]; };
  let a1, a2, dots, rep, big, did, khud, tag, send, hnd;
  return {
    init() {
      a1 = el('bub', '<span class="who">diwali party aunty</span><span class="msg">beta, ye kisne diya? 👀</span>', $('ui'), { left: '60px', top: '1010px' });
      a2 = el('bub', '<span class="msg">mummy ne? ya sasural se? 😏</span>', $('ui'), { left: '60px', top: '1215px' });
      dots = el('dots', '<i></i><i></i><i></i>', $('ui'), { position: 'absolute', right: '60px', top: '1385px' });
      rep = el('bub me', '<span class="msg">Maine. 💅</span>', $('ui'), { right: '60px', top: '1385px' });
      big = el('slam sh', 'MAINE.', $('ui'), { top: '520px', fontSize: '300px' });
      did = el('kick', '(I did.)', $('ui'), { position: 'absolute', left: '0', width: '1080px', textAlign: 'center', top: '815px', fontSize: '54px' });
      khud = el('nc', '<span>khud kamaya.</span><br><span>khud liya. ✨</span>', $('ui'), { top: '250px', fontSize: '66px' });
      tag = mkPin('🎁 to: <b>me</b> · from: <b>me</b>'); tag.querySelector('.tx').style.fontSize = '42px';
      send = el('nc', '<span>send this to the girl who</span><br><span>buys her own jewellery 🫶</span>', $('ui'), { top: '1170px', fontSize: '54px' });
      hnd = el('hnd', '@nairaflore', $('ui'), { top: '1400px' });
    },
    plan(t) { return { layers: [sh(which(t))] }; },
    draw(t, K) {
      // ---- the question, already on screen at frame 1
      const pre = t < LIFT;
      tf(a1, { op: pre ? 1 : 0 }); tf(a2, t < B(2) ? { op: 0 } : (pre ? popT(t, B(2), LIFT, { from: .5, fo: .02 }) : { op: 0 }));
      const dd = t >= B(4.5) && pre; tf(dots, { op: dd ? 1 : 0 });
      if (dd) dots.querySelectorAll('i').forEach((e, i) => { e.style.transform = `translateY(${(-8 * Math.max(0, Math.sin(t * 13 - i * .9))).toFixed(1)}px)`; });
      // ---- the lift: the answer
      tf(rep, popT(t, LIFT, B(12), { from: .4, fo: .08 }));
      tf(big, slamT(t, LIFT, B(12) - .05, { from: 2.8, dur: .14, fo: .1 })); tf(did, popT(t, B(9), B(12) - .05, { from: .6, fo: .1 }));
      burst(fx, t, LIFT, 540, 700, { n: 90, speed: 1700, life: 1.1, size: 28, seed: 8, grav: 700 });
      // ---- earned it, bought it
      tf(khud, popT(t, B(12) + .05, B(16), { from: .6, fo: .08 }));
      if (on(t, B(12) + .15, B(16))) { const p = trkScr('ring5', t, K); if (p) { twinkle(fx, t, p[0] - 40, p[1] - 30, 32, 0); twinkle(fx, t, p[0] + 46, p[1] - 40, 26, 1.6); } }
      // ---- a gift tag on the hoop
      const hp = on(t, B(16), B(20)) ? trkScr('hoop6', t, K) : null;
      if (hp) drawPin(tag, t, B(16) + .05, B(20) - .02, hp[0], hp[1], hp[0] + 60, hp[1] + 330); else tag.style.display = 'none';
      // ---- the send line
      tf(send, popT(t, B(20) + .05, 99, { from: .6 })); tf(hnd, popT(t, B(21), 99, { from: .8 }));
      if (t > B(20)) twinkle(fx, t, 900, 1200, 26, 3);
    }
  };
})();
