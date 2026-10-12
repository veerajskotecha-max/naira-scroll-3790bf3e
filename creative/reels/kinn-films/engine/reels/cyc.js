// CHOOSE YOUR CHARACTER : a fighting-game select screen of six of her, live, the cursor hopping on every beat. Player 1 locks
// in the main character as the 808s arrive, equips the hoops, the kada and the ring as power-ups, fires the hair tornado, and
// meets the final boss in the bass gap: the wind machine. K.O. on the lift. Back to the grid: which one are you?
window.REEL = (() => {
  const C = D.cues, LIFT = C.lift;
  const sh = (id, extra = {}) => ({ shot: id, ...extra });
  const TL = [0, 1, 2, 3, 4, 5].map(i => ({ x: 75 + (i % 3) * 315, y: 400 + Math.floor(i / 3) * 440, w: 300, h: 410 }));
  const NAMES = ['MAIN CHARACTER', 'EARRING STRUGGLER', 'THE GIGGLER', 'HAIR TORNADO', 'NO COMMENTS', 'THE BUN'];
  const bx = (n) => `<span class="bx">${[0, 1, 2, 3, 4].map(i => `<em class="${i < n ? '' : 'o'}"></em>`).join('')}</span>`;
  const STATS = [`<b>MAIN CHARACTER</b><br>AURA ${bx(5)}<br>EYE CONTACT ${bx(5)}`, `<b>EARRING STRUGGLER</b><br>PATIENCE ${bx(1)}<br>BACKS LOST <i>3</i>`,
    `<b>THE GIGGLER</b><br>COMPOSURE ${bx(0)}<br>LAUGHS <i>ALL OF THEM</i>`, `<b>HAIR TORNADO</b><br>SPIN ${bx(5)}<br>WIND RESISTANCE <i>0</i>`,
    `<b>NO COMMENTS</b><br>REPLIES <i>0</i><br>SEEN <i>✓✓</i>`, `<b>THE BUN</b><br>MESSY ${bx(4)}<br>ON PURPOSE <i>YES</i>`];
  const grid = t => t < B(8) || t >= B(26);
  const cursor = t => t < B(8) ? [0, 1, 2, 3, 4, 5, 0, 0][Math.min(7, Math.floor(t / D.beat + 1e-6))] : Math.floor((t - B(26)) / (D.beat / 2) + 1e-6) % 6;
  const cut = [['c02', 8], ['c03', 9], ['c04', 10], ['c05', 11], ['c06', 12], ['c07', 16], ['c08', 21], ['c09', 24]];
  const which = t => { let c = cut[0]; for (const x of cut) if (t >= B(x[1]) - 1e-6) c = x; return c[0]; };
  const ITEMS = [[8, 'c02', 'hoop2', '<b>ITEM 1/3</b>WOVEN GOLD HOOPS<br><i>+50 AURA</i>'], [9, 'c03', 'kada3', '<b>ITEM 2/3</b>THE KADA<br><i>+30 WRIST GAME</i>'],
    [10, 'c04', 'ring4', '<b>ITEM 3/3</b>TWO-STONE RING<br><i>+20 PEEKABOO</i>'], [11, 'c05', 'hoop5', '<b>STATUS</b>FULLY EQUIPPED!<br><i>AURA 999</i>']];
  let head, headB, tiles = [], stats, sel, cmt, items = [], sm, combo = [], hud, hpL, hpR, warn, boss, arrow, round, fight, ko;
  return {
    init() {
      const st = document.createElement('style'); st.textContent = `
        .bx { display:inline-flex; gap:8px; vertical-align:-2px; margin-left:10px; } .bx em { display:block; width:24px; height:24px; background:#FFBDA8; box-shadow:3px 3px 0 #000; }
        .bx em.o { background:rgba(26,22,20,.5); outline:4px solid #FFBDA8; outline-offset:-4px; }
        .tile .tn { position:absolute; left:0; top:0; font-family:Pixel; font-size:30px; color:#1A1614; background:#FBF3EC; padding:10px 12px 8px; }
        .tile .p1 { left:auto; right:10px; }
        .item { box-sizing:border-box; width:940px; }
        .combo { position:absolute; left:0; width:1080px; text-align:center; font-family:Pixel; font-size:96px; line-height:1.2; color:#FFBDA8; text-shadow:9px 9px 0 #000; }
        .hud { position:absolute; left:50px; width:980px; top:236px; display:flex; align-items:flex-start; gap:22px; font-family:Pixel; color:#FBF3EC; text-shadow:4px 4px 0 #000; }
        .hud .s { flex:1; } .hud .s.r { text-align:right; } .hud .n { font-size:22px; line-height:1.4; margin-bottom:12px; }
        .hud .bar { position:relative; height:34px; border:5px solid #FBF3EC; background:rgba(26,22,20,.65); box-shadow:4px 4px 0 #000; }
        .hud .bar i { position:absolute; top:0; bottom:0; left:0; background:#FFBDA8; } .hud .s.r .bar i { left:auto; right:0; background:#99B4AF; }
        .hud .vs { font-size:46px; color:#FFBDA8; padding-top:30px; }`;
      document.head.appendChild(st);
      head = el('selh', 'CHOOSE YOUR<br>CHARACTER', $('ui'), { top: '200px' }); headB = el('selh', 'WHICH ONE<br>ARE YOU?', $('ui'), { top: '200px' });
      TL.forEach((r, i) => tiles.push(el('tile', `<div class="tn">${i + 1}</div><div class="p1">P1</div><div class="nm">${NAMES[i]}</div>`, $('ui'),
        { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' })));
      stats = el('stats', '', $('ui'), { top: '1300px' });
      sel = el('banner', 'PLAYER 1 SELECTED<i>MAIN CHARACTER</i>', $('ui'), { top: '1300px' });
      cmt = el('banner', 'COMMENT 1-6 👇', $('ui'), { top: '1320px', fontSize: '50px', color: '#FBF3EC' });
      for (const [, , , html] of ITEMS) items.push(el('item', html, $('ui'), { top: '1290px' }));
      sm = el('banner', 'SPECIAL MOVE<i>HAIR TORNADO</i>', $('ui'), { top: '250px' });
      combo = ['x1', 'x2', 'x3 COMBO!'].map(s => el('combo', s, $('ui'), { top: '1330px' }));
      hud = el('hud', `<div class="s"><div class="n">P1 · MAIN CHARACTER</div><div class="bar"><i></i></div></div><div class="vs">VS</div>
        <div class="s r"><div class="n">BOSS · WIND MACHINE</div><div class="bar"><i></i></div></div>`, $('ui'));
      [hpL, hpR] = hud.querySelectorAll('.bar i');
      warn = el('banner', '⚠ WARNING ⚠', $('ui'), { top: '1010px', fontSize: '60px' });
      boss = el('banner', 'FINAL BOSS<i>THE WIND MACHINE</i>', $('ui'), { top: '1010px' });
      arrow = el('combo', '↗', $('ui'), { top: '560px', left: '300px', fontSize: '120px', color: '#FBF3EC' });
      round = el('banner', 'ROUND 1', $('ui'), { top: '1060px', fontSize: '70px', color: '#FBF3EC' });
      fight = el('combo', 'FIGHT!', $('ui'), { top: '1040px', fontSize: '150px' });
      ko = el('ko', 'K.O.<small>YOU LOST.<br>TO A HAND FAN.</small>', $('ui'), { top: '980px' });
    },
    plan(t) {
      if (grid(t)) return {
        layers: TL.map((r, i) => sh('ct' + i, { rect: r, nokick: true })),
        pre: (c) => { c.fillStyle = '#50726A'; c.fillRect(0, 0, W, H); c.fillStyle = '#5A7D75'; for (let y = 0; y < H; y += 60) for (let x = (y / 60) % 2 ? 60 : 0; x < W; x += 120) c.fillRect(x, y, 60, 60); }
      };
      return { layers: [sh(which(t))] };
    },
    draw(t, K) {
      const g = grid(t), cu = cursor(t), end = t >= B(26);
      // ---- the select screen
      tf(head, { op: g && !end ? 1 : 0 }); tf(headB, { op: end ? 1 : 0, s: lerp(1.3, 1, P(t, B(26), .2, 'back')) });
      tiles.forEach((e, i) => {
        const lock = i === 0 && t >= B(7) && t < B(8);
        tf(e, { op: g ? 1 : 0, s: lock ? 1 + .06 * Math.abs(Math.sin((t - B(7)) * 14)) : (i === cu ? 1.03 : 1) });
        e.classList.toggle('on', g && i === cu); e.querySelector('.p1').style.display = g && i === cu ? '' : 'none';
      });
      const sk = t < B(8) ? cu : -1;
      tf(stats, { op: t < B(7) ? 1 : 0 }); if (t < B(7)) stats.innerHTML = STATS[sk];
      tf(sel, popT(t, B(7), B(8), { from: .5, fo: .02 })); tf(cmt, popT(t, B(26.3), 99, { from: .5 }));
      if (t >= B(7) && t < B(8)) burst(fx, t, B(7), TL[0].x + 150, TL[0].y + 200, { n: 40, speed: 1100, life: .7, seed: 7 });
      // ---- power-ups: a card slams in on each beat, the piece glints
      ITEMS.forEach(([k, shot, tr], i) => {
        const a = B(k), b = B(k + 1), q = P(t, a, .18, 'out5');
        tf(items[i], { op: t >= a && t < b ? 1 : 0, x: lerp(1100, 0, q) });
        if (on(t, a, b)) { const p = trkScr(tr, t, K); if (p) { twinkle(fx, t, p[0], p[1], 34, i); burst(fx, t, a + .05, p[0], p[1], { n: 26, speed: 800, life: .55, size: 16, seed: 80 + i }); } }
      });
      // ---- special move
      tf(sm, popT(t, B(12), B(16), { from: .3, fo: .05 }));
      combo.forEach((e, i) => tf(e, slamT(t, B(13 + i), i < 2 ? B(14 + i) : B(16), { from: 2.4, dur: .1, fo: .05, rot: i % 2 ? 4 : -4 })));
      // ---- the boss fight HUD
      const ho = t >= B(16) && t < B(26) ? 1 : 0; tf(hud, { op: ho, y: lerp(-120, 0, P(t, B(16), .25, 'back')) });
      if (ho) {
        const me = t < B(23) ? 100 : (t < LIFT ? lerp(100, 62, P(t, B(23), .2)) : lerp(62, 0, P(t, LIFT, .12)));
        hpL.style.width = me.toFixed(1) + '%'; hpR.style.width = '100%';
      }
      tf(warn, { op: on(t, B(16), B(17.5)) && Math.floor((t - B(16)) / (D.beat / 2)) % 2 === 0 ? 1 : 0 });
      tf(boss, popT(t, B(17.5), B(21), { from: .4, fo: .06 }));
      tf(arrow, { op: on(t, B(17.5), B(21)) ? 1 : 0, x: Math.sin(t * 12) * 10, y: -Math.abs(Math.sin(t * 12)) * 10 });
      tf(round, popT(t, B(21), B(22), { from: .5, fo: .04 })); tf(fight, slamT(t, B(22), B(23.5), { from: 2.6, dur: .12, fo: .08 }));
      // ---- K.O. on the lift
      tf(ko, slamT(t, LIFT, B(26), { from: 3, dur: .14, fo: .06 }));
      burst(fx, t, LIFT, 540, 1080, { n: 90, speed: 1700, life: 1.1, size: 28, seed: 24, grav: 700 });
    }
  };
})();
