// MULTIPLY: the frame splits with the song (1, 2, 4, 9 tiles), freezes in the silence, and the centre tile bursts back to full
// screen on the drop. Layouts and their tiles come from the cues; each tile is a shot drawn cover-scaled into its cell.
// The graphics stay small: the nine-tile grids carry an index number per tile (the comment prompt), the clap draws a blush
// frame round 05 before the drop bursts it, and the last grid closes on the brand tile: the NAIRA wordmark, sage with the
// blush flower, the same drawing as the site's header.
window.REEL = (() => {
  const C = D.cues, SEG = C.seg, GUT = 8, IVORY = '#FBF3EC';
  const cell = (cols, rows) => { const w = (W - (cols - 1) * GUT) / cols, h = (H - (rows - 1) * GUT) / rows;
    return [...Array(cols * rows)].map((_, i) => ({ x: (i % cols) * (w + GUT), y: Math.floor(i / cols) * (h + GUT), w, h })); };
  const RECTS = { full: [{ x: 0, y: 0, w: W, h: H }], '2v': cell(1, 2), '2x2': cell(2, 2), '3x3': cell(3, 3) };
  const mix = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p) });
  const segAt = t => SEG.find(s => t >= s.t0 - 1e-6 && t < s.t1 - 1e-6) || SEG[SEG.length - 1];
  const NUM_Y = 252;      // the index sits this far down each tile: clear of Instagram's top bar in row 1, of its caption in row 3
  const LOGO = '../img/logo_sage.svg';   // drawn on the fx canvas from the preloaded image, so a frame never catches it loading
  let brand, nums = [], sel;
  return {
    init() {
      const st = document.createElement('style'); st.textContent = `
        .brand { position:absolute; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#FBF3EC; }
        .brand .wm { width:250px; height:56px; }
        .brand .rule { width:46px; height:2px; background:#99B4AF; margin:30px 0 22px; }
        .brand i { font-style:italic; font-family:CG; font-weight:500; font-size:31px; line-height:1; color:#50726A; }
        .brand b { margin-top:14px; font-family:Jost; font-weight:500; font-size:16px; letter-spacing:.22em; color:#1A1614; }
        .num { position:absolute; font-family:Jost; font-weight:500; font-size:30px; line-height:1; letter-spacing:.14em; color:#FBF3EC;
          font-variant-numeric:tabular-nums; filter:drop-shadow(0 1px 2px rgba(26,22,20,.65)) drop-shadow(0 2px 10px rgba(26,22,20,.45)); }
        .num::before { content:''; display:inline-block; width:18px; height:2px; margin:0 10px 0 0; vertical-align:.32em; background:currentColor; }
        .num.on { color:#FFBDA8; }
        .sel { position:absolute; box-sizing:border-box; border:9px solid #FFBDA8; box-shadow:inset 0 0 0 2px rgba(26,22,20,.35), 0 0 0 2px rgba(26,22,20,.35), 0 0 36px rgba(255,189,168,.7); }`;
      document.head.appendChild(st);
      const c = RECTS['3x3'][4];
      brand = el('brand', '<div class="wm"></div><div class="rule"></div><i>woven gold hoops</i><b>@NAIRAFLORE</b>', $('ui'),
        { left: c.x + 'px', top: c.y + 'px', width: c.w + 'px', height: c.h + 'px' });
      nums = RECTS['3x3'].map(r => el('num', '', $('ui'), { left: (r.x + 20) + 'px', top: (r.y + NUM_Y) + 'px' }));
      sel = el('sel', '', $('ui'), { left: c.x + 'px', top: c.y + 'px', width: c.w + 'px', height: c.h + 'px' });
    },
    plan(t) {
      const sg = segAt(t), R = RECTS[sg.kind], layers = [];
      if (sg.grow != null && t < sg.t0 + .22) {                                          // the frozen grid stays under the burst
        const pv = SEG[SEG.indexOf(sg) - 1];
        pv.tiles.forEach((id, i) => { if (i !== sg.grow) layers.push({ shot: id, rect: RECTS[pv.kind][i], tt: pv.freeze }); });
      }
      sg.tiles.forEach((id, i) => {
        if (id === 'brand') return;
        const L = { shot: id, rect: R[i] };
        if (sg.freeze != null && t >= sg.freeze) L.tt = sg.freeze;                       // everything stops in the silence
        if (sg.cascade) L.tt = t - sg.cascade * i;                                         // one spin rippling across the grid
        if (sg.build) {                                                                    // the last bar: tiles arrive one by one
          const b = sg.build[sg.order.indexOf(i)]; if (t < b - 1e-6) return;
          L.alpha = P(t, b, .08); L.z = lerp(1.14, 1, P(t, b, .3, 'out'));
        }
        if (sg.grow != null) L.rect = mix(RECTS['3x3'][sg.grow], RECTS.full[0], P(t, sg.t0, .22, 'out'));   // out of the centre tile
        layers.push(L);
      });
      return { bg: IVORY, layers, extra: [LOGO] };
    },
    draw(t) {
      const sg = segAt(t);
      // the index numbers: the first nine-grid shows them all a beat after it opens; the last one counts them in as tiles land
      nums.forEach((e, i) => {
        const n = sg.num && sg.num[i];
        if (!n) { tf(e, { op: 0 }); return; }
        const t0 = sg.build ? sg.build[sg.order.indexOf(i)] : sg.t0 + D.beat / 2;
        e.textContent = n; e.classList.toggle('on', !!(sg.sel && i === sg.sel.tile && t >= sg.sel.t));
        tf(e, { op: P(t, t0, .14), x: lerp(-10, 0, P(t, t0, .3)) });
      });
      // the clap picks 05
      if (sg.sel && t >= sg.sel.t) tf(sel, { op: P(t, sg.sel.t, .05), s: lerp(1.06, 1, P(t, sg.sel.t, .14, 'out')) });
      else tf(sel, { op: 0 });
      // the brand tile lands last, in the centre
      const i = sg.tiles.indexOf('brand');
      if (i < 0 || !sg.build) { tf(brand, { op: 0 }); return; }
      const b = sg.build[sg.order.indexOf(i)], op = P(t, b, .1);
      tf(brand, { op, s: lerp(.9, 1, P(t, b, .35, 'out')) });
      if (op > 0) { const r = brand.querySelector('.wm').getBoundingClientRect(); fx.save(); fx.globalAlpha = op; fx.drawImage(im(LOGO), r.left, r.top, r.width, r.height); fx.restore(); }
    }
  };
})();
