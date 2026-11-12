import { describe, it, expect } from "vitest";
import { orderByVisits, placeSoldOut, bestsellerHandles } from "./shopOrder";

const p = (handle: string, availableForSale = true) => ({ handle, availableForSale });

describe("orderByVisits", () => {
  it("puts more-visited in-stock pieces above less-visited ones", () => {
    const out = orderByVisits([p("a"), p("b"), p("c")], { a: 1, b: 50, c: 10 }, 1).map((x) => x.handle);
    expect(out).toEqual(["b", "c", "a"]);
  });
  it("allows only one sold-out card per twenty while stocked pieces remain", () => {
    const available = Array.from({ length: 65 }, (_, i) => p(`v${i}`));
    const sold = Array.from({ length: 12 }, (_, i) => p(`s${i}`, false));
    const out = orderByVisits([...sold, ...available], { v0: 100 }, 1);
    expect(out.flatMap((x, i) => !x.availableForSale ? [i] : []).slice(0, 3)).toEqual([19, 39, 59]);
    expect(out.slice(68).every((x) => !x.availableForSale)).toBe(true);
    for (let i = 0; i < 68; i += 20) {
      expect(out.slice(i, Math.min(i + 20, 68)).filter((x) => !x.availableForSale).length).toBeLessThanOrEqual(1);
    }
    expect(new Set(out.map((x) => x.handle)).size).toBe(77);
  });
  it("puts sold-out cards last in collections with fewer than nineteen stocked cards", () => {
    expect(placeSoldOut([p("sold", false), p("a"), p("b")]).map((x) => x.handle)).toEqual(["a", "b", "sold"]);
  });
  it("keeps the limit after a page pins cards and reapplies stock placement", () => {
    const pieces = Array.from({ length: 40 }, (_, i) => p(`v${i}`));
    const out = placeSoldOut([p("pin"), ...orderByVisits([...pieces, p("s1", false), p("s2", false)], {}, 1)]);
    expect(out.flatMap((x, i) => !x.availableForSale ? [i] : [])).toEqual([19, 39]);
    expect(out[0].handle).toBe("pin");
  });
  it("scatters new stocked pieces without disrupting visit rank", () => {
    const out = orderByVisits([p("a"), p("new"), p("b")], { a: 20, b: 10 }, 2);
    expect(out.filter((x) => x.handle !== "new").map((x) => x.handle)).toEqual(["a", "b"]);
  });
  it("is stable for the same seed", () => {
    const pieces = [p("a"), p("x", false), p("y"), p("b")];
    expect(orderByVisits(pieces, { a: 2, b: 1 }, 7)).toEqual(orderByVisits(pieces, { a: 2, b: 1 }, 7));
  });
});

describe("bestsellerHandles", () => {
  it("selects the ten most-visited confirmed in-stock products only", () => {
    const stocked = Array.from({ length: 12 }, (_, i) => p(`p${i}`));
    const visits = Object.fromEntries(stocked.map((x, i) => [x.handle, 100 - i]));
    const result = bestsellerHandles([...stocked, p("sold", false), p("new"), { handle: "unknown" }], { ...visits, sold: 9999, unknown: 9999 });
    expect([...result]).toEqual(Array.from({ length: 10 }, (_, i) => `p${i}`));
  });
  it("counts colours once and withdraws bestseller status when stock sells out", () => {
    expect([...bestsellerHandles([p("a"), p("a"), p("b")], { a: 100, b: 50 }, 2)]).toEqual(["a", "b"]);
    expect([...bestsellerHandles([p("a", false), p("b")], { a: 100, b: 50 }, 2)]).toEqual(["b"]);
  });
});
