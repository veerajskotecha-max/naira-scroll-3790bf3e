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
     codes (BUY2 10% and BUY3 20%, both min-quantity scoped to
     `discount-scope-all`). A rate that is generous here and stingy there
     quotes the shopper a total Fastrr never charges. */
  it("earns 10% on the second piece without the shopper typing anything", () => {
    expect(resolveCartDiscount({ totalItems: 2 })).toEqual({ code: "BUY2", rate: 0.1, automatic: true });
  });

  it("climbs to 20% on the third piece", () => {
    expect(resolveCartDiscount({ totalItems: 3 })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
  });

  /* The owner took Buy 4 away on 25 Nov 2026 ("Remove buy 4 offer"). Three
     pieces are the top rung, and BUY3 in Shopify is "3 or more": a fourth
     piece, and every one after it, stays at 20% on BUY3. */
  it("stays at 20% on the fourth piece, and hands Fastrr BUY3", () => {
    expect(resolveCartDiscount({ totalItems: 4 })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
  });

  it("keeps BUY3 on a fifth piece and beyond", () => {
    expect(resolveCartDiscount({ totalItems: 5 })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
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

  /* FRIENDSANDFAMILY is 20%: it TIES the three-piece rung (BUY3, 20%) and
     sits over the two-piece one (BUY2, 10%). In Shopify it covers only the
     jewellery collections, while BUY3 covers every product
     (discount-scope-all, read 2 Nov 2026), so handing Fastrr FRIENDSANDFAMILY
     on the tie would charge an outfit in the bag full price against a bag
     that quoted 20% off it. The rung wins the tie from three pieces on (no
     richer rung follows since Buy 4 went on 25 Nov 2026); one and two pieces
     still get the typed 20%. */
  it("hands Fastrr the rung, not the narrower 20% code, on the tie from three pieces", () => {
    for (const totalItems of [3, 4, 5, 9]) {
      expect(resolveCartDiscount({ totalItems, promoCode: "FRIENDSANDFAMILY" })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
    }
    for (const totalItems of [1, 2]) {
      expect(resolveCartDiscount({ totalItems, promoCode: "FRIENDSANDFAMILY" })).toEqual({
        code: "FRIENDSANDFAMILY",
        rate: 0.2,
        automatic: false,
      });
    }
  });

  /* No typed code is worth more than the top rung's 20%, so from three
     pieces the bag hands Fastrr BUY3 whatever was typed: the one code that
     gives the most and covers every product. BUY3 typed by hand is the same
     code at the same rate, named as typed. */
  it("hands Fastrr BUY3 at four pieces whatever code was typed", () => {
    for (const promoCode of [null, "NAIRA10", "FRIENDSANDFAMILY", "BUY2", "BUY4", "junk"]) {
      expect(resolveCartDiscount({ totalItems: 4, promoCode })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
    }
    expect(resolveCartDiscount({ totalItems: 4, promoCode: "BUY3" })).toEqual({ code: "BUY3", rate: 0.2, automatic: false });
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
     higher one would undercharge every full bag. Past the top rung the rate
     holds; it never falls back. */
  it("keeps each rung below the next one up, and the top rung's rate beyond it", () => {
    expect(resolveCartDiscount({ totalItems: 2 }).rate).toBeLessThan(resolveCartDiscount({ totalItems: 3 }).rate);
    expect(resolveCartDiscount({ totalItems: 4 }).rate).toBe(resolveCartDiscount({ totalItems: 3 }).rate);
  });

  it("keeps the earned rung when it beats the typed code", () => {
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "BUY2" })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "NAIRA10" })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
  });

  /* On two pieces the typed 20% beats the 10% rung and is the code handed
     over. */
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
     hand into a smaller bag, the bag must not quote a rate checkout
     refuses. */
  it("gives a typed rung code nothing below its own minimum", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "BUY2" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "BUY3" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "BUY3" })).toEqual({ code: "BUY2", rate: 0.1, automatic: true });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "BUY3" })).toEqual({ code: "BUY3", rate: 0.2, automatic: false });
  });

  /* BUY4 is no code at all since 25 Nov 2026: out of the ladder and out of
     the table of typed codes. Typed by hand, or left in storage from before,
     it is worth nothing and never reaches Fastrr; the bag keeps the rung it
     earned. Were it still accepted here, the bag would quote 30% off four
     pieces for as long as Shopify still held the code. */
  it("treats a typed BUY4 as no code, at any count", () => {
    expect(ACCEPTED_PROMO_CODES).not.toContain("BUY4");
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "BUY4" })).toEqual({ code: null, rate: 0, automatic: false });
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "BUY4" })).toEqual({ code: "BUY2", rate: 0.1, automatic: true });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "BUY4" })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
    expect(resolveCartDiscount({ totalItems: 4, promoCode: "BUY4" })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
    expect(resolveCartDiscount({ totalItems: 6, promoCode: "BUY4" })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
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

  /* NAIRA10 (10%) TIES the two-piece rung (BUY2, 10%) and sits under the
     three-piece one (BUY3, 20%). On the tie the bag names the rung, not the
     code, as it does on every tie with a code that is not the rung itself;
     the third piece out-earns the code outright. */
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

  it("hands Fastrr BUY3, not the welcome code, at four pieces", () => {
    expect(resolveCartDiscount({ totalItems: 4, promoCode: "NAIRA10" })).toEqual({
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
     which returned totalDiscount 1779.20 on 8896, the bag's own figure to
     the rupee. Three or more pieces take BUY3's 20%: 8896 less 1779.20 =
     7116.80, so 7117. A three-piece bag of 6747 less 1349.40 = 5397.60, so
     5398. */
  it("takes 20% off the four-piece bag Fastrr was driven with, and off a three-piece one", () => {
    expect(discountedSubtotal(8896, resolveCartDiscount({ totalItems: 4 }))).toBe(7117);
    expect(discountedSubtotal(6747, resolveCartDiscount({ totalItems: 3 }))).toBe(5398);
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
    // Three pieces are the top rung since 25 Nov 2026.
    expect(itemsToQuantityOffer(3)).toBe(0);
    expect(itemsToQuantityOffer(4)).toBe(0);
    expect(itemsToQuantityOffer(7)).toBe(0);
  });

  it("names the rung earned and the rung ahead", () => {
    expect(earnedQuantityOffer(1)).toBeNull();
    expect(nextQuantityOffer(1)?.code).toBe("BUY2");
    expect(earnedQuantityOffer(2)?.code).toBe("BUY2");
    expect(nextQuantityOffer(2)?.code).toBe("BUY3");
    expect(earnedQuantityOffer(3)?.code).toBe("BUY3");
    expect(nextQuantityOffer(3)).toBeNull();
    expect(earnedQuantityOffer(4)?.code).toBe("BUY3");
    expect(nextQuantityOffer(4)).toBeNull();
  });

  /* The rungs share the track equally (1/4 and 3/4), so a label centred under
     each has half of the width; placed by piece count, two neighbouring
     rungs sat a quarter apart with the last at the very end and their labels
     met at 280px. */
  it("centres each rung in its own half of the track", () => {
    expect(QUANTITY_OFFERS.map((_, i) => rungPosition(i))).toEqual([1 / 4, 3 / 4]);
  });

  /* Measured across the whole ladder so the bar never snaps backwards when a
     rung is cleared: one piece is half way to Buy 2 (1/8), Buy 2 is met
     exactly as it is reached (1/4), and three pieces fill it. */
  it("fills monotonically over three pieces, meets each rung, and caps at full", () => {
    const steps = [0, 1, 2, 3, 4, 5, 9].map(quantityOfferProgress);
    expect(steps).toEqual([0, 1 / 8, 1 / 4, 1, 1, 1, 1]);
    steps.forEach((v, i) => i && expect(v).toBeGreaterThanOrEqual(steps[i - 1]));
    QUANTITY_OFFERS.slice(0, -1).forEach((offer, i) => expect(quantityOfferProgress(offer.minQuantity)).toBe(rungPosition(i)));
  });

  it("orders the rungs by rising threshold and rising reward", () => {
    for (let i = 1; i < QUANTITY_OFFERS.length; i += 1) {
      expect(QUANTITY_OFFERS[i].minQuantity).toBeGreaterThan(QUANTITY_OFFERS[i - 1].minQuantity);
      expect(QUANTITY_OFFERS[i].rate).toBeGreaterThan(QUANTITY_OFFERS[i - 1].rate);
    }
    expect(TOP_QUANTITY_OFFER.code).toBe("BUY3");
  });

  /* Literal on purpose, like OfferProgress.test.tsx: the ladder cannot move
     here without this failing, the prompt to move the Shopify codes too. */
  it("is the owner's ladder of 25 Nov 2026: Buy 2 10%, Buy 3 20%, and no Buy 4", () => {
    expect(QUANTITY_OFFERS.map(({ code, minQuantity, rate }) => [code, minQuantity, rate])).toEqual([
      ["BUY2", 2, 0.1],
      ["BUY3", 3, 0.2],
    ]);
    expect(PROMO_DISCOUNTS).toEqual({ FRIENDSANDFAMILY: 0.2, BUY2: 0.1, BUY3: 0.2, NAIRA10: 0.1 });
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

  /* Three pieces are the top since 25 Nov 2026, so the fourth moves nothing
     but itself: it saves its own 20%, to the rupee the bag rounds to. Three
     pieces, 1,499 + 2,399 + 1,799 = 5,697, are 4,557.60 at 20%, so 4,558. A
     ₹1,299 fourth makes 6,996, 5,596.80 at 20%, so 5,597: it adds 1,039 and
     saves 260. A ₹1,499 fourth makes 7,196, 5,756.80 at 20%, so 5,757: it
     adds 1,199 and saves 300. */
  it("counts only the fourth piece's own 20%, the bag's rate staying where it was", () => {
    expect(addOnEffect({ subtotal: 5697, totalItems: 3 }, 1299)).toEqual({ adds: 1039, saves: 260, rate: 0.2 });
    expect(addOnEffect({ subtotal: 5697, totalItems: 3 }, 1499)).toEqual({ adds: 1199, saves: 300, rate: 0.2 });
  });

  /* The same past it: a fifth ₹999 piece saves only its own 20%. 6,996 at 20%
     is 5,597 (5,596.80); 7,995 at 20% is 6,396, so it adds 799. */
  it("past the top rung, a piece saves only its own 20%", () => {
    expect(addOnEffect({ subtotal: 6996, totalItems: 4 }, 999)).toEqual({ adds: 799, saves: 200, rate: 0.2 });
  });
});

describe("ladderHeadline: the band over the bag", () => {
  it("names what a second piece does, as the plan's mock-up reads", () => {
    expect(ladderHeadline(1)).toBe("A second piece takes 10% off your bag");
  });

  it("says what the bag has and what a third piece adds", () => {
    expect(ladderHeadline(2, 0.1)).toBe("10% off your bag · a third piece makes it 20%");
  });

  /* Three pieces are the top again since 25 Nov 2026: the line names no
     fourth piece, and never a rate the bag cannot reach. */
  it("at three pieces, says the bag has the best price and names no fourth piece", () => {
    expect(ladderHeadline(3, 0.2)).toBe("20% off your bag, the best price");
    expect(ladderHeadline(3, 0.2)).not.toMatch(/fourth|30%/);
  });

  it("stops at the top rung", () => {
    expect(ladderHeadline(4, 0.2)).toBe("20% off your bag, the best price");
    expect(ladderHeadline(5, 0.2)).toBe("20% off your bag, the best price");
  });

  /* A 10% code already matches the 10% rung, so the line skips it and names
     the next rung worth more; the 20% code already matches the top rung, so
     the line offers nothing more. */
  it("never offers a saving already in hand from a code", () => {
    expect(ladderHeadline(1, 0.1)).toBe("10% off your bag · your third piece makes it 20%");
    expect(ladderHeadline(1, 0.2)).toBe("20% off your bag, the best price");
    expect(ladderHeadline(2, 0.2)).toBe("20% off your bag, the best price");
  });
});


/* The ladder end to end, as the bag totals it: no discount on one piece, 10%
   on two, 20% on three or more, across mixed prices, rounded once on the
   bag. */
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
    // 2,997 at 20% is 2,397.60.
    ["three of a kind", [999, 999, 999], 2398, "BUY3"],
    // 4,897 at 20% is 3,917.60.
    ["three, mixed", [2399, 1499, 999], 3918, "BUY3"],
    // 6,996 at 20% is 5,596.80.
    ["four, mixed", [2399, 2399, 1199, 999], 5597, "BUY3"],
    // 5,996 at 20% is 4,796.80.
    ["four of a kind", [1499, 1499, 1499, 1499], 4797, "BUY3"],
    // 1,499 + 2,399 + 1,799 + 1,299 + 999 = 7,995; at 20% 6,396.
    ["five, mixed", [1499, 2399, 1799, 1299, 999], 6396, "BUY3"],
  ] as const)("%s", (_name, prices, charged, code) => {
    expect(total([...prices])).toBe(charged);
    expect(resolveCartDiscount({ totalItems: prices.length }).code).toBe(code);
  });
});

/* What the product page quotes per piece at each rung. Rounded as the bag
   rounds, from the piece's own price, never typed in. */
describe("pieceAtRung", () => {
  const [buy2, buy3] = QUANTITY_OFFERS;
  /* Worked by hand: 999 x 0.8 = 799.20; 1,199 x 0.8 = 959.20; 1,499 x 0.8 =
     1,199.20; 1,799 x 0.8 = 1,439.20; 2,399 x 0.8 = 1,919.20. */
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

  /* Two of a piece cost exactly twice the quote. Three or four can sit ₹1
     from the bag's total (it rounds the total once, the quote rounds the
     piece): ₹999 at 20% is 799.20, so four are 3,196 against the bag's 3,197
     (3,196.80); ₹2,749 at 20% is 2,199.20, so three are 6,597 against the
     bag's 6,598 (6,597.60). Never more than ₹1. */
  it("matches the bag at two pieces and is within ₹1 of it at three or four", () => {
    for (const price of [599, 799, 999, 1049, 1199, 1299, 1499, 1799, 1899, 2399, 2499, 2749]) {
      expect(2 * pieceAtRung(price, buy2)).toBe(discountedSubtotal(2 * price, resolveCartDiscount({ totalItems: 2 })));
      for (const n of [3, 4]) {
        const bag = discountedSubtotal(n * price, resolveCartDiscount({ totalItems: n }));
        expect(Math.abs(bag - n * pieceAtRung(price, buy3))).toBeLessThanOrEqual(1);
      }
    }
    expect(4 * pieceAtRung(999, buy3)).toBe(3196);
    expect(discountedSubtotal(4 * 999, resolveCartDiscount({ totalItems: 4 }))).toBe(3197);
    expect(3 * pieceAtRung(2749, buy3)).toBe(6597);
    expect(discountedSubtotal(3 * 2749, resolveCartDiscount({ totalItems: 3 }))).toBe(6598);
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
     (5,397 at 20% is 4,317.60). The same on the way to 10%, with figures
     for the wording only: ₹2,749 alone, with ₹249 more, is 2,698 (2,998 at
     10% is 2,698.20), 51 less. */
  it("says the total drops rather than adding a negative amount", () => {
    expect(pdpOfferStatus({ subtotal: 5148, totalItems: 2 }, 599)).toBe("Add to bag for 20% off everything: your total drops ₹35.");
    expect(pdpOfferStatus({ subtotal: 4798, totalItems: 2 }, 599)).toBe("Add to bag for 20% off everything: your total stays the same.");
    expect(pdpOfferStatus({ subtotal: 2749, totalItems: 1 }, 249)).toBe("Add to bag for 10% off everything: your total drops ₹51.");
  });

  /* Three pieces are the top since 25 Nov 2026: a fourth takes the bag
     nowhere new. The line names the rate the bag has and offers no richer
     one. */
  it("as the fourth, says the bag has 20% and promises nothing more", () => {
    const line = pdpOfferStatus({ subtotal: 2997, totalItems: 3 }, 999);
    expect(line).toBe("20% off is on your bag, this piece included.");
    expect(line).not.toMatch(/30%|fourth/);
  });

  /* At the top rung the box's gold Buy 3 column already prices this piece:
     999 at 20% is ₹799 (799.20, as Shopify charges it). The bag's own maths
     can put it ₹1 away (seven ₹999 pieces are 5,594, from 5,594.40, and
     eight are 6,394, from 6,393.60: the eighth adds 800), and "adding this
     costs ₹800" one line under "₹799 each" would read as the same claim ₹1
     apart. The line names the rate and leaves the figure to the column. */
  it("at the top rung, says the bag has 20% and leaves this piece's price to the box", () => {
    expect(pdpOfferStatus({ subtotal: 3996, totalItems: 4 }, 999)).toBe("20% off is on your bag, this piece included.");
    expect(addOnEffect({ subtotal: 6993, totalItems: 7 }, 999).adds).toBe(800);
    expect(pdpOfferStatus({ subtotal: 6993, totalItems: 7 }, 999)).toBe("20% off is on your bag, this piece included.");
  });

  /* Every price the store sells at, in bags of three to eight: no second
     rupee figure for this piece under the rung's column. */
  it("never quotes a second price for this piece at a rung the bag already has", () => {
    const prices = [599, 799, 999, 1199, 1299, 1499, 1799, 1899, 2399, 2499, 2749];
    for (const price of prices) {
      for (const other of prices) {
        for (let n = 3; n <= 8; n++) {
          expect(pdpOfferStatus({ subtotal: other * n, totalItems: n }, price)).toBe("20% off is on your bag, this piece included.");
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
     already matches the top rung (BUY3), so the line names no rung at all;
     NAIRA10's 10% matches BUY2, so the line names the three-piece 20%. With
     one piece in the bag and FRIENDSANDFAMILY typed, the second piece stays
     at the code's 20% (it beats BUY2's 10%), and the code has no column in
     the box, so the line keeps its figure: 2,198 at 20% is 1,758
     (1,758.40), against 1,199 at 20% = 959 (959.20), so this piece costs
     799. */
  it("never offers a saving a typed code already gives", () => {
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("Your code takes 20% off, the best price.");
    expect(pdpOfferStatus({ subtotal: 0, totalItems: 0, promoCode: "NAIRA10" }, 999)).toBe("Your code takes 10% off. 3 pieces take 20%.");
    expect(pdpOfferStatus({ subtotal: 1199, totalItems: 1, promoCode: "FRIENDSANDFAMILY" }, 999)).toBe("20% off is on your bag: adding this costs ₹799, not ₹999.");
  });
});
