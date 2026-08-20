import { useEffect, useRef, useState } from "react";
import floralBg from "@/assets/floral-pattern-bg.webp";

/* ───────────────────────────────────────────────────────────────
   RING ATELIER BACKDROP
   The hero's pressed-flower paper wash carried behind the turning
   ring, with slow 3D-parallax petals and glass orbs that drift on
   scroll/pointer, plus an elegant flower bloom wherever the client
   taps. Scoped to this section only. Reduced motion: static wash.
   ─────────────────────────────────────────────────────────────── */

type BloomSpecies = {
  name: string;
  /** petal outline path in a 40x80 viewBox */
  d: string;
  /** number of petals in the outer whorf */
  petals: number;
  /** petal length in px */
  size: number;
  /** travel distance of each petal from the tap point */
  spread: number;
  /** palette used for petals, cycled */
  palette: string[];
  /** inner whorl petal ratio (0 = none) */
  inner: number;
  /** halo ring tint */
  halo: string;
  /** core gradient */
  core: string;
  /** open duration in seconds */
  dur: number;
};

/* Six botanicals, each with its own silhouette, petal count and palette,
   so no two taps look the same. Colours stay inside the Naira palette:
   blush, warm beige, sage, cream, faded teal, antique gold. */
const SPECIES: BloomSpecies[] = [
  {
    name: "rose",
    d: "M20,3 C34,20 35,52 20,77 C5,52 6,20 20,3 Z",
    petals: 9,
    size: 34,
    spread: 46,
    palette: ["#F3D9C6", "#E5B9A4", "#FFC9B4", "#EFCDBB"],
    inner: 0.58,
    halo: "rgba(229,185,164,0.42)",
    core: "radial-gradient(circle, #FFF6E2 0%, #E5B9A4 58%, transparent 74%)",
    dur: 1.5,
  },
  {
    name: "wild five",
    d: "M20,4 C36,22 38,54 20,76 C2,54 4,22 20,4 Z",
    petals: 5,
    size: 40,
    spread: 52,
    palette: ["#AEBDB6", "#C9D5CE", "#DCE6E1"],
    inner: 0,
    halo: "rgba(174,189,182,0.45)",
    core: "radial-gradient(circle, #FFFDF6 0%, #C9A44C 62%, transparent 76%)",
    dur: 1.35,
  },
  {
    name: "jasmine star",
    d: "M20,2 C26,24 30,40 20,78 C10,40 14,24 20,2 Z",
    petals: 6,
    size: 44,
    spread: 58,
    palette: ["#FFF6EA", "#F6E4D5", "#FFEFE2"],
    inner: 0.5,
    halo: "rgba(201,154,76,0.36)",
    core: "radial-gradient(circle, #FFFBF0 0%, #E8C88A 60%, transparent 76%)",
    dur: 1.6,
  },
  {
    name: "marigold",
    d: "M20,6 C30,22 31,48 20,74 C9,48 10,22 20,6 Z",
    petals: 14,
    size: 26,
    spread: 40,
    palette: ["#E9C79B", "#DCB07E", "#F2D9B6", "#C99A4C"],
    inner: 0.62,
    halo: "rgba(201,154,76,0.4)",
    core: "radial-gradient(circle, #FFF3D8 0%, #C99A4C 60%, transparent 76%)",
    dur: 1.7,
  },
  {
    name: "camellia",
    d: "M20,4 C39,18 40,56 20,78 C0,56 1,18 20,4 Z",
    petals: 7,
    size: 38,
    spread: 48,
    palette: ["#FFD6C6", "#F0BCA8", "#FFE6DA", "#E5B9A4"],
    inner: 0.55,
    halo: "rgba(255,189,168,0.42)",
    core: "radial-gradient(circle, #FFF8EE 0%, #F0BCA8 58%, transparent 74%)",
    dur: 1.45,
  },
  {
    name: "teal bud",
    d: "M20,3 C31,26 32,52 20,77 C8,52 9,26 20,3 Z",
    petals: 8,
    size: 30,
    spread: 44,
    palette: ["#8FB0AE", "#B7CCC6", "#2F5D63", "#D6E3DE"],
    inner: 0.5,
    halo: "rgba(47,93,99,0.32)",
    core: "radial-gradient(circle, #F4FBF8 0%, #8FB0AE 58%, transparent 74%)",
    dur: 1.55,
  },
];

type Bloom = {
  id: number;
  x: number;
  y: number;
  species: BloomSpecies;
  /** whole-bloom rotation so repeats never align */
  tilt: number;
  /** 0.82 – 1.18 scale jitter */
  scale: number;
  /** dew sparkle offsets */
  dew: { a: number; d: number; s: number; delay: number }[];
};

const PETALS = [
  { l: "6%", t: "12%", w: 130, rot: -18, z: -220, color: "#FFBDA8", op: 0.5, dur: "26s", delay: "0s" },
  { l: "26%", t: "68%", w: 96, rot: 14, z: -140, color: "#AEBDB6", op: 0.45, dur: "31s", delay: "-6s" },
  { l: "52%", t: "8%", w: 74, rot: -34, z: -300, color: "#E5B9A4", op: 0.4, dur: "35s", delay: "-12s" },
  { l: "72%", t: "58%", w: 120, rot: 22, z: -180, color: "#FFBDA8", op: 0.42, dur: "29s", delay: "-3s" },
  { l: "88%", t: "22%", w: 86, rot: -8, z: -260, color: "#AEBDB6", op: 0.4, dur: "33s", delay: "-9s" },
];

const ORBS = [
  { l: "16%", t: "34%", s: 190, z: -340, dur: "24s", delay: "0s" },
  { l: "80%", t: "72%", s: 150, z: -260, dur: "28s", delay: "-8s" },
  { l: "62%", t: "18%", s: 110, z: -400, dur: "32s", delay: "-4s" },
];

const RingAtelierBackdrop = ({ variant = "section" }: { variant?: "section" | "page" | "sticky" }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [blooms, setBlooms] = useState<Bloom[]>([]);
  const seq = useRef(0);
  const lastSpecies = useRef(-1);
  const isPage = variant === "page";
  const isSticky = variant === "sticky";

  /* Pointer parallax on the 3D layer.
     Two guards here exist purely to stop desktop/tablet flicker: the rAF loop
     used to run forever on every mounted backdrop (the home page mounts two),
     repainting full-viewport 3D layers every frame even while the section was
     off-screen. That constant compositor churn is what made the ring section
     shimmer while scrolling. Now the loop only runs while the backdrop is
     visible AND the layer is still settling, and it parks itself the moment
     the target is reached. Visually identical — same drift, same angles. */
  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current;
    if (!root || !layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let visible = false;

    const tick = () => {
      raf = 0;
      const dx = tx - cx;
      const dy = ty - cy;
      cx += dx * 0.08;
      cy += dy * 0.08;
      layer.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      // settled — stop burning frames until the pointer moves again
      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;
      if (visible) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (visible && !raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (!visible) return;
      const r = root.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 8;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 6;
      wake();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        // Pausing the decorative CSS keyframes off-screen keeps the compositor
        // idle while the client is elsewhere on the page.
        root.style.setProperty("--naira-ring-play", visible ? "running" : "paused");
        if (visible) wake();
        else if (raf) { cancelAnimationFrame(raf); raf = 0; }
      },
      { rootMargin: "120px" }
    );
    io.observe(root);

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);


  // flower bloom wherever the client taps
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onDown = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      const id = ++seq.current;

      // never repeat the same botanical twice in a row
      let idx = Math.floor(Math.random() * SPECIES.length);
      if (idx === lastSpecies.current) idx = (idx + 1 + Math.floor(Math.random() * (SPECIES.length - 1))) % SPECIES.length;
      lastSpecies.current = idx;

      const species = SPECIES[idx];
      const dew = Array.from({ length: 3 + Math.floor(Math.random() * 3) }).map(() => ({
        a: Math.random() * 360,
        d: species.spread * (0.75 + Math.random() * 0.7),
        s: 2 + Math.random() * 2.5,
        delay: 0.1 + Math.random() * 0.35,
      }));

      const bloom: Bloom = {
        id,
        x,
        y,
        species,
        tilt: Math.random() * 360,
        scale: 0.82 + Math.random() * 0.36,
        dew,
      };
      setBlooms((prev) => [...prev.slice(-4), bloom]);
      window.setTimeout(() => setBlooms((prev) => prev.filter((b) => b.id !== id)), (species.dur + 0.5) * 1000);
    };


    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none overflow-hidden ${isPage ? "fixed inset-0 -z-10" : isSticky ? "sticky top-0 h-[100svh] w-full" : "absolute inset-0"}`}
      style={isPage ? { backgroundColor: "#FBF3EC" } : undefined}
      aria-hidden
    >
      <style>{`
        @keyframes naira-ring-float {
          0%   { transform: translate3d(0,0,0) rotate(var(--r, 0deg)); }
          50%  { transform: translate3d(var(--dx, 14px), var(--dy, -18px), 0) rotate(calc(var(--r, 0deg) + 8deg)); }
          100% { transform: translate3d(0,0,0) rotate(var(--r, 0deg)); }
        }
        @keyframes naira-ring-orb {
          0%   { transform: translate3d(0,0,0) scale(1); opacity: .35; }
          50%  { transform: translate3d(-16px, 18px, 0) scale(1.08); opacity: .5; }
          100% { transform: translate3d(0,0,0) scale(1); opacity: .35; }
        }
        /* outer whorl: unfurls outward, tips curling as it opens, then fades */
        @keyframes naira-bloom-petal {
          0%   { transform: rotate(var(--a)) translateY(0) scale(.14) rotate(-12deg); opacity: 0; }
          18%  { opacity: .95; }
          62%  { transform: rotate(var(--a)) translateY(calc(-0.86 * var(--d))) scale(1.02) rotate(2deg); opacity: .8; }
          100% { transform: rotate(var(--a)) translateY(calc(-1.06 * var(--d))) scale(.94) rotate(6deg); opacity: 0; }
        }
        /* inner whorl: slower, tighter, offset half a step */
        @keyframes naira-bloom-inner {
          0%   { transform: rotate(var(--a)) translateY(0) scale(.1); opacity: 0; }
          26%  { opacity: .85; }
          100% { transform: rotate(var(--a)) translateY(calc(-1 * var(--d))) scale(.86); opacity: 0; }
        }
        @keyframes naira-bloom-ring {
          0%   { transform: scale(.18); opacity: .6; }
          55%  { opacity: .3; }
          100% { transform: scale(1.75); opacity: 0; }
        }
        @keyframes naira-bloom-ring-2 {
          0%   { transform: scale(.1); opacity: .35; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes naira-bloom-core {
          0%   { transform: scale(0); opacity: .95; }
          45%  { transform: scale(1.05); opacity: .7; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes naira-bloom-dew {
          0%   { transform: rotate(var(--a)) translateY(0) scale(.4); opacity: 0; }
          35%  { opacity: .9; }
          100% { transform: rotate(var(--a)) translateY(calc(-1 * var(--d))) scale(1); opacity: 0; }
        }
        /* whole bloom breathes open with a slow quarter turn */
        @keyframes naira-bloom-turn {
          0%   { transform: rotate(var(--t)) scale(.9); }
          100% { transform: rotate(calc(var(--t) + 16deg)) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .naira-ring-motion { animation: none !important; }
        }
      `}</style>

      {/* pressed-flower paper wash */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: `url(${floralBg})`, backgroundSize: "150% auto" }}
      />
      {/* warm sun-faded gradient */}
      <div className="absolute inset-0 [background:radial-gradient(120%_62%_at_50%_0%,#FFF1E6_0%,transparent_62%),radial-gradient(80%_60%_at_100%_100%,#FFD9C7_0%,transparent_58%),radial-gradient(70%_55%_at_0%_85%,#DCE6E1_0%,transparent_60%)] opacity-90" />

      {/* 3D drifting layer */}
      <div
        className="absolute inset-0"
        style={{ perspective: "900px", perspectiveOrigin: "50% 45%" }}
      >
        <div
          ref={layerRef}
          className="absolute inset-0 will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {ORBS.map((o, i) => (
            <div
              key={`orb-${i}`}
              className="naira-ring-motion absolute rounded-full"
              style={{
                left: o.l,
                top: o.t,
                width: o.s,
                height: o.s,
                transform: `translateZ(${o.z}px)`,
                background:
                  "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9) 0%, rgba(255,214,196,0.35) 42%, rgba(174,189,182,0.16) 70%, transparent 74%)",
                animation: `naira-ring-orb ${o.dur} ease-in-out ${o.delay} infinite`,
                willChange: "transform, opacity",
              }}
            />
          ))}

          {PETALS.map((p, i) => (
            <svg
              key={`petal-${i}`}
              viewBox="0 0 100 34"
              className="naira-ring-motion absolute"
              style={
                {
                  left: p.l,
                  top: p.t,
                  width: p.w,
                  height: p.w * 0.34,
                  opacity: p.op,
                  "--r": `${p.rot}deg`,
                  "--dx": `${(i % 2 ? -1 : 1) * (10 + i * 4)}px`,
                  "--dy": `${-14 - i * 3}px`,
                  animation: `naira-ring-float ${p.dur} ease-in-out ${p.delay} infinite`,
                  willChange: "transform",
                } as React.CSSProperties
              }
            >
              <path d="M2,17 C18,2 70,2 98,17 C70,32 18,32 2,17 Z" fill={p.color} />
            </svg>
          ))}
        </div>
      </div>

      {/* touch blooms — a different botanical, palette and tilt every tap */}
      {blooms.map((b) => {
        const s = b.species;
        const innerCount = s.inner ? Math.max(3, Math.round(s.petals * 0.6)) : 0;
        return (
          <div
            key={b.id}
            className="absolute"
            style={
              {
                left: b.x,
                top: b.y,
                "--t": `${b.tilt}deg`,
                transform: `rotate(${b.tilt}deg) scale(${b.scale})`,
                animation: `naira-bloom-turn ${s.dur}s cubic-bezier(.16,1,.3,1) forwards`,
              } as React.CSSProperties
            }
          >
            {/* twin dew rings */}
            <span
              className="absolute block rounded-full border"
              style={{
                width: 88,
                height: 88,
                marginLeft: -44,
                marginTop: -44,
                borderColor: s.halo,
                animation: `naira-bloom-ring ${s.dur * 0.85}s cubic-bezier(.16,1,.3,1) forwards`,
              }}
            />
            <span
              className="absolute block rounded-full border"
              style={{
                width: 64,
                height: 64,
                marginLeft: -32,
                marginTop: -32,
                borderColor: s.halo,
                animation: `naira-bloom-ring-2 ${s.dur}s cubic-bezier(.16,1,.3,1) .1s forwards`,
              }}
            />
            {/* pollen core */}
            <span
              className="absolute block rounded-full"
              style={{
                width: 15,
                height: 15,
                marginLeft: -7.5,
                marginTop: -7.5,
                background: s.core,
                animation: `naira-bloom-core ${s.dur * 0.8}s ease-out forwards`,
              }}
            />

            {/* outer whorl */}
            {Array.from({ length: s.petals }).map((_, i) => (
              <svg
                key={`o-${i}`}
                viewBox="0 0 40 80"
                style={
                  {
                    position: "absolute",
                    width: s.size * 0.5,
                    height: s.size,
                    marginLeft: -s.size * 0.25,
                    marginTop: -s.size * 0.5,
                    transformOrigin: "50% 50%",
                    "--a": `${(i * 360) / s.petals}deg`,
                    "--d": `${s.spread + (i % 3) * 7}px`,
                    animation: `naira-bloom-petal ${s.dur}s cubic-bezier(.16,1,.3,1) ${i * 0.025}s forwards`,
                  } as React.CSSProperties
                }
              >
                <path d={s.d} fill={s.palette[i % s.palette.length]} opacity="0.88" />
                <path
                  d="M20,10 C22,32 22,52 20,70"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1.1"
                  fill="none"
                />
              </svg>
            ))}

            {/* inner whorl, offset half a step for depth */}
            {Array.from({ length: innerCount }).map((_, i) => (
              <svg
                key={`i-${i}`}
                viewBox="0 0 40 80"
                style={
                  {
                    position: "absolute",
                    width: s.size * 0.34,
                    height: s.size * 0.68,
                    marginLeft: -s.size * 0.17,
                    marginTop: -s.size * 0.34,
                    transformOrigin: "50% 50%",
                    "--a": `${(i * 360) / innerCount + 180 / innerCount}deg`,
                    "--d": `${s.spread * s.inner}px`,
                    animation: `naira-bloom-inner ${s.dur * 1.1}s cubic-bezier(.16,1,.3,1) ${0.06 + i * 0.03}s forwards`,
                  } as React.CSSProperties
                }
              >
                <path d={s.d} fill={s.palette[(i + 1) % s.palette.length]} opacity="0.7" />
              </svg>
            ))}

            {/* dew sparkles drifting off the bloom */}
            {b.dew.map((d, i) => (
              <span
                key={`d-${i}`}
                className="absolute block rounded-full"
                style={
                  {
                    width: d.s,
                    height: d.s,
                    marginLeft: -d.s / 2,
                    marginTop: -d.s / 2,
                    background: "radial-gradient(circle, #FFFDF4 0%, rgba(201,154,76,0.6) 70%, transparent 74%)",
                    "--a": `${d.a}deg`,
                    "--d": `${d.d}px`,
                    animation: `naira-bloom-dew ${s.dur * 1.2}s cubic-bezier(.16,1,.3,1) ${d.delay}s forwards`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        );
      })}

    </div>
  );
};

export default RingAtelierBackdrop;
