// HAIR UP OR HAIR DOWN? : the split with the words standing behind her, a duel of whips cut on every half beat while a
// tug-of-war meter swings, a tie in the song's breakdown, then she settles it on the drop: the clip comes out and HAIR DOWN
// lands behind her. A montage with a speed gun on the spin, a fake-out on the one hair-up close-up, and the vote.
window.REEL = (() => {
  const C = D.cues, DROP = C.drop;
  const sh = (id, extra = {}) => ({ shot: id, ...extra });
  const LH = { x: 0, y: 0, w: 540, h: H }, RH = { x: 540, y: 0, w: 540, h: H };
  const cut = [['SPLIT', 0], ['h02', 4], ['h03', 5], ['h04', 6], ['h05', 6.5], ['h06', 7], ['h07', 7.5], ['TIE', 8], ['h09', 10], ['h10', 12], ['h11', 14],
    ['h12', 16], ['h13', 17], ['h14', 18], ['h15', 19], ['h16', 20], ['h17', 22], ['h18', 23], ['GRID', 24], ['h19', 25], ['h20', 26], ['h21', 27], ['h22', 28]];
  const which = t => { let c = cut[0]; for (const x of cut) if (t >= B(x[1]) - 1e-6) c = x; return c[0]; };
  // the duel: which side each whip cut shows, and UP's share of the meter after it
  const duel = [[4, 'UP', 63], [5, 'DOWN', 40], [6, 'UP', 58], [6.5, 'DOWN', 37], [7, 'UP', 61], [7.5, 'DOWN', 45], [8, 'TIE', 50]];
  function share(t) { let v = 50, prev = 50; for (const [k, , s] of duel) { if (t >= B(k)) { v = lerp(prev, s, P(t, B(k), .22, 'back')); prev = s; } } return v; }
  let up, down, q, meter, mu, md, stamps = [], tie, decide, hd, spd, spdN, fake, vote, lose, hnd, div;
  return {
    init() {
      const st = document.createElement('style'); st.textContent = `
        .dw { position:absolute; text-align:center; white-space:nowrap; font-family:Barlow; font-weight:800; line-height:.86; text-transform:uppercase;
          -webkit-text-stroke:5px #FBF3EC; paint-order:stroke fill; }
        .stp { position:absolute; font-family:Barlow; font-weight:800; font-size:118px; line-height:1; padding:8px 30px 2px; border:9px solid currentColor; border-radius:18px;
          background:rgba(26,22,20,.84); text-transform:uppercase; letter-spacing:.02em; }
        .spd { position:absolute; left:64px; top:250px; background:rgba(26,22,20,.86); border:5px solid #99B4AF; border-radius:22px; padding:16px 28px 10px; color:#FBF3EC; }
        .spd i { display:block; font-style:normal; font-family:Jost; font-weight:600; font-size:26px; letter-spacing:.24em; color:#99B4AF; }
        .spd b { font-family:Barlow; font-weight:800; font-size:110px; line-height:1; color:#FFBDA8; font-variant-numeric:tabular-nums; }
        .spd small { font-family:Barlow; font-weight:700; font-size:46px; margin-left:10px; }
        .meter .u { box-sizing:border-box; }`;
      document.head.appendChild(st);
      up = el('stp', 'UP', $('ui'), { top: '262px', left: '70px', color: '#99B4AF' });
      down = el('stp', 'DOWN', $('ui'), { top: '262px', right: '70px', color: '#FFBDA8' });
      div = el('', '', $('ui'), { position: 'absolute', left: '536px', top: '0px', width: '8px', height: '1920px', background: '#FBF3EC', boxShadow: '0 0 18px rgba(26,22,20,.35)' });
      q = el('nc', '<span>hair up or hair down? 🤔</span>', $('ui'), { top: '1190px', fontSize: '62px' });
      meter = el('meter', '<div class="u">UP</div><div class="d">DOWN</div>', $('ui'), { top: '1318px' });
      mu = meter.querySelector('.u'); md = meter.querySelector('.d');
      for (const [k, side] of duel.slice(0, 6)) stamps.push(el('stp', side, $('ui'), { top: '262px', [side === 'UP' ? 'left' : 'right']: '80px', color: side === 'UP' ? '#99B4AF' : '#FFBDA8' }));
      tie = el('nc bl', "<span>it's a TIE 😳</span>", $('ui'), { top: '1170px', fontSize: '76px' });
      decide = el('nc', '<span>okay. let HER decide 👀</span>', $('ui'), { top: '1190px', fontSize: '62px' });
      hd = el('dw', 'HAIR DOWN', $('behind'), { left: '0px', width: '1080px', top: '250px', fontSize: '225px', color: '#50726A' });
      spd = el('spd', '<i>HAIR SPEED</i><b>0.0</b><small>km/h</small>', $('ui')); spdN = spd.querySelector('b');
      fake = el('slam sh', 'wait…<br>UP?? 😳', $('ui'), { top: '300px', fontSize: '150px', lineHeight: '.95', color: '#FFBDA8', fontFamily: "Barlow, 'Noto Color Emoji'" });
      vote = el('nc', '<span>comment UP or DOWN 👇</span>', $('ui'), { top: '1150px', fontSize: '64px' });
      lose = el('nc bl', '<span>losing side does the next shoot 😌</span>', $('ui'), { top: '1262px', fontSize: '44px' });
      hnd = el('hnd', '@nairaflore', $('ui'), { top: '1400px' });
    },
    plan(t) {
      const w = which(t);
      if (w === 'SPLIT') return { layers: [sh('hL', { rect: LH }), sh('hR', { rect: RH })] };
      if (w === 'TIE') return { layers: [sh('tL', { rect: LH }), sh('tR', { rect: RH })] };
      if (w === 'GRID') return { layers: Array.from({ length: 9 }, (_, i) => { const p = P(t, B(24) + (i % 3 + Math.floor(i / 3)) * .02, .1); return sh('hg' + i, { rect: { x: (i % 3) * 360, y: Math.floor(i / 3) * 640, w: 360, h: 640 }, z: lerp(1.6, 1, p), nokick: true }); }) };
      if (w === 'h10') return { layers: [sh('h10', { depth: true })] };
      return { layers: [sh(w)] };
    },
    draw(t) {
      // ---- the split: the words behind each of her, the divider, the question
      const sp = t < B(4) || (t >= B(8) && t < B(10));
      tf(div, { op: sp ? 1 : 0 });
      tf(up, { op: sp ? 1 : 0, r: -6, s: t >= B(8) ? lerp(1.5, 1, P(t, B(8), .14)) : 1 }); tf(down, { op: sp ? 1 : 0, r: 6, s: t >= B(8) ? lerp(1.5, 1, P(t, B(8), .14)) : 1 });
      tf(q, { op: t < B(8) ? 1 : 0 });
      // ---- the meter swings with every whip, then shivers on the tie
      const mo = t < B(10) ? 1 : 0; tf(meter, { op: mo, x: t >= B(8) && t < B(10) ? Math.sin(t * 55) * 7 : 0 });
      if (mo) { const v = share(t); mu.style.width = (900 * v / 100).toFixed(1) + 'px'; mu.style.flex = 'none'; }
      duel.slice(0, 6).forEach(([k, side], i) => {
        const a = B(k), b = B(duel[i + 1][0]);
        tf(stamps[i], { ...slamT(t, a, b, { from: 2.4, dur: .12, fo: .04, rot: side === 'UP' ? -8 : 8 }) });
        burst(fx, t, a, side === 'UP' ? 260 : 820, 340, { n: 18, speed: 700, life: .5, size: 14, seed: 40 + i, grav: 500 });
      });
      tf(tie, popT(t, B(8), B(10), { from: .4, fo: .08 }));
      tf(decide, popT(t, B(10) + .05, DROP, { from: .6, fo: .05 }));
      // ---- the drop: the clip comes out, HAIR DOWN lands behind her
      tf(hd, { op: win(t, DROP, B(14), .05, .1), s: lerp(1.25, 1, P(t, DROP, .35, 'out')) });
      burst(fx, t, DROP, 540, 520, { n: 80, speed: 1600, life: 1.0, size: 26, seed: 12, grav: 700 });
      // ---- the spin gets a speed gun
      const so = win(t, B(14) + .04, B(16), .08, .08); tf(spd, { op: so, s: lerp(.6, 1, P(t, B(14) + .04, .22, 'back')) });
      if (so > 0) spdN.textContent = (132.4 * P(t, B(14) + .1, .55, 'out')).toFixed(1);
      // ---- the fake-out, then the vote
      tf(fake, slamT(t, B(27), B(28), { from: 2.6, dur: .12, fo: .05, rot: -3 }));
      tf(vote, popT(t, B(28.2), 99, { from: .6 })); tf(lose, popT(t, B(29), 99, { from: .6 })); tf(hnd, popT(t, B(30), 99, { from: .8 }));
      if (t > B(28.2)) { twinkle(fx, t, 220, 1150, 26, 1); twinkle(fx, t, 870, 1330, 22, 2); }
    }
  };
})();
