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
  rungPosition,
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

  /* These rates are not free to drift: they must match the live Shopify
     codes (BUY2 10%, BUY3 20% since 3 Nov 2026, BUY4 30% since 7 Nov 2026,
     all min-quantity scoped to `discount-scope-all`). A rate that is generous
     here and stingy there quotes the shopper a total Fastrr never charges. */
  it("earns 10% on the second piece without the shopper typing anything", () => {
    expect(resolveCartDiscount({ totalItems: 2 })).toEqual({ code: "BUY2", rate: 0.1, automatic: true });
  });

  it("climbs to 20% on the third piece", () => {
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

  /* FRIENDSANDFAMILY is 20%: since 3 Nov 2026 it TIES the three-piece rung
     (BUY3, 20%) and sits over the two-piece one (BUY2, 10%). In Shopify it
     covers only the jewellery collections, while BUY3 covers every product
     (discount-scope-all, read 2 Nov 2026), so handing Fastrr FRIENDSANDFAMILY
     on the tie would charge an outfit in the bag full price against a bag
     that quoted 20% off it. The rung wins the tie at three pieces; from four
     BUY4's 30% beats the code outright; one piece still gets the typed 20%. */
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
     higher one would undercharge every full bag. */
  it("keeps each rung below the next one up", () => {
    expect(resolveCartDiscount({ totalItems: 2 }).rate).toBeLessThan(resolveCartDiscount({ totalItems: 3 }).rate);
    expect(resolveCartDiscount({ totalItems: 3 }).rate).toBeLessThan(resolveCartDiscount({ totalItems: 4 }).rate);
  });

  it("keeps the earned rung when it beats the typed code", () => {
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "BUY2" })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
    expect(resolveCartDiscount({ totalItems: 4, promoCode: "BUY3" })).toEqual({ code: "BUY4", rate: 0.3, automatic: true });
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

  /* Shopify holds BUY2 to 2 or more pieces, BUY3 to 3 or more and BUY4 to 4
     or more. Typed by hand into a smaller bag, the bag must not quote a rate
     checkout refuses. */
  it("gives a typed rung code nothing below its own minimum", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "BUY2" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "BUY3" })).toEqual({ code: "BUY2", rate: 0.1, automatic: true });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "BUY3" })).toEqual({ code: "BUY3", rate: 0.2, automatic: false });
  });

  /* BUY4 typed into a three-piece bag: Shopify would refuse it (4 or more),
     so it is worth nothing and the bag keeps the three-piece rung, BUY3 at
     20%. Handing Fastrr BUY4 here would apply no discount at all. */
  it("gives a typed BUY4 nothing below four pieces, and keeps BUY3 at three", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "BUY4" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "BUY4" })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
    expect(resolveCartDiscount({ totalItems: 4, promoCode: "BUY4" })).toEqual({ code: "BUY4", rate: 0.3, automatic: false });
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
     sits under the others (BUY3, 20%; BUY4, 30%). On the tie the bag names the
     rung, not the code, as it does on every tie with a code that is not the
     rung itself; the third and fourth pieces out-earn the code outright. */
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

  it("hands Fastrr BUY4, not the welcome code, at four pieces", () => {
    expect(resolveCartDiscount({ totalItems: 4, promoCode: "NAIRA10" })).toEqual({
      code: "BUY4",
      rate: 0.3,
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
    expect(itemsToQuantityOffer(0)).toBe(2);
    expect(itemsToQuantityOffer(1)).toBe(1);
    // Two pieces earned 10%; the bar now points at the 3-piece rung.
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
    expect(nextQuantityOffer(1)?.code).toBe("BUY2");
    expect(earnedQuantityOffer(2)?.code).toBe("BUY2");
    expect(nextQuantityOffer(2)?.code).toBe("BUY3");
    expect(earnedQuantityOffer(3)?.code).toBe("BUY3");
    expect(nextQuantityOffer(3)?.code).toBe("BUY4");
    expect(earnedQuantityOffer(4)?.code).toBe("BUY4");
    expect(nextQuantityOffer(4)).toBeNull();
  });

  /* The rungs share the track equally (1/6, 1/2, 5/6), so a label centred
     under each has a third of the width; placed by piece count, Buy 3 and
     Buy 4 sat a quarter apart with Buy 4 at the very end and their labels met
     at 280px. */
  it("centres each rung in its own third of the track", () => {
    expect(QUANTITY_OFFERS.map((_, i) => rungPosition(i))).toEqual([1 / 6, 1 / 2, 5 / 6]);
  });

  /* Measured across the whole ladder so the bar never snaps backwards when a
     rung is cleared: one piece is half way to Buy 2 (1/12), each rung is met
     exactly as it is reached, and four pieces fill it. */
  it("fills monotonically over four pieces, meets each rung, and caps at full", () => {
    const steps = [0, 1, 2, 3, 4, 5, 9].map(quantityOfferProgress);
    expect(steps).toEqual([0, 1 / 12, 1 / 6, 1 / 2, 1, 1, 1]);
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
  it("is the owner's ladder of 7 Nov 2026: Buy 2 10%, Buy 3 20%, Buy 4 30%", () => {
    expect(QUANTITY_OFFERS.map(({ code, minQuantity, rate }) => [code, minQuantity, rate])).toEqual([
      ["BUY2", 2, 0.1],
      ["BUY3", 3, 0.2],
      ["BUY4", 4, 0.3],
    ]);
    expect(PROMO_DISCOUNTS).toEqual({ FRIENDSANDFAMILY: 0.2, BUY2: 0.1, BUY3: 0.2, BUY4: 0.3, NAIRA10: 0.1 });
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

describe("ladderHeadline: the band over the bag", () => {
  it("names what a second piece does, as the plan's mock-up reads", () => {
    expect(ladderHeadline(1)).toBe("A second piece takes 10% off your bag");
  });

  it("says what the bag has and what a third piece adds", () => {
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

  /* A 10% code already matches the 10% rung, so the line skips it and names
     the next rung worth more; a 20% code already matches the three-piece
     rung, so the line skips to the four-piece one. */
  it("never offers a saving already in hand from a code", () => {
    expect(ladderHeadline(1, 0.1)).toBe("10% off your bag · 3 pieces make it 20%");
    expect(ladderHeadline(1, 0.2)).toBe("20% off your bag · 4 pieces make it 30%");
    expect(ladderHeadline(2, 0.2)).toBe("20% off your bag · 4 pieces make it 30%");
  });
});


/* The ladder end to end, as the bag totals it: no discount on one piece, 10%
   on two, 20% on three, 30% on four or more, across mixed prices, rounded
   once on the bag. */
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
    // 6,996 at 30% is 4,897.20.
    ["four, mixed", [2399, 2399, 1199, 999], 4897, "BUY4"],
    // 5,996 at 30% is 4,197.20.
    ["four of a kind", [1499, 1499, 1499, 1499], 4197, "BUY4"],
    // 1,499 + 2,399 + 1,799 + 1,299 + 999 = 7,995; at 30% 5,596.50, rounded half up.
    ["five, mixed", [1499, 2399, 1799, 1299, 999], 5597, "BUY4"],
  ] as const)("%s", (_name, prices, charged, code) => {
    expect(total([...prices])).toBe(charged);
    expect(resolveCartDiscount({ totalItems: prices.length }).code).toBe(code);
  });
});

/* What the product page quotes per piece at each rung. Rounded as the bag
   rounds, from the piece's own price, never typed in. */
describe("pieceAtRung", () => {
  const [buy2, buy3, buy4] = QUANTITY_OFFERS;
  /* Worked by hand: 999 x 0.7 = 699.30; 1,199 x 0.7 = 839.30; 1,499 x 0.7 =
     1,049.30; 1,799 x 0.7 = 1,259.30; 2,399 x 0.7 = 1,679.30. */
  it.each([
    [999, 899, 799, 699],
    [1199, 1079, 959, 839],
    [1499, 1349, 1199, 1049],
    [1799, 1619, 1439, 1259],
    [2399, 2159, 1919, 1679],
  ])("₹%i comes to ₹%i at two, ₹%i at three and ₹%i at four", (price, two, three, four) => {
    expect(pieceAtRung(price, buy2)).toBe(two);
    expect(pieceAtRung(price, buy3)).toBe(three);
    expect(pieceAtRung(price, buy4)).toBe(four);
  });

  /* Two of a piece cost exactly twice the quote; three or four can sit ₹1
     under the bag's total (it rounds the total once), never over it. */
  it("matches the bag at two pieces and is never above it at three or four", () => {
    for (const price of [599, 799, 999, 1199, 1299, 1499, 1799, 1899, 2399, 2499, 2749]) {
      expect(2 * pieceAtRung(price, buy2)).toBe(discountedSubtotal(2 * price, resolveCartDiscount({ totalItems: 2 })));
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

  /* A typed code that hands over to a rung at the same rate: NAIRA10 on one
     piece becomes BUY2 (10%) with this one, FRIENDSANDFAMILY on two becomes
     BUY3 (20%). The rate stays and it is that rung's column, so the line
     leaves the figure to it. */
  it("leaves the figure to the column when a typed code hands over to its rung", () => {
    expect(pdpOfferStatus({ subtotal: 1199, totalItems: 1, promoCode: "NAIRA10" }, 999)).toBe("10% off is on your bag, this piece included.");
    expect(pdpOfferStatus({ subtotal: 2398, totalItems: 2, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("20% off is on your bag, this piece included.");
  });

  /* A typed code is never offered back as a saving. FRIENDSANDFAMILY's 20%
     already matches BUY3, so the line names only the four-piece 30%;
     NAIRA10's 10% matches BUY2, so the line names the three-piece 20%. With
     one piece in the bag and FRIENDSANDFAMILY typed, the second piece stays
     at the code's 20% (it beats BUY2's 10%): 2,198 at 20% is 1,758
     (1,758.40), against 1,199 at 20% = 959 (959.20), so this piece costs
     799. */
  it("never offers a saving a typed code already gives", () => {
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("Your code takes 20% off. 4 pieces take 30%.");
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode: "NAIRA10" }, 999)).toBe("Your code takes 10% off. 3 pieces take 20%.");
    expect(pdpOfferStatus({ subtotal: 1199, totalItems: 1, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("20% off is on your bag: adding this costs ₹799, not ₹999.");
  });
});
