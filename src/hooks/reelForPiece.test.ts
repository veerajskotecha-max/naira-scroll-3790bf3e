import { describe, expect, it } from "vitest";
import { reelForPiece, type Reel } from "./useReels";

const reel = (id: string, handles: string[], videoUrl = `https://x/${id}.mp4`): Reel => ({
  id,
  title: null,
  caption: null,
  video_path: `${id}.mp4`,
  poster_path: null,
  sort_order: 0,
  published: true,
  videoUrl,
  posterUrl: null,
  products: handles.map((handle, position) => ({ id: `${id}-${position}`, handle, title: handle, price_label: null, image_url: null, variant_id: null, position })),
});

/* As the site holds them on 18 October, with Sonal's hoops reel added after. */
const riya = reel("riya", ["cushion-halo-ring", "woven-gold-hoops", "prism-riviere-bracelet"]);
const pankti = reel("pankti", ["toggle-link-chain", "brushed-gold-huggies"]);
const sonal = reel("sonal", ["woven-gold-hoops"]);
const ananya = reel("ananya", ["halo-curve-ring", "baroque-pearl-lariat"]);
const reels = [riya, pankti, sonal, ananya];

describe("the reel a product page plays in its gallery", () => {
  it("is the one made for the piece, though another reel shows it first (the hoops used to get the ring's reel)", () => {
    expect(reelForPiece(reels, "woven-gold-hoops")?.id).toBe("sonal");
    expect(reelForPiece(reels, "halo-curve-ring")?.id).toBe("ananya");
    expect(reelForPiece(reels, "cushion-halo-ring")?.id).toBe("riya");
  });

  it("is any reel showing the piece when none leads with it", () => {
    expect(reelForPiece(reels, "brushed-gold-huggies")?.id).toBe("pankti");
    expect(reelForPiece(reels, "baroque-pearl-lariat")?.id).toBe("ananya");
  });

  it("skips a reel whose video could not be signed, and is null for a piece in no reel", () => {
    expect(reelForPiece([reel("sonal", ["woven-gold-hoops"], ""), riya], "woven-gold-hoops")?.id).toBe("riya");
    expect(reelForPiece(reels, "petal-flower-studs")).toBeNull();
    expect(reelForPiece(undefined, "woven-gold-hoops")).toBeNull();
  });
});
