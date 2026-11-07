import { describe, expect, it } from "vitest";
import {
  ACCEPTED_PROMO_CODES,
  PROMO_DISCOUNTS,
  addOnEffect,
  getPromoDiscountRate,
  isAcceptedPromoCode,
  ladderHeadline,
  QUANTITY_OFFERS,
  RUNG_GRID_COLS,
  TOP_QUANTITY_OFFER,
  discountedSubtotal,
  earnedQuantityOffer,
  pdpOfferStatus,
  pieceAtRung,
  itemsToQuantityOffer,
  nextQuantityOffer,
  quantityOfferProgress,
  resolveCartDiscount,
  rungPosition,
} from "./promo";

/**
 * The bag's total and the total Fastrr charges both come from this resolver.
 * Every case here is a rupee amount a shopper would otherwise see quoted and
 * then not be given.
 *
 * The ladder since the owner's second ask of 7 Nov 2026 ("remove buy 2 10%
 * from cart and offer too, we need only buy 3 20% off and buy 4 30% off"):
 * three pieces take BUY3 (20%), four or more take BUY4 (30%), one or two
 * pieces take no rung. NAIRA10 (10%, typed, any order) and FRIENDSANDFAMILY
 * (20%, typed, jewellery only in Shopify) are the only other codes.
 */
describe("resolveCartDiscount", () => {
  it("gives nothing for a single piece and no code", () => {
    expect(resolveCartDiscount({ totalItems: 1 })).toEqual({ code: null, rate: 0, automatic: false });
  });

  /* Buy 2 is gone: a two-piece bag earns no rung and hands Fastrr no code.
     Handing it BUY2 would take 10% off at checkout only until the owner
     switches BUY2 off in Shopify, and the bag would then quote 10% the
     checkout no longer gives. */
  it("gives a two-piece bag no rung and no code", () => {
    expect(resolveCartDiscount({ totalItems: 2 })).toEqual({ code: null, rate: 0, automatic: false });
  });

  /* These rates are not free to drift: they must match the live Shopify
     codes (BUY3 20% since 3 Nov 2026, BUY4 30% since 7 Nov 2026, both
     min-quantity scoped to `discount-scope-all`). A rate that is generous
     here and stingy there quotes the shopper a total Fastrr never charges. */
  it("earns 20% on the third piece without the shopper typing anything", () => {
    expect(resolveCartDiscount({ totalItems: 3 })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
  });

  /* The owner's fourth rung (7 Nov 2026): BUY4 in Shopify is BUY3's twin at
     30% and 4 or more pieces. */
  it("climbs to 30% on the fourth piece, and hands Fastrr BUY4", () => {
    expect(resolveCartDiscount({ totalItems: 4 })).toEqual({ code: "BUY4", rate: 0.3, automatic: true });
  });

  it("keeps BUY4 on a fifth piece and beyond", () => {
    expect(resolveCartDiscount({ totalItems: 5 })).toEqual({ code: "BUY4", rate: 0.3, automatic: true });
    expect(resolveCartDiscount({ totalItems: 9 }).code).toBe("BUY4");
  });

  /* Only ONE code can reach Fastrr — comma-joining two was tested live and made
     it apply neither — so the resolver must return exactly one, never a pair. */
  it("returns a single code, never a combination", () => {
    const r = resolveCartDiscount({ totalItems: 3, promoCode: "FRIENDSANDFAMILY" });
    expect(typeof r.code).toBe("string");
    expect(r.code).not.toContain(",");
    expect(r.rate).toBe(0.2);
  });

  /* FRIENDSANDFAMILY is 20%: it TIES the three-piece rung (BUY3, 20%). In
     Shopify it covers only the jewellery collections, while BUY3 covers every
     product (discount-scope-all, read 2 Nov 2026), so handing Fastrr
     FRIENDSANDFAMILY on the tie would charge an outfit in the bag full price
     against a bag that quoted 20% off it. The rung wins the tie at three
     pieces; from four BUY4's 30% beats the code outright; on one or two
     pieces there is no rung, so the typed 20% is the code handed over. */
  it("hands Fastrr the rung, not the narrower 20% code, on the three-piece tie", () => {
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "FRIENDSANDFAMILY" })).toEqual({
      code: "BUY3",
      rate: 0.2,
      automatic: true,
    });
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "FRIENDSANDFAMILY" })).toEqual({
      code: "FRIENDSANDFAMILY",
      rate: 0.2,
      automatic: false,
    });
  });

  it("gives the 20% code on two pieces, where no rung applies", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "FRIENDSANDFAMILY" })).toEqual({
      code: "FRIENDSANDFAMILY",
      rate: 0.2,
      automatic: false,
    });
  });

  it("lets BUY4 out-earn the 20% code from the fourth piece", () => {
    expect(resolveCartDiscount({ totalItems: 4, promoCode: "FRIENDSANDFAMILY" })).toEqual({
      code: "BUY4",
      rate: 0.3,
      automatic: true,
    });
    expect(resolveCartDiscount({ totalItems: 5, promoCode: "FRIENDSANDFAMILY" })).toEqual({
      code: "BUY4",
      rate: 0.3,
      automatic: true,
    });
  });

  /* No typed code is worth 30%, so from four pieces the bag hands Fastrr BUY4
     whatever was typed: the one code that gives the most. */
  it("hands Fastrr BUY4 at four pieces whatever code was typed", () => {
    for (const promoCode of ["NAIRA10", "FRIENDSANDFAMILY", "BUY2", "BUY3", "junk"]) {
      expect(resolveCartDiscount({ totalItems: 4, promoCode })).toEqual({ code: "BUY4", rate: 0.3, automatic: true });
    }
  });

  /* The same bag must always resolve to the same one code, whatever order the
     codes were typed in or how often it is asked. */
  it("is deterministic: one code per bag and code, every time", () => {
    for (const promoCode of [null, "NAIRA10", "FRIENDSANDFAMILY", "BUY2", "BUY3", "BUY4", "junk"]) {
      for (let totalItems = 0; totalItems <= 6; totalItems++) {
        const first = resolveCartDiscount({ totalItems, promoCode });
        expect(resolveCartDiscount({ totalItems, promoCode })).toEqual(first);
        expect(first.code ?? "").not.toContain(",");
        // Never less than the rung the bag has earned.
        expect(first.rate).toBeGreaterThanOrEqual(earnedQuantityOffer(totalItems)?.rate ?? 0);
      }
    }
  });

  /* The rungs must stay ordered: a lower rung that silently outranked a
     higher one would undercharge every full bag. Two pieces sit under both. */
  it("keeps each rung below the next one up", () => {
    expect(resolveCartDiscount({ totalItems: 2 }).rate).toBeLessThan(resolveCartDiscount({ totalItems: 3 }).rate);
    expect(resolveCartDiscount({ totalItems: 3 }).rate).toBeLessThan(resolveCartDiscount({ totalItems: 4 }).rate);
  });

  it("keeps the earned rung when it beats the typed code", () => {
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "NAIRA10" })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
    expect(resolveCartDiscount({ totalItems: 4, promoCode: "BUY3" })).toEqual({ code: "BUY4", rate: 0.3, automatic: true });
  });

  /* A shopper who typed BUY3 into a three-piece bag gets exactly what the bag
     earned. They must see the code they entered, not be told the bag did it
     for them. The charge is identical either way; this is about not confusing
     them. */
  it("keeps the typed code on an exact tie so the shopper sees the one they entered", () => {
    const r = resolveCartDiscount({ totalItems: 3, promoCode: "BUY3" });
    expect(r).toEqual({ code: "BUY3", rate: 0.2, automatic: false });
  });

  /* Shopify holds BUY3 to 3 or more pieces and BUY4 to 4 or more. Typed by
     hand into a smaller bag, the bag must not quote a rate checkout refuses. */
  it("gives a typed rung code nothing below its own minimum", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "BUY3" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "BUY3" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "BUY3" })).toEqual({ code: "BUY3", rate: 0.2, automatic: false });
  });

  /* BUY4 typed into a three-piece bag: Shopify would refuse it (4 or more),
     so it is worth nothing and the bag keeps the three-piece rung, BUY3 at
     20%. Handing Fastrr BUY4 here would apply no discount at all. */
  it("gives a typed BUY4 nothing below four pieces, and keeps BUY3 at three", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "BUY4" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "BUY4" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "BUY4" })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
    expect(resolveCartDiscount({ totalItems: 4, promoCode: "BUY4" })).toEqual({ code: "BUY4", rate: 0.3, automatic: false });
  });

  /* BUY2 is not a code the bag knows any more: the owner took Buy 2 away on
     7 Nov 2026 and switches it off in Shopify once the site is live. Typed
     by hand (or left in storage from an earlier visit) it is worth nothing
     and is never the code handed to Fastrr: a two-piece bag stays at full
     price, a three-piece bag gets BUY3 as if nothing were typed. */
  it("treats a typed BUY2 as no code at all", () => {
    expect(isAcceptedPromoCode("BUY2")).toBe(false);
    expect(getPromoDiscountRate("BUY2")).toBe(0);
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "BUY2" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "BUY2" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 2, promoCode: " buy-2 " })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "BUY2" })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
    for (let totalItems = 0; totalItems <= 9; totalItems++) {
      expect(resolveCartDiscount({ totalItems, promoCode: "BUY2" }).code).not.toBe("BUY2");
      expect(resolveCartDiscount({ totalItems }).code).not.toBe("BUY2");
    }
  });

  it("falls back to the earned rung when the typed code is junk", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "NOTACODE" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "NOTACODE" }).code).toBe("BUY3");
  });

  it("ignores a junk code on a single piece rather than inventing a discount", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "NOTACODE" }).rate).toBe(0);
  });

  it("tolerates the messy casing and punctuation mobile autofill produces", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: " friends-and-family " }).code).toBe(
      "FRIENDSANDFAMILY"
    );
  });

  it("treats an empty bag as no discount", () => {
    expect(resolveCartDiscount({ totalItems: 0 }).rate).toBe(0);
  });

  /* NAIRA10 is live (10%, all customers, no minimum). It must be ACCEPTED on
     a bag the ladder does not reach — one piece is two thirds of orders, and
     since 7 Nov 2026 two pieces earn nothing either — but it must never beat
     a rung it is worth less than, or a shopper who earned BUY3's 20% would be
     charged at 10%. */
  it("accepts the welcome code on a bag the ladder does not reach", () => {
    expect(ACCEPTED_PROMO_CODES).toContain("NAIRA10");
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "NAIRA10" })).toEqual({
      code: "NAIRA10",
      rate: 0.1,
      automatic: false,
    });
  });

  /* With Buy 2 gone there is no two-piece rung for NAIRA10 to tie: on two
     pieces the typed code itself is what Fastrr is handed. The third and
     fourth pieces out-earn it outright. */
  it("hands Fastrr the welcome code on two pieces, and lets the third piece out-earn it", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" })).toEqual({
      code: "NAIRA10",
      rate: 0.1,
      automatic: false,
    });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "NAIRA10" })).toEqual({
      code: "BUY3",
      rate: 0.2,
      automatic: true,
    });
  });

  it("hands Fastrr BUY4, not the welcome code, at four pieces", () => {
    expect(resolveCartDiscount({ totalItems: 4, promoCode: "NAIRA10" })).toEqual({
      code: "BUY4",
      rate: 0.3,
      automatic: true,
    });
  });
});

describe("discountedSubtotal", () => {
  it("charges a two-piece bag in full", () => {
    // 2 x 1,199 = 2,398, and no rung below three pieces.
    expect(discountedSubtotal(2398, resolveCartDiscount({ totalItems: 2 }))).toBe(2398);
  });

  it("takes the typed 10% off a two-piece bag", () => {
    // 2,398 less 10% (239.80) = 2,158.20, so 2,158.
    expect(discountedSubtotal(2398, resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" }))).toBe(2158);
  });

  /* The four-piece bag was the one driven through the live Fastrr checkout,
     which returned totalDiscount 1779.20 on 8896 when the top rung was 20%,
     the bag's own figure to the rupee. Four pieces take BUY4's 30% since
     7 Nov 2026: 8896 less 2668.80 = 6227.20, so 6227. The same bag at three
     pieces' 20% is still 7116.80, so 7117. */
  it("takes 30% off the four-piece bag Fastrr was driven with", () => {
    expect(discountedSubtotal(8896, resolveCartDiscount({ totalItems: 4 }))).toBe(6227);
    expect(discountedSubtotal(8896, { code: "BUY3", rate: 0.2, automatic: true })).toBe(7117);
  });

  it("leaves the subtotal alone when nothing applies", () => {
    expect(discountedSubtotal(1199, resolveCartDiscount({ totalItems: 1 }))).toBe(1199);
  });
});

describe("the offer ladder", () => {
  it("counts down to the next rung, not the first", () => {
    expect(itemsToQuantityOffer(0)).toBe(3);
    expect(itemsToQuantityOffer(1)).toBe(2);
    // Two pieces earn nothing yet; one more reaches the 3-piece rung.
    expect(itemsToQuantityOffer(2)).toBe(1);
    // Three earned 20%; one more reaches the 4-piece rung.
    expect(itemsToQuantityOffer(3)).toBe(1);
  });

  it("is zero once the ladder is topped out", () => {
    expect(itemsToQuantityOffer(4)).toBe(0);
    expect(itemsToQuantityOffer(7)).toBe(0);
  });

  it("names the rung earned and the rung ahead", () => {
    expect(earnedQuantityOffer(1)).toBeNull();
    expect(nextQuantityOffer(1)?.code).toBe("BUY3");
    expect(earnedQuantityOffer(2)).toBeNull();
    expect(nextQuantityOffer(2)?.code).toBe("BUY3");
    expect(earnedQuantityOffer(3)?.code).toBe("BUY3");
    expect(nextQuantityOffer(3)?.code).toBe("BUY4");
    expect(earnedQuantityOffer(4)?.code).toBe("BUY4");
    expect(nextQuantityOffer(4)).toBeNull();
  });

  /* The two rungs share the track equally (1/4, 3/4), so a label centred
     under each has half the width; placed by piece count, Buy 3 and Buy 4
     sat a quarter apart with Buy 4 at the very end and their labels met at
     280px. */
  it("centres each rung in its own half of the track", () => {
    expect(QUANTITY_OFFERS.map((_, i) => rungPosition(i))).toEqual([1 / 4, 3 / 4]);
  });

  /* Measured across the whole ladder so the bar never snaps backwards when a
     rung is cleared: one piece is a third of the way to Buy 3 (1/3 of 1/4 =
     1/12), two pieces two thirds (1/6), three meet the Buy 3 ring at 1/4, and
     four pieces fill it. */
  it("fills monotonically over four pieces, meets each rung, and caps at full", () => {
    const steps = [0, 1, 2, 3, 4, 5, 9].map(quantityOfferProgress);
    expect(steps).toEqual([0, 1 / 12, 1 / 6, 1 / 4, 1, 1, 1]);
    steps.forEach((v, i) => i && expect(v).toBeGreaterThanOrEqual(steps[i - 1]));
    QUANTITY_OFFERS.slice(0, -1).forEach((offer, i) => expect(quantityOfferProgress(offer.minQuantity)).toBe(rungPosition(i)));
  });

  it("orders the rungs by rising threshold and rising reward", () => {
    for (let i = 1; i < QUANTITY_OFFERS.length; i += 1) {
      expect(QUANTITY_OFFERS[i].minQuantity).toBeGreaterThan(QUANTITY_OFFERS[i - 1].minQuantity);
      expect(QUANTITY_OFFERS[i].rate).toBeGreaterThan(QUANTITY_OFFERS[i - 1].rate);
    }
    expect(TOP_QUANTITY_OFFER.code).toBe("BUY4");
  });

  /* Literal on purpose, like OfferProgress.test.tsx: the ladder cannot move
     here without this failing, the prompt to move the Shopify codes too. */
  it("is the owner's ladder of 7 Nov 2026: Buy 3 20%, Buy 4 30%, and no Buy 2", () => {
    expect(QUANTITY_OFFERS.map(({ code, minQuantity, rate }) => [code, minQuantity, rate])).toEqual([
      ["BUY3", 3, 0.2],
      ["BUY4", 4, 0.3],
    ]);
    expect(PROMO_DISCOUNTS).toEqual({ FRIENDSANDFAMILY: 0.2, BUY3: 0.2, BUY4: 0.3, NAIRA10: 0.1 });
    expect(ACCEPTED_PROMO_CODES).not.toContain("BUY2");
  });

  /* Every grid of rungs (the bag's labels, the product page's box) takes one
     column per rung: two since 7 Nov 2026. A fixed grid-cols-3 left an empty
     third column once Buy 2 went. */
  it("lays every grid of rungs out in one column per rung", () => {
    expect(RUNG_GRID_COLS).toBe("grid-cols-2");
  });

  /* Every rung must be a real Shopify code at the same rate, or the bag quotes
     a discount the checkout will not give. */
  it("has every rung in the discount table at the same rate", () => {
    for (const offer of QUANTITY_OFFERS) {
      expect(PROMO_DISCOUNTS[offer.code]).toBe(offer.rate);
    }
  });
});

describe("addOnEffect: what one more piece does to the bag", () => {
  /* Two pieces earn no rung since 7 Nov 2026: ₹1,499 hoops beside a ₹2,399
     bracelet add all of ₹1,499 (it was ₹1,109 under Buy 2's 10%). */
  it("adds a second piece at its full price", () => {
    expect(addOnEffect({ subtotal: 2399, totalItems: 1 }, 1499)).toEqual({ adds: 1499, saves: 0, rate: 0 });
  });

  it("counts the third piece's 20% on the whole bag", () => {
    // 2,399 + 1,499 = 3,898 at full price; with a third ₹1,499, 5,397 at 20% is 4,317.60, so 4,318.
    expect(addOnEffect({ subtotal: 3898, totalItems: 2 }, 1499)).toEqual({ adds: 420, saves: 1079, rate: 0.2 });
    // Beside ₹2,399 + ₹1,799 (4,198): 5,697 at 20% is 4,557.60, so 4,558; it adds 360 and saves 1,139.
    expect(addOnEffect({ subtotal: 4198, totalItems: 2 }, 1499)).toEqual({ adds: 360, saves: 1139, rate: 0.2 });
  });

  /* The bag already takes 10% with the code (2,399 at 10% is 2,159.10, so
     2,159). Two pieces earn no rung, so the second piece keeps the code's
     10% and saves only that (3,898 at 10% is 3,508.20, so it adds 1,349).
     The step from 10% to 20% across the bag comes with the third piece, and
     only that step is counted: 3,508 becomes 4,318 (5,397 at 20% is
     4,317.60). */
  it("with a 10% code already in hand, counts only the step up to a richer rung", () => {
    expect(addOnEffect({ subtotal: 2399, totalItems: 1, promoCode: "NAIRA10" }, 1499)).toEqual({ adds: 1349, saves: 150, rate: 0.1 });
    expect(addOnEffect({ subtotal: 3898, totalItems: 2, promoCode: "NAIRA10" }, 1499)).toEqual({ adds: 810, saves: 689, rate: 0.2 });
  });

  /* FRIENDSANDFAMILY on two pieces is already 20%; the third piece hands over
     to BUY3 at the same 20%, so it saves only its own 20%: 3,898 at 20% is
     3,118 (3,118.40), 5,397 at 20% is 4,318 (4,317.60), so it adds 1,200. */
  it("with a 20% code on two pieces, the third piece saves only its own 20%", () => {
    expect(addOnEffect({ subtotal: 3898, totalItems: 2, promoCode: "FRIENDSANDFAMILY" }, 1499)).toEqual({ adds: 1200, saves: 299, rate: 0.2 });
  });

  /* The fourth piece moves the WHOLE bag from 20% to 30%. Three pieces,
     1,499 + 2,399 + 1,799 = 5,697, are 4,557.60 at 20%, so 4,558. A ₹1,299
     fourth makes 6,996, 4,897.20 at 30%, so 4,897: it adds 339 and saves 960.
     A ₹1,499 fourth makes 7,196, 5,037.20 at 30%, so 5,037: it adds 479 and
     saves 1,020. */
  it("counts the fourth piece's 30% on the whole bag", () => {
    expect(addOnEffect({ subtotal: 5697, totalItems: 3 }, 1299)).toEqual({ adds: 339, saves: 960, rate: 0.3 });
    expect(addOnEffect({ subtotal: 5697, totalItems: 3 }, 1499)).toEqual({ adds: 479, saves: 1020, rate: 0.3 });
  });

  /* From four pieces there is no rung left: a fifth ₹999 piece saves only its
     own 30%. 6,996 at 30% is 4,897 (4,897.20); 7,995 at 30% is 5,597
     (5,596.50, rounded half up as the bag rounds), so it adds 700. */
  it("past the top rung, a piece saves only its own 30%", () => {
    expect(addOnEffect({ subtotal: 6996, totalItems: 4 }, 999)).toEqual({ adds: 700, saves: 299, rate: 0.3 });
  });
});

describe("ladderHeadline: the ladder's line in the bag", () => {
  /* The first rung is the third piece since 7 Nov 2026. One piece is two
     away from it, two pieces one away: both lines name the third piece and
     its 20%, never a second piece or 10%. */
  it("on one piece, points at the third piece and its 20%", () => {
    expect(ladderHeadline(1)).toBe("Your third piece takes 20% off your bag");
  });

  it("on two pieces, says a third piece takes 20%", () => {
    expect(ladderHeadline(2)).toBe("A third piece takes 20% off your bag");
  });

  it("never names a second piece or 10% as a rung", () => {
    for (let n = 0; n <= 5; n++) {
      expect(ladderHeadline(n)).not.toMatch(/second|10%/);
    }
  });

  /* NAIRA10 on two pieces: the bag has the code's 10%, and the third piece
     makes it 20%. */
  it("says what a 10% code gives and what a third piece adds", () => {
    expect(ladderHeadline(2, 0.1)).toBe("10% off your bag · a third piece makes it 20%");
  });

  /* Three pieces are no longer the top: the line names the fourth piece and
     its 30%, never "the best price" at 20%. */
  it("at three pieces, names the fourth piece and its 30%", () => {
    expect(ladderHeadline(3, 0.2)).toBe("20% off your bag · a fourth piece makes it 30%");
  });

  it("stops at the top rung", () => {
    expect(ladderHeadline(4, 0.3)).toBe("30% off your bag, the best price");
    expect(ladderHeadline(5, 0.3)).toBe("30% off your bag, the best price");
  });

  /* A 10% code is worth less than any rung, so the line names Buy 3; a 20%
     code already matches Buy 3, so the line skips to the four-piece one. */
  it("never offers a saving already in hand from a code", () => {
    expect(ladderHeadline(1, 0.1)).toBe("10% off your bag · your third piece makes it 20%");
    expect(ladderHeadline(1, 0.2)).toBe("20% off your bag · your fourth piece makes it 30%");
    expect(ladderHeadline(2, 0.2)).toBe("20% off your bag · your fourth piece makes it 30%");
  });
});


/* The ladder end to end, as the bag totals it: no discount on one or two
   pieces, 20% on three, 30% on four or more, across mixed prices, rounded
   once on the bag. A typed code is the only thing that discounts one or two
   pieces. */
describe("the ladder on whole bags", () => {
  const total = (prices: number[], promoCode: string | null = null) =>
    discountedSubtotal(
      prices.reduce((sum, p) => sum + p, 0),
      resolveCartDiscount({ totalItems: prices.length, promoCode }),
    );

  it.each([
    ["one piece", [2399], null, 2399, null],
    ["two of a kind", [999, 999], null, 1998, null],
    ["two, mixed", [2399, 999], null, 3398, null],
    // 3,398 at 10% is 3,058.20.
    ["two, mixed, with NAIRA10", [2399, 999], "NAIRA10", 3058, "NAIRA10"],
    // 3,398 at 20% is 2,718.40.
    ["two, mixed, with FRIENDSANDFAMILY", [2399, 999], "FRIENDSANDFAMILY", 2718, "FRIENDSANDFAMILY"],
    ["two, mixed, with BUY2 typed", [2399, 999], "BUY2", 3398, null],
    // 2,997 at 20% is 2,397.60.
    ["three of a kind", [999, 999, 999], null, 2398, "BUY3"],
    // 4,897 at 20% is 3,917.60.
    ["three, mixed", [2399, 1499, 999], null, 3918, "BUY3"],
    ["three, mixed, with BUY2 typed", [2399, 1499, 999], "BUY2", 3918, "BUY3"],
    // 6,996 at 30% is 4,897.20.
    ["four, mixed", [2399, 2399, 1199, 999], null, 4897, "BUY4"],
    // 5,996 at 30% is 4,197.20.
    ["four of a kind", [1499, 1499, 1499, 1499], null, 4197, "BUY4"],
    // 1,499 + 2,399 + 1,799 + 1,299 + 999 = 7,995; at 30% 5,596.50, rounded half up.
    ["five, mixed", [1499, 2399, 1799, 1299, 999], null, 5597, "BUY4"],
  ] as const)("%s", (_name, prices, typed, charged, code) => {
    expect(total([...prices], typed)).toBe(charged);
    expect(resolveCartDiscount({ totalItems: prices.length, promoCode: typed }).code).toBe(code);
  });
});

/* What the product page quotes per piece at each rung. Rounded as the bag
   rounds, from the piece's own price, never typed in. */
describe("pieceAtRung", () => {
  const [buy3, buy4] = QUANTITY_OFFERS;
  /* Worked by hand: 999 x 0.8 = 799.20 and x 0.7 = 699.30; 1,199: 959.20 and
     839.30; 1,499: 1,199.20 and 1,049.30; 1,799: 1,439.20 and 1,259.30;
     2,399: 1,919.20 and 1,679.30. */
  it.each([
    [999, 799, 699],
    [1199, 959, 839],
    [1499, 1199, 1049],
    [1799, 1439, 1259],
    [2399, 1919, 1679],
  ])("₹%i comes to ₹%i at three and ₹%i at four", (price, three, four) => {
    expect(pieceAtRung(price, buy3)).toBe(three);
    expect(pieceAtRung(price, buy4)).toBe(four);
  });

  /* Two of a piece cost exactly twice the price (no rung); three or four can
     sit ₹1 under the bag's total (it rounds the total once), never over it. */
  it("charges two pieces in full and is never above the bag at three or four", () => {
    for (const price of [599, 799, 999, 1199, 1299, 1499, 1799, 1899, 2399, 2499, 2749]) {
      expect(discountedSubtotal(2 * price, resolveCartDiscount({ totalItems: 2 }))).toBe(2 * price);
      for (const [n, rung] of [[3, buy3], [4, buy4]] as const) {
        const bag = discountedSubtotal(n * price, resolveCartDiscount({ totalItems: n }));
        expect(bag - n * pieceAtRung(price, rung)).toBeGreaterThanOrEqual(0);
        expect(bag - n * pieceAtRung(price, rung)).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("pdpOfferStatus: the product page's offer line", () => {
  it("says the rungs need no code while the bag is empty", () => {
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0 }, 999)).toBe("Applied in your bag. No code needed.");
  });

  /* A ₹1,199 piece in the bag: a ₹999 one makes two, which earn no rung, so
     the line quotes no saving (no "0% off") and says what the third does. */
  it("as the second piece, says one more piece takes 20%", () => {
    expect(pdpOfferStatus({ subtotal: 1199, totalItems: 1 }, 999)).toBe("Add to bag, and one more piece takes 20% off everything.");
    for (const price of [599, 999, 1499, 2399]) {
      expect(pdpOfferStatus({ subtotal: 1499, totalItems: 1 }, price)).not.toMatch(/\b10%|\b0% off|₹/);
    }
  });

  it("prices this piece as the third", () => {
    // 2,198 at full price; with another 999, 3,197 at 20% is 2,558 (2,557.60).
    expect(pdpOfferStatus({ subtotal: 2198, totalItems: 2 }, 999)).toBe("Add to bag for 20% off everything: it adds ₹360, not ₹999.");
  });

  /* A cheap piece that lifts a dear two-piece bag to 20% lowers its total:
     ₹2,749 + ₹2,399 = 5,148 at full price; with ₹599 more at 20% it is 4,598
     (5,747 at 20% is 4,597.60), 550 less. Two ₹2,399 pieces, 4,798, with
     ₹599 more are 4,318 (5,397 at 20% is 4,317.60), 480 less. Two ₹1,199
     pieces, 2,398, with ₹599 more are 2,398 again (2,997 at 20% is
     2,397.60). */
  it("says the total drops rather than adding a negative amount", () => {
    expect(pdpOfferStatus({ subtotal: 5148, totalItems: 2 }, 599)).toBe("Add to bag for 20% off everything: your total drops ₹550.");
    expect(pdpOfferStatus({ subtotal: 4798, totalItems: 2 }, 599)).toBe("Add to bag for 20% off everything: your total drops ₹480.");
    expect(pdpOfferStatus({ subtotal: 2398, totalItems: 2 }, 599)).toBe("Add to bag for 20% off everything: your total stays the same.");
  });

  /* Three pieces are not the top any more: the fourth takes the whole bag to
     30%. 2,997 at 20% is 2,398 (2,397.60); with another 999 it is 3,996 at
     30%, 2,797 (2,797.20), so this piece adds 399. */
  it("prices this piece as the fourth, which takes the bag to 30%", () => {
    expect(pdpOfferStatus({ subtotal: 2997, totalItems: 3 }, 999)).toBe("Add to bag for 30% off everything: it adds ₹399, not ₹999.");
  });

  /* At the top rung the box's gold Buy 4 column already prices this piece:
     999 at 30% is ₹699 (699.30, as Shopify charges it). The bag's own maths
     put it at ₹700 (3,996 at 30% is 2,797; with another 999, 4,995 at 30% is
     3,497, from 3,496.50 rounded half up), and "adding this costs ₹700" one
     line under "₹699 each" read as the same claim ₹1 apart. The line names
     the rate and leaves the figure to the column. */
  it("at the top rung, says the bag has 30% and leaves this piece's price to the box", () => {
    expect(pdpOfferStatus({ subtotal: 3996, totalItems: 4 }, 999)).toBe("30% off is on your bag, this piece included.");
  });

  /* Every price the store sells at, in bags of four to eight: no second
     rupee figure for this piece under the rung's column. At the old 20% top
     rung the clash almost never reached the screen; at 30% it showed in most
     four-piece bags (₹1,199: "₹839 each" over "costs ₹840"). */
  it("never quotes a second price for this piece at a rung the bag already has", () => {
    const prices = [599, 799, 999, 1199, 1299, 1499, 1799, 1899, 2399, 2499, 2749];
    for (const price of prices) {
      for (const other of prices) {
        for (let n = 4; n <= 8; n++) {
          expect(pdpOfferStatus({ subtotal: other * n, totalItems: n }, price)).toBe("30% off is on your bag, this piece included.");
        }
      }
    }
  });

  /* A typed code that hands over to a rung at the same rate:
     FRIENDSANDFAMILY on two becomes BUY3 (20%) with this one. The rate stays
     and it is that rung's column, so the line leaves the figure to it.
     NAIRA10 has no rung to hand over to on two pieces any more, so as the
     second piece it keeps its own figure: 1,199 at 10% is 1,079 (1,079.10),
     2,198 at 10% is 1,978 (1,978.20), so this piece costs 899. As the third,
     the bag moves from the code's 10% to BUY3's 20%: 1,978 becomes 2,558
     (3,197 at 20% is 2,557.60), 580 more. */
  it("leaves the figure to the column only when a typed code hands over to its rung", () => {
    expect(pdpOfferStatus({ subtotal: 2398, totalItems: 2, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("20% off is on your bag, this piece included.");
    expect(pdpOfferStatus({ subtotal: 1199, totalItems: 1, promoCode: "NAIRA10" }, 999)).toBe("10% off is on your bag: adding this costs ₹899, not ₹999.");
    expect(pdpOfferStatus({ subtotal: 2198, totalItems: 2, promoCode: "NAIRA10" }, 999)).toBe("Add to bag for 20% off everything: it adds ₹580, not ₹999.");
  });

  /* A typed code is never offered back as a saving. FRIENDSANDFAMILY's 20%
     already matches BUY3, so the line names only the four-piece 30%;
     NAIRA10's 10% is under BUY3, so the line names the three-piece 20%. With
     one piece in the bag and FRIENDSANDFAMILY typed, the second piece stays
     at the code's 20%: 2,198 at 20% is 1,758 (1,758.40), against 1,199 at
     20% = 959 (959.20), so this piece costs 799. */
  it("never offers a saving a typed code already gives", () => {
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("Your code takes 20% off. 4 pieces take 30%.");
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode: "NAIRA10" }, 999)).toBe("Your code takes 10% off. 3 pieces take 20%.");
    expect(pdpOfferStatus({ subtotal: 1199, totalItems: 1, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("20% off is on your bag: adding this costs ₹799, not ₹999.");
  });

  /* A BUY2 left in storage is no code: the empty bag says the rungs need
     none, and one piece in the bag hears what the third piece does. */
  it("treats a typed BUY2 as no code", () => {
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode: "BUY2" }, 999)).toBe("Applied in your bag. No code needed.");
    expect(pdpOfferStatus({ subtotal: 1199, totalItems: 1, promoCode: "BUY2" }, 999)).toBe("Add to bag, and one more piece takes 20% off everything.");
  });
});
