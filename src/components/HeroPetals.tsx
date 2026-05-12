import { useEffect, useMemo, useRef } from "react";

const PETAL_COUNT = 75;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

type PetalCfg = {
  variant: number;
  size: number;
  xPct: number;
  sway: number;
  swayFreq: number;
  rot: number;
  depth: number;
  start: number;
  end: number;
  driftX: number;
  hue: number; // index into BRAND_PALETTE
};

// Naira brand-aligned palette: sage, warm beige, off-white, teal accents, soft blush
const BRAND_PALETTE = [
  { top: "#FFFBF3", bot: "#E5B9A4", stroke: "#C99680" }, // warm beige
  { top: "#F5EFE6", bot: "#AEBDB6", stroke: "#7E928A" }, // sage green
  { top: "#FFFFFF", bot: "#F0E6D8", stroke: "#D9C7AE" }, // off-white
  { top: "#D8E2DC", bot: "#2F5D63", stroke: "#1F4248" }, // teal accent (rare)
  { top: "#FFF1E6", bot: "#D49A82", stroke: "#A66E58" }, // blush
];

/* ────────── Refined petal-only variants ────────── */
const PetalSVG = ({ v, s, id, hue }: { v: number; s: number; id: number; hue: number }) => {
  const c = BRAND_PALETTE[hue];
  const gid = `pp-${id}`;
  switch (v) {
    case 0: // tear-drop petal
      return (
        <svg width={s * 0.55} height={s} viewBox="0 0 24 40" fill="none">
          <defs>
            <linearGradient id={gid} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={c.top} />
              <stop offset="100%" stopColor={c.bot} />
            </linearGradient>
          </defs>
          <path
            d="M12 1.5 C19 11 19.5 28 12 38.5 C4.5 28 5 11 12 1.5 Z"
            fill={`url(#${gid})`}
            stroke={c.stroke}
            strokeWidth="0.4"
            opacity="0.95"
          />
          <path d="M12 5 L12 35" stroke={c.stroke} strokeWidth="0.35" opacity="0.5" />
        </svg>
      );
    case 1: // soft oval petal
      return (
        <svg width={s * 0.6} height={s} viewBox="0 0 26 40" fill="none">
          <defs>
            <radialGradient id={gid} cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor={c.top} />
              <stop offset="100%" stopColor={c.bot} />
            </radialGradient>
          </defs>
          <ellipse cx="13" cy="20" rx="11" ry="19" fill={`url(#${gid})`} opacity="0.92" />
        </svg>
      );
    case 2: // curved crescent petal
    default:
      return (
        <svg width={s * 0.7} height={s} viewBox="0 0 28 40" fill="none">
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c.top} />
              <stop offset="100%" stopColor={c.bot} />
            </linearGradient>
          </defs>
          <path
            d="M6 2 C22 8 26 26 14 38 C10 30 4 18 6 2 Z"
            fill={`url(#${gid})`}
            stroke={c.stroke}
            strokeWidth="0.35"
            opacity="0.93"
          />
        </svg>
      );
  }
};

const HeroPetals = ({
  progressRef,
  vh,
}: {
  progressRef: React.MutableRefObject<number>;
  vh: number;
}) => {
  const petals = useMemo<PetalCfg[]>(() => {
    return Array.from({ length: PETAL_COUNT }).map(() => {
      const bucket = Math.random();
      const sz = bucket < 0.55 ? rand(7, 12) : bucket < 0.9 ? rand(13, 19) : rand(20, 26);
      const start = rand(-0.3, 0.6);
      // bias teal sparingly (only ~10%)
      const hueRoll = Math.random();
      const hue =
        hueRoll < 0.34 ? 0 :
        hueRoll < 0.62 ? 1 :
        hueRoll < 0.78 ? 2 :
        hueRoll < 0.88 ? 4 : 3;
      return {
        variant: Math.floor(Math.random() * 3),
        size: sz,
        xPct: rand(2, 98),
        sway: rand(14, 32),         // wider, slower lateral drift
        swayFreq: rand(0.35, 0.75), // gentler oscillation
        rot: rand(-90, 90),         // softer rotation
        depth: sz < 12 ? 0.55 : sz < 19 ? 0.75 : 0.95,
        start,
        end: Math.min(1.2, start + rand(0.7, 1.1)), // longer, slower fall
        driftX: rand(-22, 22),
        hue,
      };
    });
  }, []);

  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  // smoothed per-petal nudge offsets (lerped each frame for elegance)
  const nudge = useRef<{ x: number; y: number }[]>(
    Array.from({ length: PETAL_COUNT }, () => ({ x: 0, y: 0 }))
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });

  // Track cursor for interactive nudge
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouse.current.x = e.clientX - r.left;
      mouse.current.y = e.clientY - r.top;
      mouse.current.active = true;
    };
    const onLeave = () => { mouse.current.active = false; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const p = progressRef.current;
      const vw = window.innerWidth;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const mActive = mouse.current.active;

      petals.forEach((cfg, i) => {
        const el = refs.current[i];
        if (!el) return;
        const localT = (p - cfg.start) / (cfg.end - cfg.start);
        if (localT < 0 || localT > 1) {
          if (el.style.opacity !== "0") el.style.opacity = "0";
          return;
        }
        const fallT = easeInOutSine(localT);
        // Petals fall from above the viewport down to the bottom of the hero
        const y = -80 + fallT * (vh + 160) * cfg.depth;
        let swayX =
          Math.sin(localT * Math.PI * 2 * cfg.swayFreq) * cfg.sway + cfg.driftX * localT;

        // Interactive nudge — petals near cursor get pushed away
        if (mActive) {
          const baseX = (cfg.xPct / 100) * vw;
          const dx = baseX + swayX - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 130;
          if (dist < radius && dist > 0.1) {
            const force = (1 - dist / radius) * 28;
            swayX += (dx / dist) * force;
          }
        }

        const rot = cfg.rot * localT;
        let op = 0.92;
        if (localT < 0.15) op = easeOutExpo(localT / 0.15) * 0.92;
        else if (localT > 0.82) op = easeOutExpo(1 - (localT - 0.82) / 0.18) * 0.92;
        el.style.transform = `translate3d(${swayX}px, ${y}px, 0) rotate(${rot}deg)`;
        el.style.opacity = String(op);
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [petals, vh, progressRef]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 6 }}
      aria-hidden="true"
    >
      {petals.map((cfg, i) => (
        <div
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className="absolute"
          style={{
            left: `${cfg.xPct}%`,
            top: 0,
            opacity: 0,
            willChange: "transform, opacity",
            filter:
              cfg.size > 18
                ? "drop-shadow(0 5px 7px rgba(120,80,50,0.14))"
                : "drop-shadow(0 2px 3px rgba(120,80,50,0.10))",
          }}
        >
          <PetalSVG v={cfg.variant} s={cfg.size} id={i} hue={cfg.hue} />
        </div>
      ))}
    </div>
  );
};

export default HeroPetals;
