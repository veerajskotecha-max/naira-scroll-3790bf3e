import { Gem, ShieldCheck, Sparkles, Zap } from "lucide-react";
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
    <p className="mt-3 flex min-h-9 items-center gap-2 border-y border-[color:rgb(var(--nf-gold-rgb)/0.22)] bg-[var(--nf-surface-raised)] px-2.5 py-2 text-[10px] font-medium uppercase leading-4 text-[var(--nf-text)] sm:text-[11px]">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[var(--nf-accent-strong)] text-[var(--nf-accent-contrast)]">
        <Zap size={11} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
      </span>
      {soldCount} pieces sold in the last 48 hours
    </p>
  </div>
};

export default JewelTrustStrip;
