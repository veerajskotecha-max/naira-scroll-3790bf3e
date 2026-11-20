import { CleanRungs, CleanTrack } from "@/components/clean";
import { QUANTITY_OFFERS, quantityOfferProgress, TOP_QUANTITY_OFFER } from "@/lib/promo";

/*
  The bag's offer, in one line of words over one 2px line: "Buy 2 · 10% off",
  "Buy 3 · 20% off", "Buy 4 · 30% off", the rung the bag sits on in gold, and
  the line under them filling as pieces arrive. It is the product page's OFFER
  row drawn from the same part (CleanRungs), so the two can never disagree.
  The rungs and the fill come from promo.ts; nothing here knows a rate.

  It says the offer and nothing else. The line that used to ride on top of it,
  that a sitewide sale was live today, is gone: the offer is permanent.
*/
const BagOffer = ({ totalItems }: { totalItems: number }) => {
  const top = TOP_QUANTITY_OFFER.minQuantity;
  return (
    <div data-ladder className="shrink-0">
      {/* Three equal columns the full width of the sheet, with no side padding:
          the line under them fills to a sixth and to a half at two and three
          pieces, which is then exactly the middle of "Buy 2" and of "Buy 3".
          (With 16px of padding the words sat 11px to the right of where the
          line stopped.) The rungs are about 85px wide, so they never meet,
          down to a 280px phone. */}
      <CleanRungs centered offers={QUANTITY_OFFERS} totalItems={totalItems} className="py-2.5" />
      <CleanTrack value={quantityOfferProgress(totalItems)} now={totalItems} max={top} label={`${totalItems} of ${top} pieces`} />
    </div>
  );
};

export default BagOffer;
