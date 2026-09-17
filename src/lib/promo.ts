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
  The multi-buy offer: two or more pieces, ten percent off.

  It is a CODE in Shopify, not an automatic discount, and that is deliberate.
  Shiprocket Fastrr — which owns the payment page — ignores Shopify automatic
  discounts completely: verified live with an active "2 or more, 10% off"
  automatic discount and a two-item bag, Fastrr returned totalPrice 2398.00,
  totalDiscount 0.00 and an empty discountDetail. A code travels with the bag
  (Fastrr couponCode, Shopify ?discount=) and both paths honour it.

  The shopper never types it — the bag applies it once it qualifies.
*/
export const QUANTITY_OFFER = {
  code: "BUY2",
  minQuantity: 2,
  rate: 0.1,
} as const;

export const QUANTITY_OFFER_LABEL = "Buy 2 or more — extra 10% off";

/*
  Shopify sorts every discount into a CLASS, and the class is what decides
  stacking: two discounts of the SAME class can never both apply, while
  discounts of DIFFERENT classes can, provided each is configured to combine
  with the other's class.

  A basic discount's class is derived from what it is scoped to — an
  order-wide percentage is ORDER, one scoped to products or collections is
  PRODUCT. That is why BUY2 is scoped to the hidden "discount-scope-all"
  collection (all 90 products, auto-updating): it makes BUY2 a PRODUCT
  discount, which is the only way it can stack on top of an ORDER code like
  NAIRA10.

  Keep this table in step with Shopify. A rate or class that drifts from the
  real discount makes the bag quote a total the shopper is not charged.
*/
export type DiscountClass = "order" | "product";

export const PROMO_CATALOGUE: Record<PromoCode, { rate: number; klass: DiscountClass }> = {
  NAIRA10: { rate: 0.1, klass: "order" },
  FRIENDSANDFAMILY: { rate: 0.2, klass: "product" },
  BUY2: { rate: 0.1, klass: "product" },
};

export type DiscountLine = {
  code: string;
  rate: number;
  klass: DiscountClass;
  /** True when the bag earned it rather than the shopper typing it. */
  automatic: boolean;
};

export type ResolvedDiscount = {
  /** Every code Shopify would honour together on this bag. */
  codes: string[];
  lines: DiscountLine[];
  /**
   * The ONE code we can hand the checkout.
   *
   * Fastrr's buyDirect takes a single coupon and refuses two joined together,
   * so this is the only discount the bag can guarantee. Whatever it is worth
   * is safe to show as a deduction.
   */
  passedCode: string | null;
  /**
   * A second code Shopify would stack, which the shopper has to enter in
   * Fastrr's own coupon field to receive. Never counted in the total — it is
   * an invitation, not a promise.
   */
  stackableCode: string | null;
  productRate: number;
  orderRate: number;
  /** Effective rate of `passedCode` alone — what the bag actually deducts. */
  rate: number;
  /** Effective rate if the shopper also enters `stackableCode`, compounded. */
  stackedRate: number;
};

/**
 * Which discounts the order actually gets, and what they are worth together.
 *
 * At most one per class can apply, so the better product discount wins its
 * slot and the better order discount wins its own. The two then COMPOUND
 * rather than add: Shopify takes the product discount off the line items
 * first, then the order discount off what is left. Ten and ten is nineteen
 * percent, not twenty — adding them would overstate every stacked bag.
 */
export const resolveCartDiscount = (input: {
  totalItems: number;
  promoCode?: string | null;
}): ResolvedDiscount => {
  const candidates: DiscountLine[] = [];

  const typed = normalizePromoCode(input.promoCode ?? "");
  if (isAcceptedPromoCode(typed) && typed !== QUANTITY_OFFER.code) {
    candidates.push({ code: typed, ...PROMO_CATALOGUE[typed], automatic: false });
  }
  if (input.totalItems >= QUANTITY_OFFER.minQuantity) {
    candidates.push({
      code: QUANTITY_OFFER.code,
      ...PROMO_CATALOGUE[QUANTITY_OFFER.code],
      automatic: true,
    });
  }

  /* One winner per class. A typed code takes an exact tie, so a shopper who
     went to the trouble of entering one sees it named on the bag. */
  const bestOf = (klass: DiscountClass) =>
    candidates
      .filter((c) => c.klass === klass)
      .sort((a, b) => b.rate - a.rate || Number(a.automatic) - Number(b.automatic))[0];

  const product = bestOf("product");
  const order = bestOf("order");
  const lines = [product, order].filter(Boolean) as DiscountLine[];

  const productRate = product?.rate ?? 0;
  const orderRate = order?.rate ?? 0;

  /* Only one code can reach Fastrr, so the richer of the two is the one worth
     sending; a tie goes to the code the shopper typed, which they expect to
     see. The loser becomes the stacking invitation. */
  const ranked = [...lines].sort((a, b) => b.rate - a.rate || Number(a.automatic) - Number(b.automatic));
  const passed = ranked[0] ?? null;
  const stackable = ranked[1] ?? null;

  return {
    codes: lines.map((l) => l.code),
    lines,
    passedCode: passed?.code ?? null,
    stackableCode: stackable?.code ?? null,
    productRate,
    orderRate,
    rate: passed?.rate ?? 0,
    stackedRate: 1 - (1 - productRate) * (1 - orderRate),
  };
};

/** What the shopper pays for the goods before shipping, counting only the
    discount the bag can guarantee. */
export const discountedSubtotal = (subtotal: number, resolved: ResolvedDiscount): number =>
  Math.round(subtotal * (1 - resolved.rate));

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
