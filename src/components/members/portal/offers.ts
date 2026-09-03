/**
 * "Any 3 pieces, 20% off" — the Inner Circle members' offer.
 *
 * The arithmetic, kept pure and away from React so it can be asserted directly
 * (see __checks__/offers.check.ts) and so the panel and the copy can never drift
 * apart on what the member is actually being charged.
 *
 * The 4+ rule: once three pieces are in the set, EVERY piece in the set is 20%
 * off — not the first three only. That is what a Shopify order-level percentage
 * discount with a "minimum quantity of items = 3" requirement actually does, so
 * the figure quoted here is the figure Shopify charges. Nothing is grouped into
 * threes and nothing is left at full price.
 */

export const OFFER_MIN_PIECES = 3;
export const OFFER_RATE = 0.2;

export type OfferQuote = {
  /** How many pieces are in the set. */
  count: number;
  /** Full price of the set, in rupees. */
  subtotal: number;
  /** Rupees taken off. 0 until the set qualifies. */
  discount: number;
  /** What the member pays, in rupees. */
  total: number;
  /** True once the set is big enough for the discount. */
  qualifies: boolean;
  /** Pieces still to add before the discount applies. 0 once it does. */
  needed: number;
};

/**
 * Money is summed and discounted in whole paise so a set of odd prices can
 * never drift by a fraction of a paisa the way repeated float rupee maths does.
 */
export const quoteThreeForTwenty = (prices: number[]): OfferQuote => {
  const subtotalPaise = prices.reduce((sum, price) => sum + Math.round(price * 100), 0);
  const qualifies = prices.length >= OFFER_MIN_PIECES;
  const discountPaise = qualifies ? Math.round(subtotalPaise * OFFER_RATE) : 0;

  return {
    count: prices.length,
    subtotal: subtotalPaise / 100,
    discount: discountPaise / 100,
    total: (subtotalPaise - discountPaise) / 100,
    qualifies,
    needed: Math.max(0, OFFER_MIN_PIECES - prices.length),
  };
};

/**
 * ₹1,499 — Indian digit grouping, and paise shown only when there are any,
 * so a whole-rupee price is never dressed up as ₹1,499.00.
 */
export const formatINR = (rupees: number): string => {
  const paise = Math.round(rupees * 100);
  const digits = paise % 100 === 0 ? 0 : 2;
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
};

/** Money for a row that carries its own currency code. Every row is INR today. */
export const formatMoney = (amount: number, currency: string): string =>
  currency === "INR" || !currency
    ? formatINR(amount)
    : `${currency} ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
