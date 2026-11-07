import {
  QUANTITY_OFFERS,
  TOP_QUANTITY_OFFER,
  earnedQuantityOffer,
  itemsToQuantityOffer,
  nextQuantityOffer,
  quantityOfferProgress,
  rungPosition,
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
 *  - Every rung sits on the track, in order, so a shopper can SEE that the
 *    richer rung is further along. A list of percentages states the offer; a
 *    track makes the next piece feel close. Since Buy 4 (7 Nov 2026) the
 *    three rungs each take a third of the track (`rungPosition`), so their
 *    labels have room at any width.
 *  - The bar measures the whole ladder rather than the current rung, so
 *    adding a piece always moves it forward instead of resetting to empty
 *    each time a rung is cleared.
 *
 * It sits above the items, not beside the totals: it is a reason to keep
 * shopping, not a line of arithmetic.
 */
/* `quiet` (the redesigned bag): no eyebrow and no rung labels, so the band
   carries one headline over one track rather than six scraps of capitals.
   `appliedRate` is the discount the bag actually gets (a typed code can give
   as much as a rung), so the band never offers a saving already in hand. */
const OfferProgress = ({ totalItems, quiet = false, appliedRate }: { totalItems: number; quiet?: boolean; appliedRate?: number }) => {
  const earned = earnedQuantityOffer(totalItems);
  const next = nextQuantityOffer(totalItems);
  const away = itemsToQuantityOffer(totalItems);
  const progress = quantityOfferProgress(totalItems);
  const applied = Math.max(appliedRate ?? 0, earned?.rate ?? 0);
  const better = QUANTITY_OFFERS.find((offer) => totalItems < offer.minQuantity && offer.rate > applied) ?? null;

  /* Kept short deliberately: the editorial serif renders as capitals, and a
     sentence that wraps to two lines of caps reads as shouting rather than as
     an offer. Every branch here fits one line at 360px. */
  const headline =
    applied > 0
      ? better
        ? `${pct(applied)} off — add ${pieces(better.minQuantity - totalItems)} for ${pct(better.rate)}`
        : `${pct(applied)} off — your best price`
      : `Add ${pieces(away)}, save ${pct(next?.rate ?? 0)}`;

  return (
    <div className="shrink-0 border-y border-[color:rgb(var(--nf-gold-rgb)/0.38)] bg-[var(--nf-surface-raised)] px-4 py-2.5 sm:px-5 sm:pb-3.5 sm:pt-3">
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        {!quiet && (
          <p className="flex shrink-0 items-center gap-1 text-[11px] font-medium uppercase tracking-[var(--nf-track-10)] text-[var(--nf-accent-quiet)] sm:tracking-[var(--nf-track-16)]">
            <span aria-hidden="true">&#10022;</span>
            Pairing Offer
          </p>
        )}

        {/* On short mobile screens the earned saving and the offer name share
            one line. The desktop drawer keeps the roomier editorial treatment. */}
        <p className={`truncate font-cormorant font-semibold leading-none text-[var(--nf-text)] sm:leading-snug ${quiet ? "text-left text-[13px] sm:text-[14px]" : "text-right text-[14px] sm:text-[16px]"}`}>
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
        {QUANTITY_OFFERS.map((offer, i) => {
          const at = rungPosition(i);
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

      {/* Each rung is labelled under its own marker, in that rung's third of
          the width, so the ladder reads as a distance rather than as unrelated
          coupons and no label can reach its neighbour's: with three rungs at
          their piece counts, "3 pieces" and "4 pieces" overlapped at 280px.
          Stacked over two short lines, at 11px, the least a phone reads. */}
      {!quiet && (
        <ul className="mt-1.5 grid grid-cols-3 text-center sm:mt-2">
          {QUANTITY_OFFERS.map((offer) => {
            const reached = totalItems >= offer.minQuantity;
            return (
              <li
                key={offer.code}
                className={`flex min-w-0 flex-col items-center whitespace-nowrap leading-[1.25] transition-colors duration-300 motion-reduce:transition-none ${
                  reached ? "text-[var(--nf-accent-quiet)]" : "text-[color:rgb(var(--nf-ink-rgb)/0.65)]"
                }`}
              >
                <span className="text-[11px] uppercase tracking-[var(--nf-track-8)]">{offer.minQuantity} pieces</span>
                <span className={`text-[11px] uppercase tracking-[var(--nf-track-8)] sm:text-[12px] ${reached ? "font-semibold" : "font-medium"}`}>
                  {pct(offer.rate)} off
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default OfferProgress;
