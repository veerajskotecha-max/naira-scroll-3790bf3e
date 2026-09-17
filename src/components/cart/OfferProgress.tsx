import {
  QUANTITY_OFFERS,
  TOP_QUANTITY_OFFER,
  earnedQuantityOffer,
  itemsToQuantityOffer,
  nextQuantityOffer,
  quantityOfferProgress,
} from "@/lib/promo";

const pct = (rate: number) => `${Math.round(rate * 100)}%`;

/**
 * The buy-more ladder, across the top of the bag.
 *
 * Both rungs are always on show, not just the next one — the shopper can see
 * that a third piece is worth more than a second before deciding how many to
 * buy, which is the whole point of a ladder. The bar fills across the full
 * ladder so adding a piece always moves it forward rather than resetting at
 * each rung, and each rung is marked at its true position on that bar.
 *
 * It sits above the items rather than beside the totals because it is a reason
 * to keep shopping, not a line of arithmetic.
 */
const OfferProgress = ({ totalItems }: { totalItems: number }) => {
  const earned = earnedQuantityOffer(totalItems);
  const next = nextQuantityOffer(totalItems);
  const away = itemsToQuantityOffer(totalItems);
  const progress = quantityOfferProgress(totalItems);

  return (
    <div className="border-b border-[color:rgb(var(--nf-ink-rgb)/0.08)] bg-[var(--nf-surface-raised)] px-5 pb-3 pt-3">
      <p className="flex items-baseline justify-between gap-3 text-[11px] uppercase tracking-[var(--nf-track-16)]">
        <span className={earned ? "font-semibold text-primary" : "text-muted-foreground"}>
          {earned ? `${pct(earned.rate)} off applied` : "Buy more, save more"}
        </span>
        {next ? (
          <span className="shrink-0 text-muted-foreground">
            {away === 1 ? "1 piece" : `${away} pieces`} to{" "}
            <span className="font-semibold text-primary">{pct(next.rate)}</span>
          </span>
        ) : (
          <span className="shrink-0 font-semibold text-primary">Best price unlocked</span>
        )}
      </p>

      <div
        className="relative mt-2.5 h-[3px] w-full bg-[color:rgb(var(--nf-ink-rgb)/0.10)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOP_QUANTITY_OFFER.minQuantity}
        aria-valuenow={Math.min(totalItems, TOP_QUANTITY_OFFER.minQuantity)}
        aria-label={`${totalItems} of ${TOP_QUANTITY_OFFER.minQuantity} pieces towards ${pct(TOP_QUANTITY_OFFER.rate)} off`}
      >
        <span
          className="block h-full bg-[var(--nf-accent-strong)] transition-[width] duration-500 ease-reveal motion-reduce:transition-none"
          style={{ width: `${progress * 100}%` }}
        />
        {QUANTITY_OFFERS.map((offer) => {
          const at = offer.minQuantity / TOP_QUANTITY_OFFER.minQuantity;
          const reached = totalItems >= offer.minQuantity;
          return (
            <span
              key={offer.code}
              aria-hidden="true"
              className={`absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 transition-colors duration-300 ${
                reached ? "bg-[var(--nf-accent-strong)]" : "bg-[color:rgb(var(--nf-ink-rgb)/0.18)]"
              }`}
              style={{ left: `${at * 100}%` }}
            />
          );
        })}
      </div>

      {/* Both rungs, always legible, so the second one is a visible reason to
          add a third piece rather than a surprise after the fact. */}
      <ul className="mt-2 flex items-center gap-4">
        {QUANTITY_OFFERS.map((offer) => {
          const reached = totalItems >= offer.minQuantity;
          return (
            <li
              key={offer.code}
              className={`flex items-baseline gap-1 text-[10px] uppercase tracking-[var(--nf-track-10)] transition-opacity duration-300 ${
                reached ? "text-primary opacity-100" : "text-muted-foreground opacity-70"
              }`}
            >
              <span className={reached ? "font-semibold" : ""}>{offer.minQuantity} pieces</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold">{pct(offer.rate)} off</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OfferProgress;
