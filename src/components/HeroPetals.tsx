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

// Naira pastel palette inspired by soft floating tissue petals: off-white, blush, muted sage, warm beige
const BRAND_PALETTE = [
  { top: "hsl(42 52% 98%)", bot: "hsl(24 48% 84%)", stroke: "hsl(24 28% 74%)" },
  { top: "hsl(33 42% 94%)", bot: "hsl(91 22% 74%)", stroke: "hsl(91 13% 63%)" },
  { top: "hsl(0 0% 100%)", bot: "hsl(37 36% 91%)", stroke: "hsl(37 20% 80%)" },
  { top: "hsl(166 24% 82%)", bot: "hsl(186 20% 57%)", stroke: "hsl(186 18% 49%)" },
  { top: "hsl(8 70% 95%)", bot: "hsl(13 48% 82%)", stroke: "hsl(13 28% 72%)" },
];

/* ────────── Refined petal-only variants ────────── */
const PetalSVG = ({ v, s, id, hue }: { v: number; s: number; id: number; hue: number }) => {
  const c = BRAND_PALETTE[hue];
  const gid = `pp-${id}`;
  switch (v) {
    case 0: // tear-drop petal
      return (
        <svg width={s * 0.7} height={s} viewBox="0 0 28 40" fill="none">
          <defs>
            <linearGradient id={gid} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={c.top} />
              <stop offset="100%" stopColor={c.bot} />
            </linearGradient>
          </defs>
          <path
            d="M14 2 C23 9 24 27 13 39 C5 27 6 10 14 2 Z"
            fill={`url(#${gid})`}
            stroke={c.stroke}
            strokeWidth="0.22"
            opacity="0.72"
          />
          <path d="M14 7 C13 16 13 27 13 35" stroke={c.stroke} strokeWidth="0.18" opacity="0.28" />
        </svg>
      );
    case 1: // soft oval petal
      return (
        <svg width={s * 0.85} height={s} viewBox="0 0 34 40" fill="none">
          <defs>
            <radialGradient id={gid} cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor={c.top} />
              <stop offset="100%" stopColor={c.bot} />
            </radialGradient>
          </defs>
          <ellipse cx="17" cy="20" rx="13" ry="17" fill={`url(#${gid})`} opacity="0.58" />
        </svg>
      );
    case 2: // curved crescent petal
    default:
      return (
        <svg width={s * 1.15} height={s} viewBox="0 0 46 40" fill="none">
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c.top} />
              <stop offset="100%" stopColor={c.bot} />
            </linearGradient>
          </defs>
          <path
            d="M4 20 C12 5 32 5 42 19 C31 27 14 28 4 20 Z"
            fill={`url(#${gid})`}
            stroke={c.stroke}
            strokeWidth="0.2"
            opacity="0.62"
          />
          <path d="M11 20 C21 17 30 17 38 19" stroke={c.stroke} strokeWidth="0.16" opacity="0.22" />
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
      const sz = bucket < 0.45 ? rand(8, 13) : bucket < 0.84 ? rand(14, 24) : rand(28, 44);
      const start = rand(-0.3, 0.6);
      // mostly blush/beige/off-white, with rare sage/teal notes like the reference
      const hueRoll = Math.random();
      const hue =
        hueRoll < 0.32 ? 2 :
        hueRoll < 0.56 ? 0 :
        hueRoll < 0.76 ? 4 :
        hueRoll < 0.93 ? 1 : 3;
      return {
        variant: Math.floor(Math.random() * 3),
        size: sz,
        xPct: rand(2, 98),
        sway: rand(14, 32),         // wider, slower lateral drift
        swayFreq: rand(0.35, 0.75), // gentler oscillation
        rot: rand(-90, 90),         // softer rotation
        depth: sz < 14 ? 0.5 : sz < 25 ? 0.72 : 0.9,
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
    let lastT = performance.now();
    let petalsEnd = 1;
    const measureEnd = () => {
      const el = document.querySelector<HTMLElement>("[data-petals-end]");
      petalsEnd = el ? Math.max(1, el.offsetTop - 40) : Math.max(1, window.innerHeight);
    };
    measureEnd();
    const onResize = () => measureEnd();
    window.addEventListener("resize", onResize, { passive: true });
    const measureTimer = window.setTimeout(measureEnd, 400);

    const tick = (now: number) => {
      const dt = Math.min(40, now - lastT) / 1000;
      lastT = now;
      const p = progressRef.current;
      const vw = window.innerWidth;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const mActive = mouse.current.active;
      // continuous time-based phase so petals breathe even without scroll
      const phase = now / 1000;

      // Fade out the entire petals layer as the New Arrivals section enters
      // (so no petals overlap the first SKUs once the logo has faded in).
      const scrollY = window.scrollY;
      const fadeStart = Math.max(1, petalsEnd - window.innerHeight * 0.55);
      const fadeRange = Math.max(1, petalsEnd - fadeStart);
      const fadeT = Math.max(0, Math.min(1, (scrollY - fadeStart) / fadeRange));
      const layerOpacity = 1 - fadeT;
      if (containerRef.current) {
        containerRef.current.style.opacity = String(layerOpacity);
        containerRef.current.style.visibility = layerOpacity <= 0.01 ? "hidden" : "visible";
      }

      petals.forEach((cfg, i) => {
        const el = refs.current[i];
        if (!el) return;
        const localT = (p - cfg.start) / (cfg.end - cfg.start);
        if (localT < 0 || localT > 1) {
          if (el.style.opacity !== "0") el.style.opacity = "0";
          return;
        }
        const fallT = easeInOutSine(localT);
        const y = -80 + fallT * (vh + 160) * cfg.depth;
        // dual-frequency sway: gentle long arc + subtle micro-wobble
        const swayBase =
          Math.sin(phase * cfg.swayFreq + cfg.start * 6.28) * cfg.sway +
          Math.sin(phase * cfg.swayFreq * 2.3 + i) * (cfg.sway * 0.18) +
          cfg.driftX * fallT;

        // Interactive nudge — silky lerp toward target offset
        let nudgeTargetX = 0;
        let nudgeTargetY = 0;
        if (mActive) {
          const baseX = (cfg.xPct / 100) * vw;
          const dx = baseX + swayBase - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 240;
          if (dist < radius && dist > 0.1) {
            const force = Math.pow(1 - dist / radius, 2) * 70;
            nudgeTargetX = (dx / dist) * force;
            nudgeTargetY = (dy / dist) * force * 0.5;
          }
        }
        const k = 1 - Math.exp(-dt * 9); // snappier critically-damped lerp
        const n = nudge.current[i];
        n.x += (nudgeTargetX - n.x) * k;
        n.y += (nudgeTargetY - n.y) * k;

        const swayX = swayBase + n.x;
        // gentle rotation tied to sway for natural feel
        const rot =
          cfg.rot * 0.35 * Math.sin(phase * cfg.swayFreq * 0.8 + cfg.start * 3.14) +
          cfg.rot * 0.6 * fallT;

        let op = 0.94;
        if (localT < 0.18) op = easeOutExpo(localT / 0.18) * 0.94;
        else if (localT > 0.8) op = easeOutExpo(1 - (localT - 0.8) / 0.2) * 0.94;

        el.style.transform = `translate3d(${swayX}px, ${y + n.y}px, 0) rotate(${rot}deg)`;
        el.style.opacity = String(op);
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(measureTimer);
    };
  }, [petals, vh, progressRef]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
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
