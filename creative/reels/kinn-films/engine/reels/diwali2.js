// DIWALI LOOK LOADING… : one item per bar while the bar fills, the stall on the earring back, 99% and the hair comes down
// on the song's own silence, then 100% on the drop and eight bars of the finished look with a transition on every hit.
window.REEL = (() => {
  const C = D.cues, [G0, G1] = C.gap, DROP = C.drop;
  const sh = (id, extra = {}) => ({ shot: id, ...extra });
  const cut = [['d01', 0], ['d02', 4], ['d03', 8], ['d04', 11], ['d05', 12], ['d06', 16], ['d07', 18], ['d08', 20], ['d09', 24], ['d10', 28], ['d11', 32], ['d12', 34],
    ['d13', 35], ['d14', 37], ['d15', 39], ['d16', 41], ['d17', 43], ['d18', 44], ['TRI', 46], ['d20', 47], ['d21', 49], ['GRID', 51], ['STK', 52], ['d23', 53],
    ['d24', 55], ['d25', 57], ['d26', 59], ['d27', 61]];
  const which = t => { let c = cut[0]; for (const x of cut) if (t >= B(x[1]) - 1e-6) c = x; return c[0]; };
  // the bar: [time, percent] keyframes (eased between)
  const PK = [[0, 0], [B(5.6), 3], [B(6), 3], [B(6.6), 14], [B(10), 14], [B(10.6), 29], [B(12), 29], [B(14), 43], [B(19), 43], [B(19.5), 64], [B(22), 64], [B(22.6), 82],
    [B(25), 82], [B(25.6), 99], [G1, 99], [DROP - .02, 99.9], [DROP, 100]];
  function pct(t) { if (t <= PK[0][0]) return PK[0][1]; for (let i = 1; i < PK.length; i++) if (t <= PK[i][0]) { const [a, pa] = PK[i - 1], [b, pb] = PK[i]; return lerp(pa, pb, E.io(clamp((t - a) / Math.max(1e-6, b - a)))); } return 100; }
  let load, fill, pc, chips, dlg, dh, dm, r1, r2, wait, fin, big, sub, diw, pins = {}, endA, endB, endH, mini, minif, nine, hey, star;
  return {
    init() {
      load = el('load', `<div class="ti">${diya(84)} diwali look ${diya(84)}</div><div class="sub">loading<span class="dd"></span></div>
        <div class="row"><div class="tr"><div class="fl"></div></div><div class="pc">0%</div></div>
        <div class="ck"><span>✓ kada</span><span>✓ ring</span><span>✓ hoops</span><span>✓ hair</span></div>`);
      fill = load.querySelector('.fl'); pc = load.querySelector('.pc'); chips = [...load.querySelectorAll('.ck span')];
      dlg = el('dlg', `<div class="h">⚠️ earring back not found</div><div class="m">hoops could not be installed</div><div class="bt"><div>retry</div><div>cry 😭</div></div>`, $('ui'), { top: '1160px' });
      dh = dlg.querySelector('.h'); dm = dlg.querySelector('.m'); [r1, r2] = dlg.querySelectorAll('.bt div');
      wait = el('nc bl', '<span>…wait.</span>', $('ui'), { top: '1290px', fontSize: '62px' });
      fin = el('nc', '<span>hair down. final answer. 💅</span>', $('ui'), { top: '1330px', fontSize: '54px' });
      big = el('slam sh', '100%', $('ui'), { top: '560px', fontSize: '330px' });
      sub = el('kick', 'diwali look · loaded ✨', $('ui'), { position: 'absolute', left: '0', width: '1080px', textAlign: 'center', top: '900px', fontSize: '50px' });
      diw = el('slam', 'DIWALI', $('behind'), { top: '215px', fontSize: '330px', color: '#50726A' });
      pins.h = mkPin('✓ <b>hoops</b>'); pins.k = mkPin('✓ <b>kada</b>'); pins.r = mkPin('✓ <b>ring</b>'); pins.h2 = mkPin('✨ <b>hoops</b>');
      hey = el('slam sh', 'MAIN CHARACTER', $('ui'), { top: '1470px', fontSize: '128px', color: '#FBF3EC' });
      endA = el('serif', 'diwali look:', $('ui'), { top: '1180px', fontSize: '104px' });
      endB = el('serif', 'loaded ✨', $('ui'), { top: '1300px', fontSize: '150px', color: '#FFBDA8' });
      endH = el('hnd', '@nairaflore', $('ui'), { top: '1500px' });
      mini = el('', `<div style="width:520px;height:22px;border-radius:11px;background:rgba(251,243,236,.45);overflow:hidden;box-shadow:0 4px 12px rgba(26,22,20,.3)"><div style="height:100%;width:100%;background:#FFBDA8"></div></div>`, $('ui'), { position: 'absolute', left: '280px', top: '1650px' });
      minif = mini.firstChild.firstChild;
    },
    plan(t) {
      const w = which(t);
      if (w === 'TRI') {                                          // three strips drop in, alternating directions
        const ids = ['d19a', 'd19b', 'd19c'];
        return { layers: ids.map((id, i) => { const p = P(t, B(46) + i * .045, .12, 'out'); return sh(id, { rect: { x: i * 360, y: 0, w: 360, h: H }, dy: (i % 2 ? -1 : 1) * H * (1 - p), nokick: true }); }) };
      }
      if (w === 'GRID') return { layers: Array.from({ length: 9 }, (_, i) => { const p = P(t, B(51) + (i % 3 + Math.floor(i / 3)) * .02, .1); return sh('dg' + i, { rect: { x: (i % 3) * 360, y: Math.floor(i / 3) * 640, w: 360, h: 640 }, z: lerp(1.6, 1, p), nokick: true }); }) };
      if (w === 'STK') { const p = P(t, B(52), .2, 'back'); return { bg: '#FFBDA8', layers: [sh('d22', { sticker: true, stroke: 18, z: lerp(.55, .86, p), rot: lerp(-14, -4, p), dy: 60, nokick: true })] }; }
      if (w === 'd13') return { layers: [sh('d13', { depth: true })] };
      if (w === 'd10') return { layers: [sh('d10', { depth: t >= G0 && t < DROP })] };
      return { layers: [sh(w)] };
    },
    draw(t) {
      // ---- the loading card, the bar and the items
      const lo = t < DROP; tf(load, { op: lo ? 1 : 0 });
      if (lo) {
        const v = pct(t); fill.style.width = clamp(v / 100).toFixed(4) * 100 + '%';
        pc.textContent = v >= 99 && v < 100 && t > G1 ? v.toFixed(1) + '%' : Math.floor(v) + '%';
        const stall = t >= B(14) && t < B(19); pc.style.transform = stall ? `translateX(${(Math.sin(t * 70) * 5).toFixed(1)}px)` : '';
        load.querySelector('.dd').textContent = ['', '.', '..', '...'][Math.floor(t * 4) % 4];
        [[B(6.6), 0], [B(10.6), 1], [B(19.5), 2], [B(22.6), 3]].forEach(([a, i]) => { const q = popT(t, a, 99, { from: .3 }); chips[i].style.opacity = q.op; chips[i].style.transform = `scale(${q.s.toFixed(3)})`; chips[i].style.display = q.op > 0 ? '' : 'none'; });
        // the bar's head throws sparks while it moves
        const moving = [[B(6), B(6.6)], [B(10), B(10.6)], [B(12), B(14)], [B(19), B(19.5)], [B(22), B(22.6)], [B(25), B(25.6)], [G1, DROP]].some(([a, b]) => t >= a && t < b + .15);
        if (moving) { const x = 110 + (860 - 172) * v / 100; burst(fx, t, Math.floor(t * 12) / 12, x, 600, { n: 10, speed: 360, life: .35, size: 13, seed: Math.floor(t * 12), grav: 600, dir: -Math.PI / 2, spread: 2.4 }); }
      }
      // sparkles on each item as it goes on
      burst(fx, t, B(6.6), 470, 960, { n: 34, speed: 900, seed: 6 }); burst(fx, t, B(10.6), 560, 1400, { n: 30, speed: 800, seed: 10 });
      burst(fx, t, B(19.5), 860, 760, { n: 40, speed: 1000, seed: 19 }); burst(fx, t, B(22.6), 560, 430, { n: 34, speed: 900, seed: 22 });
      // ---- the stall: the dialog
      const dq = popT(t, B(14.2), B(19.8), { from: .7, fo: .15 }); tf(dlg, { ...dq });
      if (dq.op > 0) {
        const fixed = t >= B(19); dh.textContent = fixed ? '✅ earring back found' : '⚠️ earring back not found'; dm.textContent = fixed ? 'installing hoops… 😮‍💨' : 'hoops could not be installed';
        r1.classList.toggle('on', t >= B(17) && t < B(18)); r2.classList.toggle('on', t >= B(18) && t < B(19));
      }
      // ---- 99%, wait, hair down
      tf(wait, popT(t, B(26), G0, { from: .5 })); tf(fin, popT(t, G0, DROP, { from: .6, fo: .06 }));
      // ---- the drop: 100%
      const bq = slamT(t, DROP, B(34.4), { from: 3, dur: .14 }); tf(big, bq); tf(sub, popT(t, DROP + .08, B(34.4), { from: .4 }));
      rangoli(fx, t, DROP, 540, 820, { life: 1.2 }); burst(fx, t, DROP, 540, 760, { n: 90, speed: 1700, life: 1.1, size: 28, seed: 32, grav: 700 });
      tf(diw, { op: win(t, B(35), B(37), .06, .1), s: lerp(1.12, 1, P(t, B(35), .5)) });
      // ---- pinned labels, glints
      drawPin(pins.h, t, B(37), B(39) - .02, 330, 970, 700, 1250); drawPin(pins.k, t, B(39), B(41) - .02, 870, 1650, 560, 1420);
      drawPin(pins.r, t, B(41), B(43) - .02, 370, 1090, 740, 1360); drawPin(pins.h2, t, B(53), B(55) - .02, 330, 960, 700, 1250);
      if (on(t, B(37), B(39))) twinkle(fx, t, 330, 1000, 34); if (on(t, B(39), B(41))) twinkle(fx, t, 880, 1640, 30, 1);
      if (on(t, B(41), B(43))) { twinkle(fx, t, 375, 1085, 40, 2); burst(fx, t, B(41), 375, 1085, { n: 36, speed: 1000, seed: 41 }); }
      if (on(t, B(53), B(55))) twinkle(fx, t, 330, 990, 34, 3);
      // ---- sticker beat
      tf(hey, slamT(t, B(52) + .04, B(53), { from: 1.8, rot: -4, fo: .04 })); burst(fx, t, B(52), 540, 900, { n: 50, speed: 1300, seed: 52 });
      // ---- the end card, and the bar back to 0% for the loop
      tf(endA, popT(t, B(61), 99, { from: .7, rise: 30 })); tf(endB, popT(t, B(61.5), 99, { from: .5, rise: 30 })); tf(endH, popT(t, B(62.2), 99, { from: .8 }));
      const mo = win(t, B(62), 99, .15, 0); tf(mini, { op: mo });
      if (mo > 0) minif.style.width = (t > D.dur - .2 ? lerp(100, 0, P(t, D.dur - .2, .15)) : 100).toFixed(1) + '%';
      if (t > B(61)) twinkle(fx, t, 780, 1330, 30, 4);
    }
  };
})();
