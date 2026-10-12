// MULTIPLY: the frame splits with the song (1, 2, 4, 9 tiles), freezes in the silence, and the centre tile bursts back to full
// screen on the drop. Layouts and their tiles come from the cues; each tile is a shot drawn cover-scaled into its cell.
window.REEL = (() => {
  const C = D.cues, SEG = C.seg, GUT = 8, IVORY = '#FBF3EC';
  const cell = (cols, rows) => { const w = (W - (cols - 1) * GUT) / cols, h = (H - (rows - 1) * GUT) / rows;
    return [...Array(cols * rows)].map((_, i) => ({ x: (i % cols) * (w + GUT), y: Math.floor(i / cols) * (h + GUT), w, h })); };
  const RECTS = { full: [{ x: 0, y: 0, w: W, h: H }], '2v': cell(1, 2), '2x2': cell(2, 2), '3x3': cell(3, 3) };
  const mix = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p) });
  const segAt = t => SEG.find(s => t >= s.t0 - 1e-6 && t < s.t1 - 1e-6) || SEG[SEG.length - 1];
  let brand;
  return {
    init() {
      const st = document.createElement('style'); st.textContent = `
        .brand { position:absolute; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; background:#99B4AF; }
        .brand b { font-family:CG; font-style:italic; font-weight:500; font-size:50px; line-height:1; color:#FBF3EC; }
        .brand i { font-style:normal; font-family:Jost; font-weight:500; font-size:17px; letter-spacing:.26em; text-transform:uppercase; color:#1A1614; }`;
      document.head.appendChild(st);
      const c = RECTS['3x3'][4];
      brand = el('brand', '<b>@nairaflore</b><i>woven gold hoops</i>', $('ui'), { left: c.x + 'px', top: c.y + 'px', width: c.w + 'px', height: c.h + 'px' });
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
      return { bg: IVORY, layers };
    },
    draw(t) {
      const sg = segAt(t), i = sg.tiles.indexOf('brand');
      if (i < 0 || !sg.build) { tf(brand, { op: 0 }); return; }
      const b = sg.build[sg.order.indexOf(i)];
      tf(brand, { op: P(t, b, .1), s: lerp(.9, 1, P(t, b, .35, 'out')) });
    }
  };
})();
