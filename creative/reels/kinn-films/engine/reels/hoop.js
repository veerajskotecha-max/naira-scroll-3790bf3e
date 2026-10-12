// POV: YOU'RE HER HOOP : the Woven Gold Hoop narrates the shoot in speech bubbles tracked to it, one a bar. It complains going
// in, judges the struggle, admires itself in the breakdown, screams through the spin on the drop, bickers with the kada,
// enjoys the fan, shakes when she laughs, and signs off.
window.REEL = (() => {
  const C = D.cues, DROP = C.drop;
  const sh = (id, extra = {}) => ({ shot: id, ...extra });
  const cut = [['v1', 0], ['v2', 4], ['v3', 8], ['v4', 12], ['v5', 16], ['v6', 20], ['v7', 24], ['v8', 28]];
  const which = t => { let c = cut[0]; for (const x of cut) if (t >= B(x[1]) - 1e-6) c = x; return c[0]; };
  const lab = (who, html) => `<i>${who}</i>${html}`;
  // [track, from beat, to beat, side, anchor, label, text]
  const BUBS = [
    ['h2', 4, 8, 'down', .62, 'the hoop', "she's been at this<br>for 4 minutes 😮‍💨"],
    ['h3', 8, 12, 'down', .3, 'the hoop', 'okay but<br>i look GOOD ✨'],
    ['h4', 12, 16, 'down', .5, 'the hoop', 'WHY ARE WE<br>SPINNING 🌀'],
    ['h5', 16, 20, 'up', .86, 'the hoop', 'my close-up.'],
    ['k5', 17.5, 20, 'down', .18, 'the kada', "excuse me?<br>i'm RIGHT here 💁‍♀️"],
    ['h6', 20, 24, 'down', .62, 'the hoop', 'finally.<br>fresh air. 🌬️'],
    ['h7', 24, 28, 'down', .5, 'the hoop', "she's laughing.<br>i'm shaking 😭"],
    ['h8', 28, 32, 'down', .3, 'the woven gold hoop', '10/10.<br>would hang again ✨']];
  let pov, ow, bubs = [], hnd;
  function pin(e, tr, t, K, side, ax, extra = {}) {
    const p = trkScr(tr, t, K); if (!p) return;
    e.style.display = ''; placeSB(e, p[0], p[1], { side, ax, gap: 30 }); tf(e, extra);
  }
  return {
    init() {
      const st = document.createElement('style'); st.textContent = `.sb { font-size:57px; } .sb i { font-size:27px; }`; document.head.appendChild(st);
      pov = el('pov', "POV: you're her hoop", $('ui'), { top: '250px' });
      ow = el('sb', '', $('ui'));
      BUBS.forEach(b => bubs.push(el(b[0] === 'k5' ? 'sb k' : 'sb', lab(b[5], b[6]), $('ui'))));
      hnd = el('hnd', '@nairaflore', $('ui'), { top: '1470px' });
    },
    plan(t) { return { layers: [sh(which(t))] }; },
    draw(t, K) {
      // ---- frame 1: the hook is already on screen
      tf(pov, { op: t < B(4) - .1 ? 1 : 1 - P(t, B(4) - .1, .1) });
      if (t < B(4)) {
        const n = t < B(1) ? 1 : t < B(2) ? 2 : 3, txt = ['ow.', 'ow. ow.', 'ow. ow. <b>OW.</b>'][n - 1];
        if (ow.dataset.n !== String(n)) { ow.innerHTML = lab('the hoop', txt); ow.dataset.n = n; }
        const kick = n > 1 ? 1 + .12 * (1 - P(t, B(n - 1), .2)) : 1;
        pin(ow, 'h1', t, K, 'up', .72, { s: kick, op: t > B(4) - .08 ? 1 - P(t, B(4) - .08, .08) : 1 });
      } else tf(ow, { op: 0 });
      // ---- one bubble a bar, riding the piece it belongs to
      BUBS.forEach(([tr, a, b, side, ax], i) => {
        const q = popT(t, B(a), B(b), { from: .45, dur: .3, fo: .08 }); if (q.op <= 0) { tf(bubs[i], { op: 0 }); return; }
        let r = 0, x = 0, y = 0;
        if (tr === 'h4') r = 7 * Math.sin((t - B(12)) * 17);                       // the spin
        if (tr === 'h7') { const R = rng(Math.round(t * FPS)); x = (R() - .5) * 16; y = (R() - .5) * 12; r = (R() - .5) * 5; }   // the laugh
        pin(bubs[i], tr, t, K, side, ax, { s: q.s, op: q.op, r, x, y });
      });
      // ---- glints on the hoop when it is showing off
      const g = (tr, a, b, ph) => { if (on(t, B(a), B(b))) { const p = trkScr(tr, t, K); if (p) twinkle(fx, t, p[0] + 26, p[1] - 30, 30, ph); } };
      g('h3', 8, 12, 0); g('h8', 28, 32, 2); g('h5', 16, 20, 1);
      burst(fx, t, DROP, 540, 860, { n: 70, speed: 1500, life: 1.0, size: 24, seed: 12, grav: 700 });
      tf(hnd, popT(t, B(30), 99, { from: .8 }));
    }
  };
})();
