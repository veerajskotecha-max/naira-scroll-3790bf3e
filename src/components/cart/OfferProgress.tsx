import {
  QUANTITY_OFFERS,
  TOP_QUANTITY_OFFER,
  earnedQuantityOffer,
  itemsToQuantityOffer,
  nextQuantityOffer,
  quantityOfferProgress,
} from "@/lib/promo";

const pct = (rate: number) => `${Math.round(rate * 100)}%`;
const pieces = (n: number) => (n === 1 ? "1 piece" : `${n} pieces`);

/**
 * The buy-more ladder, across the top of the bag.
 *
 * Three decisions worth keeping:
 *
 *  - It wears the same gold-on-linen band as the offer block on the product
 *    page, so the promise a shopper read next to Add to Cart is recognisably
 *    the same promise in the bag rather than a second, unfamiliar one.
 *  - Both rungs sit on the track at their true positions, so a shopper can
 *    SEE that the richer rung is further along and how far. A list of two
 *    percentages states the offer; a track makes the third piece feel close.
 *  - The bar measures the whole ladder rather than the current rung, so
 *    adding a piece always moves it forward instead of resetting to empty
 *    each time a rung is cleared.
 *
 * It sits above the items, not beside the totals: it is a reason to keep
 * shopping, not a line of arithmetic.
 */
const OfferProgress = ({ totalItems }: { totalItems: number }) => {
  const earned = earnedQuantityOffer(totalItems);
  const next = nextQuantityOffer(totalItems);
  const away = itemsToQuantityOffer(totalItems);
  const progress = quantityOfferProgress(totalItems);

  /* Kept short deliberately: the editorial serif renders as capitals, and a
     sentence that wraps to two lines of caps reads as shouting rather than as
     an offer. Every branch here fits one line at 360px. */
  const headline = earned
    ? next
      ? `${pct(earned.rate)} off — add ${pieces(away)} for ${pct(next.rate)}`
      : `${pct(earned.rate)} off — your best price`
    : `Add ${pieces(away)}, save ${pct(next?.rate ?? 0)}`;

  return (
    <div className="shrink-0 border-y border-[color:rgb(var(--nf-gold-rgb)/0.38)] bg-[var(--nf-surface-raised)] px-4 py-2.5 sm:px-5 sm:pb-3.5 sm:pt-3">
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="flex shrink-0 items-center gap-1 text-[9px] font-medium uppercase tracking-[var(--nf-track-16)] text-[var(--nf-accent-quiet)] sm:text-[10px] sm:tracking-[var(--nf-track-18)]">
          <span aria-hidden="true">&#10022;</span>
          Pairing Offer
        </p>

        {/* On short mobile screens the earned saving and the offer name share
            one line. The desktop drawer keeps the roomier editorial treatment. */}
        <p className="truncate text-right font-cormorant text-[14px] font-semibold leading-none text-[var(--nf-text)] sm:text-[16px] sm:leading-snug">
          {headline}
        </p>
      </div>

      <div
        className="relative mt-2.5 h-[2px] w-full bg-[color:rgb(var(--nf-ink-rgb)/0.10)] sm:mt-3"
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
              className={`absolute top-1/2 h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 rotate-45 border transition-colors duration-300 ${
                reached
                  ? "border-[var(--nf-accent-strong)] bg-[var(--nf-accent-strong)]"
                  : "border-[color:rgb(var(--nf-ink-rgb)/0.22)] bg-[var(--nf-surface-raised)]"
              }`}
              style={{ left: `${at * 100}%` }}
            />
          );
        })}
      </div>

      {/* Each rung is labelled where it actually sits on the track, so the
          ladder reads as a distance rather than as two unrelated coupons.

          Stacked over two short lines rather than one long one: side by side,
          "2 · 20% off" and "3 · 30% off" ran into each other at 390px, which
          is most of the traffic. The last label right-aligns — centred on its
          marker it would hang off the end of the bar. */}
      <div className="relative mt-1.5 h-[22px] sm:mt-2 sm:h-[26px]">
        {QUANTITY_OFFERS.map((offer, i) => {
          const at = offer.minQuantity / TOP_QUANTITY_OFFER.minQuantity;
          const reached = totalItems >= offer.minQuantity;
          const last = i === QUANTITY_OFFERS.length - 1;
          return (
            <span
              key={offer.code}
              className={`absolute top-0 flex flex-col whitespace-nowrap leading-[1.25] transition-colors duration-300 ${
                last ? "items-end text-right" : "items-center text-center"
              } ${reached ? "text-[var(--nf-accent-quiet)]" : "text-[color:rgb(var(--nf-ink-rgb)/0.45)]"}`}
              style={{ left: `${at * 100}%`, transform: last ? "translateX(-100%)" : "translateX(-50%)" }}
            >
              <span className="text-[8px] uppercase tracking-[var(--nf-track-8)] sm:text-[9px] sm:tracking-[var(--nf-track-10)]">
                {offer.minQuantity} pieces
              </span>
              <span className={`text-[10px] uppercase tracking-[var(--nf-track-8)] sm:text-[11px] ${reached ? "font-semibold" : "font-medium"}`}>
                {pct(offer.rate)} off
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default OfferProgress;
