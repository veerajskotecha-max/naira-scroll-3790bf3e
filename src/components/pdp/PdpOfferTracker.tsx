import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { percent, rupees, rungStates } from "@/components/clean";
import { pdpOfferStatus, pieceAtRung, QUANTITY_OFFERS, quantityOfferProgress, resolveCartDiscount, rungPosition, TOP_QUANTITY_OFFER } from "@/lib/promo";
import { OFFER_OPEN_LINE } from "./renew";
import { usePromoCode } from "./usePromoCode";

/*
  The buy-more offer on the renewed product page: a padded panel under the
  reassurances, with a 2px line that fills as the bag does. The reel's pattern
  ("add one more to unlock…") with the shop's real offer: Buy 2 and Buy 3
  (extra 10% and extra 20% since 25 Nov 2026), however many steps promo.ts
  holds.

  Every figure is promo.ts's: the rates from QUANTITY_OFFERS, this piece's
  price at each step from `pieceAtRung`, the line's fill from
  `quantityOfferProgress`. A paler stretch ahead of the fill shows where the
  bag would stand with this piece in it. There is no code to copy: the bag
  applies the step it has reached.

  Each step is three short lines, so the rate is the largest thing in the
  panel (the design review, 25 Nov 2026: "the offer is the quietest block on
  the page"): BUY 2, then 10% off, then this piece's price at that step.

  The sentence under the steps says the one thing the steps cannot: any
  pieces count. What adding THIS piece does to a bag that already holds
  pieces is said above the buttons, beside the button it is about
  (JewelDetailNext, `offerLine`).

  The list of steps is still the element the phone's buy bar keeps clear of
  while it is on screen (JewelDetailNext reads `[data-offer-ladder] ul`).

  A pre-order choice is arranged on WhatsApp and never reaches the bag: the
  steps step back and the line says so. A piece sold out altogether gets no
  panel at all (JewelDetailNext).
*/
const PdpOfferTracker = ({ price, preorder = false, className = "mt-6" }: { price: number; preorder?: boolean; className?: string }) => {
  const { totalItems, subtotal, setDrawerOpen } = useCart();
  const promoCode = usePromoCode();
  /* The line starts empty and fills once the page is drawn, so the fill is
     seen arriving; the pre-built page and a reader's first paint carry the
     true widths already. */
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!(price > 0)) return null;
  const now = resolveCartDiscount({ totalItems, promoCode });
  /* A typed code keeps promo.ts's own sentence about what it is worth. */
  const line = preorder
    ? "This offer is for in-stock pieces, not pre-orders."
    : now.rate > 0 && !now.automatic
      ? pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode }, price)
      : totalItems > 0
        ? "Mix any pieces. No code needed."
        : OFFER_OPEN_LINE;
  const bagHasPieces = totalItems > 0;
  const top = TOP_QUANTITY_OFFER.minQuantity;
  const fill = preorder ? 0 : quantityOfferProgress(totalItems);
  /* Where the bag would stand with this piece in it. On an empty bag that
     stretch ends before any step, so it is not drawn. */
  const ghost = preorder || !bagHasPieces ? 0 : quantityOfferProgress(totalItems + 1);
  const states = rungStates(preorder ? 0 : totalItems, QUANTITY_OFFERS.map((offer) => offer.minQuantity));
  const width = (value: number) => `${(drawn ? value : 0) * 100}%`;

  return (
    <section className={`rn-panel ${className}`.trim()} aria-label="Buy more, save more" data-offer-ladder data-state={Math.min(totalItems, top)}>
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
      <ul className="rn-rungs" data-muted={preorder ? "" : undefined}>
        {QUANTITY_OFFERS.map((offer, index) => {
          const state = states[index];
          return (
            <li
              key={offer.code}
              data-rung={offer.minQuantity}
              data-reached={state !== "ahead" ? "" : undefined}
              data-current={state === "current" ? "" : undefined}
              data-passed={state === "passed" ? "" : undefined}
            >
              <span className="rn-rung__name">Buy {offer.minQuantity}</span>
              <span className="rn-rung__rate">Extra {percent(offer.rate)} off</span>
              {!preorder && <span className="rn-rung__each">{rupees(pieceAtRung(price, offer))} each</span>}
              {state === "current" ? <span className="nc-sr">, in your bag</span> : null}
            </li>
          );
        })}
      </ul>
      {/* Always in the page, so a screen reader hears each new state. */}
      <p key={line} className="nc-small rn-offer__line rn-tick-in" aria-live="polite">
        {line}
      </p>
    </section>
  );
};

export default PdpOfferTracker;
