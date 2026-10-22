import { describe, expect, it } from "vitest";
import type { JewelPiece } from "@/data/jewellery";
import { cardCover } from "./cardCover";
import { withLeadImage, wornFirst, type ShopifyProductNode } from "./shopify";

const cdn = (file: string) => `https://cdn.shopify.com/s/files/1/0680/9606/5698/files/${file}?v=1`;
const piece = (p: Partial<JewelPiece> & Pick<JewelPiece, "handle">): JewelPiece => ({
  name: p.handle,
  category: "Necklaces",
  sku: "",
  number: "",
  price: 1499,
  priceLabel: "₹1,499",
  variantId: "gid://shopify/ProductVariant/1",
  availableForSale: true,
  image: p.gallery?.[0] ?? "",
  blurb: "",
  materials: "",
  ...p,
});

describe("cardCover", () => {
  it("shows the piece alone where the listing opens on a model", () => {
    // Bold Nocturne Chain's product page opens on the worn shot.
    const gallery = [cdn("YF5144_2_worn.png"), cdn("YF5144_3_alt.png"), cdn("bold-nocturne-chain-size-guide.jpg")];
    expect(cardCover(piece({ handle: "bold-nocturne-chain", gallery }))).toBe(cdn("YF5144_3_alt.png"));
  });

  it("falls back to the listing's lead product photo when the chosen one is gone", () => {
    const gallery = [cdn("new-worn.jpg"), cdn("new-packshot.jpg")];
    expect(cardCover(piece({ handle: "bold-nocturne-chain", gallery, cover: cdn("new-packshot.jpg") }))).toBe(cdn("new-packshot.jpg"));
  });

  it("uses the lead product photo for a piece with no choice of its own", () => {
    const gallery = [cdn("model.jpg"), cdn("on-the-block.jpg")];
    expect(cardCover(piece({ handle: "a-new-piece", gallery, cover: cdn("on-the-block.jpg") }))).toBe(cdn("on-the-block.jpg"));
  });

  it("never leads with the gift box or the size guide", () => {
    const gallery = [cdn("worn.jpg"), cdn("packshot.jpg"), cdn("naira-packaging-b3.jpg")];
    expect(cardCover(piece({ handle: "a-new-piece", gallery, cover: cdn("naira-packaging-b3.jpg") }))).not.toMatch(/packaging/);
  });

  it("keeps a colour card on that colour's own photo", () => {
    const gallery = [cdn("YF5144_2_worn.png"), cdn("YF5144_3_alt.png")];
    const silver = piece({ handle: "bold-nocturne-chain", gallery, image: cdn("silver.jpg"), colour: { option: "Metal", value: "Silver" } });
    expect(cardCover(silver)).toBe(cdn("silver.jpg"));
  });
});

describe("withLeadImage", () => {
  const node = (files: Array<[string, string?]>) =>
    ({ handle: "x", images: { edges: files.map(([f, alt]) => ({ node: { url: cdn(f), altText: alt ?? null } })) } }) as unknown as ShopifyProductNode;

  it("notes the listing's first product photo, skipping box and size guide", () => {
    const out = withLeadImage(node([["naira-packaging-b8.jpg"], ["IMG_1.jpg", "Size guide — X"], ["x-0.jpg"], ["x-1.jpg"]]));
    expect(out?.leadImage).toBe(cdn("x-0.jpg"));
  });

  it("survives the product page's worn-first reorder", () => {
    const out = wornFirst(withLeadImage(node([["x_1_main.png"], ["x_2_worn.png"]])));
    expect(out?.images.edges[0].node.url).toBe(cdn("x_2_worn.png"));
    expect(out?.leadImage).toBe(cdn("x_1_main.png"));
  });
});
