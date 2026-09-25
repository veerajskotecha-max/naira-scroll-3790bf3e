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
 *
 * It used to end with "Last 24 hours: N pieces sold", where N was a hash of the
 * product handle rather than a sales figure — the same number every day, on
 * every visit. A made-up count is not something to show a shopper, so it is
 * gone rather than restyled.
 */
const JewelTrustStrip = () => (
  <div className="mt-3">
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
  </div>
);

export default JewelTrustStrip;
