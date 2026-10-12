// HOOP ZOOM: each shot is full frame with its focus on the tracked hoop; the zoom schedule in the cues snaps or pushes into it
// (a tile-style rect, so the hoop is pulled toward the centre as far as the frame still covers the screen). The last shot names it.
window.REEL = (() => {
  const C = D.cues, Z = C.zoom || {};
  const SHOTS = D.shots.slice().sort((a, b) => a.t0 - b.t0);
  const at = t => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0 - 1e-6) s = x; return s; };
  const zoomAt = (id, t) => { let z = 1; for (const [ts, zt, d, e] of (Z[id] || [])) { if (t < ts - 1e-6) break; z = lerp(z, zt, P(t, ts, d, e || 'out')); } return z; };
  let cred;
  return {
    init() {
      const st = document.createElement('style'); st.textContent = `
        .crd { position:absolute; left:0; width:1080px; top:1318px; text-align:center; font-family:Jost; font-weight:500; font-size:26px; letter-spacing:.28em;
          color:#FBF3EC; filter:drop-shadow(0 1px 3px rgba(26,22,20,.8)) drop-shadow(0 2px 14px rgba(26,22,20,.6)); }`;
      document.head.appendChild(st);
      cred = el('crd', 'woven gold hoops &nbsp;·&nbsp; @nairaflore', $('ui'));
    },
    plan(t) {
      const s = at(t), tr = D.tracks && D.tracks[s.id] ? trk(s.id, t) : null;
      return { layers: [{ shot: s.id, rect: { x: 0, y: 0, w: W, h: H }, focus: tr || s.focus || [540, 960], z: zoomAt(s.id, t) }] };
    },
    draw(t) { tf(cred, { op: P(t, C.credit, .6), y: lerp(10, 0, P(t, C.credit, .8)) }); }
  };
})();
