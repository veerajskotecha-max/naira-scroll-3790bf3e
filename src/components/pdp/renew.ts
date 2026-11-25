import { discountedSubtotal, resolveCartDiscount } from "@/lib/promo";

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
