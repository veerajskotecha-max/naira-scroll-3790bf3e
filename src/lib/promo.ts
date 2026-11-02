/* Cart discount handling.

   One discount reaches the checkout and one only. Fastrr's buyDirect carries a
   single coupon — joining two with a comma was tested against the live
   checkout and made it apply NEITHER (couponCodes [], totalDiscount 0.00) — so
   the bag resolves exactly one code and never quotes a stacked total it cannot
   deliver. */

/* NAIRA10 is back and live in Shopify: 10%, ALL customers, no minimum, no
   usage limit — its old title said "first order" but it was never actually
   restricted, so the bag can offer it to anyone without quoting a discount the
   checkout would reject.

   It is the floor of the ladder, not a rung of it. The quantity offers are
   earned by the bag; NAIRA10 is typed. A single-piece order is two thirds of
   what this store sells and the ladder gives it nothing, so without this code
   the most common order carries no discount at all. */
export const PROMO_DISCOUNTS = {
  FRIENDSANDFAMILY: 0.2,
  BUY2: 0.2,
  BUY3: 0.3,
  NAIRA10: 0.1,
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
  The buy-more ladder: two pieces take 20% off, three take 30% (the owner,
  2 Nov 2026; it was 15% and 25%, and 10% and 20% before 25 Oct). BUY2 and
  BUY3 in Shopify carry the same rates, so the bag quotes what Fastrr charges.

  Both rungs are CODES in Shopify, not automatic discounts, and that is
  deliberate — Fastrr, which owns the payment page, ignores Shopify automatic
  discounts entirely (verified live: an active "2 or more, 10% off" automatic
  discount left a two-item bag at totalPrice 2398.00, totalDiscount 0.00). A
  code travels with the bag and is honoured. The shopper never types one; the
  bag applies whichever rung it has reached.
*/
export const QUANTITY_OFFERS = [
  { code: "BUY2", minQuantity: 2, rate: 0.2 },
  { code: "BUY3", minQuantity: 3, rate: 0.3 },
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
 * and what the shopper typed wins outright — never both. On an exact tie the
 * rung wins, unless the typed code IS that rung (BUY2 typed into a two-piece
 * bag is still named as typed). The rungs are scoped in Shopify to
 * `discount-scope-all`, every product; FRIENDSANDFAMILY, which ties BUY2 at
 * 20% since 2 Nov 2026, only to the jewellery collections (175 of 194
 * products, read 2 Nov). Handing Fastrr FRIENDSANDFAMILY on that tie would
 * charge an outfit in the bag full price while the bag quoted 20% off it.
 */
export const resolveCartDiscount = (input: {
  totalItems: number;
  promoCode?: string | null;
}): ResolvedDiscount => {
  const typed = normalizePromoCode(input.promoCode ?? "");
  /* A rung's code typed by hand still needs the rung's pieces: Shopify holds
     BUY2 to 2 or more and BUY3 to 3 or more, so below that it is worth 0. */
  const typedRung = QUANTITY_OFFERS.find((offer) => offer.code === typed);
  const typedRate = typedRung && input.totalItems < typedRung.minQuantity ? 0 : getPromoDiscountRate(typed);
  const earned = earnedQuantityOffer(input.totalItems);

  if (earned && (earned.rate > typedRate || (earned.rate === typedRate && typed !== earned.code))) {
    return { code: earned.code, rate: earned.rate, automatic: true };
  }
  if (typedRate > 0) return { code: typed, rate: typedRate, automatic: false };
  return { code: null, rate: 0, automatic: false };
};

/** What the shopper pays for the goods, before shipping. */
export const discountedSubtotal = (subtotal: number, resolved: ResolvedDiscount): number =>
  Math.round(subtotal * (1 - resolved.rate));

/**
 * What one more piece does to the bag: what it adds to the total and what the
 * bag then saves on it, by the same resolver and rounding as the checkout.
 * A ₹1,499 piece beside a ₹2,399 one adds ₹719 and saves ₹780.
 */
export const addOnEffect = (bag: { subtotal: number; totalItems: number; promoCode?: string | null }, price: number) => {
  const now = discountedSubtotal(bag.subtotal, resolveCartDiscount({ totalItems: bag.totalItems, promoCode: bag.promoCode }));
  const after = resolveCartDiscount({ totalItems: bag.totalItems + 1, promoCode: bag.promoCode });
  const adds = discountedSubtotal(bag.subtotal + price, after) - now;
  return { adds, saves: price - adds, rate: after.rate };
};

const ORDINAL = ["", "first", "second", "third", "fourth", "fifth"];
const percent = (rate: number) => `${Math.round(rate * 100)}%`;

/**
 * The band over the bag, one line: what the ladder does for this bag now and
 * what the next piece would do. `appliedRate` is the discount the bag gets (a
 * typed code can give as much as a rung), so it never offers a saving in hand.
 */
export const ladderHeadline = (totalItems: number, appliedRate = 0): string => {
  const earned = earnedQuantityOffer(totalItems);
  const applied = Math.max(appliedRate, earned?.rate ?? 0);
  const better = QUANTITY_OFFERS.find((offer) => totalItems < offer.minQuantity && offer.rate > applied);
  if (!better) return applied > 0 ? `${percent(applied)} off your bag, the best price` : "";
  const away = better.minQuantity - totalItems;
  const next =
    away === 1
      ? `a ${ORDINAL[better.minQuantity] ?? `${better.minQuantity}th`} piece`
      : `${better.minQuantity} pieces`;
  if (applied === 0) {
    return away === 1 ? `A ${ORDINAL[better.minQuantity]} piece takes ${percent(better.rate)} off your bag` : `${next} take ${percent(better.rate)} off your bag`;
  }
  return `${percent(applied)} off your bag · ${next} ${away === 1 ? "makes" : "make"} it ${percent(better.rate)}`;
};

/**
 * What one piece costs at a rung, rounded as the bag rounds its total
 * (`discountedSubtotal`). For every current price, two of a piece come to
 * exactly twice this. At three, a price ending in 99 can sit ₹1 under the
 * bag's total (3 × ₹699 = ₹2,097 against ₹2,098 for three ₹999 pieces): the
 * bag rounds the total once, this rounds the piece. Never more, never over.
 */
export const pieceAtRung = (price: number, offer: { code: string; rate: number }): number =>
  discountedSubtotal(price, { code: offer.code, rate: offer.rate, automatic: true });

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/**
 * The product page's offer line, for this piece against the bag as Shopify
 * last confirmed it. Empty, it says the rungs need no code. Holding pieces, it
 * says what adding THIS one does to the bag's total, by the bag's own resolver
 * and rounding (`addOnEffect`), so the figure is the one the bag then shows. A
 * typed code is never offered back as a saving the shopper already has.
 */
export const pdpOfferStatus = (
  bag: { subtotal: number; totalItems: number; promoCode?: string | null },
  price: number,
): string => {
  const now = resolveCartDiscount({ totalItems: bag.totalItems, promoCode: bag.promoCode });
  if (bag.totalItems <= 0) {
    if (now.rate <= 0 || now.automatic) return "Applied in your bag. No code needed.";
    const better = QUANTITY_OFFERS.find((offer) => offer.rate > now.rate);
    return better
      ? `Your code takes ${percent(now.rate)} off. ${better.minQuantity} pieces take ${percent(better.rate)}.`
      : `Your code takes ${percent(now.rate)} off, the best price.`;
  }
  const effect = addOnEffect(bag, price);
  /* "Add to bag", not "Add this": Buy Now beside it checks out this piece on
     its own, without the bag's offer. A cheap piece that lifts a dear bag to
     the next rung can lower its total (₹2,749 + ₹2,399 with a ₹599 piece at
     30% is ₹95 less than the two at 20%); that is said as a drop, never as
     "adds ₹-95". */
  if (effect.adds <= 0) {
    const drop = effect.adds < 0 ? `your total drops ${rupees(-effect.adds)}` : "your total stays the same";
    return `Add to bag for ${percent(effect.rate)} off everything: ${drop}.`;
  }
  const adds = effect.adds < price ? `${rupees(effect.adds)}, not ${rupees(price)}` : rupees(effect.adds);
  return effect.rate > now.rate
    ? `Add to bag for ${percent(effect.rate)} off everything: it adds ${adds}.`
    : `${percent(now.rate)} off is on your bag: adding this costs ${adds}.`;
};

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
