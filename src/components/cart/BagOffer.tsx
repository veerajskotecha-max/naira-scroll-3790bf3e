import { CleanRungs, CleanTrack } from "@/components/clean";
import { QUANTITY_OFFERS, quantityOfferProgress, rungPosition, TOP_QUANTITY_OFFER } from "@/lib/promo";

/*
  The bag's offer, in one line of words over one 2px line: "Buy 2 · 10% off"
  and "Buy 3 · 15% off" (the owner's offer of 25 Nov 2026; Buy 4 is gone),
  the rung the bag sits on in gold, and the line under them filling as pieces
  arrive. It is drawn from the same part
  as the product page's steps (CleanRungs), so the two can never disagree.
  The rungs and the fill come from promo.ts; nothing here knows a rate.

  The line carries a small diamond at each step, gold once reached: the
  product page's own stops (renew.css `.rn-bagsteps`). Without them the
  labels over an underline read as tabs (the design review, 25 Nov 2026).

  It says the offer and nothing else. The line that used to ride on top of it,
  that a sitewide sale was live today, is gone: the offer is permanent.
*/
const BagOffer = ({ totalItems }: { totalItems: number }) => {
  const top = TOP_QUANTITY_OFFER.minQuantity;
  /* A bag of five is still "3 of 3": the line has no step past the top one. */
  const counted = Math.min(Math.max(0, totalItems), top);
  return (
    <div data-ladder className="shrink-0">
      {/* Equal columns the full width of the sheet (one per rung, two since
          25 Nov 2026), with no side padding: the line under them fills to a
          quarter at two pieces, which is then exactly the middle of "Buy 2",
          and the stop for "Buy 3" sits at three quarters, the middle of its own.
          (With 16px of padding the words sat 11px to the right of where the
          line stopped.) The rungs are about 85px wide, so they never meet,
          down to a 280px phone. */}
      <CleanRungs centered offers={QUANTITY_OFFERS} totalItems={totalItems} className="py-2.5" />
      <div className="rn-bagsteps">
        <CleanTrack value={quantityOfferProgress(totalItems)} now={totalItems} max={top} label={`${counted} of ${top} pieces`} />
        {QUANTITY_OFFERS.map((offer, index) => (
          <i
            key={offer.code}
            aria-hidden="true"
            style={{ left: `${rungPosition(index) * 100}%` }}
            data-reached={totalItems >= offer.minQuantity ? "" : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default BagOffer;
