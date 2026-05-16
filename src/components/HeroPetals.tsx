import { useEffect, useMemo, useRef } from "react";

const PETAL_COUNT = 70;

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
  spin: number;     // continuous rotation speed
  depth: number;
  start: number;
  end: number;
  driftX: number;
  hue: number;
  flip: boolean;
};

/* ─── Naira brand palette ─── rose petals tinted with sage, warm beige,
   blush peach, teal whisper, and off-white. Each entry defines a
   gradient (centre→edge) plus a soft vein/stroke colour.            */
const BRAND_PALETTE = [
  // Warm blush / peach — primary brand beige
  { c1: "hsl(18 78% 96%)", c2: "hsl(16 58% 82%)", c3: "hsl(14 38% 68%)", vein: "hsl(14 32% 56%)" },
  // Soft sage
  { c1: "hsl(140 22% 94%)", c2: "hsl(140 18% 78%)", c3: "hsl(146 16% 64%)", vein: "hsl(146 18% 48%)" },
  // Off-white / cream
  { c1: "hsl(40 60% 99%)", c2: "hsl(34 36% 92%)", c3: "hsl(30 24% 82%)", vein: "hsl(30 18% 68%)" },
  // Teal whisper (rare accent)
  { c1: "hsl(186 28% 92%)", c2: "hsl(188 22% 72%)", c3: "hsl(190 28% 48%)", vein: "hsl(190 32% 36%)" },
  // Dusty rose
  { c1: "hsl(8 70% 95%)", c2: "hsl(8 52% 82%)", c3: "hsl(6 38% 68%)", vein: "hsl(6 32% 54%)" },
];

/* ────────── Rose petal variants — heart/teardrop, notched, furled ─────────
   Each petal has a luminous centre gradient, a soft vein, and a tightly
   curled base that catches light like real fabric.                       */
const PetalSVG = ({ v, s, id, hue }: { v: number; s: number; id: number; hue: number }) => {
  const c = BRAND_PALETTE[hue];
  const gid = `pp-${id}`;
  const sid = `ps-${id}`;
  const sheen = (
    <radialGradient id={sid} cx="50%" cy="22%" r="60%">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
      <stop offset="55%" stopColor="#ffffff" stopOpacity="0.08" />
      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
    </radialGradient>
  );

  switch (v) {
    case 0:
      // Classic rose petal — heart-notched top, tapered base
      return (
        <svg width={s * 0.9} height={s} viewBox="0 0 36 40" fill="none">
          <defs>
            <radialGradient id={gid} cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor={c.c1} />
              <stop offset="55%" stopColor={c.c2} />
              <stop offset="100%" stopColor={c.c3} />
            </radialGradient>
            {sheen}
          </defs>
          <path
            d="M18 3 C8 4 2 14 4 24 C6 33 14 39 18 38 C22 39 30 33 32 24 C34 14 28 4 18 3 C16 6 20 6 18 3 Z"
            fill={`url(#${gid})`}
            stroke={c.vein}
            strokeOpacity="0.35"
            strokeWidth="0.35"
          />
          <path
            d="M18 8 C16 18 16 28 18 36"
            stroke={c.vein}
            strokeOpacity="0.32"
            strokeWidth="0.4"
            fill="none"
          />
          <path
            d="M18 12 C14 18 12 26 13 33 M18 12 C22 18 24 26 23 33"
            stroke={c.vein}
            strokeOpacity="0.18"
            strokeWidth="0.3"
            fill="none"
          />
          <path
            d="M18 3 C8 4 2 14 4 24 C6 33 14 39 18 38 C22 39 30 33 32 24 C34 14 28 4 18 3 Z"
            fill={`url(#${sid})`}
          />
        </svg>
      );
    case 1:
      // Furled rose petal — curled side suggests volume
      return (
        <svg width={s * 0.78} height={s} viewBox="0 0 32 40" fill="none">
          <defs>
            <linearGradient id={gid} x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor={c.c1} />
              <stop offset="50%" stopColor={c.c2} />
              <stop offset="100%" stopColor={c.c3} />
            </linearGradient>
            {sheen}
          </defs>
          <path
            d="M16 2 C26 6 30 18 27 30 C24 38 14 40 10 35 C5 28 4 16 10 8 C12 5 14 3 16 2 Z"
            fill={`url(#${gid})`}
            stroke={c.vein}
            strokeOpacity="0.32"
            strokeWidth="0.32"
          />
          {/* curled edge highlight */}
          <path
            d="M10 8 C6 14 6 24 11 33"
            stroke={c.c1}
            strokeOpacity="0.55"
            strokeWidth="0.7"
            fill="none"
          />
          <path
            d="M16 6 C15 16 16 26 18 35"
            stroke={c.vein}
            strokeOpacity="0.28"
            strokeWidth="0.35"
            fill="none"
          />
          <path
            d="M16 2 C26 6 30 18 27 30 C24 38 14 40 10 35 C5 28 4 16 10 8 C12 5 14 3 16 2 Z"
            fill={`url(#${sid})`}
          />
        </svg>
      );
    case 2:
    default:
      // Wide rounded petal — outer rose petal that catches light
      return (
        <svg width={s} height={s * 0.88} viewBox="0 0 40 36" fill="none">
          <defs>
            <radialGradient id={gid} cx="50%" cy="30%" r="80%">
              <stop offset="0%" stopColor={c.c1} />
              <stop offset="60%" stopColor={c.c2} />
              <stop offset="100%" stopColor={c.c3} />
            </radialGradient>
            {sheen}
          </defs>
          <path
            d="M20 2 C32 4 38 14 36 24 C33 33 24 35 20 33 C16 35 7 33 4 24 C2 14 8 4 20 2 Z"
            fill={`url(#${gid})`}
            stroke={c.vein}
            strokeOpacity="0.3"
            strokeWidth="0.32"
          />
          <path
            d="M20 6 C18 14 18 22 20 32"
            stroke={c.vein}
            strokeOpacity="0.3"
            strokeWidth="0.36"
            fill="none"
          />
          <path
            d="M20 10 C14 16 12 24 14 30 M20 10 C26 16 28 24 26 30"
            stroke={c.vein}
            strokeOpacity="0.16"
            strokeWidth="0.28"
            fill="none"
          />
          <path
            d="M20 2 C32 4 38 14 36 24 C33 33 24 35 20 33 C16 35 7 33 4 24 C2 14 8 4 20 2 Z"
            fill={`url(#${sid})`}
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
      // slightly larger so the rose detail reads
      const sz = bucket < 0.4 ? rand(11, 16) : bucket < 0.82 ? rand(18, 28) : rand(30, 46);
      const start = rand(-0.25, 0.55);
      // hue distribution — warm blush dominant, sage + cream secondary, teal/dusty rare accents
      const hueRoll = Math.random();
      const hue =
        hueRoll < 0.36 ? 0 :  // blush/peach
        hueRoll < 0.62 ? 2 :  // off-white cream
        hueRoll < 0.82 ? 1 :  // sage
        hueRoll < 0.94 ? 4 :  // dusty rose
        3;                    // teal whisper (rare)
      return {
        variant: Math.floor(Math.random() * 3),
        size: sz,
        xPct: rand(2, 98),
        sway: rand(12, 28),
        swayFreq: rand(0.4, 0.85),
        rot: rand(-120, 120),
        spin: rand(-40, 40),
        depth: sz < 16 ? 0.55 : sz < 28 ? 0.78 : 0.95,
        start,
        // FASTER falls — shorter per-petal life cycle
        end: Math.min(1.15, start + rand(0.42, 0.7)),
        driftX: rand(-26, 26),
        hue,
        flip: Math.random() < 0.5,
      };
    });
  }, []);

  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const nudge = useRef<{ x: number; y: number }[]>(
    Array.from({ length: PETAL_COUNT }, () => ({ x: 0, y: 0 }))
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });

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
      const phase = now / 1000;

      const scrollY = window.scrollY;
      const fadeStart = petalsEnd + 180;
      const fadeEnd   = petalsEnd + 360;
      const fadeT = Math.max(0, Math.min(1, (scrollY - fadeStart) / Math.max(1, fadeEnd - fadeStart)));
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
        const y = -100 + fallT * (vh + 200) * cfg.depth;
        const swayBase =
          Math.sin(phase * cfg.swayFreq + cfg.start * 6.28) * cfg.sway +
          Math.sin(phase * cfg.swayFreq * 2.3 + i) * (cfg.sway * 0.2) +
          cfg.driftX * fallT;

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
        const k = 1 - Math.exp(-dt * 9);
        const n = nudge.current[i];
        n.x += (nudgeTargetX - n.x) * k;
        n.y += (nudgeTargetY - n.y) * k;

        const swayX = swayBase + n.x;
        const rot =
          cfg.rot * 0.35 * Math.sin(phase * cfg.swayFreq * 0.8 + cfg.start * 3.14) +
          cfg.rot * 0.6 * fallT +
          cfg.spin * phase * 0.15;

        let op = 0.96;
        if (localT < 0.15) op = easeOutExpo(localT / 0.15) * 0.96;
        else if (localT > 0.82) op = easeOutExpo(1 - (localT - 0.82) / 0.18) * 0.96;

        const scaleX = cfg.flip ? -1 : 1;
        el.style.transform = `translate3d(${swayX}px, ${y + n.y}px, 0) rotate(${rot}deg) scaleX(${scaleX})`;
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
      style={{ zIndex: 6, transition: "opacity 0.35s ease" }}
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
              cfg.size > 22
                ? "drop-shadow(0 6px 9px rgba(120,80,50,0.18))"
                : "drop-shadow(0 2px 4px rgba(120,80,50,0.12))",
          }}
        >
          <PetalSVG v={cfg.variant} s={cfg.size} id={i} hue={cfg.hue} />
        </div>
      ))}
    </div>
  );
};

export default HeroPetals;
