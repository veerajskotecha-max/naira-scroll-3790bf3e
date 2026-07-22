/* Naira Flore — FloatingRing.tsx
   Gold solitaire ring that FLOATS (up/down) and TURNS (slow 3D spin),
   with a cast shadow + warm glow. Self-contained: no libs, no Tailwind config. */

import React from "react";

type Gem = "emerald" | "blush" | "pearl";
type Stage = "ink" | "cream" | "none";

interface FloatingRingProps {
  gem?: Gem;
  stage?: Stage;
  size?: number;
  spin?: number;
  className?: string;
}

const GEM_STOPS: Record<Gem, [string, string, string]> = {
  emerald: ["#D6E7E2", "#7E9C95", "#3C4F4A"],
  blush: ["#FFE0D5", "#D08469", "#8C4533"],
  pearl: ["#FFFFFF", "#FFF5EE", "#E4C9AE"],
};

export default function FloatingRing({
  gem = "emerald",
  stage = "ink",
  size = 460,
  spin = 18,
  className = "",
}: FloatingRingProps) {
  const uid = React.useId().replace(/:/g, "");
  const goldId = `gold-${uid}`;
  const goldRimId = `goldrim-${uid}`;
  const gemId = `gem-${uid}`;
  const gemHighlightId = `gemhi-${uid}`;
  const [g0, g1, g2] = GEM_STOPS[gem];

  const stageBg =
    stage === "ink"
      ? "radial-gradient(120% 120% at 50% 20%, #2A211B 0%, #1A1614 70%)"
      : stage === "cream"
      ? "radial-gradient(120% 120% at 50% 20%, #FFFFFF 0%, #FBF3EE 70%)"
      : "transparent";
  const glowColor = stage === "cream" ? "rgba(201,146,87,.22)" : "rgba(232,201,168,.20)";
  const captionColor = stage === "cream" ? "rgba(90,82,76,.7)" : "rgba(255,248,245,.55)";
  const captionAccent = stage === "cream" ? "#8C5343" : "#E8C9A8";

  return (
    <div
      className={`nf-ring-stage ${className}`}
      style={{
        width: size,
        height: size,
        background: stageBg,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital@1&family=Jost:wght@400;500&display=swap');
        .nf-ring-stage{ position:relative; display:flex; align-items:center; justify-content:center; border-radius:4px; overflow:hidden; isolation:isolate; }
        .nf-ring-stage::before{ content:""; position:absolute; width:70%; height:70%; border-radius:50%; background:radial-gradient(circle, ${glowColor}, transparent 68%); filter:blur(6px); z-index:0; }
        .nf-ring-float-${uid}{ position:relative; z-index:2; width:56%; max-width:340px; transform-style:preserve-3d; animation:nf-float-${uid} 5.5s ease-in-out infinite; }
        .nf-ring-turn-${uid}{ transform-style:preserve-3d; animation:nf-turn-${uid} ${spin}s linear infinite; will-change:transform; }
        .nf-ring-turn-${uid} svg{ display:block; width:100%; height:auto; filter:drop-shadow(0 18px 26px rgba(0,0,0,.42)); }
        .nf-ring-shadow-${uid}{ position:absolute; z-index:1; bottom:16%; width:34%; height:5%; background:radial-gradient(ellipse at center, rgba(0,0,0,.45), transparent 70%); filter:blur(3px); animation:nf-shadow-${uid} 5.5s ease-in-out infinite; }
        .nf-ring-caption-${uid}{ position:absolute; z-index:3; bottom:26px; left:0; right:0; text-align:center; font-family:'Jost',sans-serif; font-size:11px; letter-spacing:.32em; text-transform:uppercase; color:${captionColor}; }
        .nf-ring-caption-${uid} em{ font-family:'Cormorant Garamond',Georgia,serif; font-style:italic; text-transform:none; letter-spacing:0; font-size:15px; color:${captionAccent}; margin-right:8px; }
        @keyframes nf-float-${uid}{ 0%,100%{ transform:translateY(6px);} 50%{ transform:translateY(-16px);} }
        @keyframes nf-turn-${uid}{ 0%{ transform:perspective(1200px) rotateY(0deg);} 100%{ transform:perspective(1200px) rotateY(360deg);} }
        @keyframes nf-shadow-${uid}{ 0%,100%{ transform:scale(1); opacity:.5;} 50%{ transform:scale(.72); opacity:.28;} }
        @media (prefers-reduced-motion: reduce){ .nf-ring-float-${uid},.nf-ring-turn-${uid},.nf-ring-shadow-${uid}{ animation:none; } }
      `}</style>

      <div className={`nf-ring-shadow-${uid}`} />

      <div className={`nf-ring-float-${uid}`}>
        <div className={`nf-ring-turn-${uid}`}>
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
                <stop offset="0%" stopColor="rgba(255,255,255,.85)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            {/* Ring band (torus-like ellipse) */}
            <ellipse
              cx="100"
              cy="140"
              rx="62"
              ry="58"
              fill="none"
              stroke={`url(#${goldId})`}
              strokeWidth="14"
            />
            <ellipse
              cx="100"
              cy="140"
              rx="62"
              ry="58"
              fill="none"
              stroke={`url(#${goldRimId})`}
              strokeWidth="2"
              opacity="0.9"
            />
            {/* Inner hole highlight */}
            <ellipse
              cx="100"
              cy="140"
              rx="52"
              ry="48"
              fill="none"
              stroke="rgba(0,0,0,.35)"
              strokeWidth="1"
            />

            {/* Prong setting */}
            <path
              d="M84 78 L100 60 L116 78 Z"
              fill={`url(#${goldId})`}
              stroke={`url(#${goldRimId})`}
              strokeWidth="1"
            />
            <path d="M88 78 L100 66" stroke="#4A2F0A" strokeWidth="1" opacity=".4" />
            <path d="M112 78 L100 66" stroke="#4A2F0A" strokeWidth="1" opacity=".4" />

            {/* Solitaire gem */}
            <circle cx="100" cy="66" r="22" fill={`url(#${gemId})`} />
            <circle cx="100" cy="66" r="22" fill={`url(#${gemHighlightId})`} />
            <circle
              cx="100"
              cy="66"
              r="22"
              fill="none"
              stroke={`url(#${goldRimId})`}
              strokeWidth="2"
            />
            {/* Facet lines */}
            <path
              d="M100 44 L100 88 M78 66 L122 66 M85 51 L115 81 M115 51 L85 81"
              stroke="rgba(255,255,255,.35)"
              strokeWidth="0.6"
            />
          </svg>
        </div>
      </div>

      <div className={`nf-ring-caption-${uid}`}>
        <em>The Marigold Solitaire</em>· slowly turning
      </div>
    </div>
  );
}
