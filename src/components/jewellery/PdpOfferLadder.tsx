import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  getPromoCode,
  getPromoDiscountRate,
  pdpOfferStatus,
  pieceAtRung,
  PROMO_EVENT,
  QUANTITY_OFFERS,
  RUNG_GRID_COLS,
  TOP_QUANTITY_OFFER,
} from "@/lib/promo";

/*
  The buy-more offer on the product page, under the price and the badges (the
  owner, 2 Nov 2026: "offer display on pdp too below price and features like
  Palmonas"). Palmonas shows three coupon cards on a rail, with bundle prices
  that ignore the piece and a code to copy. Here every rung is always in view,
  priced for THIS piece (the chosen variant's price), and there is no code:
  the bag applies the rung itself and hands Fastrr the one code.

  Every figure comes from promo.ts: the rates from QUANTITY_OFFERS, the piece
  price at each rung from `pieceAtRung` (the bag's own rounding), and the line
  under the panel from `pdpOfferStatus`, which follows the bag as Shopify last
  confirmed it (a piece still on its way in does not count yet).

  Two rungs since 7 Nov 2026: Buy 3 at 20% and Buy 4 at 30%. The owner added
  Buy 4 that morning and asked for this box to be calmer and easier to read,
  then took Buy 2 (10%) away the same day ("we need only buy 3 20% off and
  buy 4 30% off"). One equal column per rung (`RUNG_GRID_COLS`, never a
  fixed count) between gold hairlines, each read in one glance: the rate,
  largest, in the serif; the piece's price at that rung under it; "Buy 3" as
  the small label beside the rate. The rung the bag has reached takes the
  rate in gold and a gold rule under its column, and a rung it has climbed
  past steps back. No fill behind the text, and nothing under 11px.

  That rule is drawn INSIDE the list of rungs, in a 3px foot each column
  keeps for it (taken from the panel's own bottom padding, so the panel's
  height does not move). The phone's buy bar (JewelDetailNext) keeps off the
  list while it is on screen; laid on the panel's foot 8px under the list,
  the rule sat under the bar on a 390x844 phone (Prism Rivière, two pieces
  in the bag: list to 775px, bar from 779px, rule at 781-783px) and the
  reached rung lost its mark.

  Still two rows, because the panel sits right above Add to cart: on a 390x844
  phone the most-advertised piece (Prism Rivière, its badges on two lines)
  kept Add to cart on the first screen with 3px to spare, so the panel holds
  the height it had, 56px. That is why the label sits beside the rate rather
  than over it. With three columns that took a stacked layout below 310px and
  hid "off" below 350px; two columns hold the label, the rate and "off" on
  one line down to 280px, so there is one layout at every width. "Applied in
  your bag · no code" rides on the panel's top rule, costing no row. The line
  saying what this piece does to the bag appears under it only once the bag
  holds a piece (or a code is typed); that change happens behind the bag,
  which opens at the tap.

  A pre-order choice (a size or metal Shopify has sold out of) is reserved on
  WhatsApp and never reaches the bag, so the per-piece figures would be a
  price the shopper cannot get: they give way to one note in the same row, so
  the choices below do not jump under the finger. A piece sold out altogether
  gets no panel at all (JewelDetailNext).
*/
const pct = (rate: number) => `${Math.round(rate * 100)}%`;
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const PdpOfferLadder = ({ price, preorder = false }: { price: number; preorder?: boolean }) => {
  const { totalItems, subtotal, setDrawerOpen } = useCart();
  const [promoCode, setCode] = useState<string | null>(() => getPromoCode());
  useEffect(() => {
    const sync = () => setCode(getPromoCode());
    window.addEventListener(PROMO_EVENT, sync);
    return () => window.removeEventListener(PROMO_EVENT, sync);
  }, []);

  if (!(price > 0)) return null;
  const bagHasSomething = totalItems > 0 || getPromoDiscountRate(promoCode) > 0;
  const status = !preorder && bagHasSomething ? pdpOfferStatus({ subtotal, totalItems, promoCode }, price) : "";
  /* The highest rung the bag has reached; a lower one it has climbed past steps back. */
  const current = [...QUANTITY_OFFERS].reverse().find((offer) => totalItems >= offer.minQuantity);

  return (
    <section
      data-offer-ladder
      data-state={Math.min(totalItems, TOP_QUANTITY_OFFER.minQuantity)}
      aria-label="Buy more, pay less"
      className="mt-3"
    >
      <div className={`relative border border-nf-gold-deep/45 px-1 pt-[9px] ${preorder ? "pb-[7px]" : "pb-[4px]"}`}>
        {/* On the top rule, like a fieldset's legend: no row of its own. */}
        <p className="absolute -top-[7px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-nf-ivory px-2 font-nf-label text-[11px] font-medium uppercase leading-[14px] tracking-nf-8 text-nf-gold-text">
          {preorder ? "Not on pre-orders" : "Applied in your bag · no code"}
        </p>
        <ul className={`grid ${RUNG_GRID_COLS}`}>
          {QUANTITY_OFFERS.map((offer, i) => {
            const reached = !preorder && totalItems >= offer.minQuantity;
            const isCurrent = reached && offer.code === current?.code;
            const passed = reached && !isCurrent;
            return (
              <li
                key={offer.code}
                data-rung={offer.minQuantity}
                data-reached={reached ? "" : undefined}
                data-current={isCurrent ? "" : undefined}
                className={`relative min-w-0 px-1 text-center ${preorder ? "" : "pb-[3px]"} ${i > 0 ? "border-l border-nf-gold-deep/25" : ""}`}
              >
                <p className="flex h-[22px] flex-row items-baseline justify-center gap-1.5 whitespace-nowrap">
                  <span className={`font-nf-label text-[11px] font-medium uppercase leading-[14px] tracking-nf-8 ${passed ? "text-nf-ink/65" : "text-nf-gold-text"}`}>
                    Buy {offer.minQuantity}
                  </span>
                  <span
                    className={`font-nf-editorial text-[23px] font-medium leading-[22px] lining-nums tabular-nums transition-colors duration-300 motion-reduce:transition-none ${
                      isCurrent ? "text-nf-gold-text" : passed ? "text-nf-ink/65" : "text-nf-ink"
                    }`}
                  >
                    {pct(offer.rate)}
                    <span className="font-nf-label text-[11.5px] font-normal leading-none tracking-normal text-nf-ink/70"> off</span>
                  </span>
                </p>
                {!preorder && (
                  /* A fixed height: the figure and the pre-order note take the
                     same room, or picking a pre-order size moves the sizes. */
                  <p className={`h-4 whitespace-nowrap leading-4 ${passed ? "text-nf-ink/65" : "text-nf-ink"}`}>
                    <span className="text-[13.5px] font-medium tabular-nums">{rupees(pieceAtRung(price, offer))}</span>
                    <span className="font-nf-label text-[11.5px] text-nf-ink/65"> each</span>
                  </p>
                )}
                {isCurrent && (
                  <>
                    <span className="sr-only">, in your bag</span>
                    {/* The reached rung's rule, in the column's own foot: inside
                        the list, so the buy bar never covers it. Held to about
                        the rung's own width: across a whole half of the box
                        (two columns since 7 Nov 2026) it read as a divider. */}
                    <span aria-hidden="true" data-rung-rule className="absolute inset-x-2 bottom-0 mx-auto h-[2px] max-w-[108px] bg-nf-gold-deep" />
                  </>
                )}
              </li>
            );
          })}
        </ul>
        {preorder && (
          <p className="h-4 text-center font-nf-label text-[11.5px] leading-4 text-nf-ink/70">In-stock pieces only</p>
        )}
      </div>
      {/* Always in the page, so a screen reader hears each new state. View
          bag's 44px reaches up over the panel's rule, never down onto Buy Now
          and Add to cart 8px below. */}
      <div aria-live="polite" className="flex items-start justify-between gap-3">
        {status && (
          <>
            <p key={status} className="mt-1.5 min-w-0 animate-in fade-in-0 font-nf-label text-[11.5px] leading-[16px] text-nf-ink/75 duration-150 motion-reduce:animate-none">
              {status}
            </p>
            {totalItems > 0 && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="-mb-[6px] -mr-2 -mt-[16px] inline-flex min-h-[44px] shrink-0 items-end px-2 pb-[6px] font-nf-label text-[11px] leading-[16px] text-nf-ink underline decoration-nf-gold underline-offset-4"
              >
                View bag
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PdpOfferLadder;
