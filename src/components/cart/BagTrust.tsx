import { Banknote } from "lucide-react";
import { MastercardMark, Stars, VisaMark } from "@/components/cart/PayMarks";
import { clientsLabel, SHOP_RATING } from "@/lib/trust";

/*
  The bag's trust block, option B ("Quiet seal"), from the checkout the owner
  sent on 16 Nov 2026: the reference's star line between two hairlines, then
  one line of the ways to pay, "cards and COD" in the owner's own words, all
  directly above Checkout. The button keeps its GPay, PhonePe and Paytm discs,
  so UPI is still the first mark the thumb meets.

  Lighter than the tile row (option A): about half the height, and nothing in
  it looks pressable, so it never competes with the one black button. The
  marks are shapes, sized inline (see PayMarks).
*/

const RATING_TEXT = `Rated ${SHOP_RATING}/5 · Trusted by ${clientsLabel} clients`;

/** The star line between two hairlines; the hairlines give way on a narrow phone. */
export const RatingLine = ({ className = "" }: { className?: string }) => (
  <div data-rating-line className={`flex items-center gap-2.5 ${className}`}>
    <span aria-hidden="true" className="h-px min-w-3 flex-1 bg-nf-ink/15" />
    <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-center text-[11.5px] leading-[1.4] text-nf-ink/70">
      <Stars rating={SHOP_RATING} size={12} />
      <span>{RATING_TEXT}</span>
    </p>
    <span aria-hidden="true" className="h-px min-w-3 flex-1 bg-nf-ink/15" />
  </div>
);

export const BagTrust = () => (
  <div data-bag-trust className="mt-4">
    <RatingLine />
    <p data-pay-line className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px] text-nf-ink/75">
      <span className="inline-flex items-center gap-1.5">
        <VisaMark height={9} />
        <MastercardMark height={13} />
        <span>Cards</span>
      </span>
      <span aria-hidden="true" className="text-nf-ink/30">·</span>
      <span className="inline-flex items-center gap-1.5">
        <Banknote size={15} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-nf-ink/70" />
        <span>Cash on delivery</span>
      </span>
    </p>
  </div>
);
