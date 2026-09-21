import { Gem, ShieldCheck, Sparkles } from "lucide-react";

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
const JewelTrustStrip = () => (
  <ul
    className="mt-3 flex list-none gap-2 overflow-x-auto pb-1 scrollbar-hide"
    aria-label="Naira Flore jewellery assurances"
  >
    {items.map(({ icon: Icon, label }) => (
      <li
        key={label}
        className="flex min-h-11 shrink-0 items-center gap-2 border border-[color:rgb(var(--nf-gold-rgb)/0.22)] bg-[var(--nf-surface)] px-3"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[var(--nf-surface-raised)] text-[var(--nf-accent-quiet)]">
          <Icon size={14} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span
          className="whitespace-nowrap text-[10px] leading-none text-[var(--nf-text)] md:text-[11px]"
          style={jost}
        >
          {label}
        </span>
      </li>
    ))}
  </ul>
);

export default JewelTrustStrip;
