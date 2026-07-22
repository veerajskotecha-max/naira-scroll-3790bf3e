/* ───────────────────────────────────────────────────────────────
   FILM GRAIN + VIGNETTE
   A fixed, full-screen overlay that adds tactile film grain and a
   whisper of vignette — the "pressed paper" feel of an editorial.
   Pure CSS/SVG noise, GPU-cheap, pointer-events-none. Honours
   prefers-reduced-motion (grain holds still).
   ─────────────────────────────────────────────────────────────── */

const grainSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
    <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter>
    <rect width='100%' height='100%' filter='url(%23n)'/>
  </svg>`.replace(/\n\s*/g, " ")
);

const FilmGrain = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-[9000]">
    <div
      className="film-grain absolute inset-0 opacity-[0.05] mix-blend-overlay"
      style={{ backgroundImage: `url("data:image/svg+xml,${grainSvg}")`, backgroundSize: "160px 160px" }}
    />
    <div className="absolute inset-0 [background:radial-gradient(120%_120%_at_50%_50%,transparent_62%,rgba(26,22,20,0.16)_100%)]" />
    <style>{`
      @keyframes film-grain-shift {
        0%   { transform: translate(0,0); }
        20%  { transform: translate(-6%,4%); }
        40%  { transform: translate(4%,-5%); }
        60%  { transform: translate(-3%,3%); }
        80%  { transform: translate(5%,2%); }
        100% { transform: translate(0,0); }
      }
      .film-grain { animation: film-grain-shift 0.7s steps(4) infinite; }
      @media (prefers-reduced-motion: reduce) { .film-grain { animation: none; } }
    `}</style>
  </div>
);

export default FilmGrain;
