import { describe, expect, it } from "vitest";
import { reelCover } from "./reelCovers";

describe("bundled reel covers", () => {
  it("keeps the seeded reels' covers by their exact paths", () => {
    expect(reelCover("seed/reel-1.mp4")).toBeTruthy();
    expect(reelCover("seed/reel-2.mp4")).toBeTruthy();
    expect(reelCover("seed/reel-1.mp4")).not.toBe(reelCover("seed/reel-2.mp4"));
  });

  /* /admin/reels stores an upload as uploads/<time>-<file name>. Keyed by the
     full path, the new edits' covers would never match, and their tiles would
     wait on a signed poster like the seeded reels used to. */
  it("finds an edit's cover by its file name, wherever the studio stored it", () => {
    const ananya = reelCover("uploads/1792350000000-ananya-where-is-this-from.mp4");
    const sonal = reelCover("uploads/1792350000001-sonal-doing-all-the-work.mp4");
    expect(ananya).toBeTruthy();
    expect(sonal).toBeTruthy();
    expect(ananya).not.toBe(sonal);
    expect(reelCover("edits/ananya-where-is-this-from.mp4")).toBe(ananya);
  });

  it("matches the whole file name only, and nothing for a reel without a cover", () => {
    expect(reelCover("uploads/1792350000000-xsonal-doing-all-the-work.mp4")).toBeUndefined();
    expect(reelCover("uploads/1792350000000-sonal-doing-all-the-work.mov")).toBeUndefined();
    expect(reelCover("uploads/1792350000000-another-reel.mp4")).toBeUndefined();
    expect(reelCover(null)).toBeUndefined();
  });
});
