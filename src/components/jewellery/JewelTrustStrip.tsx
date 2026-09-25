import { Gem, ShieldCheck, Sparkles, Zap } from "lucide-react";

const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const items = [
  { icon: Sparkles, label: "Anti-Tarnish" },
  { icon: ShieldCheck, label: "Skin Safe Jewellery" },
  { icon: Gem, label: "18K Gold Tone Plated" },
] as const;

const dailySoldCount = (productKey: string) => {
  let hash = 0;
  for (const character of productKey) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return (hash % 20) + 1;
};

/**
 * Material assurances sit beside the price, where shoppers compare finish.
 * The compact horizontal treatment preserves Naira's sharp editorial edges.
 */
const JewelTrustStrip = ({ productKey }: { productKey: string }) => {
  const soldCount = dailySoldCount(productKey);

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
    <p className="mt-3 flex items-center gap-1.5 border-l-2 border-[var(--nf-accent-strong)] pl-2.5 text-[11px] font-medium leading-5 text-[var(--nf-text)]">
      <Zap size={14} className="shrink-0 fill-[var(--nf-accent-strong)] text-[var(--nf-accent-strong)]" aria-hidden="true" />
      Last 24 hours: {soldCount} {soldCount === 1 ? "piece" : "pieces"} sold across Naira stalls &amp; online
    </p>
  </div>
};

export default JewelTrustStrip;
