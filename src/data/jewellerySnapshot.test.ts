import { describe, expect, it } from "vitest";
import { jewellery as authored } from "@/data/jewellery";
import { jewellerySnapshot } from "@/data/jewellerySnapshot";
import { JEWELLERY_HANDLES } from "@/data/jewelleryHandles";

const firstPaint = new Set([...authored, ...jewellerySnapshot].map((p) => p.handle));

describe("PDP first paint", () => {
  /*
    The bug: JewelDetail could only draw a piece before the live catalogue
    arrived if it was hand-authored — 21 of 56. prism-riviere-bracelet, the #1
    ad landing page, was not, and showed the "Loading piece" skeleton for as
    long as Shopify took to answer (1.3s–4s measured). Clarity recorded "Loading
    piece" as the page title in 7 of 80 sessions.

    Every handle the pre-boot redirect treats as live jewellery must be drawable
    without a network round trip. If this fails, run:
      npx vite-node scripts/generate-jewellery-snapshot.ts
  */
  it("can draw every live jewellery piece without waiting for Shopify", () => {
    const missing = [...JEWELLERY_HANDLES].filter((h) => !firstPaint.has(h));
    expect(missing).toEqual([]);
  });

  it("includes the #1 ad landing page that exposed the bug", () => {
    expect(firstPaint.has("prism-riviere-bracelet")).toBe(true);
  });

  /* Hand-authored copy is curated and must stay the authority — the snapshot
     only fills gaps, it never shadows a piece that has its own entry. */
  it("never duplicates a hand-authored piece", () => {
    const authoredHandles = new Set(authored.map((p) => p.handle));
    expect(jewellerySnapshot.filter((p) => authoredHandles.has(p.handle)).map((p) => p.handle)).toEqual([]);
  });

  /* A snapshot entry is a real first paint: it must be buyable-looking and
     addressable, not a placeholder that flips to something else on load. */
  it("gives every snapshot piece a price, an image and a variant to add to cart", () => {
    const broken = jewellerySnapshot.filter((p) => !(p.price > 0 && p.image && p.variantId.startsWith("gid://shopify/ProductVariant/")));
    expect(broken.map((p) => p.handle)).toEqual([]);
  });
});
