import { describe, it, expect } from "vitest";
import { summarise } from "./useApprovedReviews";

/* The rating comes only from real, approved reviews: none means no rating,
   never a default. */
describe("approved review summary", () => {
  it("shows nothing without reviews", () => {
    expect(summarise([])).toEqual({ reviews: [], rating: null, count: 0 });
  });

  it("averages to one decimal and counts every review", () => {
    const r = (rating: number) => ({ name: "A", rating, text: "", images: [], date: "" });
    expect(summarise([r(5), r(4), r(4)])).toMatchObject({ rating: 4.3, count: 3 });
  });
});
