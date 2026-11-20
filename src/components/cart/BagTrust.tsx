import { clientsLabel, SHOP_RATING } from "@/lib/trust";

/*
  The bag's trust block, directly above Checkout (the owner's ask of
  16 Nov 2026), in the clean system's words-only form: the shop's rating and
  the clients it has served on one line, the ways to pay on the next. One
  star glyph stands in for the five drawn ones, and the ways to pay are three
  words, UPI first, in place of the card marks and the banknote: they were
  the only foreign colours left in the bag.

  Both lines are the supporting text style, centred, and nothing in them is
  pressable, so the block never competes with the one filled button under it.
  The figures are the owner's (lib/trust.ts) and are stated as two separate
  facts: 5,000 is how many clients bought, not how many rated.
*/

const RATING_TEXT = `Rated ${SHOP_RATING}/5 · Trusted by ${clientsLabel} clients`;
const WAYS_TO_PAY = "UPI · Cards · Cash on delivery";

/** The rating line. The star is decoration: the rating is written out beside it. */
export const RatingLine = ({ className = "" }: { className?: string }) => (
  <p data-rating-line className={`nc-small text-center ${className}`.trim()}>
    <span aria-hidden="true" className="nc-star">
      ★
    </span>{" "}
    {RATING_TEXT}
  </p>
);

export const BagTrust = () => (
  <div data-bag-trust className="mt-2.5">
    <RatingLine />
    <p data-pay-line className="nc-small text-center">
      {WAYS_TO_PAY}
    </p>
  </div>
);
