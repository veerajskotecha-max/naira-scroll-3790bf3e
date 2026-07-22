/* Naira Flore — FloatingRing.tsx
   Gold solitaire ring on a cream stage. Gently floats and rotates
   in 3D as the user SCROLLS the page. Self-contained. */

import React from "react";

type Gem = "emerald" | "blush" | "pearl";
type Stage = "ink" | "cream" | "none";

interface FloatingRingProps {
  gem?: Gem;
  stage?: Stage;
  size?: number;
  /** Degrees of rotation per 1000px of scroll. */
  scrollSpeed?: number;
  className?: string;
  caption?: React.ReactNode;
  eyebrow?: string;
}

const GEM_STOPS: Record<Gem, [string, string, string]> = {
  emerald: ["#D6E7E2", "#7E9C95", "#3C4F4A"],
  blush: ["#FFE0D5", "#D08469", "#8C4533"],
  pearl: ["#FFFFFF", "#F5F0EA", "#D9CCBE"],
};

export default function FloatingRing({
  gem = "pearl",
  stage = "cream",
  size = 520,
  scrollSpeed = 220,
  className = "",
  caption,
  eyebrow = "The Zircone Edit · Demi-Gold",
}: FloatingRingProps) {
  const uid = React.useId().replace(/:/g, "");
  const goldId = `gold-${uid}`;
  const goldRimId = `goldrim-${uid}`;
  const gemId = `gem-${uid}`;
  const gemHighlightId = `gemhi-${uid}`;
  const [g0, g1, g2] = GEM_STOPS[gem];

  const stageRef = React.useRef<HTMLDivElement>(null);
  const turnRef = React.useRef<HTMLDivElement>(null);

  // Scroll-linked rotation with rAF + lerp for smoothness
  React.useEffect(() => {
    if (!turnRef.current || !stageRef.current) return;
    let raf = 0;
    let current = 0;
    let target = 0;

    const compute = () => {
      const rect = stageRef.current!.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress from -1 (below fold) to +1 (above fold) as element passes viewport
      const centerFromTop = rect.top + rect.height / 2;
      const progress = (vh / 2 - centerFromTop) / vh; // ~[-1, 1]
      target = progress * scrollSpeed * 4; // total degrees range
    };

    const tick = () => {
      current += (target - current) * 0.08;
      if (turnRef.current) {
        turnRef.current.style.transform = `perspective(1200px) rotateY(${current}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [scrollSpeed]);

  const stageBg =
    stage === "ink"
      ? "radial-gradient(120% 120% at 50% 20%, #2A211B 0%, #1A1614 70%)"
      : stage === "cream"
      ? "radial-gradient(120% 120% at 50% 30%, #FBEBDD 0%, #F3DECB 70%)"
      : "transparent";
  const glowColor = stage === "ink" ? "rgba(232,201,168,.20)" : "rgba(201,146,87,.18)";
  const captionColor = stage === "ink" ? "rgba(255,248,245,.55)" : "rgba(140,83,67,.75)";

  return (
    <div
      ref={stageRef}
      className={`nf-ring-stage ${className}`}
      style={{
        width: "100%",
        maxWidth: size,
        aspectRatio: "1 / 1",
        background: stageBg,
      }}
    >
      <style>{`
        .nf-ring-stage{ position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; isolation:isolate; }
        .nf-ring-stage::before{ content:""; position:absolute; width:70%; height:70%; border-radius:50%; background:radial-gradient(circle, ${glowColor}, transparent 68%); filter:blur(6px); z-index:0; }
        .nf-ring-eyebrow-${uid}{ position:absolute; top:24px; left:0; right:0; text-align:center; font-family:'Jost',sans-serif; font-size:11px; letter-spacing:.32em; text-transform:uppercase; color:${captionColor}; z-index:4; font-weight:500; }
        .nf-ring-float-${uid}{ position:relative; z-index:2; width:60%; max-width:360px; transform-style:preserve-3d; animation:nf-float-${uid} 6s ease-in-out infinite; }
        .nf-ring-turn-${uid}{ transform-style:preserve-3d; will-change:transform; transform:perspective(1200px) rotateY(0deg); }
        .nf-ring-turn-${uid} svg{ display:block; width:100%; height:auto; filter:drop-shadow(0 22px 30px rgba(120,70,40,.22)); }
        .nf-ring-shadow-${uid}{ position:absolute; z-index:1; bottom:18%; width:36%; height:5%; background:radial-gradient(ellipse at center, rgba(120,70,40,.35), transparent 70%); filter:blur(4px); animation:nf-shadow-${uid} 6s ease-in-out infinite; }
        @keyframes nf-float-${uid}{ 0%,100%{ transform:translateY(6px);} 50%{ transform:translateY(-14px);} }
        @keyframes nf-shadow-${uid}{ 0%,100%{ transform:scale(1); opacity:.55;} 50%{ transform:scale(.72); opacity:.28;} }
        @media (prefers-reduced-motion: reduce){ .nf-ring-float-${uid},.nf-ring-shadow-${uid}{ animation:none; } }
      `}</style>

      {eyebrow && <div className={`nf-ring-eyebrow-${uid}`}>{eyebrow}</div>}

      <div className={`nf-ring-shadow-${uid}`} />

      <div className={`nf-ring-float-${uid}`}>
        <div ref={turnRef} className={`nf-ring-turn-${uid}`}>
          <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id={goldId} cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFF3D6" />
                <stop offset="45%" stopColor="#E8C078" />
                <stop offset="100%" stopColor="#8A6321" />
              </radialGradient>
              <linearGradient id={goldRimId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE9B8" />
                <stop offset="100%" stopColor="#7A5416" />
              </linearGradient>
              <radialGradient id={gemId} cx="45%" cy="35%" r="70%">
                <stop offset="0%" stopColor={g0} />
                <stop offset="55%" stopColor={g1} />
                <stop offset="100%" stopColor={g2} />
              </radialGradient>
              <radialGradient id={gemHighlightId} cx="35%" cy="30%" r="30%">
                <stop offset="0%" stopColor="rgba(255,255,255,.9)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            {/* Ring band */}
            <ellipse cx="100" cy="140" rx="62" ry="58" fill="none" stroke={`url(#${goldId})`} strokeWidth="10" />
            <ellipse cx="100" cy="140" rx="62" ry="58" fill="none" stroke={`url(#${goldRimId})`} strokeWidth="1.5" opacity="0.9" />
            <ellipse cx="100" cy="140" rx="55" ry="51" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="0.8" />

            {/* Four prongs */}
            <path d="M82 74 L100 62 L118 74 Z" fill={`url(#${goldId})`} stroke={`url(#${goldRimId})`} strokeWidth="0.8" />
            <circle cx="82" cy="74" r="2.4" fill="#E8C078" />
            <circle cx="118" cy="74" r="2.4" fill="#E8C078" />
            <circle cx="100" cy="60" r="2.4" fill="#E8C078" />

            {/* Solitaire zircone */}
            <circle cx="100" cy="68" r="22" fill={`url(#${gemId})`} />
            <circle cx="100" cy="68" r="22" fill={`url(#${gemHighlightId})`} />
            <circle cx="100" cy="68" r="22" fill="none" stroke={`url(#${goldRimId})`} strokeWidth="1.5" />
            {/* Brilliant-cut facets */}
            <path
              d="M100 46 L100 90 M78 68 L122 68 M85 53 L115 83 M115 53 L85 83 M88 48 L112 88 M112 48 L88 88"
              stroke="rgba(255,255,255,.45)"
              strokeWidth="0.5"
            />
            <circle cx="93" cy="60" r="4" fill="rgba(255,255,255,.65)" />
          </svg>
        </div>
      </div>

      {caption && (
        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "'Jost',sans-serif",
            fontSize: 11,
            letterSpacing: ".28em",
            textTransform: "uppercase",
            color: captionColor,
            zIndex: 3,
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}
