import { TicketPercent, Truck } from "lucide-react";
import { QUANTITY_OFFERS } from "@/lib/promo";
import { PREORDER_NOTE_SHORT } from "@/data/jewellery";

/*
  The two facts a shopper arriving from an ad needs before deciding, held
  directly under the price so they share the first screen with it.

  Clarity, 21–24 Sep: 76% of visits that touched a product page viewed no other
  page, and on the most-advertised pieces the average visitor stopped before the
  halfway mark. The multi-buy offer sat about one and a half screens down and
  COD was mentioned only under the Add to Cart button, below the first screen,
  so most of them left without seeing either.

  Each fact is one line at 360px, because the budget is the Instagram in-app
  browser — half of all sessions — where the visible page is ~640px tall. "Applied
  in your bag" is left to the Pairing Offer section further down; here it
  wrapped the line and pushed the COD line below the screen.

  The COD fee is NOT quoted here — the owner's call, to keep the product page
  clean. It is stated as its own line in the bag, in rupees, before the shopper
  reaches the payment page (`CartDrawer.tsx`, rate in `src/lib/payment.ts`).

  Plain text, not links: a tappable-looking line that goes nowhere is a dead
  click, and /jewellery already carries most of the site's dead clicks.
*/
/* A sold-out piece is taken as a pre-order that ships within two weeks (the
   CTA block says so), so it must not be promised the in-stock date here. */
const PdpBuyFacts = ({ arrivesBy, soldOut = false }: { arrivesBy: string | null; soldOut?: boolean }) => (
  <div id="product-facts" className="mt-2 flex flex-col gap-1 text-[12px] leading-[1.45] text-[var(--nf-text)]">
    <p className="flex items-start gap-2">
      <TicketPercent size={15} strokeWidth={1.6} className="mt-px shrink-0 text-[var(--nf-accent-strong)]" aria-hidden="true" />
      <span>
        {QUANTITY_OFFERS.map((offer, i) => (
          <span key={offer.code}>
            {i > 0 && " · "}
            <span className="font-semibold">
              Buy {offer.minQuantity}, save {Math.round(offer.rate * 100)}%
            </span>
          </span>
        ))}
      </span>
    </p>
    <p className="flex items-start gap-2">
      <Truck size={15} strokeWidth={1.6} className="mt-px shrink-0 text-[var(--nf-accent-strong)]" aria-hidden="true" />
      <span>
        {soldOut
          ? "Pre-order · ships within 2 weeks, free"
          : arrivesBy
            ? `Free delivery by ${arrivesBy}`
            : `Free ${PREORDER_NOTE_SHORT.toLowerCase()}`}
        <span className="text-[color:rgb(var(--nf-ink-rgb)/0.62)]"> · COD available</span>
      </span>
    </p>
  </div>
);

export default PdpBuyFacts;
