// FLASH: a photoshoot. At each event the running shot freezes on that instant for the event's hold (a photo), then runs on;
// the white flashes and the shutter punches come from the fx list. Black in the song's silence.
window.REEL = (() => {
  const C = D.cues, EV = C.events, [K0, K1] = C.black;
  const SHOTS = D.shots.slice().sort((a, b) => a.t0 - b.t0);
  const at = t => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0 - 1e-6) s = x; return s; };
  return {
    init() {},
    plan(t) {
      if (t >= K0 - 1e-6 && t < K1 - 1e-6) return { layers: [], bg: '#000' };
      const s = at(t); let tt;
      for (const [te, h] of EV) if (t >= te - 1e-6 && t < te + h - 1e-6 && te >= s.t0 - 1e-6) tt = te;
      return { layers: [tt == null ? { shot: s.id } : { shot: s.id, tt }] };
    },
    draw() {}
  };
})();
