/* Welcome-offer promo code handling.
   The code is captured through the welcome popup and auto-applied to the
   Shopify checkout URL via the ?discount= parameter. */

export const WELCOME_PROMO_CODE = "NAIRA10";
export const WELCOME_PROMO_LABEL = "10% off your first order";

export const PROMO_DISCOUNTS = {
  NAIRA10: 0.1,
  FRIENDSANDFAMILY: 0.2,
  BUY2: 0.1,
} as const;

/*
  The multi-buy offer: two or more pieces, ten percent off.

  It is a CODE in Shopify, not an automatic discount, and that is deliberate.
  Shiprocket Fastrr — which now owns the payment page — ignores Shopify
  automatic discounts completely: verified live with an active
  "2 or more, 10% off" automatic discount and a two-item bag, Fastrr returned
  totalPrice 2398.00, totalDiscount 0.00 and an empty discountDetail. The
  drawer would have promised a discount the shopper was never given. A code
  travels with the bag (Fastrr `couponCode`, Shopify `?discount=`) and both
  paths honour it.

  The shopper never types it — the bag applies it once it qualifies.
*/
export const QUANTITY_OFFER = {
  code: "BUY2",
  minQuantity: 2,
  rate: 0.1,
} as const;

export const QUANTITY_OFFER_LABEL = "Buy 2 or more — extra 10% off";

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

export type ResolvedDiscount = {
  /** The code to hand checkout, or null when nothing applies. */
  code: string | null;
  rate: number;
  /** True when the bag earned it rather than the shopper typing it. */
  automatic: boolean;
};

/**
 * Which single discount the order actually gets.
 *
 * Shopify order discounts do not combine (every one of ours is created with
 * `combinesWith.orderDiscounts: false`), so exactly one can win. This resolves
 * it the same way Shopify will — the larger rate — which is what keeps the
 * total in the drawer equal to the total the shopper is charged. A typed code
 * wins an exact tie, because a shopper who went to the trouble of entering one
 * should see it named on the receipt.
 */
export const resolveCartDiscount = (input: {
  totalItems: number;
  promoCode?: string | null;
}): ResolvedDiscount => {
  const typed = normalizePromoCode(input.promoCode ?? "");
  const typedRate = getPromoDiscountRate(typed);
  const earnedRate = input.totalItems >= QUANTITY_OFFER.minQuantity ? QUANTITY_OFFER.rate : 0;

  if (typedRate >= earnedRate) {
    return { code: typedRate > 0 ? typed : null, rate: typedRate, automatic: false };
  }
  return { code: QUANTITY_OFFER.code, rate: earnedRate, automatic: true };
};

/** How many more pieces earn the multi-buy offer, or 0 once it is earned. */
export const itemsToQuantityOffer = (totalItems: number): number =>
  Math.max(0, QUANTITY_OFFER.minQuantity - totalItems);

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
