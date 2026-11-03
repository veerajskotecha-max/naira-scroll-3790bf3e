import { QUANTITY_OFFERS, TOP_QUANTITY_OFFER, ladderHeadline, quantityOfferProgress } from "@/lib/promo";

const pct = (rate: number) => `${Math.round(rate * 100)}%`;

/*
  The ladder across the top of the bag, as the CRO plan draws it: one line
  saying what the discount applies to ("A second piece takes 10% off your
  bag"), over a track whose rungs are labelled where they sit, 10% at the
  second piece and 20% at the third. The bar measures the whole ladder, so a
  piece always moves it forward; it starts a third full with one piece in.
  `appliedRate` is the discount the bag actually gets (a typed code can give as
  much as a rung), so the line never offers a saving already in hand.
*/
const LadderBand = ({ totalItems, appliedRate = 0 }: { totalItems: number; appliedRate?: number }) => {
  const progress = quantityOfferProgress(totalItems);
  return (
    <div data-ladder className="shrink-0 border-b border-[color:rgb(var(--nf-gold-rgb)/0.38)] bg-nf-ivory-deep px-4 pb-2.5 pt-2 sm:px-5">
      <p className="font-nf-editorial text-[15.5px] font-medium leading-snug text-nf-ink">{ladderHeadline(totalItems, appliedRate)}</p>
      <div
        className="relative mt-[18px] h-[3px] w-full bg-[color:rgb(var(--nf-ink-rgb)/0.10)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOP_QUANTITY_OFFER.minQuantity}
        aria-valuenow={Math.min(totalItems, TOP_QUANTITY_OFFER.minQuantity)}
        aria-label={`${totalItems} of ${TOP_QUANTITY_OFFER.minQuantity} pieces towards ${pct(TOP_QUANTITY_OFFER.rate)} off`}
      >
        <span
          className="block h-full bg-nf-gold transition-[width] duration-500 ease-reveal motion-reduce:transition-none"
          style={{ width: `${progress * 100}%` }}
        />
        {QUANTITY_OFFERS.map((offer, i) => {
          const at = offer.minQuantity / TOP_QUANTITY_OFFER.minQuantity;
          const reached = totalItems >= offer.minQuantity;
          const last = i === QUANTITY_OFFERS.length - 1;
          return (
            <span key={offer.code} aria-hidden="true">
              <span
                className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border transition-colors duration-300 ${
                  reached ? "border-nf-gold bg-nf-gold" : "border-[color:rgb(var(--nf-ink-rgb)/0.25)] bg-nf-ivory-deep"
                }`}
                style={{ left: `${at * 100}%` }}
              />
              <span
                className={`absolute bottom-2 font-nf-label text-[9px] font-medium tracking-nf-8 text-nf-gold-text ${last ? "right-0" : "-translate-x-1/2"}`}
                style={last ? undefined : { left: `${at * 100}%` }}
              >
                {pct(offer.rate)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default LadderBand;
