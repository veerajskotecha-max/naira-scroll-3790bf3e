import { describe, expect, it } from "vitest";
import { orderedRealReviews } from "./realReviews";

/* A product page opens on the reviews about its kind of piece, photographs
   first among them: the ring page opened on a bracelet when the block sorted
   photos first over the match. */
describe("orderedRealReviews", () => {
  it("leads a ring page with the ring reviews", () => {
    const first = orderedRealReviews("Blush Cluster Ring")[0];
    expect(first.match).toContain("ring");
  });

  it("puts photographed reviews first among equal matches", () => {
    const list = orderedRealReviews("Prism Rivière Bracelet");
    const firstWithout = list.findIndex((r) => !r.hasPhotos);
    const lastWith = list.map((r) => r.hasPhotos).lastIndexOf(true);
    const braceletScore = (r: (typeof list)[number]) => (r.match ?? []).filter((k) => "prism rivière bracelet".includes(k)).length;
    expect(braceletScore(list[0])).toBeGreaterThanOrEqual(braceletScore(list[list.length - 1]));
    expect(list[0].hasPhotos).toBe(true);
    expect(firstWithout === -1 || lastWith < firstWithout || braceletScore(list[lastWith]) < braceletScore(list[firstWithout])).toBe(true);
  });
});
