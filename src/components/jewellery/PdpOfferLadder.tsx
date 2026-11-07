import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  getPromoCode,
  getPromoDiscountRate,
  pdpOfferStatus,
  pieceAtRung,
  PROMO_EVENT,
  QUANTITY_OFFERS,
  TOP_QUANTITY_OFFER,
} from "@/lib/promo";

/*
  The buy-more offer on the product page, under the price and the badges (the
  owner, 2 Nov 2026: "offer display on pdp too below price and features like
  Palmonas"). Palmonas shows three coupon cards on a rail, with bundle prices
  that ignore the piece and a code to copy. Here every rung is always in
  view (three since Buy 4, 7 Nov 2026), priced for THIS piece (the chosen variant's price), and there is no
  code: the bag applies the rung itself and hands Fastrr the one code.

  Every figure comes from promo.ts: the rates from QUANTITY_OFFERS, the piece
  price at each rung from `pieceAtRung` (the bag's own rounding), and the line
  under the panel from `pdpOfferStatus`, which follows the bag as Shopify last
  confirmed it (a piece still on its way in does not count yet).

  Two rows, because the panel sits right above Add to cart: on a 390x844
  phone a piece with no choices kept its Add to cart on the first screen only
  with the panel under 71px, and the phone's buy bar, which shows whenever
  that button is not fully on screen, would otherwise cover the panel itself.
  "Applied in your bag · no code" rides on the panel's top rule, costing no
  row. The line saying what this piece does to the bag appears under it only
  once the bag holds a piece (or a code is typed); that change happens behind
  the bag, which opens at the tap.

  A pre-order choice (a size or metal Shopify has sold out of) is reserved on
  WhatsApp and never reaches the bag, so the per-piece figures would be a
  price the shopper cannot get: they give way to a note in the same space, so
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
  const top = Math.max(0, ...QUANTITY_OFFERS.filter((offer) => totalItems >= offer.minQuantity).map((offer) => offer.rate));

  return (
    <section data-offer-ladder data-state={Math.min(totalItems, TOP_QUANTITY_OFFER.minQuantity)} aria-label="Buy more, pay less" className="mt-3">
      <div className="relative border border-nf-gold-deep/35 px-3 pb-[7px] pt-[9px]">
        {/* On the top rule, like a fieldset's legend: no row of its own. */}
        <p className="absolute -top-[7px] left-2 bg-nf-ivory px-1.5 font-nf-label text-[9.5px] font-medium uppercase leading-[13px] tracking-nf-16 text-nf-gold-text">
          {preorder ? "Not on pre-orders" : "Applied in your bag · no code"}
        </p>
        <ul className="grid grid-cols-3">
          {QUANTITY_OFFERS.map((offer, i) => {
            const reached = totalItems >= offer.minQuantity;
            /* A lower rung the bag has climbed past steps back; the line says so in words. */
            const passed = reached && offer.rate < top;
            return (
              <li
                key={offer.code}
                data-rung={offer.minQuantity}
                data-reached={reached ? "" : undefined}
                className={`min-w-0 ${i > 0 ? "border-l border-nf-ink/10 pl-3" : "pr-2"} ${passed ? "text-nf-ink/65" : "text-nf-ink"}`}
              >
                <p className="flex items-center gap-[7px] whitespace-nowrap font-nf-label text-[10px] font-medium uppercase leading-[14px] tracking-nf-16">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 rotate-45 border transition-colors duration-300 motion-reduce:transition-none ${
                      reached ? "border-nf-gold-deep bg-nf-gold-deep" : "border-nf-ink/30 bg-transparent"
                    }`}
                  />
                  Buy {offer.minQuantity} · {pct(offer.rate)} off
                </p>
                {preorder ? (
                  <p className="mt-0.5 h-[22px] whitespace-nowrap pl-[13px] font-nf-label text-[11px] leading-[22px] text-nf-ink/65">
                    In-stock pieces only
                  </p>
                ) : (
                  /* A fixed height: the figure and the note must take the
                     same room, or picking a pre-order size moves the sizes. */
                  <p className="mt-0.5 h-[22px] whitespace-nowrap pl-[13px] leading-[22px]">
                    <span className="text-[14.5px] font-semibold tracking-normal tabular-nums">{rupees(pieceAtRung(price, offer))}</span>
                    <span className="font-nf-label text-[11px] text-nf-ink/65"> each</span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
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
