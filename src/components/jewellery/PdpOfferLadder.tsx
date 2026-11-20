import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { CleanFact, CleanRungs, rupees } from "@/components/clean";
import { getPromoCode, pdpOfferStatus, pieceAtRung, PROMO_EVENT, QUANTITY_OFFERS, TOP_QUANTITY_OFFER } from "@/lib/promo";

/*
  The buy-more offer on the product page: the OFFER row of the facts table
  under the price (the owner, 2 Nov 2026: "offer display on pdp too below
  price and features like Palmonas"; 20 Nov 2026: "cleaner, remove clutter").

  It used to be a gold box with a legend on its top rule, serif numerals and
  dividers. Now it is words in a table row, like the qualities above it: the
  three rungs in equal columns ("Buy 2 · 10%"), this piece's price at each
  rung under its name, and one line saying what the offer does to the bag.
  No box, no rule between rungs, no icon. The rung the bag has reached turns
  gold; one it has climbed past steps back.

  Every figure comes from promo.ts: the rates from QUANTITY_OFFERS, the piece
  price at each rung from `pieceAtRung` (the bag's own rounding), and the line
  from `pdpOfferStatus`, which follows the bag as Shopify last confirmed it (a
  piece still on its way in does not count yet). There is no code to copy:
  the bag applies the rung itself and hands Fastrr the one code.

  The list of rungs is the element the phone's buy bar keeps off while it is
  on screen (JewelDetailNext reads `[data-offer-ladder] ul`), so everything
  that marks a rung lives inside that list.

  A pre-order choice (a size or metal Shopify has sold out of) is reserved on
  WhatsApp and never reaches the bag, so the per-piece figures would be a
  price the shopper cannot get: the rungs step back and the line says so. The
  row keeps its height (the rungs hold their second line's room, and the line
  holds two lines' room while the bag has pieces), so the sizes below do not
  jump under the finger. A piece sold out altogether gets no row at all
  (JewelDetailNext).
*/
const PdpOfferLadder = ({ price, preorder = false }: { price: number; preorder?: boolean }) => {
  const { totalItems, subtotal, setDrawerOpen } = useCart();
  const [promoCode, setCode] = useState<string | null>(() => getPromoCode());
  useEffect(() => {
    const sync = () => setCode(getPromoCode());
    window.addEventListener(PROMO_EVENT, sync);
    return () => window.removeEventListener(PROMO_EVENT, sync);
  }, []);

  if (!(price > 0)) return null;
  /* What the offer does for this piece, or, when promo.ts has nothing to say
     about this bag, what it says of an empty one: where the offer applies. */
  const line = preorder
    ? "Not on pre-orders. In-stock pieces only."
    : pdpOfferStatus({ subtotal, totalItems, promoCode }, price) || pdpOfferStatus({ subtotal: 0, totalItems: 0 }, price);
  const bagHasPieces = totalItems > 0;

  return (
    <CleanFact label="Offer">
      <div data-offer-ladder data-state={Math.min(totalItems, TOP_QUANTITY_OFFER.minQuantity)} role="group" aria-label="Buy more, pay less">
        {/* Under 360px three columns are 68px each and "Buy 2 · 10%" is as
            wide, so the rungs ran into one another ("10%Buy 3"). There each
            rung is a line of its own: its name, then its price. */}
        <CleanRungs
          offers={QUANTITY_OFFERS}
          totalItems={totalItems}
          muted={preorder}
          each={preorder ? undefined : (offer) => `${rupees(pieceAtRung(price, offer))} each`}
          className="max-[359px]:!grid-flow-row max-[359px]:[&>li]:flex max-[359px]:[&>li]:gap-3"
        />
        {/* Always in the page, so a screen reader hears each new state. View
            bag floats at the right of the first line and the sentence runs
            round it, so on a 360px phone the longest sentence is two lines,
            never three; the line holds two lines' room while the bag has
            pieces. */}
        <div aria-live="polite" className={`flow-root ${bagHasPieces ? "min-h-[40px]" : ""}`}>
          {bagHasPieces && !preorder && (
            <button type="button" onClick={() => setDrawerOpen(true)} className="nc-small nc-link nc-link--ink nc-tap float-right ml-3">
              View bag
            </button>
          )}
          <p key={line} className="nc-small">
            {line}
          </p>
        </div>
      </div>
    </CleanFact>
  );
};

export default PdpOfferLadder;
