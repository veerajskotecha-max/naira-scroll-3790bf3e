// INTRODUCING PAWAN KUMAR : a 90s heroine entry played straight, letterboxed, with a checklist of what every heroine entry
// needs. The look and the hair tick on the beat; "the wind machine" blinks. On the song's own silence the frame freezes on
// the real wind machine, a hand fan, the bars snap off and it gets a filmi debut card. She breaks on the drop. Credits roll.
window.REEL = (() => {
  const C = D.cues, [G0] = C.gap, DROP = C.drop;
  const sh = (id, extra = {}) => ({ shot: id, ...extra });
  const cut = [['p01', 0], ['p02', 4], ['p03', 8], ['p04', 12], ['p06', 20], ['p07', 24], ['p08', 28], ['p09', 32], ['p10', 38], ['p11', 44]];
  const which = t => { let c = cut[0]; for (const x of cut) if (t >= B(x[1]) - 1e-6) c = x; return c[0]; };
  const FAN = [850, 1400], FR = 400;                             // the fan on the freeze frame (BD3B07AF 22.60), source px
  const frozen = t => t >= G0 && t < DROP;
  let barT, barB, chk, items, aside, ttl, card, credbg, cred, endA, endB;
  return {
    init() {
      const st = document.createElement('style'); st.textContent = `
        .chk .i .as { font-family:CG; font-style:italic; font-weight:600; font-size:44px; color:#FFBDA8; margin-left:6px; }
        .chk { width:auto; background:rgba(26,22,20,.5); padding:22px 40px 30px 34px; border-radius:28px; box-shadow:0 14px 40px rgba(26,22,20,.25); }
        .chk .i.blink::before { border-color:#FFBDA8; box-shadow:0 0 0 6px rgba(255,189,168,.35), 0 2px 10px rgba(0,0,0,.5); }`;
      document.head.appendChild(st);
      barT = el('lbx', '', $('ui'), { top: '0px' }); barB = el('lbx', '', $('ui'), { top: '1744px' });
      chk = el('chk', `<div class="h">every heroine entry needs:</div><div class="i">the look</div><div class="i">the hair</div>
        <div class="i">the wind machine<span class="as">(borrowed. plastic.)</span></div>`, $('ui'), { top: '1150px' });
      items = [...chk.querySelectorAll('.i')]; aside = chk.querySelector('.as');
      ttl = el('filmi', '<small>introducing</small><b style="font-size:136px">THE HEROINE</b>', $('ui'), { top: '1170px' });
      card = el('filmi', '<small>introducing</small><b style="font-size:130px">PAWAN KUMAR</b><i>wind machine · ₹0 · debut</i>', $('ui'), { top: '280px' });
      credbg = el('credbg', '', $('ui'));
      cred = el('cred', [['heroine', 'main character energy'], ['wind machine', 'Pawan Kumar (debut)'], ['hair', 'physics'], ['hoops', '@nairaflore'],
        ['catering', '1 samosa'], ['budget', '<span class="rs">₹0 + one hand fan</span>']].map(([a, b]) => `<div class="r"><span>${a}</span><span>${b}</span></div>`).join('') +
        '<div class="end">no fans were harmed in the making of this reel</div>', $('ui'), { top: '1920px' });
      cred.querySelectorAll('.r span:last-child').forEach(e => { if (e.querySelector('.rs')) { e.classList.add('rs'); e.innerHTML = e.textContent; } });
      endA = el('serif', 'every heroine needs<br>a pawan kumar 🌀', $('ui'), { top: '1150px', fontSize: '92px', lineHeight: '1.08' });
      endB = el('nc bl', '<span>tag yours 👇</span>', $('ui'), { top: '1400px', fontSize: '56px' });
    },
    plan(t) {
      const w = which(t);
      const under = frozen(t) ? (c, tt) => {                     // the spotlight: everything but the fan goes dim
        const L = sh('p08'), [x, y] = toScr(L, tt, FAN[0], FAN[1]), k = xm(L, tt).a, a = .62 * P(tt, G0, .12);
        c.save(); c.fillStyle = `rgba(26,22,20,${a.toFixed(3)})`; c.beginPath(); c.rect(0, 0, W, H); c.arc(x, y, FR * k, 0, Math.PI * 2); c.fill('evenodd'); c.restore();
      } : null;
            return { layers: [sh(w)], under };
    },
    draw(t, K) {
      // ---- letterbox: on from frame 1, snapped off by the freeze, back in for the loop
      const off = t >= G0 ? P(t, G0, .1, 'in') : 0, back = t > D.dur - .3 ? P(t, D.dur - .3, .25) : 0, lb = 176 * (off * (1 - back));
      tf(barT, { y: -lb }); tf(barB, { y: lb }); if (off >= 1 && back <= 0) { barT.style.display = 'none'; barB.style.display = 'none'; }
      // ---- the checklist
      const hero = t >= B(17) - .1 && t < B(20);
      const co = hero ? 1 - P(t, B(17) - .1, .1) : t < G0 ? (t >= B(20) ? P(t, B(20), .12) : 1) : (t >= DROP && t < B(38) ? 1 : (t > D.dur - .3 ? P(t, D.dur - .3, .2) : 0));
      tf(chk, { op: t >= G0 && t < G0 + .08 ? 1 - P(t, G0, .08) : co });
      const loop = t > D.dur - .3;
      [[B(4), 0], [B(13), 1], [DROP, 2]].forEach(([a, i]) => {
        const done = t >= a && !loop; items[i].classList.toggle('on', done);
        items[i].style.opacity = 1; items[i].style.transform = done && t < a + .3 ? `scale(${lerp(1.25, 1, P(t, a, .3, 'back')).toFixed(3)})` : '';
        items[i].style.transformOrigin = '0 50%';
      });
      items[2].classList.toggle('blink', t >= B(20) && t < G0 && Math.floor((t - B(20)) / (D.beat / 2)) % 2 === 0);
      aside.style.display = t >= DROP && !loop ? '' : 'none';
      burst(fx, t, B(4), 140, 1290, { n: 22, speed: 700, life: .6, size: 15, seed: 4 }); burst(fx, t, B(13), 140, 1360, { n: 22, speed: 700, life: .6, size: 15, seed: 13 });
      burst(fx, t, DROP, 140, 1430, { n: 40, speed: 1000, life: .8, size: 20, seed: 32 });
      // ---- "introducing THE HEROINE" stands behind her as she comes round
      tf(ttl, { op: win(t, B(17), B(20), .15, .06), s: lerp(1.1, 1, P(t, B(17), .6)) });
      // ---- the freeze: a circle draws round the fan, the debut card, an arrow
      const fo = frozen(t) ? 1 : 0;
      tf(card, { op: fo * P(t, G0 + .1, .2), s: lerp(.85, 1, P(t, G0 + .1, .3, 'back')) });
      if (fo) {
        const L = sh('p08'), [x, y] = toScr(L, t, FAN[0], FAN[1]), k = xm(L, t).a, r = FR * k + 10, p = P(t, G0 + .05, .3, 'io');
        fx.save(); fx.lineCap = 'round';
        fx.strokeStyle = '#FFBDA8'; fx.lineWidth = 22; fx.beginPath(); fx.arc(x, y, r, -Math.PI * .6, -Math.PI * .6 + Math.PI * 2 * p); fx.stroke();
        fx.strokeStyle = '#FBF3EC'; fx.lineWidth = 9; fx.beginPath(); fx.arc(x, y, r, -Math.PI * .6, -Math.PI * .6 + Math.PI * 2 * p); fx.stroke();
        const q = P(t, G0 + .3, .25, 'io'), ax0 = 470, ay0 = 690, ax1 = x - r * .55, ay1 = y - r * .86, mx = 380, my = 900;
        if (q > 0) {
          fx.strokeStyle = '#FBF3EC'; fx.lineWidth = 9; fx.beginPath();
          for (let i = 0; i <= 24 * q; i++) { const u = i / 24, a = (1 - u) ** 2, b = 2 * (1 - u) * u, c = u * u; const px = a * ax0 + b * mx + c * ax1, py = a * ay0 + b * my + c * ay1; i ? fx.lineTo(px, py) : fx.moveTo(px, py); }
          fx.stroke();
          if (q >= 1) { const ang = Math.atan2(ay1 - my, ax1 - mx); fx.beginPath(); fx.moveTo(ax1, ay1); fx.lineTo(ax1 - 46 * Math.cos(ang - .45), ay1 - 46 * Math.sin(ang - .45));
            fx.moveTo(ax1, ay1); fx.lineTo(ax1 - 46 * Math.cos(ang + .45), ay1 - 46 * Math.sin(ang + .45)); fx.stroke(); }
        }
        fx.restore();
        twinkle(fx, t, x - r * .7, y - r * .7, 30, 1); twinkle(fx, t, x + r * .1, y - r * 1.02, 22, 2);
      }
      // ---- credits roll over the cover close-up, then the line to send
      const cr = t >= B(38) && t < B(44) + .2; tf(credbg, { op: cr ? Math.min(P(t, B(38), .25), 1 - P(t, B(44), .2)) : 0 });
      if (cr) { cred.style.display = ''; cred.style.top = lerp(1920, 900, P(t, B(38), B(44) - B(38) - .25, 'out')).toFixed(1) + 'px'; cred.style.opacity = 1 - P(t, B(44), .2); }
      else cred.style.display = 'none';
      tf(endA, popT(t, B(44) + .05, D.dur - .25, { from: .7, rise: 30, fo: .2 })); tf(endB, popT(t, B(45), D.dur - .25, { from: .6, fo: .2 }));
      if (t > B(44) && t < D.dur - .25) twinkle(fx, t, 880, 1180, 26, 3);
    }
  };
})();
