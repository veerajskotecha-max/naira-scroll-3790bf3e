// I ASKED FOR ONE PHOTO, the elegant cut on track B (the moon song). One line of type at a time, nothing that pops: the ask over
// two posed shots, her 27 videos under a small counter, the 27th (the DP clip) freezing on B's silence ("so i paused one."), the
// drop as the screenshot, eight more stills stacking up as prints on sage, and the DP left on the table as the profile photo.
window.REEL = (() => {
  const C = D.cues, DROP = C.drop, [G0] = C.gap, [V0, V27] = C.vid, FAST = C.fast, [S0, S1] = C.shrink, STACK = C.stack, CARD = C.card;
  const sh = (id, extra = {}) => ({ shot: id, ...extra });
  const VIDS = D.shots.filter(s => /^v\d\d$/.test(s.id)), STILLS = D.shots.filter(s => /^c\d$/.test(s.id));
  const SAGE = '#99B4AF', IVORY = '#FBF3EC';
  const PW = 864, PH = 1536, PB = 14;                                // a print: 80% of the frame, an ivory border
  const fb = face(SH.dp, DROP) || [328, 564, 814, 1150];
  const DPF = [(fb[0] + fb[2]) / 2 + 10, (fb[1] + fb[3]) / 2 + .16 * (fb[3] - fb[1])], DPS = 1.62 * (fb[3] - fb[1]);   // face, fist and hoop
  const DPC = { x: 540, y: 760, r: 300 };
  const R = rng(5), LAY = STILLS.map(() => ({ rot: (R() - .5) * 6, dx: (R() - .5) * 70, dy: (R() - .5) * 50 }));  // each print lands a little askew
  const DPROT = -1.2;
  let lines = {}, cnt, cred, newdp;
  const vidAt = t => { let k = -1; VIDS.forEach((s, i) => { if (t >= s.t0 - 1e-6) k = i; }); return k; };
  // a frame of a shot drawn as a print: centre (x, y), width w (9:16), rotated, ivory border, soft shadow
  function print(c, id, t, x, y, w, rot, a = 1, shadow = 1) {
    const h = w * 16 / 9, b = PB * w / PW;
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot * Math.PI / 180);
    c.shadowColor = `rgba(26,22,20,${(.28 * shadow).toFixed(3)})`; c.shadowBlur = 46; c.shadowOffsetY = 18;
    c.fillStyle = IVORY; c.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b); c.shadowColor = 'transparent';
    c.drawImage(im(fURL(SH[id], t)), -w / 2, -h / 2, w, h); c.restore();
  }
  // the DP from full frame (p=0) to a print (p=1), and from the print (q=0) to the profile circle (q=1)
  function dpShape(c, t, p, q) {
    const img = im(fURL(SH.dp, t));
    const w = lerp(W * lerp(1, 1.03, P(t, DROP, S0 - DROP)), PW, p), h = w * 16 / 9;    // a slow push while it is full frame
    const rot = lerp(0, DPROT, p);
    const cw = lerp(w, 2 * DPC.r, q), ch = lerp(h, 2 * DPC.r, q), rad = lerp(0, DPC.r, q), cx0 = lerp(540, DPC.x, q), cy0 = lerp(960, DPC.y, q);
    const k0 = w / W, k1 = 2 * DPC.r / DPS, k = lerp(k0, k1, E.io(q));                  // image scale: the whole frame, then the face
    const fx0 = lerp(540, DPF[0], E.io(q)), fy0 = lerp(960, DPF[1], E.io(q));           // the source point at the shape's centre
    const b = lerp(PB * p, 8, q);
    c.save(); c.translate(cx0, cy0); c.rotate(lerp(rot, 0, q) * Math.PI / 180);
    if (p > 0) {
      c.shadowColor = `rgba(26,22,20,${(.28 * p).toFixed(3)})`; c.shadowBlur = 46; c.shadowOffsetY = 18;
      c.fillStyle = IVORY; c.beginPath(); c.roundRect(-cw / 2 - b, -ch / 2 - b, cw + 2 * b, ch + 2 * b, rad + b); c.fill(); c.shadowColor = 'transparent';
    }
    c.beginPath(); c.roundRect(-cw / 2, -ch / 2, cw, ch, rad); c.clip();
    c.drawImage(img, -fx0 * k, -fy0 * k, W * k, H * k); c.restore();
  }
  return {
    init() {
      const st = document.createElement('style'); st.textContent = `
        .ln { position:absolute; left:0; width:1080px; top:1196px; text-align:center; white-space:nowrap; font-family:CG; font-style:italic; font-weight:500;
          font-size:76px; line-height:1.1; color:#FBF3EC; letter-spacing:.005em;
          filter:drop-shadow(0 2px 16px rgba(26,22,20,.55)) drop-shadow(0 1px 2px rgba(26,22,20,.45)); }
        .ln.sm { font-size:62px; }
        .cnt { position:absolute; left:0; width:1080px; top:1330px; text-align:center; font-family:Jost; font-weight:400; font-size:26px; letter-spacing:.36em;
          text-transform:uppercase; color:#FBF3EC; filter:drop-shadow(0 1px 6px rgba(26,22,20,.7)); font-variant-numeric:tabular-nums; }
        .card { position:absolute; left:0; width:1080px; text-align:center; }
        .card.h { top:1112px; font-family:CG; font-style:italic; font-weight:500; font-size:124px; line-height:1; color:#FBF3EC;
          filter:drop-shadow(0 2px 10px rgba(80,114,106,.55)); }
        .card.c { top:1268px; font-family:Jost; font-weight:500; font-size:28px; letter-spacing:.24em; color:#1A1614; }`;
      document.head.appendChild(st);
      const mk = (k, txt, cls = '') => { lines[k] = el('ln ' + cls, txt, $('ui')); };
      mk('ask', 'i asked for one photo.'); mk('one', 'just one. for my new dp.'); mk('sent', 'she sent twenty-seven videos.');
      mk('not', 'not one photo.'); mk('pause', 'so i paused one.'); mk('more', '(and eight more.)', 'sm');
      cnt = el('cnt', 'video 01 / 27', $('ui'));
      newdp = el('card h', 'new dp.', $('ui')); cred = el('card c', 'woven gold hoops &nbsp;·&nbsp; @nairaflore', $('ui'));
    },
    plan(t) {
      if (t < B(2)) return { layers: [sh('a1')] };
      if (t < V0) return { layers: [sh('a2')] };
      if (t < V27) return { layers: [sh(VIDS[Math.max(0, vidAt(t))].id)] };
      if (t < S0) return { layers: [], extra: [fURL(SH.dp, t)], pre: c => dpShape(c, t, 0, 0) };
      // on sage: the DP becomes a print, the stills land on it one a beat, then they lift away and the DP becomes the profile photo
      const shown = STILLS.filter(s => t >= s.t0 - 1e-6);
      return { layers: [], bg: SAGE, extra: [fURL(SH.dp, t), ...shown.map(s => fURL(s, t))], pre: c => {
        const p = P(t, S0, S1 - S0, 'io'), q = P(t, CARD + .12, .62, 'io');
        dpShape(c, t, p, q);
        const lift = P(t, CARD - .05, .3, 'io');                        // the stack lifts away before the DP turns into the circle
        if (lift >= 1) return;
        const dst = lift > 0 ? t3 : c;                                  // lifting: composite the stack first, so the prints fade as one
        if (lift > 0) { t3.setTransform(1, 0, 0, 1, 0, 0); t3.globalAlpha = 1; t3.clearRect(0, 0, W, H); }
        shown.forEach((s, i) => {
          const a = P(t, s.t0, .16), L = LAY[i], drop = lerp(1.07, 1, P(t, s.t0, .22, 'out'));
          print(dst, s.id, t, 540 + L.dx, 960 + L.dy, PW * drop, L.rot, a, 1);
        });
        if (lift > 0) { c.save(); c.globalAlpha = 1 - lift; c.drawImage(T3, 0, -90 * lift); c.restore(); }
      } };
    },
    draw(t) {
      const show = (e, a, b, fi = .32, fo = .28, rise = 14) => {
        if (t < a || t > b) { tf(e, { op: 0 }); return; }
        const i = fi > 0 ? P(t, a, fi) : 1, o = 1 - P(t, b - fo, fo, 'io');
        tf(e, { op: Math.min(i, o), y: lerp(rise, 0, P(t, a, fi * 1.6)) });
      };
      show(lines.ask, 0, B(2) - .04, 0, .26, 0);                        // on screen from the first frame
      show(lines.one, B(2) + .02, V0 - .06);
      show(lines.sent, V0 + .02, B(10) - .1);
      show(lines.not, B(28), G0 - .04, .3, .22);
      show(lines.pause, G0, DROP - .02, .12, .12, 8);
      show(lines.more, STACK + .05, B(39) - .1);
      // the counter: each video's number on its cut; 27 is the clip she paused
      const co = t >= V0 && t < DROP ? (t < DROP - .3 ? P(t, V0, .3) : 1 - P(t, DROP - .3, .28)) : 0;
      tf(cnt, { op: co });
      if (co > 0) cnt.textContent = `video ${String(t >= V27 ? 27 : vidAt(t) + 1).padStart(2, '0')} / 27`;
      // the profile card
      show(newdp, CARD + .62, 99, .5, 0, 20);
      show(cred, CARD + .62 + D.beat, 99, .5, 0, 10);
    }
  };
})();
