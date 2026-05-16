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
  const shd = `pd-${id}`;     // inner shadow gradient
  const eid = `pe-${id}`;     // edge curl highlight
  const tid = `pt-${id}`;     // tip blush

  // Soft top-light sheen — reads as a glossy silk highlight
  const sheen = (
    <radialGradient id={sid} cx="50%" cy="18%" r="62%">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
      <stop offset="45%" stopColor="#ffffff" stopOpacity="0.12" />
      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
    </radialGradient>
  );
  // Inner shadow — gives the petal volume / cupped feel
  const innerShadow = (
    <radialGradient id={shd} cx="50%" cy="95%" r="85%">
      <stop offset="0%" stopColor={c.vein} stopOpacity="0.32" />
      <stop offset="55%" stopColor={c.vein} stopOpacity="0.08" />
      <stop offset="100%" stopColor={c.vein} stopOpacity="0" />
    </radialGradient>
  );
  // Warm tip blush — deepens the outer rim like a real rose petal
  const tipBlush = (
    <radialGradient id={tid} cx="50%" cy="6%" r="55%">
      <stop offset="0%" stopColor={c.c3} stopOpacity="0.55" />
      <stop offset="60%" stopColor={c.c3} stopOpacity="0.12" />
      <stop offset="100%" stopColor={c.c3} stopOpacity="0" />
    </radialGradient>
  );

  switch (v) {
    case 0:
      // Classic rose petal — heart-notched top, tapered base, fine venation
      return (
        <svg width={s * 0.9} height={s} viewBox="0 0 36 40" fill="none">
          <defs>
            <radialGradient id={gid} cx="50%" cy="38%" r="78%">
              <stop offset="0%" stopColor={c.c1} />
              <stop offset="48%" stopColor={c.c2} />
              <stop offset="100%" stopColor={c.c3} />
            </radialGradient>
            <linearGradient id={eid} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={c.c3} stopOpacity="0.35" />
              <stop offset="50%" stopColor={c.c1} stopOpacity="0.0" />
              <stop offset="100%" stopColor={c.c3} stopOpacity="0.35" />
            </linearGradient>
            {sheen}{innerShadow}{tipBlush}
          </defs>
          {/* base petal */}
          <path
            d="M18 3 C8 4 2 14 4 24 C6 33 14 39 18 38 C22 39 30 33 32 24 C34 14 28 4 18 3 C16 6 20 6 18 3 Z"
            fill={`url(#${gid})`}
            stroke={c.vein}
            strokeOpacity="0.4"
            strokeWidth="0.35"
          />
          {/* tip blush */}
          <path
            d="M18 3 C8 4 2 14 4 24 C6 33 14 39 18 38 C22 39 30 33 32 24 C34 14 28 4 18 3 Z"
            fill={`url(#${tid})`}
          />
          {/* central midrib */}
          <path
            d="M18 7 C17 17 17 28 18 37"
            stroke={c.vein}
            strokeOpacity="0.45"
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* primary lateral veins */}
          <path
            d="M18 11 C14 16 11 23 12 32 M18 11 C22 16 25 23 24 32"
            stroke={c.vein}
            strokeOpacity="0.28"
            strokeWidth="0.36"
            fill="none"
            strokeLinecap="round"
          />
          {/* secondary fine veins */}
          <path
            d="M18 14 C15 18 13 22 13 27 M18 14 C21 18 23 22 23 27 M18 18 C16 22 15 26 15 30 M18 18 C20 22 21 26 21 30"
            stroke={c.vein}
            strokeOpacity="0.14"
            strokeWidth="0.22"
            fill="none"
            strokeLinecap="round"
          />
          {/* edge rim shading */}
          <path
            d="M18 3 C8 4 2 14 4 24 C6 33 14 39 18 38 C22 39 30 33 32 24 C34 14 28 4 18 3 Z"
            fill={`url(#${eid})`}
            opacity="0.6"
          />
          {/* inner cup shadow */}
          <path
            d="M18 3 C8 4 2 14 4 24 C6 33 14 39 18 38 C22 39 30 33 32 24 C34 14 28 4 18 3 Z"
            fill={`url(#${shd})`}
          />
          {/* glossy sheen */}
          <path
            d="M18 3 C8 4 2 14 4 24 C6 33 14 39 18 38 C22 39 30 33 32 24 C34 14 28 4 18 3 Z"
            fill={`url(#${sid})`}
          />
          {/* tiny notch highlight */}
          <path
            d="M16 5 C17 6.5 19 6.5 20 5"
            stroke={c.c1}
            strokeOpacity="0.7"
            strokeWidth="0.35"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );
    case 1:
      // Furled rose petal — pronounced curled side, layered volume
      return (
        <svg width={s * 0.78} height={s} viewBox="0 0 32 40" fill="none">
          <defs>
            <linearGradient id={gid} x1="18%" y1="4%" x2="82%" y2="98%">
              <stop offset="0%" stopColor={c.c1} />
              <stop offset="45%" stopColor={c.c2} />
              <stop offset="100%" stopColor={c.c3} />
            </linearGradient>
            <linearGradient id={eid} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={c.c1} stopOpacity="0.75" />
              <stop offset="35%" stopColor={c.c1} stopOpacity="0.0" />
            </linearGradient>
            {sheen}{innerShadow}{tipBlush}
          </defs>
          {/* base petal */}
          <path
            d="M16 2 C26 6 30 18 27 30 C24 38 14 40 10 35 C5 28 4 16 10 8 C12 5 14 3 16 2 Z"
            fill={`url(#${gid})`}
            stroke={c.vein}
            strokeOpacity="0.36"
            strokeWidth="0.32"
          />
          {/* tip blush along outer rim */}
          <path
            d="M16 2 C26 6 30 18 27 30 C24 38 14 40 10 35 C5 28 4 16 10 8 C12 5 14 3 16 2 Z"
            fill={`url(#${tid})`}
          />
          {/* curled edge — soft fold */}
          <path
            d="M10 8 C6 14 6 24 11 33"
            stroke={c.c1}
            strokeOpacity="0.75"
            strokeWidth="0.9"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M10.5 9 C7 15 7.2 24 11.5 32"
            stroke={c.vein}
            strokeOpacity="0.22"
            strokeWidth="0.3"
            fill="none"
          />
          {/* midrib */}
          <path
            d="M16 4 C15 14 16 26 19 36"
            stroke={c.vein}
            strokeOpacity="0.42"
            strokeWidth="0.48"
            fill="none"
            strokeLinecap="round"
          />
          {/* lateral veins */}
          <path
            d="M16 8 C19 14 22 20 23 28 M16 12 C18 18 20 24 21 30 M16 16 C17 22 18 27 19 32"
            stroke={c.vein}
            strokeOpacity="0.2"
            strokeWidth="0.3"
            fill="none"
            strokeLinecap="round"
          />
          {/* edge rim shading */}
          <path
            d="M16 2 C26 6 30 18 27 30 C24 38 14 40 10 35 C5 28 4 16 10 8 C12 5 14 3 16 2 Z"
            fill={`url(#${eid})`}
            opacity="0.5"
          />
          {/* inner cup shadow */}
          <path
            d="M16 2 C26 6 30 18 27 30 C24 38 14 40 10 35 C5 28 4 16 10 8 C12 5 14 3 16 2 Z"
            fill={`url(#${shd})`}
          />
          {/* sheen */}
          <path
            d="M16 2 C26 6 30 18 27 30 C24 38 14 40 10 35 C5 28 4 16 10 8 C12 5 14 3 16 2 Z"
            fill={`url(#${sid})`}
          />
        </svg>
      );
    case 2:
    default:
      // Wide outer petal — broad, slightly scalloped, catches light
      return (
        <svg width={s} height={s * 0.88} viewBox="0 0 40 36" fill="none">
          <defs>
            <radialGradient id={gid} cx="50%" cy="32%" r="85%">
              <stop offset="0%" stopColor={c.c1} />
              <stop offset="55%" stopColor={c.c2} />
              <stop offset="100%" stopColor={c.c3} />
            </radialGradient>
            <linearGradient id={eid} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={c.c3} stopOpacity="0.4" />
              <stop offset="100%" stopColor={c.c3} stopOpacity="0" />
            </linearGradient>
            {sheen}{innerShadow}{tipBlush}
          </defs>
          {/* scalloped petal body */}
          <path
            d="M20 2 C28 3 34 8 36 14 C38 20 36 28 30 32 C26 35 22 34 20 33 C18 34 14 35 10 32 C4 28 2 20 4 14 C6 8 12 3 20 2 Z"
            fill={`url(#${gid})`}
            stroke={c.vein}
            strokeOpacity="0.34"
            strokeWidth="0.32"
          />
          {/* tip blush */}
          <path
            d="M20 2 C28 3 34 8 36 14 C38 20 36 28 30 32 C26 35 22 34 20 33 C18 34 14 35 10 32 C4 28 2 20 4 14 C6 8 12 3 20 2 Z"
            fill={`url(#${tid})`}
          />
          {/* midrib */}
          <path
            d="M20 5 C19 13 19 22 20 32"
            stroke={c.vein}
            strokeOpacity="0.42"
            strokeWidth="0.48"
            fill="none"
            strokeLinecap="round"
          />
          {/* primary veins */}
          <path
            d="M20 9 C14 14 11 21 13 29 M20 9 C26 14 29 21 27 29"
            stroke={c.vein}
            strokeOpacity="0.24"
            strokeWidth="0.34"
            fill="none"
            strokeLinecap="round"
          />
          {/* secondary veins */}
          <path
            d="M20 13 C16 17 14 22 14 27 M20 13 C24 17 26 22 26 27 M20 17 C17 20 16 24 16 28 M20 17 C23 20 24 24 24 28"
            stroke={c.vein}
            strokeOpacity="0.14"
            strokeWidth="0.24"
            fill="none"
            strokeLinecap="round"
          />
          {/* bottom rim shading */}
          <path
            d="M20 2 C28 3 34 8 36 14 C38 20 36 28 30 32 C26 35 22 34 20 33 C18 34 14 35 10 32 C4 28 2 20 4 14 C6 8 12 3 20 2 Z"
            fill={`url(#${eid})`}
            opacity="0.55"
          />
          {/* inner cup */}
          <path
            d="M20 2 C28 3 34 8 36 14 C38 20 36 28 30 32 C26 35 22 34 20 33 C18 34 14 35 10 32 C4 28 2 20 4 14 C6 8 12 3 20 2 Z"
            fill={`url(#${shd})`}
          />
          {/* sheen highlight */}
          <path
            d="M20 2 C28 3 34 8 36 14 C38 20 36 28 30 32 C26 35 22 34 20 33 C18 34 14 35 10 32 C4 28 2 20 4 14 C6 8 12 3 20 2 Z"
            fill={`url(#${sid})`}
          />
          {/* small specular dot — silk highlight */}
          <ellipse cx="16" cy="9" rx="3.2" ry="1.4" fill="#ffffff" opacity="0.28" />
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
