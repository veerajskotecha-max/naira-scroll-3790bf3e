import { useEffect, useMemo, useRef } from "react";

const PETAL_COUNT = 28;

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
};

/* ────────── 6 refined hand-drawn SVG petal variants ────────── */
const PetalSVG = ({ v, s, id }: { v: number; s: number; id: number }) => {
  switch (v) {
    case 0: // 5-petal cherry blossom — soft blush, gold stamen
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <defs>
            <radialGradient id={`pg0-${id}`} cx="50%" cy="55%" r="60%">
              <stop offset="0%" stopColor="#FFF1E6" />
              <stop offset="45%" stopColor="#F5D4C0" />
              <stop offset="100%" stopColor="#D49A82" />
            </radialGradient>
            <radialGradient id={`pg0c-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E8C079" />
              <stop offset="100%" stopColor="#9C7A3E" />
            </radialGradient>
          </defs>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="20"
              cy="9"
              rx="5.4"
              ry="9.4"
              fill={`url(#pg0-${id})`}
              transform={`rotate(${a} 20 20)`}
              opacity="0.95"
            />
          ))}
          {/* stamens */}
          {[18, 19, 20, 21, 22].map((cx, i) => (
            <line
              key={i}
              x1="20"
              y1="20"
              x2={cx}
              y2={16 + (i % 2)}
              stroke="#B89968"
              strokeWidth="0.4"
              opacity="0.7"
            />
          ))}
          <circle cx="20" cy="20" r="2.4" fill={`url(#pg0c-${id})`} />
          <circle cx="20" cy="20" r="0.7" fill="#5A3F1C" opacity="0.6" />
        </svg>
      );

    case 1: // single cream petal — translucent w/ soft gold vein
      return (
        <svg width={s * 0.55} height={s} viewBox="0 0 24 40" fill="none">
          <defs>
            <linearGradient id={`pg1-${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFFBF3" />
              <stop offset="100%" stopColor="#F2E2C6" />
            </linearGradient>
          </defs>
          <path
            d="M12 1.5 C19 11 19.5 28 12 38.5 C4.5 28 5 11 12 1.5 Z"
            fill={`url(#pg1-${id})`}
            stroke="#D9C49A"
            strokeWidth="0.5"
            opacity="0.96"
          />
          <path d="M12 4.5 L12 35.5" stroke="#B89968" strokeWidth="0.45" opacity="0.55" />
          <path d="M12 12 Q9 14 8 18" stroke="#B89968" strokeWidth="0.3" opacity="0.35" fill="none" />
          <path d="M12 22 Q15 24 16 28" stroke="#B89968" strokeWidth="0.3" opacity="0.35" fill="none" />
        </svg>
      );

    case 2: // gota-pati bud cluster — soft peach beads with gold dots
      return (
        <svg width={s} height={s * 0.5} viewBox="0 0 40 20" fill="none">
          <defs>
            <radialGradient id={`pg2-${id}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#F6D9C5" />
              <stop offset="100%" stopColor="#D9A88E" />
            </radialGradient>
          </defs>
          <circle cx="8" cy="11" r="5" fill={`url(#pg2-${id})`} opacity="0.92" />
          <circle cx="20" cy="8" r="6" fill={`url(#pg2-${id})`} opacity="0.96" />
          <circle cx="32" cy="11" r="4.5" fill={`url(#pg2-${id})`} opacity="0.92" />
          <circle cx="8" cy="11" r="1.3" fill="#C9A05A" />
          <circle cx="20" cy="8" r="1.5" fill="#C9A05A" />
          <circle cx="32" cy="11" r="1.2" fill="#C9A05A" />
          <circle cx="8" cy="11" r="0.45" fill="#FFE9B5" />
          <circle cx="20" cy="8" r="0.5" fill="#FFE9B5" />
          <circle cx="32" cy="11" r="0.4" fill="#FFE9B5" />
        </svg>
      );

    case 3: // sage leaf — refined vein structure
      return (
        <svg width={s * 0.5} height={s} viewBox="0 0 22 40" fill="none">
          <defs>
            <linearGradient id={`pg3-${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#C2D0C8" />
              <stop offset="100%" stopColor="#9DAEA5" />
            </linearGradient>
          </defs>
          <path
            d="M11 1 C19 12 19 28 11 39 C3 28 3 12 11 1 Z"
            fill={`url(#pg3-${id})`}
            opacity="0.9"
          />
          <path d="M11 3.5 L11 36.5" stroke="#5E6F66" strokeWidth="0.55" opacity="0.7" />
          {[9, 15, 21, 27, 32].map((y) => (
            <g key={y} opacity="0.55">
              <path
                d={`M11 ${y} Q ${y < 20 ? 7 : 7} ${y + 2} ${y < 20 ? 5.5 : 5.5} ${y + 4}`}
                stroke="#5E6F66"
                strokeWidth="0.32"
                fill="none"
              />
              <path
                d={`M11 ${y} Q ${y < 20 ? 15 : 15} ${y + 2} ${y < 20 ? 16.5 : 16.5} ${y + 4}`}
                stroke="#5E6F66"
                strokeWidth="0.32"
                fill="none"
              />
            </g>
          ))}
        </svg>
      );

    case 4: // 3-bud cherry blossom mini cluster
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <defs>
            <radialGradient id={`pg4-${id}`} cx="50%" cy="55%" r="60%">
              <stop offset="0%" stopColor="#FFF1E6" />
              <stop offset="45%" stopColor="#F5D4C0" />
              <stop offset="100%" stopColor="#D49A82" />
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
                  opacity="0.93"
                />
              ))}
              <circle cx={cx} cy={cy} r={r * 0.22} fill="#C9A05A" />
              <circle cx={cx} cy={cy} r={r * 0.08} fill="#FFE9B5" />
            </g>
          ))}
        </svg>
      );

    case 5: // gold speck — refined sparkle
    default:
      return (
        <svg width={s * 0.34} height={s * 0.34} viewBox="0 0 10 10">
          <defs>
            <radialGradient id={`pg5-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE9B5" />
              <stop offset="60%" stopColor="#D9B873" />
              <stop offset="100%" stopColor="#9C7A3E" />
            </radialGradient>
          </defs>
          <circle cx="5" cy="5" r="3" fill={`url(#pg5-${id})`} />
          <circle cx="5" cy="5" r="1" fill="#FFF6D0" opacity="0.9" />
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
      const sz = bucket < 0.35 ? rand(14, 22) : bucket < 0.82 ? rand(24, 34) : rand(36, 48);
      const start = rand(-0.05, 0.7);
      return {
        variant: Math.floor(Math.random() * 6),
        size: sz,
        xPct: rand(3, 97),
        sway: rand(10, 20),
        swayFreq: rand(0.5, 1.3),
        rot: rand(-160, 160),
        depth: sz < 22 ? 0.5 : sz < 34 ? 0.78 : 1.05,
        start,
        end: Math.min(1.1, start + rand(0.55, 0.9)),
        driftX: rand(-25, 25),
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
        // ease the fall slightly so petals decelerate near the bottom
        const fallT = easeInOutSine(localT);
        const y = -60 + fallT * (vh + 140) * cfg.depth;
        const swayX =
          Math.sin(localT * Math.PI * 2 * cfg.swayFreq) * cfg.sway + cfg.driftX * localT;
        const rot = cfg.rot * localT;
        let op = 0.92;
        if (localT < 0.18) op = easeOutExpo(localT / 0.18) * 0.92;
        else if (localT > 0.78) op = easeOutExpo(1 - (localT - 0.78) / 0.22) * 0.92;
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
              cfg.size > 32
                ? "drop-shadow(0 6px 9px rgba(120,80,50,0.16))"
                : "drop-shadow(0 2px 4px rgba(120,80,50,0.10))",
          }}
        >
          <PetalSVG v={cfg.variant} s={cfg.size} id={i} />
        </div>
      ))}
    </div>
  );
};

export default HeroPetals;
