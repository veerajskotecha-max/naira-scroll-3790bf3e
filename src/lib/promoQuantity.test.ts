import { describe, expect, it } from "vitest";
import {
  ACCEPTED_PROMO_CODES,
  PROMO_DISCOUNTS,
  addOnEffect,
  ladderHeadline,
  QUANTITY_OFFERS,
  TOP_QUANTITY_OFFER,
  discountedSubtotal,
  earnedQuantityOffer,
  pdpOfferStatus,
  pieceAtRung,
  itemsToQuantityOffer,
  nextQuantityOffer,
  quantityOfferProgress,
  resolveCartDiscount,
} from "./promo";

/**
 * The bag's total and the total Fastrr charges both come from this resolver.
 * Every case here is a rupee amount a shopper would otherwise see quoted and
 * then not be given.
 */
describe("resolveCartDiscount", () => {
  it("gives nothing for a single piece and no code", () => {
    expect(resolveCartDiscount({ totalItems: 1 })).toEqual({ code: null, rate: 0, automatic: false });
  });

  /* These two rates are not free to drift: they must match the live Shopify
     codes (BUY2 20%, BUY3 30%, both min-quantity scoped to
     `discount-scope-all`). A rate that is generous here and stingy there
     quotes the shopper a total Fastrr never charges. */
  it("earns 20% on the second piece without the shopper typing anything", () => {
    expect(resolveCartDiscount({ totalItems: 2 })).toEqual({ code: "BUY2", rate: 0.2, automatic: true });
  });

  it("climbs to 30% on the third piece", () => {
    expect(resolveCartDiscount({ totalItems: 3 })).toEqual({ code: "BUY3", rate: 0.3, automatic: true });
  });

  it("keeps the top rung beyond its threshold", () => {
    expect(resolveCartDiscount({ totalItems: 9 }).code).toBe("BUY3");
  });

  /* Only ONE code can reach Fastrr — comma-joining two was tested live and made
     it apply neither — so the resolver must return exactly one, never a pair. */
  it("returns a single code, never a combination", () => {
    const r = resolveCartDiscount({ totalItems: 3, promoCode: "FRIENDSANDFAMILY" });
    expect(typeof r.code).toBe("string");
    expect(r.code).not.toContain(",");
    expect(r.rate).toBe(0.3);
  });

  /* FRIENDSANDFAMILY is 20%: it TIES the two-piece rung (20%) and sits under
     the top one (30%). In Shopify it covers only the jewellery collections,
     while BUY2 covers every product (discount-scope-all, read 2 Nov 2026), so
     handing Fastrr FRIENDSANDFAMILY on the tie would charge an outfit in the
     bag full price against a bag that quoted 20% off it. The rung wins the
     tie; one piece still gets the typed 20%, and the third piece takes 30%. */
  it("hands Fastrr the rung, not the narrower 20% code, on the two-piece tie", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "FRIENDSANDFAMILY" })).toEqual({
      code: "BUY2",
      rate: 0.2,
      automatic: true,
    });
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "FRIENDSANDFAMILY" })).toEqual({
      code: "FRIENDSANDFAMILY",
      rate: 0.2,
      automatic: false,
    });
  });

  /* The same bag must always resolve to the same one code, whatever order the
     codes were typed in or how often it is asked. */
  it("is deterministic: one code per bag and code, every time", () => {
    for (const promoCode of [null, "NAIRA10", "FRIENDSANDFAMILY", "BUY2", "BUY3", "junk"]) {
      for (let totalItems = 0; totalItems <= 4; totalItems++) {
        const first = resolveCartDiscount({ totalItems, promoCode });
        expect(resolveCartDiscount({ totalItems, promoCode })).toEqual(first);
        expect(first.code ?? "").not.toContain(",");
        // Never less than the rung the bag has earned.
        expect(first.rate).toBeGreaterThanOrEqual(earnedQuantityOffer(totalItems)?.rate ?? 0);
      }
    }
  });

  /* The rungs must stay ordered: a 2-piece rung that silently outranked the
     3-piece one would undercharge every full bag. */
  it("keeps the 2-piece rung below the 3-piece rung", () => {
    expect(resolveCartDiscount({ totalItems: 2 }).rate).toBeLessThan(
      resolveCartDiscount({ totalItems: 3 }).rate,
    );
  });

  it("keeps the earned rung when it beats the typed code", () => {
    const r = resolveCartDiscount({ totalItems: 3, promoCode: "BUY2" });
    expect(r).toEqual({ code: "BUY3", rate: 0.3, automatic: true });
  });

  it("lets the third piece out-earn the 20% code", () => {
    const r = resolveCartDiscount({ totalItems: 3, promoCode: "FRIENDSANDFAMILY" });
    expect(r).toEqual({ code: "BUY3", rate: 0.3, automatic: true });
  });

  /* A shopper who typed BUY2 into a two-piece bag gets exactly what the bag
     earned. They must see the code they entered, not be told the bag did it
     for them. The charge is identical either way; this is about not confusing
     them. */
  it("keeps the typed code on an exact tie so the shopper sees the one they entered", () => {
    const r = resolveCartDiscount({ totalItems: 2, promoCode: "BUY2" });
    expect(r).toEqual({ code: "BUY2", rate: 0.2, automatic: false });
  });

  /* Shopify holds BUY2 to 2 or more pieces and BUY3 to 3 or more. Typed by
     hand into a smaller bag, the bag must not quote a rate checkout refuses. */
  it("gives a typed rung code nothing below its own minimum", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "BUY2" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "BUY3" })).toEqual({ code: "BUY2", rate: 0.2, automatic: true });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "BUY3" })).toEqual({ code: "BUY3", rate: 0.3, automatic: false });
  });

  it("falls back to the earned rung when the typed code is junk", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "NOTACODE" }).code).toBe("BUY2");
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

  /* NAIRA10 is live again (10%, all customers, no minimum). It must be
     ACCEPTED on a single-piece bag — that is two thirds of orders and the
     ladder gives them nothing — but it must never beat a rung it is worth less
     than, or a shopper who earned 20% would be charged at 10%. */
  it("accepts the welcome code on a bag the ladder does not reach", () => {
    expect(ACCEPTED_PROMO_CODES).toContain("NAIRA10");
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "NAIRA10" })).toEqual({
      code: "NAIRA10",
      rate: 0.1,
      automatic: false,
    });
  });

  /* NAIRA10 is worth less than either rung (10% against 20% and 30%), so the
     second piece already out-earns it and the bag names the rung, not the
     code. */
  it("lets both rungs out-earn the welcome code", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" })).toEqual({
      code: "BUY2",
      rate: 0.2,
      automatic: true,
    });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "NAIRA10" })).toEqual({
      code: "BUY3",
      rate: 0.3,
      automatic: true,
    });
  });
});

describe("discountedSubtotal", () => {
  it("takes 20% off a two-piece bag", () => {
    // 2 x 1199 = 2398, less 20% = 1918.40.
    expect(discountedSubtotal(2398, resolveCartDiscount({ totalItems: 2 }))).toBe(1918);
  });

  /* The four-piece bag was the one driven through the live Fastrr checkout,
     which returned totalDiscount 1779.20 on 8896 when the top rung was 20%,
     the bag's own figure to the rupee. At 30% the same bag is 8896 less
     2668.80 = 6227.20. */
  it("takes the top rung off the four-piece bag Fastrr was driven with", () => {
    expect(discountedSubtotal(8896, resolveCartDiscount({ totalItems: 4 }))).toBe(6227);
  });

  it("leaves the subtotal alone when nothing applies", () => {
    expect(discountedSubtotal(1199, resolveCartDiscount({ totalItems: 1 }))).toBe(1199);
  });
});

describe("the offer ladder", () => {
  it("counts down to the next rung, not the first", () => {
    expect(itemsToQuantityOffer(0)).toBe(2);
    expect(itemsToQuantityOffer(1)).toBe(1);
    // Two pieces earned 20%; the bar now points at the 3-piece rung.
    expect(itemsToQuantityOffer(2)).toBe(1);
  });

  it("is zero once the ladder is topped out", () => {
    expect(itemsToQuantityOffer(3)).toBe(0);
    expect(itemsToQuantityOffer(7)).toBe(0);
  });

  it("names the rung earned and the rung ahead", () => {
    expect(earnedQuantityOffer(1)).toBeNull();
    expect(nextQuantityOffer(1)?.code).toBe("BUY2");
    expect(earnedQuantityOffer(2)?.code).toBe("BUY2");
    expect(nextQuantityOffer(2)?.code).toBe("BUY3");
    expect(earnedQuantityOffer(3)?.code).toBe("BUY3");
    expect(nextQuantityOffer(3)).toBeNull();
  });

  /* Measured across the whole ladder so the bar never snaps backwards when a
     rung is cleared. */
  it("fills monotonically and caps at full", () => {
    const steps = [0, 1, 2, 3, 4].map(quantityOfferProgress);
    expect(steps).toEqual([0, 1 / 3, 2 / 3, 1, 1]);
    steps.forEach((v, i) => i && expect(v).toBeGreaterThanOrEqual(steps[i - 1]));
  });

  it("orders the rungs by rising threshold and rising reward", () => {
    for (let i = 1; i < QUANTITY_OFFERS.length; i += 1) {
      expect(QUANTITY_OFFERS[i].minQuantity).toBeGreaterThan(QUANTITY_OFFERS[i - 1].minQuantity);
      expect(QUANTITY_OFFERS[i].rate).toBeGreaterThan(QUANTITY_OFFERS[i - 1].rate);
    }
    expect(TOP_QUANTITY_OFFER.code).toBe("BUY3");
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
  it("adds ₹719 and saves ₹780 when ₹1,499 hoops join a ₹2,399 bracelet", () => {
    // 3,898 at 20% is 3,118.40, against 2,399 for the bracelet alone.
    expect(addOnEffect({ subtotal: 2399, totalItems: 1 }, 1499)).toEqual({ adds: 719, saves: 780, rate: 0.2 });
  });

  it("counts the third piece's 30% on the whole bag", () => {
    // 2,399 + 1,499 at 20% is 3,118.40; with a third ₹1,499 at 30% it is 3,777.90.
    expect(addOnEffect({ subtotal: 3898, totalItems: 2 }, 1499)).toEqual({ adds: 660, saves: 839, rate: 0.3 });
  });

  /* The bag already takes 10% with the code (2,159), so the second piece only
     adds the step from 10% to 20% across the bag, not the full 20%. */
  it("with a 10% code already in hand, counts only the step up to the rung", () => {
    expect(addOnEffect({ subtotal: 2399, totalItems: 1, promoCode: "NAIRA10" }, 1499)).toEqual({ adds: 959, saves: 540, rate: 0.2 });
  });
});

describe("ladderHeadline: the band over the bag", () => {
  it("names what a second piece does, as the plan's mock-up reads", () => {
    expect(ladderHeadline(1)).toBe("A second piece takes 20% off your bag");
  });

  it("says what the bag has and what a third piece adds", () => {
    expect(ladderHeadline(2, 0.2)).toBe("20% off your bag · a third piece makes it 30%");
  });

  it("stops at the top rung", () => {
    expect(ladderHeadline(3, 0.3)).toBe("30% off your bag, the best price");
    expect(ladderHeadline(5, 0.3)).toBe("30% off your bag, the best price");
  });

  /* A 20% code already matches the 20% rung, so the line skips it and names
     only the rung worth more. */
  it("never offers a saving already in hand from a code", () => {
    expect(ladderHeadline(1, 0.1)).toBe("10% off your bag · a second piece makes it 20%");
    expect(ladderHeadline(1, 0.2)).toBe("20% off your bag · 3 pieces make it 30%");
  });
});


/* The ladder end to end, as the bag totals it: no discount on one piece, 20%
   on two, 30% on three or more, across mixed prices, rounded once on the bag. */
describe("the ladder on whole bags", () => {
  const total = (prices: number[], promoCode: string | null = null) =>
    discountedSubtotal(
      prices.reduce((sum, p) => sum + p, 0),
      resolveCartDiscount({ totalItems: prices.length, promoCode }),
    );

  it.each([
    ["one piece", [2399], 2399, null],
    ["two of a kind", [999, 999], 1598, "BUY2"],
    ["two, mixed", [2399, 999], 2718, "BUY2"],
    ["three of a kind", [999, 999, 999], 2098, "BUY3"],
    ["three, mixed", [2399, 1499, 999], 3428, "BUY3"],
    ["four, mixed", [2399, 2399, 1199, 999], 4897, "BUY3"],
  ] as const)("%s", (_name, prices, charged, code) => {
    expect(total([...prices])).toBe(charged);
    expect(resolveCartDiscount({ totalItems: prices.length }).code).toBe(code);
  });
});

/* What the product page quotes per piece at each rung. Rounded as the bag
   rounds, from the piece's own price, never typed in. */
describe("pieceAtRung", () => {
  const [buy2, buy3] = QUANTITY_OFFERS;
  it.each([
    [999, 799, 699],
    [1199, 959, 839],
    [1499, 1199, 1049],
    [1799, 1439, 1259],
    [2399, 1919, 1679],
  ])("₹%i comes to ₹%i at two and ₹%i at three", (price, two, three) => {
    expect(pieceAtRung(price, buy2)).toBe(two);
    expect(pieceAtRung(price, buy3)).toBe(three);
  });

  /* Two of a piece cost exactly twice the quote; three can sit ₹1 under the
     bag's total (it rounds the total once), never over it. */
  it("matches the bag at two pieces and is never above it at three", () => {
    for (const price of [999, 1199, 1499, 1799, 1899, 2399, 2499]) {
      expect(2 * pieceAtRung(price, buy2)).toBe(discountedSubtotal(2 * price, resolveCartDiscount({ totalItems: 2 })));
      const bag3 = discountedSubtotal(3 * price, resolveCartDiscount({ totalItems: 3 }));
      expect(bag3 - 3 * pieceAtRung(price, buy3)).toBeGreaterThanOrEqual(0);
      expect(bag3 - 3 * pieceAtRung(price, buy3)).toBeLessThanOrEqual(1);
    }
  });
});

describe("pdpOfferStatus: the product page's offer line", () => {
  it("says the rungs need no code while the bag is empty", () => {
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0 }, 999)).toBe("Applied in your bag. No code needed.");
  });

  /* A ₹1,199 piece in the bag: a ₹999 one makes it 2,198 at 20% = 1,758.40,
     so the total goes up by 559, the figure the bag then shows. */
  it("prices this piece as the second, by the bag's own maths", () => {
    expect(pdpOfferStatus({ subtotal: 1199, totalItems: 1 }, 999)).toBe("Add this for 20% off the bag: it adds ₹559, not ₹999.");
  });

  it("prices this piece as the third", () => {
    // 2,198 at 20% is 1,758; with another 999 at 30% it is 2,238 (2,237.90).
    expect(pdpOfferStatus({ subtotal: 2198, totalItems: 2 }, 999)).toBe("Add this for 30% off the bag: it adds ₹480, not ₹999.");
  });

  it("at the top rung, says the bag has 30% and what this piece adds", () => {
    expect(pdpOfferStatus({ subtotal: 2997, totalItems: 3 }, 999)).toBe("30% off is on your bag: this adds ₹699, not ₹999.");
  });

  /* A typed code already worth 20% is never offered back as a saving. */
  it("never offers a saving a typed code already gives", () => {
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("Your code takes 20% off. 3 pieces take 30%.");
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode: "NAIRA10" }, 999)).toBe("Your code takes 10% off. 2 pieces take 20%.");
    expect(pdpOfferStatus({ subtotal: 1199, totalItems: 1, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("20% off is on your bag: this adds ₹799, not ₹999.");
  });
});
