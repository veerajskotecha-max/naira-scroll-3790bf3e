import { standing, rupees, TIERS } from "./tiers";

const velista = { fontFamily: "var(--nf-font-display), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const GOLD = "#B0843A";
const SAGE = "#99B4AF";

/*
  One wreath per tier, drawn rather than drawn *on*. Same hand throughout:
  the ring fills in and opens up as the member climbs — Petal is a sprig with a
  single closed bud, Rare Bloom is a closed ring in gold with a stone at the
  crown.
*/
const WREATHS = [
  { leaves: 9, arc: 190, flowers: [1], open: true, gold: false, gem: false },
  { leaves: 13, arc: 250, flowers: [0, 1], open: true, gold: false, gem: false },
  { leaves: 17, arc: 300, flowers: [0, 0.5, 1], open: true, gold: false, gem: false },
  { leaves: 21, arc: 344, flowers: [0, 0.25, 0.5, 0.75, 1], open: false, gold: true, gem: true },
] as const;

const pointAt = (deg: number, radius: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: 60 + radius * Math.cos(rad), y: 60 + radius * Math.sin(rad) };
};

/** The wreath for a tier index. Decorative — the tier name is real text over it. */
const Wreath = ({ index, className = "" }: { index: number; className?: string }) => {
  const w = WREATHS[index] ?? WREATHS[0];
  const leafInk = w.gold ? GOLD : SAGE;
  const start = 90 - w.arc / 2;
  const step = w.arc / (w.leaves - 1);
  const from = pointAt(start, 42);
  const to = pointAt(start + w.arc, 42);

  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden focusable="false">
      {/* the stem the whole thing grows along */}
      <path
        d={`M ${from.x.toFixed(1)} ${from.y.toFixed(1)} A 42 42 0 ${w.arc > 180 ? 1 : 0} 1 ${to.x.toFixed(1)} ${to.y.toFixed(1)}`}
        stroke={leafInk}
        strokeOpacity=".55"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {Array.from({ length: w.leaves }, (_, i) => {
        const deg = start + i * step;
        const p = pointAt(deg, 42);
        const tilt = i % 2 ? 30 : -30;
        return (
          <ellipse
            key={`leaf-${i}`}
            cx={p.x}
            cy={p.y}
            rx="7.5"
            ry="3.1"
            transform={`rotate(${deg + 90 + tilt} ${p.x} ${p.y})`}
            stroke={leafInk}
            strokeOpacity=".55"
            strokeWidth="1"
          />
        );
      })}
      {w.flowers.map((fraction, f) => {
        const p = pointAt(start + w.arc * fraction, 42);
        const petals = index === 0 ? 3 : 5;
        return (
          <g key={`bloom-${f}`}>
            {Array.from({ length: petals }, (_, k) => (
              <ellipse
                key={k}
                cx={p.x}
                cy={p.y - 3.6}
                rx="2.6"
                ry="3.8"
                transform={`rotate(${(360 / petals) * k} ${p.x} ${p.y})`}
                stroke={GOLD}
                strokeOpacity=".7"
                strokeWidth="1"
                fill={w.gold ? GOLD : "none"}
                fillOpacity={w.gold ? 0.16 : 0}
              />
            ))}
            <circle cx={p.x} cy={p.y} r="1.6" fill={GOLD} fillOpacity=".55" />
          </g>
        );
      })}
      {w.gem && (
        <path d="M60 8 L66 15 L60 23 L54 15 Z" stroke={GOLD} strokeWidth="1" fill={GOLD} fillOpacity=".2" />
      )}
    </svg>
  );
};

/**
 * The member's standing: their wreath, their real lifetime spend, and an
 * honest distance to the next rung. `spend` of null means still loading.
 */
const MemberTier = ({ spend }: { spend: number | null }) => {
  const loading = spend === null;
  const { tier, next, toNext, fraction } = standing(spend ?? 0);
  const index = Math.max(0, TIERS.findIndex((t) => t.name === tier.name));
  const fresh = !loading && spend === 0;

  return (
    <section
      className="relative overflow-hidden border border-[#1A1614]/10 bg-[#FFFBF7] px-6 py-8 text-center"
      aria-busy={loading}
    >
      <p className="text-[9px] tracking-[0.4em] text-[#B0843A]" style={jost}>
        YOUR STANDING
      </p>

      <div className={`relative mx-auto mt-4 h-[132px] w-[132px] ${loading ? "opacity-40" : ""}`}>
        <Wreath index={index} className="h-full w-full" />
        <span className="absolute inset-0 grid place-items-center px-8 pt-5">
          <span className="text-[17px] leading-[1.1]" style={velista}>
            {loading ? "—" : tier.name}
          </span>
        </span>
      </div>

      {loading ? (
        <div className="mx-auto mt-6 h-3 w-40 animate-pulse bg-[#1A1614]/10 motion-reduce:animate-none" />
      ) : (
        <>
          <p className="mx-auto mt-5 max-w-[34ch] text-[1.02rem] italic leading-[1.55] text-[#1A1614]/70" style={editorial}>
            {fresh
              ? "Every wreath starts as one stem. Your first piece opens the next."
              : tier.perk}
          </p>

          <p className="mt-4 text-[10px] tracking-[0.32em] text-[#1A1614]/45" style={jost}>
            {fresh ? "NOTHING COLLECTED YET" : `${rupees(spend ?? 0)} COLLECTED WITH US`}
          </p>

          {next ? (
            <div className="mx-auto mt-6 max-w-[300px]">
              <div className="h-px w-full bg-[#1A1614]/10">
                <div
                  className="h-px origin-left bg-[#B0843A] transition-transform duration-300 ease-out motion-reduce:transition-none"
                  style={{ transform: `scaleX(${fraction})` }}
                />
              </div>
              <p className="mt-3 text-[10px] tracking-[0.28em] text-[#8A6A2F]" style={jost}>
                {rupees(toNext)} TO {next.name.toUpperCase()}
              </p>
            </div>
          ) : (
            <p className="mt-6 text-[10px] tracking-[0.28em] text-[#8A6A2F]" style={jost}>
              THE TOP OF THE GARDEN · NOTHING ABOVE THIS
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default MemberTier;
