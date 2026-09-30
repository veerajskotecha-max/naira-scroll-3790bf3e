import { Gem, ShieldCheck, Sparkles } from "lucide-react";
import { recentSoldCount } from "@/lib/dailySold";

const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const items = [
  { icon: Sparkles, label: "Anti-Tarnish" },
  { icon: ShieldCheck, label: "Skin Safe Jewellery" },
  { icon: Gem, label: "18K Gold Tone Plated" },
] as const;

/**
 * Material assurances sit beside the price, where shoppers compare finish.
 * The compact horizontal treatment preserves Naira's sharp editorial edges.
 */
const JewelTrustStrip = ({ productKey }: { productKey: string }) => {
  const soldCount = recentSoldCount(productKey);

  return <div className="mt-3">
    <ul
      className="grid list-none grid-cols-3 gap-1.5"
      aria-label="Naira Flore jewellery assurances"
    >
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex min-w-0 flex-col items-center justify-center gap-1.5 border border-[color:rgb(var(--nf-gold-rgb)/0.22)] bg-[var(--nf-surface)] px-1.5 py-2 text-center md:min-h-11 md:flex-row md:gap-2 md:px-3 md:py-0"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-[var(--nf-surface-raised)] text-[var(--nf-accent-quiet)] md:h-7 md:w-7">
            <Icon size={13} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span
            className="text-[8px] leading-[1.25] text-[var(--nf-text)] sm:text-[9px] md:text-[11px]"
            style={jost}
          >
            {label}
          </span>
        </li>
      ))}
    </ul>
    <p className="mt-3 flex min-h-9 items-center justify-center gap-3 border-y border-[color:rgb(var(--nf-gold-rgb)/0.35)] bg-[var(--nf-surface-raised)] px-3 py-2.5">
      <svg
        width="10"
        height="10"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-[var(--nf-accent-strong)]"
      >
        <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="currentColor" />
      </svg>
      <span className="flex items-baseline gap-1.5">
        <span className="font-cormorant text-[15px] italic leading-none text-[var(--nf-accent-strong)]">
          {soldCount}
        </span>
        <span
          className="whitespace-nowrap text-[9px] font-light uppercase leading-none tracking-[0.2em] text-[var(--nf-text)] sm:text-[10px]"
          style={jost}
        >
          pieces sold in the last 48 hours
        </span>
      </span>
      <span className="h-2 w-px shrink-0 bg-[color:rgb(var(--nf-gold-rgb)/0.3)]" aria-hidden="true" />
    </p>
  </div>
};

export default JewelTrustStrip;
