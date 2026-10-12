// Shared by the two elegant Punjabi-song reels: one shot at a time, straight cuts, lyric lines in a quiet serif, and one credit.
// Configured by the reel's cues: lines [[text, t0, t1], ...], credit (time), frame (a hairline inset round the picture).
window.REEL = (() => {
  const CFG = D.cues, sh = id => ({ shot: id });
  const SHOTS = D.shots.slice().sort((a, b) => a.t0 - b.t0);
  const at = t => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0 - 1e-6) s = x; return s.id; };
  let subs = [], cred, frame;
  return {
    init() {
      const st = document.createElement('style'); st.textContent = `
        .sub { position:absolute; left:0; width:1080px; top:1238px; text-align:center; white-space:nowrap; font-family:CG; font-style:italic; font-weight:500;
          font-size:60px; line-height:1.12; color:#FBF3EC; filter:drop-shadow(0 2px 14px rgba(26,22,20,.6)) drop-shadow(0 1px 2px rgba(26,22,20,.45)); }
        .crd { position:absolute; left:0; width:1080px; top:1318px; text-align:center; font-family:Jost; font-weight:500; font-size:26px; letter-spacing:.28em;
          color:#FBF3EC; filter:drop-shadow(0 1px 3px rgba(26,22,20,.8)) drop-shadow(0 2px 14px rgba(26,22,20,.6)); }
        .frm { position:absolute; left:34px; top:34px; right:34px; bottom:34px; border:2px solid rgba(251,243,236,.78); pointer-events:none; }`;
      document.head.appendChild(st);
      subs = CFG.lines.map(([txt]) => el('sub', txt, $('ui')));
      cred = el('crd', 'woven gold hoops &nbsp;·&nbsp; @nairaflore', $('ui'));
      if (CFG.frame) frame = el('frm', '', $('ui'));
    },
    plan(t) { return { layers: [sh(at(t))] }; },
    draw(t) {
      CFG.lines.forEach(([, a, b], i) => {
        const o = t < a || t > b ? 0 : Math.min(P(t, a, .4), 1 - P(t, b - .35, .35, 'io'));
        tf(subs[i], { op: o, y: lerp(12, 0, P(t, a, .6)) });
      });
      tf(cred, { op: P(t, CFG.credit, .6), y: lerp(10, 0, P(t, CFG.credit, .8)) });
    }
  };
})();
