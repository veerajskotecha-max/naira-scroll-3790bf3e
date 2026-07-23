/* =============================================================================
   Naira Flore — FloatingRing.tsx  (scroll-linked, CLAMPED)
   Gold solitaire ring that turns as you scroll — rotation is clamped to a gentle
   range so it NEVER goes edge-on. Floats softly. Self-contained.
   ============================================================================= */

import React from "react";

type Gem = "zircone" | "emerald" | "blush" | "pearl";
type Stage = "cream" | "ink" | "none";

interface FloatingRingProps {
  gem?: Gem;
  stage?: Stage;
  size?: number;
  maxTurn?: number;
  eyebrow?: string;
  caption?: string;
  className?: string;
}

const GEM_STOPS: Record<Gem, [string, string, string]> = {
  zircone: ["#FFFFFF", "#EAF1F4", "#B9C6CE"],
  emerald: ["#D6E7E2", "#7E9C95", "#3C4F4A"],
  blush: ["#FFE0D5", "#D08469", "#8C4533"],
  pearl: ["#FFFFFF", "#FFF5EE", "#E4C9AE"],
};

export default function FloatingRing({
  gem = "zircone",
  stage = "cream",
  size = 460,
  maxTurn = 26,
  eyebrow = "The Zircone Edit · Demi-Gold",
  caption = "The Marigold Solitaire",
  className = "",
}: FloatingRingProps) {
  const uid = React.useId().replace(/[:]/g, "");
  const goldId = `gold-${uid}`;
  const goldRimId = `goldrim-${uid}`;
  const gemId = `gem-${uid}`;
  const gemHiId = `gemhi-${uid}`;
  const bandId = `band-${uid}`;
  const [g0, g1, g2] = GEM_STOPS[gem];

  const stageRef = React.useRef<HTMLDivElement>(null);
  const turnRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = stageRef.current;
    const turn = turnRef.current;
    if (!el || !turn) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = r.top + r.height / 2;
      let p = (center - vh / 2) / (vh / 2 + r.height / 2);
      p = Math.max(-1, Math.min(1, p));
      const angle = p * maxTurn;
      turn.style.transform = `perspective(1200px) rotateX(6deg) rotateY(${angle.toFixed(2)}deg)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const apply = () => {
      if (mql.matches) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        turn.style.transform = "perspective(1200px) rotateX(6deg) rotateY(-8deg)";
      } else {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();
      }
    };

    apply();
    mql.addEventListener("change", apply);
    return () => {
      mql.removeEventListener("change", apply);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [maxTurn]);

  const stageBg =
    stage === "ink"
      ? "radial-gradient(120% 120% at 50% 22%, #2A211B 0%, #1A1614 72%)"
      : stage === "cream"
      ? "radial-gradient(130% 120% at 50% 18%, #FFF6F1 0%, #F6E3D6 55%, #EFD3C4 100%)"
      : "transparent";
  const onCream = stage !== "ink";
  const glowColor = onCream ? "rgba(201,146,87,.20)" : "rgba(232,201,168,.18)";

  return (
    <div
      ref={stageRef}
      className={`nf-ring-stage ${className}`}
      style={{
        width: "100%",
        maxWidth: size,
        aspectRatio: "1 / 1",
        background: stageBg,
        ["--nf-glow" as string]: glowColor,
      } as React.CSSProperties}
    >
      <style>{`
        .nf-ring-stage{ position:relative; display:flex; align-items:center; justify-content:center; border-radius:4px; overflow:hidden; isolation:isolate; }
        .nf-ring-stage::before{ content:""; position:absolute; width:66%; height:66%; border-radius:50%; background:radial-gradient(circle, var(--nf-glow, rgba(201,146,87,.20)), transparent 68%); filter:blur(8px); z-index:0; }
        .nf-eyebrow-${uid}{ position:absolute; top:26px; left:0; right:0; text-align:center; z-index:3;
          font-family:'Jost',sans-serif; font-size:11px; font-weight:500; letter-spacing:.32em; text-transform:uppercase;
          color:${onCream ? "#B08463" : "#E8C9A8"}; }
        .nf-ring-float-${uid}{ position:relative; z-index:2; width:52%; max-width:320px;
          animation:nf-float-${uid} 6s ease-in-out infinite; }
        .nf-ring-turn-${uid}{ transform-style:preserve-3d; transform:perspective(1200px) rotateX(6deg) rotateY(-8deg);
          transition:transform .12s linear; will-change:transform; }
        .nf-ring-turn-${uid} svg{ display:block; width:100%; height:auto; filter:drop-shadow(0 18px 26px rgba(60,35,15,.28)); }
        .nf-ring-shadow-${uid}{ position:absolute; z-index:1; bottom:15%; width:30%; height:4.5%;
          background:radial-gradient(ellipse at center, rgba(90,55,25,.30), transparent 70%); filter:blur(3px);
          animation:nf-shadow-${uid} 6s ease-in-out infinite; }
        .nf-ring-caption-${uid}{ position:absolute; z-index:3; bottom:24px; left:0; right:0; text-align:center;
          font-family:'Cormorant Garamond',Georgia,serif; font-style:italic; font-size:16px;
          color:${onCream ? "#8C5343" : "#E8C9A8"}; }
        @keyframes nf-float-${uid}{ 0%,100%{ transform:translateY(6px);} 50%{ transform:translateY(-14px);} }
        @keyframes nf-shadow-${uid}{ 0%,100%{ transform:scale(1); opacity:.5;} 50%{ transform:scale(.74); opacity:.3;} }
        @media (prefers-reduced-motion: reduce){
          .nf-ring-float-${uid},.nf-ring-shadow-${uid}{ animation:none; }
        }
      `}</style>

      {eyebrow ? <div className={`nf-eyebrow-${uid}`}>{eyebrow}</div> : null}

      <div className={`nf-ring-shadow-${uid}`} />

      <div className={`nf-ring-float-${uid}`}>
        <div ref={turnRef} className={`nf-ring-turn-${uid}`}>
          <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id={goldId} cx="50%" cy="40%" r="65%">
                <stop offset="0%" stopColor="#FFF3D6" />
                <stop offset="45%" stopColor="#E8C078" />
                <stop offset="100%" stopColor="#8A6321" />
              </radialGradient>
              <linearGradient id={goldRimId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE9B8" />
                <stop offset="100%" stopColor="#7A5416" />
              </linearGradient>
              <radialGradient id={gemId} cx="42%" cy="34%" r="72%">
                <stop offset="0%" stopColor={g0} />
                <stop offset="55%" stopColor={g1} />
                <stop offset="100%" stopColor={g2} />
              </radialGradient>
              <radialGradient id={gemHiId} cx="35%" cy="28%" r="30%">
                <stop offset="0%" stopColor="rgba(255,255,255,.95)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              <linearGradient id={bandId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FBE3A8" />
                <stop offset="50%" stopColor="#C89257" />
                <stop offset="100%" stopColor="#6E4913" />
              </linearGradient>
            </defs>

            {/* Torus band via even-odd fill (transparent hole) */}
            <path
              fillRule="evenodd"
              fill={`url(#${bandId})`}
              d="
                M 38 140
                a 62 58 0 1 0 124 0
                a 62 58 0 1 0 -124 0
                Z
                M 48 140
                a 52 48 0 1 1 104 0
                a 52 48 0 1 1 -104 0
                Z
              "
            />
            <ellipse cx="100" cy="140" rx="62" ry="58" fill="none" stroke={`url(#${goldRimId})`} strokeWidth="1" opacity="0.9" />
            <ellipse cx="100" cy="140" rx="52" ry="48" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="0.7" />

            {/* Crown / setting */}
            <path
              d="M84 92 L100 78 L116 92 L112 108 L88 108 Z"
              fill={`url(#${goldId})`}
              stroke={`url(#${goldRimId})`}
              strokeWidth="0.8"
            />

            {/* Prongs */}
            <g fill={`url(#${goldId})`} stroke={`url(#${goldRimId})`} strokeWidth="0.6">
              <path d="M80 74 L86 66 L92 76 Z" />
              <path d="M120 74 L114 66 L108 76 Z" />
              <path d="M100 58 L94 68 L106 68 Z" />
              <path d="M100 92 L94 84 L106 84 Z" />
            </g>

            {/* Gem */}
            <circle cx="100" cy="72" r="22" fill={`url(#${gemId})`} />
            <circle cx="100" cy="72" r="22" fill={`url(#${gemHiId})`} />
            <circle cx="100" cy="72" r="22" fill="none" stroke={`url(#${goldRimId})`} strokeWidth="1.4" />
            {/* Brilliant-cut facets */}
            <path
              d="M100 50 L100 94 M78 72 L122 72 M85 57 L115 87 M115 57 L85 87 M88 52 L112 92 M112 52 L88 92"
              stroke="rgba(255,255,255,.5)"
              strokeWidth="0.5"
              fill="none"
            />
            {/* Sparkle */}
            <circle cx="92" cy="63" r="3.6" fill="rgba(255,255,255,.75)" />
            <circle cx="108" cy="80" r="1.4" fill="rgba(255,255,255,.6)" />
          </svg>
        </div>
      </div>

      {caption ? <div className={`nf-ring-caption-${uid}`}>{caption}</div> : null}
    </div>
  );
}
