/* ───────────────────────────────────────────────────────────────
   FILM GRAIN + VIGNETTE
   A fixed, full-screen overlay that adds tactile film grain and a
   whisper of vignette — the "pressed paper" feel of an editorial.
   Pure CSS/SVG noise, pointer-events-none. Desktop-only: the
   full-viewport mix-blend layer forces whole-screen recomposits every
   frame, which tanks scroll smoothness on mobile GPUs — phones get
   the clean page instead.

   The grain does not move. It used to run film-grain-shift on a
   steps(4) loop, which snapped the whole overlay to a new offset about
   six times a second, for as long as the page was open. On a fixed,
   full-screen, mix-blend-overlay layer each of those steps costs a
   re-blend of the entire viewport against everything under it — and
   because it is desktop-only, so was the symptom. Measured over five
   scroll passes of the home page: a median of 36 dropped frames per
   pass with the shift running against 21 with it off.

   The texture, the opacity, the blend mode and the vignette are all
   unchanged — this is the same layer the reduced-motion path always
   rendered, now shown to everyone.
   ─────────────────────────────────────────────────────────────── */

const grainSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
    <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter>
    <rect width='100%' height='100%' filter='url(%23n)'/>
  </svg>`.replace(/\n\s*/g, " ")
);

const FilmGrain = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-[9000] hidden lg:block">
    <div
      className="film-grain absolute inset-0 opacity-[0.05] mix-blend-overlay"
      style={{ backgroundImage: `url("data:image/svg+xml,${grainSvg}")`, backgroundSize: "160px 160px" }}
    />
    <div className="absolute inset-0 [background:radial-gradient(120%_120%_at_50%_50%,transparent_62%,rgba(26,22,20,0.16)_100%)]" />
  </div>
);

export default FilmGrain;
