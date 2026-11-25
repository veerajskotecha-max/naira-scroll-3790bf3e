import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { CleanRungs, rupees, rungStates } from "@/components/clean";
import { getPromoCode, pdpOfferStatus, pieceAtRung, PROMO_EVENT, QUANTITY_OFFERS, quantityOfferProgress, rungPosition, TOP_QUANTITY_OFFER } from "@/lib/promo";

/*
  The buy-more offer on the renewed product page: a padded panel under the
  benefits, with a 2px line that fills as the bag does. The reel's pattern
  ("add one more to unlock…") with the shop's real offer: Buy 2 / 3 / 4.

  Every figure is promo.ts's, as in the OFFER row it replaces
  (jewellery/PdpOfferLadder): the rates from QUANTITY_OFFERS, this piece's
  price at each step from `pieceAtRung`, the sentence from `pdpOfferStatus`,
  the line's fill from `quantityOfferProgress`. A paler stretch ahead of the
  fill shows where the bag would stand with this piece in it. There is no
  code to copy: the bag applies the step it has reached.

  The list of steps is still the element the phone's buy bar keeps clear of
  while it is on screen (JewelDetailNext reads `[data-offer-ladder] ul`).

  A pre-order choice is reserved on WhatsApp and never reaches the bag: the
  steps step back and the line says so. A piece sold out altogether gets no
  panel at all (JewelDetailNext).
*/
const PdpOfferTracker = ({ price, preorder = false }: { price: number; preorder?: boolean }) => {
  const { totalItems, subtotal, setDrawerOpen } = useCart();
  const [promoCode, setCode] = useState<string | null>(() => getPromoCode());
  useEffect(() => {
    const sync = () => setCode(getPromoCode());
    window.addEventListener(PROMO_EVENT, sync);
    return () => window.removeEventListener(PROMO_EVENT, sync);
  }, []);
  /* The line starts empty and fills once the page is drawn, so the fill is
     seen arriving; the pre-built page and a reader's first paint carry the
     true widths already. */
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!(price > 0)) return null;
  const line = preorder
    ? "Not on pre-orders. In-stock pieces only."
    : pdpOfferStatus({ subtotal, totalItems, promoCode }, price) || pdpOfferStatus({ subtotal: 0, totalItems: 0 }, price);
  const bagHasPieces = totalItems > 0;
  const top = TOP_QUANTITY_OFFER.minQuantity;
  const fill = preorder ? 0 : quantityOfferProgress(totalItems);
  const ghost = preorder ? 0 : quantityOfferProgress(totalItems + 1);
  const states = rungStates(preorder ? 0 : totalItems, QUANTITY_OFFERS.map((offer) => offer.minQuantity));
  const width = (value: number) => `${(drawn ? value : 0) * 100}%`;

  return (
    <section className="rn-panel mt-4" aria-label="Buy more, pay less" data-offer-ladder data-state={Math.min(totalItems, top)}>
      <div className="rn-panel__head">
        <p className="nc-label">Buy more, save more</p>
        {bagHasPieces && !preorder && (
          <button type="button" onClick={() => setDrawerOpen(true)} className="nc-small nc-link nc-link--ink nc-tap shrink-0">
            View bag
          </button>
        )}
      </div>
      <div
        className="rn-steps"
        data-muted={preorder ? "" : undefined}
        role="progressbar"
        aria-label={`${Math.min(totalItems, top)} of ${top} pieces in your bag`}
        aria-valuemin={0}
        aria-valuemax={top}
        aria-valuenow={Math.min(totalItems, top)}
      >
        <span className="rn-steps__line">
          <span className="rn-steps__ghost" style={{ width: width(ghost) }} />
          <span className="rn-steps__fill" style={{ width: width(fill) }} />
        </span>
        {QUANTITY_OFFERS.map((offer, index) => (
          <span
            key={offer.code}
            className="rn-steps__stop"
            style={{ left: `${rungPosition(index) * 100}%` }}
            data-reached={states[index] !== "ahead" ? "" : undefined}
            data-current={states[index] === "current" ? "" : undefined}
          />
        ))}
      </div>
      <CleanRungs
        offers={QUANTITY_OFFERS}
        totalItems={totalItems}
        muted={preorder}
        centered
        each={preorder ? undefined : (offer) => `${rupees(pieceAtRung(price, offer))} each`}
      />
      {/* Always in the page, so a screen reader hears each new state. */}
      <p key={line} className="nc-small rn-offer__line rn-tick-in text-center" aria-live="polite">
        {line}
      </p>
    </section>
  );
};

export default PdpOfferTracker;
