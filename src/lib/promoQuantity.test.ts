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
     codes (BUY2 10%, BUY3 20% since 3 Nov 2026, both min-quantity scoped to
     `discount-scope-all`). A rate that is generous here and stingy there
     quotes the shopper a total Fastrr never charges. */
  it("earns 10% on the second piece without the shopper typing anything", () => {
    expect(resolveCartDiscount({ totalItems: 2 })).toEqual({ code: "BUY2", rate: 0.1, automatic: true });
  });

  it("climbs to 20% on the third piece", () => {
    expect(resolveCartDiscount({ totalItems: 3 })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
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
    expect(r.rate).toBe(0.2);
  });

  /* FRIENDSANDFAMILY is 20%: since 3 Nov 2026 it TIES the top rung (BUY3,
     20%) and sits over the two-piece one (BUY2, 10%). In Shopify it covers
     only the jewellery collections, while BUY3 covers every product
     (discount-scope-all, read 2 Nov 2026), so handing Fastrr FRIENDSANDFAMILY
     on the tie would charge an outfit in the bag full price against a bag
     that quoted 20% off it. The rung wins the tie, at three pieces and
     beyond; one piece still gets the typed 20%. */
  it("hands Fastrr the rung, not the narrower 20% code, on the three-piece tie", () => {
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "FRIENDSANDFAMILY" })).toEqual({
      code: "BUY3",
      rate: 0.2,
      automatic: true,
    });
    expect(resolveCartDiscount({ totalItems: 4, promoCode: "FRIENDSANDFAMILY" })).toEqual({
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
    expect(r).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
  });

  /* At 10% and 20% no rung is richer than the 20% code (the third piece only
     ties it, above), so the strict comparison now runs the other way: on two
     pieces the typed 20% beats the 10% rung and is the code handed over. */
  it("lets the 20% code out-earn the two-piece rung", () => {
    const r = resolveCartDiscount({ totalItems: 2, promoCode: "FRIENDSANDFAMILY" });
    expect(r).toEqual({ code: "FRIENDSANDFAMILY", rate: 0.2, automatic: false });
  });

  /* A shopper who typed BUY2 into a two-piece bag gets exactly what the bag
     earned. They must see the code they entered, not be told the bag did it
     for them. The charge is identical either way; this is about not confusing
     them. */
  it("keeps the typed code on an exact tie so the shopper sees the one they entered", () => {
    const r = resolveCartDiscount({ totalItems: 2, promoCode: "BUY2" });
    expect(r).toEqual({ code: "BUY2", rate: 0.1, automatic: false });
  });

  /* Shopify holds BUY2 to 2 or more pieces and BUY3 to 3 or more. Typed by
     hand into a smaller bag, the bag must not quote a rate checkout refuses. */
  it("gives a typed rung code nothing below its own minimum", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "BUY2" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "BUY3" })).toEqual({ code: "BUY2", rate: 0.1, automatic: true });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "BUY3" })).toEqual({ code: "BUY3", rate: 0.2, automatic: false });
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
     than, or a shopper who earned BUY3's 20% would be charged at 10%. */
  it("accepts the welcome code on a bag the ladder does not reach", () => {
    expect(ACCEPTED_PROMO_CODES).toContain("NAIRA10");
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "NAIRA10" })).toEqual({
      code: "NAIRA10",
      rate: 0.1,
      automatic: false,
    });
  });

  /* Since 3 Nov 2026 NAIRA10 (10%) TIES the two-piece rung (BUY2, 10%) and
     sits under the top one (BUY3, 20%). On the tie the bag names the rung,
     not the code, as it does on every tie with a code that is not the rung
     itself; the third piece out-earns the code outright. */
  it("hands the rung on the two-piece tie with the welcome code, and lets the third piece out-earn it", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" })).toEqual({
      code: "BUY2",
      rate: 0.1,
      automatic: true,
    });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "NAIRA10" })).toEqual({
      code: "BUY3",
      rate: 0.2,
      automatic: true,
    });
  });
});

describe("discountedSubtotal", () => {
  it("takes 10% off a two-piece bag", () => {
    // 2 x 1199 = 2398, less 10% (239.80) = 2158.20.
    expect(discountedSubtotal(2398, resolveCartDiscount({ totalItems: 2 }))).toBe(2158);
  });

  /* The four-piece bag was the one driven through the live Fastrr checkout,
     which returned totalDiscount 1779.20 on 8896 when the top rung was 20%,
     the bag's own figure to the rupee. The top rung is 20% again since 3 Nov
     2026, so the bag is that same 8896 less 1779.20 = 7116.80. */
  it("takes the top rung off the four-piece bag Fastrr was driven with", () => {
    expect(discountedSubtotal(8896, resolveCartDiscount({ totalItems: 4 }))).toBe(7117);
  });

  it("leaves the subtotal alone when nothing applies", () => {
    expect(discountedSubtotal(1199, resolveCartDiscount({ totalItems: 1 }))).toBe(1199);
  });
});

describe("the offer ladder", () => {
  it("counts down to the next rung, not the first", () => {
    expect(itemsToQuantityOffer(0)).toBe(2);
    expect(itemsToQuantityOffer(1)).toBe(1);
    // Two pieces earned 10%; the bar now points at the 3-piece rung.
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
  it("adds ₹1,109 and saves ₹390 when ₹1,499 hoops join a ₹2,399 bracelet", () => {
    // 3,898 at 10% is 3,508.20, against 2,399 for the bracelet alone.
    expect(addOnEffect({ subtotal: 2399, totalItems: 1 }, 1499)).toEqual({ adds: 1109, saves: 390, rate: 0.1 });
  });

  it("counts the third piece's 20% on the whole bag", () => {
    // 2,399 + 1,499 at 10% is 3,508.20; with a third ₹1,499 at 20% it is 4,317.60.
    expect(addOnEffect({ subtotal: 3898, totalItems: 2 }, 1499)).toEqual({ adds: 810, saves: 689, rate: 0.2 });
  });

  /* The bag already takes 10% with the code (2,399 at 10% is 2,159.10, so
     2,159). The second piece's rung is also 10%, so it brings no step: the
     piece saves only its own 10% (3,898 at 10% is 3,508.20, so it adds
     1,349). The step from 10% to 20% across the bag comes with the third
     piece, and only that step is counted: 3,508 becomes 4,318 (4,317.60). */
  it("with a 10% code already in hand, counts only the step up to a richer rung", () => {
    expect(addOnEffect({ subtotal: 2399, totalItems: 1, promoCode: "NAIRA10" }, 1499)).toEqual({ adds: 1349, saves: 150, rate: 0.1 });
    expect(addOnEffect({ subtotal: 3898, totalItems: 2, promoCode: "NAIRA10" }, 1499)).toEqual({ adds: 810, saves: 689, rate: 0.2 });
  });
});

describe("ladderHeadline: the band over the bag", () => {
  it("names what a second piece does, as the plan's mock-up reads", () => {
    expect(ladderHeadline(1)).toBe("A second piece takes 10% off your bag");
  });

  it("says what the bag has and what a third piece adds", () => {
    expect(ladderHeadline(2, 0.1)).toBe("10% off your bag · a third piece makes it 20%");
  });

  it("stops at the top rung", () => {
    expect(ladderHeadline(3, 0.2)).toBe("20% off your bag, the best price");
    expect(ladderHeadline(5, 0.2)).toBe("20% off your bag, the best price");
  });

  /* A 10% code already matches the 10% rung, so the line skips it and names
     only the rung worth more; a 20% code already matches the top rung, so
     there is no rung left to offer. */
  it("never offers a saving already in hand from a code", () => {
    expect(ladderHeadline(1, 0.1)).toBe("10% off your bag · 3 pieces make it 20%");
    expect(ladderHeadline(1, 0.2)).toBe("20% off your bag, the best price");
  });
});


/* The ladder end to end, as the bag totals it: no discount on one piece, 10%
   on two, 20% on three or more, across mixed prices, rounded once on the bag. */
describe("the ladder on whole bags", () => {
  const total = (prices: number[], promoCode: string | null = null) =>
    discountedSubtotal(
      prices.reduce((sum, p) => sum + p, 0),
      resolveCartDiscount({ totalItems: prices.length, promoCode }),
    );

  it.each([
    ["one piece", [2399], 2399, null],
    ["two of a kind", [999, 999], 1798, "BUY2"],
    ["two, mixed", [2399, 999], 3058, "BUY2"],
    ["three of a kind", [999, 999, 999], 2398, "BUY3"],
    ["three, mixed", [2399, 1499, 999], 3918, "BUY3"],
    ["four, mixed", [2399, 2399, 1199, 999], 5597, "BUY3"],
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
    [999, 899, 799],
    [1199, 1079, 959],
    [1499, 1349, 1199],
    [1799, 1619, 1439],
    [2399, 2159, 1919],
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

  /* A ₹1,199 piece in the bag: a ₹999 one makes it 2,198 at 10% = 1,978.20,
     so the total goes up by 779, the figure the bag then shows. */
  it("prices this piece as the second, by the bag's own maths", () => {
    expect(pdpOfferStatus({ subtotal: 1199, totalItems: 1 }, 999)).toBe("Add to bag for 10% off everything: it adds ₹779, not ₹999.");
  });

  it("prices this piece as the third", () => {
    // 2,198 at 10% is 1,978; with another 999 at 20% it is 2,558 (2,557.60).
    expect(pdpOfferStatus({ subtotal: 2198, totalItems: 2 }, 999)).toBe("Add to bag for 20% off everything: it adds ₹580, not ₹999.");
  });

  /* A cheap piece that lifts a dear two-piece bag to 20% lowers its total:
     ₹2,749 + ₹2,399 = 5,148 at 10% is 4,633 (4,633.20); with ₹599 more at
     20% it is 4,598 (5,747 at 20% is 4,597.60). Two ₹2,399 pieces, 4,798 at
     10%, are 4,318 (4,318.20); with ₹599 more at 20% they are 4,318 again
     (5,397 at 20% is 4,317.60). */
  it("says the total drops rather than adding a negative amount", () => {
    expect(pdpOfferStatus({ subtotal: 5148, totalItems: 2 }, 599)).toBe("Add to bag for 20% off everything: your total drops ₹35.");
    expect(pdpOfferStatus({ subtotal: 4798, totalItems: 2 }, 599)).toBe("Add to bag for 20% off everything: your total stays the same.");
  });

  /* 2,997 at 20% is 2,398 (2,397.60); with another 999 it is 3,996 at 20%,
     3,197 (3,196.80), so this piece costs 799. */
  it("at the top rung, says the bag has 20% and what this piece adds", () => {
    expect(pdpOfferStatus({ subtotal: 2997, totalItems: 3 }, 999)).toBe("20% off is on your bag: adding this costs ₹799, not ₹999.");
  });

  /* A typed code is never offered back as a saving. FRIENDSANDFAMILY's 20%
     already matches the top rung, so there is no rung to offer; NAIRA10's 10%
     matches BUY2, so the line names only the three-piece 20%. With one piece
     in the bag and FRIENDSANDFAMILY typed, the second piece stays at the
     code's 20% (it beats BUY2's 10%): 2,198 at 20% is 1,758 (1,758.40),
     against 1,199 at 20% = 959 (959.20), so this piece costs 799. */
  it("never offers a saving a typed code already gives", () => {
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("Your code takes 20% off, the best price.");
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode: "NAIRA10" }, 999)).toBe("Your code takes 10% off. 3 pieces take 20%.");
    expect(pdpOfferStatus({ subtotal: 1199, totalItems: 1, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("20% off is on your bag: adding this costs ₹799, not ₹999.");
  });
});
