/* Cart discount handling.

   One discount reaches the checkout and one only. Fastrr's buyDirect carries a
   single coupon — joining two with a comma was tested against the live
   checkout and made it apply NEITHER (couponCodes [], totalDiscount 0.00) — so
   the bag resolves exactly one code and never quotes a stacked total it cannot
   deliver. */

export const PROMO_DISCOUNTS = {
  FRIENDSANDFAMILY: 0.2,
  BUY2: 0.1,
  BUY3: 0.2,
} as const;

export type PromoCode = keyof typeof PROMO_DISCOUNTS;
export const ACCEPTED_PROMO_CODES = Object.keys(PROMO_DISCOUNTS) as PromoCode[];

/** Removes pasted whitespace and punctuation so mobile autofill cannot invalidate a real code. */
export const normalizePromoCode = (code: string) =>
  code.normalize("NFKC").toUpperCase().replace(/[^A-Z0-9]/g, "");

export const isAcceptedPromoCode = (code: string): code is PromoCode =>
  Object.prototype.hasOwnProperty.call(PROMO_DISCOUNTS, code);

export const getPromoDiscountRate = (code: string | null): number => {
  const normalized = normalizePromoCode(code ?? "");
  return isAcceptedPromoCode(normalized) ? PROMO_DISCOUNTS[normalized] : 0;
};

/*
  The buy-more ladder: two pieces take 10% off, three take 20%.

  Both rungs are CODES in Shopify, not automatic discounts, and that is
  deliberate — Fastrr, which owns the payment page, ignores Shopify automatic
  discounts entirely (verified live: an active "2 or more, 10% off" automatic
  discount left a two-item bag at totalPrice 2398.00, totalDiscount 0.00). A
  code travels with the bag and is honoured. The shopper never types one; the
  bag applies whichever rung it has reached.
*/
export const QUANTITY_OFFERS = [
  { code: "BUY2", minQuantity: 2, rate: 0.1 },
  { code: "BUY3", minQuantity: 3, rate: 0.2 },
] as const;

export type QuantityOffer = (typeof QUANTITY_OFFERS)[number];

/** The top rung — what the ladder is worth once fully climbed. */
export const TOP_QUANTITY_OFFER = QUANTITY_OFFERS[QUANTITY_OFFERS.length - 1];

/** The best rung the bag has already earned, or null below the first. */
export const earnedQuantityOffer = (totalItems: number): QuantityOffer | null =>
  [...QUANTITY_OFFERS].reverse().find((o) => totalItems >= o.minQuantity) ?? null;

/** The next rung up, or null once the ladder is topped out. */
export const nextQuantityOffer = (totalItems: number): QuantityOffer | null =>
  QUANTITY_OFFERS.find((o) => totalItems < o.minQuantity) ?? null;

/** How many more pieces reach the next rung, or 0 at the top. */
export const itemsToQuantityOffer = (totalItems: number): number => {
  const next = nextQuantityOffer(totalItems);
  return next ? Math.max(0, next.minQuantity - totalItems) : 0;
};

/**
 * How full the offer bar should be, 0 to 1.
 *
 * Measured across the WHOLE ladder rather than per rung, so the bar keeps
 * creeping forward as pieces go in instead of snapping back to empty each time
 * a rung is cleared.
 */
export const quantityOfferProgress = (totalItems: number): number =>
  Math.min(1, totalItems / TOP_QUANTITY_OFFER.minQuantity);

export type ResolvedDiscount = {
  /** The single code the checkout carries, or null when nothing applies. */
  code: string | null;
  rate: number;
  /** True when the bag earned it rather than the shopper typing it. */
  automatic: boolean;
};

/**
 * The one discount the order gets.
 *
 * Only a single code can reach checkout, so the richer of what the bag earned
 * and what the shopper typed wins outright — never both. A typed code takes an
 * exact tie, so someone who went to the trouble of entering one sees it named.
 */
export const resolveCartDiscount = (input: {
  totalItems: number;
  promoCode?: string | null;
}): ResolvedDiscount => {
  const typed = normalizePromoCode(input.promoCode ?? "");
  const typedRate = getPromoDiscountRate(typed);
  const earned = earnedQuantityOffer(input.totalItems);

  if (earned && earned.rate > typedRate) {
    return { code: earned.code, rate: earned.rate, automatic: true };
  }
  if (typedRate > 0) return { code: typed, rate: typedRate, automatic: false };
  return { code: null, rate: 0, automatic: false };
};

/** What the shopper pays for the goods, before shipping. */
export const discountedSubtotal = (subtotal: number, resolved: ResolvedDiscount): number =>
  Math.round(subtotal * (1 - resolved.rate));

const CODE_KEY = "naira-promo-code";
const SEEN_KEY = "naira-promo-popup-seen";
const LEAD_KEY = "naira-promo-lead";

export const PROMO_EVENT = "naira-promo-changed";

const emit = () => {
  try {
    window.dispatchEvent(new CustomEvent(PROMO_EVENT));
  } catch {
    /* noop */
  }
};

export const getPromoCode = (): string | null => {
  try {
    return localStorage.getItem(CODE_KEY);
  } catch {
    return null;
  }
};

export const setPromoCode = (code: string) => {
  try {
    localStorage.setItem(CODE_KEY, normalizePromoCode(code));
  } catch {
    /* noop */
  }
  emit();
};

export const clearPromoCode = () => {
  try {
    localStorage.removeItem(CODE_KEY);
  } catch {
    /* noop */
  }
  emit();
};

export const hasSeenPromoPopup = (): boolean => {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
};

export const markPromoPopupSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* noop */
  }
};

export const savePromoLead = (lead: { channel: "email" | "whatsapp"; value: string }) => {
  try {
    localStorage.setItem(LEAD_KEY, JSON.stringify({ ...lead, at: new Date().toISOString() }));
  } catch {
    /* noop */
  }
};

/**
 * Appends a discount code to a Shopify checkout URL.
 *
 * Defaults to the stored code, but callers that have already resolved which
 * discount wins (see `resolveCartDiscount`) must pass it in — otherwise the
 * URL would carry the typed code while the cart carries the earned one.
 */
export const applyPromoToCheckoutUrl = (url: string, override?: string | null): string => {
  const code = override === undefined ? getPromoCode() : override;
  if (!code) return url;
  try {
    const next = new URL(url);
    next.searchParams.set("discount", code);
    return next.toString();
  } catch {
    return url;
  }
};
