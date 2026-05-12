import { useEffect, useMemo, useRef } from "react";

const PETAL_COUNT = 34;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
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
};

/* ────────── 6 hand-drawn SVG petal variants ────────── */
const PetalSVG = ({ v, s, id }: { v: number; s: number; id: number }) => {
  switch (v) {
    case 0: // 5-petal cherry blossom
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <defs>
            <radialGradient id={`pg0-${id}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#FBE5D6" />
              <stop offset="60%" stopColor="#F4D5C2" />
              <stop offset="100%" stopColor="#D9A088" />
            </radialGradient>
          </defs>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="20"
              cy="9"
              rx="5.6"
              ry="9.2"
              fill={`url(#pg0-${id})`}
              transform={`rotate(${a} 20 20)`}
              opacity="0.94"
            />
          ))}
          <circle cx="20" cy="20" r="2.2" fill="#B89968" />
          <circle cx="20" cy="20" r="0.9" fill="#7d6234" />
        </svg>
      );
    case 1: // single cream petal w/ gold vein
      return (
        <svg width={s * 0.55} height={s} viewBox="0 0 24 40" fill="none">
          <path
            d="M12 2 C18.5 12 18.5 28 12 38 C5.5 28 5.5 12 12 2 Z"
            fill="#FBF3E8"
            stroke="#D9C49A"
            strokeWidth="0.6"
            opacity="0.96"
          />
          <path d="M12 5 L12 35" stroke="#B89968" strokeWidth="0.55" opacity="0.6" />
        </svg>
      );
    case 2: // gota-pati bud cluster
      return (
        <svg width={s} height={s * 0.5} viewBox="0 0 40 20" fill="none">
          <circle cx="8" cy="11" r="5" fill="#E8C9B5" opacity="0.9" />
          <circle cx="20" cy="8" r="6" fill="#EDD0BC" opacity="0.95" />
          <circle cx="32" cy="11" r="4.5" fill="#E8C9B5" opacity="0.9" />
          <circle cx="8" cy="11" r="1.2" fill="#B89968" />
          <circle cx="20" cy="8" r="1.4" fill="#B89968" />
          <circle cx="32" cy="11" r="1.1" fill="#B89968" />
        </svg>
      );
    case 3: // sage leaf w/ vein
      return (
        <svg width={s * 0.5} height={s} viewBox="0 0 22 40" fill="none">
          <path
            d="M11 1 C19 12 19 28 11 39 C3 28 3 12 11 1 Z"
            fill="#AEBDB6"
            opacity="0.86"
          />
          <path d="M11 4 L11 36" stroke="#6F8278" strokeWidth="0.7" />
          {[10, 18, 26].map((y) => (
            <g key={y}>
              <path d={`M11 ${y} L6 ${y + 3}`} stroke="#6F8278" strokeWidth="0.4" />
              <path d={`M11 ${y} L16 ${y + 3}`} stroke="#6F8278" strokeWidth="0.4" />
            </g>
          ))}
        </svg>
      );
    case 4: // 3-bud cherry blossom mini cluster
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <defs>
            <radialGradient id={`pg4-${id}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#FBE5D6" />
              <stop offset="100%" stopColor="#D9A088" />
            </radialGradient>
          </defs>
          {([
            [12, 14, 6.5],
            [27, 12, 5.5],
            [20, 27, 7],
          ] as const).map(([cx, cy, r], i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cx={cx}
                  cy={cy - r * 0.55}
                  rx={r * 0.34}
                  ry={r * 0.6}
                  fill={`url(#pg4-${id})`}
                  transform={`rotate(${a} ${cx} ${cy})`}
                  opacity="0.92"
                />
              ))}
              <circle cx={cx} cy={cy} r={r * 0.2} fill="#B89968" />
            </g>
          ))}
        </svg>
      );
    case 5: // tiny gold speck
    default:
      return (
        <svg width={s * 0.32} height={s * 0.32} viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="2.6" fill="#D9B873" opacity="0.85" />
          <circle cx="5" cy="5" r="1" fill="#FFE9B0" />
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
      const sz = bucket < 0.32 ? rand(14, 22) : bucket < 0.8 ? rand(24, 36) : rand(38, 54);
      const start = rand(-0.05, 0.78);
      return {
        variant: Math.floor(Math.random() * 6),
        size: sz,
        xPct: rand(2, 98),
        sway: rand(8, 18),
        swayFreq: rand(0.6, 1.6),
        rot: rand(-200, 200),
        depth: sz < 22 ? 0.55 : sz < 36 ? 0.85 : 1.15,
        start,
        end: Math.min(1.05, start + rand(0.4, 0.7)),
        driftX: rand(-30, 30),
      };
    });
  }, []);

  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const p = progressRef.current;
      petals.forEach((cfg, i) => {
        const el = refs.current[i];
        if (!el) return;
        const localT = (p - cfg.start) / (cfg.end - cfg.start);
        if (localT < 0 || localT > 1) {
          if (el.style.opacity !== "0") el.style.opacity = "0";
          return;
        }
        const y = -60 + localT * (vh + 140) * cfg.depth;
        const swayX =
          Math.sin(localT * Math.PI * 2 * cfg.swayFreq) * cfg.sway + cfg.driftX * localT;
        const rot = cfg.rot * localT;
        let op = 0.95;
        if (localT < 0.15) op = easeOutExpo(localT / 0.15) * 0.95;
        else if (localT > 0.8) op = easeOutExpo(1 - (localT - 0.8) / 0.2) * 0.95;
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
              cfg.size > 36
                ? "drop-shadow(0 5px 8px rgba(120,80,50,0.14))"
                : undefined,
          }}
        >
          <PetalSVG v={cfg.variant} s={cfg.size} id={i} />
        </div>
      ))}
    </div>
  );
};

export default HeroPetals;
