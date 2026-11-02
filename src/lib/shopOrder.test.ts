import { describe, it, expect } from "vitest";
import { orderByVisits } from "./shopOrder";

const p = (handle: string, availableForSale = true) => ({ handle, availableForSale });

describe("orderByVisits", () => {
  it("puts more-visited in-stock pieces above less-visited ones", () => {
    const out = orderByVisits([p("a"), p("b"), p("c")], { a: 1, b: 50, c: 10 }, 1).map((x) => x.handle);
    expect(out).toEqual(["b", "c", "a"]);
  });
  it("does not always put sold-out and new pieces last", () => {
    const pieces = [...Array.from({ length: 20 }, (_, i) => p(`v${i}`)), p("sold", false), p("new")];
    const visits = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`v${i}`, 100 - i]));
    const positions = Array.from({ length: 30 }, (_, s) => orderByVisits(pieces, { ...visits, sold: 999 }, s).findIndex((x) => x.handle === "sold"));
    expect(positions.some((i) => i < 20)).toBe(true);
  });
  it("is stable for the same seed", () => {
    const pieces = [p("a"), p("x", false), p("y"), p("b")];
    expect(orderByVisits(pieces, { a: 2, b: 1 }, 7)).toEqual(orderByVisits(pieces, { a: 2, b: 1 }, 7));
  });
});
