import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { summarise } from "./useApprovedReviews";
import { realReviews } from "@/data/realReviews";

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

/* The page showed "4.9 · 51 reviews" built from text written for the site,
   handed to each product by a hash of its name. Only reviews customers wrote
   may reach the product page: approved submissions and the genuine reviews
   with photographs in realReviews.ts. */
describe("where the product page's reviews come from", () => {
  /* Code only: the comments name the old sources to say why they went. */
  const read = (p: string) => readFileSync(resolve(__dirname, p), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  it("reads only approved submissions and the genuine customer reviews", () => {
    const hook = read("useApprovedReviews.ts");
    expect(hook).toMatch(/from "@\/data\/realReviews"/);
    expect(hook).toMatch(/\.eq\("approved", true\)/);
    expect(hook).not.toMatch(/productReviews|reviewWall|jewelleryReviews|OneLiners|getProductReviews/);
    const real = read("../data/realReviews.ts");
    expect(real).not.toMatch(/productReviews|jewelleryReviews|OneLiners|ugc\//);
  });

  it("counts and averages exactly the reviews it shows", () => {
    const s = summarise(realReviews.map((r) => ({ name: r.name, rating: r.rating, text: r.text, images: r.images, date: r.date })));
    expect(s.count).toBe(realReviews.length);
  });
});
