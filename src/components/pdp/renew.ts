import { addOnEffect, discountedSubtotal, pdpOfferStatus, QUANTITY_OFFERS, resolveCartDiscount } from "@/lib/promo";

/*
  The renewed product page's own arithmetic and wording, kept apart from the
  components so each can be tested without a browser.
*/

/**
 * One sentence to sit under the price: the first sentence of the piece's own
 * description, when it is short enough to be read at a glance. A long first
 * sentence gives nothing (the description, open below, says it in full), and
 * so does one that is an announcement or a question rather than a line about
 * the piece ("Adjustable version is live!" on Cushion Halo Ring).
 */
export const ledeOf = (blurb: string | undefined, max = 90): string | null => {
  const text = (blurb ?? "").trim();
  if (!text) return null;
  const end = text.search(/[.!?](\s|$)/);
  const first = (end < 0 ? text : text.slice(0, end + 1)).trim();
  return first.length >= 12 && first.length <= max && first.length < text.length && first.endsWith(".") ? first : null;
};

/**
 * A piece sold as a set says what is in it, in the listing's own words (the
 * "Set" row of its details): "In the set: three pairs, huggie hoops, clover
 * studs and round solitaire studs." Its first sentence ("Three ways to wear
 * one idea.") never said that ₹1,499 buys three pairs (the copy review,
 * 25 Nov 2026). Nothing when the row is missing, a stub, or too long.
 */
export const setLede = (value: string | undefined, max = 100): string | null => {
  const text = (value ?? "").trim().replace(/\.$/, "");
  if (text.length < 8) return null;
  const line = `In the set: ${/^[A-Z][a-z]/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text}.`;
  return line.length <= max ? line : null;
};

type Bag = { subtotal: number; totalItems: number; promoCode?: string | null };

/**
 * What adding these pieces together does to the bag: what they add to its
 * total, what that saves against their own prices, and the rate the bag then
 * has. The bag's own resolver and rounding (promo.ts), so the figures are the
 * ones the bag shows once they are in. With one price it is `addOnEffect`.
 */
export const bundleEffect = (bag: Bag, prices: readonly number[]) => {
  const sum = prices.reduce((total, price) => total + price, 0);
  const now = discountedSubtotal(bag.subtotal, resolveCartDiscount({ totalItems: bag.totalItems, promoCode: bag.promoCode }));
  const after = resolveCartDiscount({ totalItems: bag.totalItems + prices.length, promoCode: bag.promoCode });
  const adds = discountedSubtotal(bag.subtotal + sum, after) - now;
  return { sum, adds, saves: sum - adds, rate: after.rate };
};

const pct = (rate: number) => `${Math.round(rate * 100)}%`;
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** The offer in one sentence, for a bag with nothing in it yet: any pieces
    count, and nothing has to be typed. */
export const OFFER_OPEN_LINE = "Mix any pieces. The discount applies in your bag, no code needed.";

/**
 * The renewed page's sentence about the offer, for this piece against the bag
 * as it stands. The arithmetic is promo.ts's (`addOnEffect`, the bag's own
 * resolver and rounding); only the words are the page's, after the copy
 * review of 25 Nov 2026: "it adds ₹495" under a price of ₹1,049 read as a
 * third price for one piece, so the sentence says whose figure it is ("your
 * total goes up by ₹495, not ₹1,049").
 *
 * `inBag`: this very piece, as chosen, is already in the bag. The page then
 * stops selling it and says what one more piece would do.
 *
 * A typed code keeps promo.ts's own sentence: the page never rewords what a
 * code is worth.
 */
export const offerLine = (bag: Bag, price: number, inBag = false): string => {
  const now = resolveCartDiscount({ totalItems: bag.totalItems, promoCode: bag.promoCode });
  if (bag.totalItems <= 0) return now.rate > 0 && !now.automatic ? pdpOfferStatus(bag, price) : OFFER_OPEN_LINE;
  if (inBag) {
    const better = QUANTITY_OFFERS.find((offer) => bag.totalItems < offer.minQuantity && offer.rate > now.rate);
    if (!better) return now.rate > 0 ? `This piece is in your bag, with ${pct(now.rate)} off.` : "This piece is in your bag.";
    const more = better.minQuantity - bag.totalItems;
    return `This piece is in your bag. ${more === 1 ? "One more piece takes" : `${more} more pieces take`} ${pct(better.rate)} off everything.`;
  }
  const effect = addOnEffect(bag, price);
  if (effect.rate <= 0) return pdpOfferStatus(bag, price);
  if (effect.rate > now.rate) {
    const lead = `Add to bag and everything in it gets ${pct(effect.rate)} off.`;
    if (effect.adds < 0) return `${lead} Your total drops by ${inr(-effect.adds)}.`;
    if (effect.adds === 0) return `${lead} Your total stays the same.`;
    return effect.adds < price ? `${lead} Your total goes up by ${inr(effect.adds)}, not ${inr(price)}.` : `${lead} Your total goes up by ${inr(effect.adds)}.`;
  }
  const after = resolveCartDiscount({ totalItems: bag.totalItems + 1, promoCode: bag.promoCode });
  return after.automatic ? `Your bag already has ${pct(now.rate)} off. This piece gets it too.` : pdpOfferStatus(bag, price);
};

/** "second", "third", "fourth": the piece a step of the offer starts at. */
const ORDINAL = ["", "first", "second", "third", "fourth", "fifth"];

/**
 * The bag suggestion's heading: what the next piece does, in the words the
 * bag's foot has always used ("A third piece takes 15% off your bag"). Empty
 * when one more piece reaches no richer step.
 */
export const nextPieceLine = (totalItems: number, rateNow: number, rateAfter: number): string =>
  rateAfter > rateNow ? `A ${ORDINAL[totalItems + 1] ?? `${totalItems + 1}th`} piece takes ${pct(rateAfter)} off your bag` : "";

/** "Earrings" stays; "Necklaces" names one necklace: a row holds one piece. */
export const oneOf = (category: string): string =>
  ({ Necklaces: "Necklace", Bracelets: "Bracelet", Rings: "Ring", Anklets: "Anklet" })[category] ?? category;
