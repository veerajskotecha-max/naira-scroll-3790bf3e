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
   what this store sells and the ladder gives it nothing (nor, since 7 Nov
   2026, a two-piece one), so without this code the most common order carries
   no discount at all.

   BUY2 is not here, on purpose. The owner took the two-piece rung away on
   7 Nov 2026 ("we need only buy 3 20% off and buy 4 30% off"), and BUY2 is
   switched off in Shopify once this is live. Typed by hand it is now an
   unknown code: worth nothing in the bag, and never handed to Fastrr, so the
   bag cannot quote 10% off two pieces whatever Shopify still holds. */
export const PROMO_DISCOUNTS = {
  FRIENDSANDFAMILY: 0.2,
  BUY3: 0.2,
  BUY4: 0.3,
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
  The buy-more ladder: three pieces take 20% off, four take 30%. Two rungs,
  the owner's ask of 7 Nov 2026 ("remove buy 2 10% from cart and offer too,
  we need only buy 3 20% off and buy 4 30% off"): two pieces take nothing.
  Earlier the same day it was three rungs (Buy 2 at 10%, and Buy 4 added at
  30%); BUY3's 20% is the rate of 3 Nov (20% and 30% for two and three
  pieces on 2-3 Nov, 15% and 25% from 25 Oct). BUY3 and BUY4 in Shopify
  carry the same rates, so the bag quotes what Fastrr charges. BUY4 was made
  as BUY3's exact twin, only the rate (30%) and the minimum (4 pieces)
  changed: the same `discount-scope-all` collection, every buyer, and the
  same combinesWith. BUY2 (10%, 2 or more) is switched off in Shopify once
  this is live, never before, so the live bag never promises more than the
  checkout gives.

  Every consumer reads the rungs from here, and their number too: a grid of
  rungs takes one column per entry (`RUNG_GRID_COLS`), never a fixed count.

  Both rungs are CODES in Shopify, not automatic discounts, and that is
  deliberate — Fastrr, which owns the payment page, ignores Shopify automatic
  discounts entirely (verified live: an active "2 or more, 10% off" automatic
  discount left a two-item bag at totalPrice 2398.00, totalDiscount 0.00). A
  code travels with the bag and is honoured. The shopper never types one; the
  bag applies whichever rung it has reached.
*/
export const QUANTITY_OFFERS = [
  { code: "BUY3", minQuantity: 3, rate: 0.2 },
  { code: "BUY4", minQuantity: 4, rate: 0.3 },
] as const;

export type QuantityOffer = (typeof QUANTITY_OFFERS)[number];

/* One equal column per rung, for every grid of rungs (the bag's labels, the
   product page's offer box, the old bag's labels). Literal class names, so
   Tailwind's scanner sees each one; a ladder longer than the map fails to
   compile here instead of falling back to a fixed count. Two columns since
   7 Nov 2026; every one of those grids was a hard-coded `grid-cols-3`. */
const GRID_COLS = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" } as const;
export const RUNG_GRID_COLS: string = GRID_COLS[QUANTITY_OFFERS.length];

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
 * Where the rung at `index` sits on a ladder track, 0 to 1: each rung at the
 * middle of its own equal share of the track (1/4 and 3/4 for two; it was
 * 1/6, 1/2 and 5/6 for three). A track that placed them by piece count put
 * Buy 3 and Buy 4 a quarter of the width apart with Buy 4 at the very end,
 * and on a 280px phone their labels ran into each other; centred in equal
 * shares, a label always has its own share of the width.
 */
export const rungPosition = (index: number): number => (index + 0.5) / QUANTITY_OFFERS.length;

/**
 * How full the offer bar should be, 0 to 1, on the track `rungPosition` lays
 * out: it meets each rung as the bag reaches that rung's pieces, runs evenly
 * between them (one piece fills a third of the way to Buy 3, two pieces two
 * thirds), and is full once the top rung is reached.
 *
 * Measured across the WHOLE ladder rather than per rung, so the bar keeps
 * creeping forward as pieces go in instead of snapping back to empty each time
 * a rung is cleared.
 */
export const quantityOfferProgress = (totalItems: number): number => {
  const items = Math.max(0, totalItems);
  if (items >= TOP_QUANTITY_OFFER.minQuantity) return 1;
  let fromItems = 0;
  let fromAt = 0;
  for (const [index, offer] of QUANTITY_OFFERS.entries()) {
    const at = rungPosition(index);
    if (items <= offer.minQuantity) return fromAt + ((items - fromItems) / (offer.minQuantity - fromItems)) * (at - fromAt);
    fromItems = offer.minQuantity;
    fromAt = at;
  }
  return 1;
};

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
 * rung wins, unless the typed code IS that rung (BUY3 typed into a
 * three-piece bag is still named as typed). The rungs are scoped in Shopify
 * to `discount-scope-all`, every product; FRIENDSANDFAMILY (20%), which ties
 * BUY3, only to the jewellery collections (175 of 194 products, read 2 Nov).
 * Handing Fastrr FRIENDSANDFAMILY on that tie would charge an outfit in the
 * bag full price while the bag quoted 20% off it.
 *
 * Two rungs since 7 Nov 2026 (Buy 3 at 20%, Buy 4 at 30%; Buy 2 is gone), so
 * one and two pieces earn nothing and only a typed code can discount them:
 * NAIRA10 (10%) wins on one and two pieces and loses to BUY3 from three;
 * FRIENDSANDFAMILY (20%) wins on one and two, ties BUY3 on three (BUY3 goes);
 * BUY4 (30%) beats every typed code from four, so from four pieces the bag
 * always hands Fastrr BUY4. A typed BUY2 is no code at all any more (it is
 * not in PROMO_DISCOUNTS): worth nothing on two pieces, and the three-piece
 * bag gets BUY3 as if nothing were typed.
 */
export const resolveCartDiscount = (input: {
  totalItems: number;
  promoCode?: string | null;
}): ResolvedDiscount => {
  const typed = normalizePromoCode(input.promoCode ?? "");
  /* A rung's code typed by hand still needs the rung's pieces: Shopify holds
     BUY3 to 3 or more and BUY4 to 4 or more, so below that it is worth 0
     (BUY4 typed into a three-piece bag leaves it at BUY3). */
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
 * A ₹1,499 piece beside a ₹2,399 one adds all of ₹1,499 (two pieces earn no
 * rung since 7 Nov 2026). As the third, beside ₹2,399 + ₹1,799 (₹4,198), it
 * adds ₹360 and saves ₹1,139: the whole bag takes 20% (₹5,697 at 20% is
 * ₹4,558, from ₹4,557.60). As the fourth, beside ₹2,399 + ₹1,499 + ₹1,799
 * (₹4,558), it adds ₹479 and saves ₹1,020: the whole bag moves from 20% to
 * 30% (₹7,196 at 30% is ₹5,037).
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
 * The ladder's line in the bag: what the ladder does for this bag now and
 * what the next piece would do. `appliedRate` is the discount the bag gets (a
 * typed code can give as much as a rung), so it never offers a saving in hand.
 *
 * It names the piece the rung starts at. Since 7 Nov 2026 the first rung is
 * the third piece, so one and two pieces read "Your third piece takes 20% off
 * your bag" and "A third piece takes 20% off your bag": "3 pieces take 20%"
 * on a bag of one left her to count, and a bag of two that had just lost its
 * 10% must hear plainly that the next piece is the one that pays.
 */
export const ladderHeadline = (totalItems: number, appliedRate = 0): string => {
  const earned = earnedQuantityOffer(totalItems);
  const applied = Math.max(appliedRate, earned?.rate ?? 0);
  const better = QUANTITY_OFFERS.find((offer) => totalItems < offer.minQuantity && offer.rate > applied);
  if (!better) return applied > 0 ? `${percent(applied)} off your bag, the best price` : "";
  const ordinal = ORDINAL[better.minQuantity] ?? `${better.minQuantity}th`;
  /* "a third piece" when it is the very next one, "your third piece" when
     more must come before it. */
  const piece = `${better.minQuantity - totalItems === 1 ? "a" : "your"} ${ordinal} piece`;
  if (applied === 0) return `${piece.charAt(0).toUpperCase()}${piece.slice(1)} takes ${percent(better.rate)} off your bag`;
  return `${percent(applied)} off your bag · ${piece} makes it ${percent(better.rate)}`;
};

/**
 * What one piece costs at a rung, rounded as the bag rounds its total
 * (`discountedSubtotal`), and to the rupee what Shopify's code charges a
 * piece (₹999 at 20% is ₹799.20, at 30% ₹699.30). At three or four of a
 * piece, a price ending in 99 can sit ₹1 under the bag's total (3 × ₹799 =
 * ₹2,397 against ₹2,398 for three ₹999 pieces; 4 × ₹699 = ₹2,796 against
 * ₹2,797 for four): the bag rounds the total once, this rounds the piece.
 * Never more than ₹1, never over.
 */
export const pieceAtRung = (price: number, offer: { code: string; rate: number }): number =>
  discountedSubtotal(price, { code: offer.code, rate: offer.rate, automatic: true });

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/**
 * The product page's offer line, for this piece against the bag as Shopify
 * last confirmed it. Empty, it says the rungs need no code. Holding pieces, it
 * says what adding THIS one does to the bag's total, by the bag's own resolver
 * and rounding (`addOnEffect`), so the figure is the one the bag then shows;
 * at a rung the bag already has, it names the rate and leaves the figure to
 * that rung's column in the box. A typed code is never offered back as a
 * saving the shopper already has. Where adding this piece reaches no rung and
 * no code applies (one piece in the bag, since the first rung became the
 * third piece on 7 Nov 2026), it says how many more the rung needs, never a
 * rate of "0% off".
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
     its own, without the bag's offer. */
  if (effect.rate <= 0) {
    /* Nothing applies with this piece either: a second piece earns no rung.
       The line says what does, counted from the bag with this piece in it. */
    const after = bag.totalItems + 1;
    const next = nextQuantityOffer(after);
    if (!next) return "";
    const more = next.minQuantity - after;
    return `Add to bag, and ${more === 1 ? "one more piece takes" : `${more} more pieces take`} ${percent(next.rate)} off everything.`;
  }
  /* A cheap piece that lifts a dear bag to the next rung can lower its total
     (₹2,749 + ₹2,399 with a ₹599 piece at 20% is ₹550 less than the two at
     full price); that is said as a drop, never as "adds ₹-550". */
  if (effect.adds <= 0) {
    const drop = effect.adds < 0 ? `your total drops ${rupees(-effect.adds)}` : "your total stays the same";
    return `Add to bag for ${percent(effect.rate)} off everything: ${drop}.`;
  }
  const adds = effect.adds < price ? `${rupees(effect.adds)}, not ${rupees(price)}` : rupees(effect.adds);
  if (effect.rate > now.rate) return `Add to bag for ${percent(effect.rate)} off everything: it adds ${adds}.`;
  /* The rate stays, and it is a rung's: the box above already prices this
     piece at that rung (₹1,199 is "₹839 each" under Buy 4, the piece rounded
     alone, as Shopify charges it, ₹839.30). "Adding this costs ₹840" (the
     whole bag rounded again) one line under that gold column read as the same
     claim ₹1 apart, and at 30% it was ₹1 apart in most four-piece bags. So the
     line names the rate and leaves the figure to the box. A typed code's rate
     (NAIRA10 or FRIENDSANDFAMILY on one or two pieces) has no column of its
     own, so it keeps its figure. */
  const after = resolveCartDiscount({ totalItems: bag.totalItems + 1, promoCode: bag.promoCode });
  return after.automatic
    ? `${percent(now.rate)} off is on your bag, this piece included.`
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
