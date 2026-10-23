import { describe, expect, it } from "vitest";
import type { JewelPiece, JewelVariant } from "@/data/jewellery";
import { cardKey, colourCards, colourFromParam, colourOption, openingChoice, pieceHref } from "./colourCards";

const variant = (id: string, options: Record<string, string>, price: number, extra: Partial<JewelVariant> = {}): JewelVariant => ({
  id,
  title: Object.values(options).join(" / "),
  availableForSale: true,
  price,
  options,
  ...extra,
});

const piece = (handle: string, extra: Partial<JewelPiece> = {}): JewelPiece => ({
  handle,
  name: handle,
  category: "Bracelets",
  sku: "",
  number: "1",
  price: 1899,
  priceLabel: "₹1,899",
  variantId: `${handle}-lead`,
  availableForSale: true,
  image: `https://cdn.shopify.com/${handle}.jpg`,
  blurb: "",
  materials: "",
  ...extra,
});

const bangle = piece("triple-coil-wrap-bangle", {
  options: [{ name: "Metal", values: ["Gold", "Silver"] }],
  variants: [
    variant("gold", { Metal: "Gold" }, 1899, { image: "https://cdn.shopify.com/coil-gold.jpg" }),
    variant("silver", { Metal: "Silver" }, 1799, { image: "https://cdn.shopify.com/coil-silver.jpg", compareAtPrice: 2199 }),
  ],
});

const ring = piece("watch-link-ring", {
  category: "Rings",
  options: [
    { name: "Metal", values: ["Gold", "Silver"] },
    { name: "Size", values: ["6", "7", "8"] },
  ],
  variants: ["Gold", "Silver"].flatMap((metal) =>
    ["6", "7", "8"].map((size) =>
      variant(`${metal}-${size}`, { Metal: metal, Size: size }, 1299, {
        image: `https://cdn.shopify.com/watch-${metal.toLowerCase()}.jpg`,
        availableForSale: !(metal === "Silver" && size === "6"),
      }),
    ),
  ),
});

const sized = piece("roman-numeral-trio-ring", {
  category: "Rings",
  options: [{ name: "Size", values: ["6", "7", "8"] }],
  variants: ["6", "7", "8"].map((size) => variant(size, { Size: size }, 1499)),
});

const starPoint = piece("star-point-band", {
  category: "Rings",
  options: [
    { name: "Metal", values: ["Gold", "Silver"] },
    { name: "Size", values: ["5", "6", "7", "8"] },
  ],
  variants: ["Gold", "Silver"].flatMap((metal) => ["5", "6", "7", "8"].map((size) => variant(`${metal}-${size}`, { Metal: metal, Size: size }, 799))),
});

const birthstone = piece("birthstone-heart-necklace", {
  category: "Necklaces",
  options: [{ name: "Month", values: ["January · Garnet", "February · Amethyst"] }],
  variants: [variant("jan", { Month: "January · Garnet" }, 1599), variant("feb", { Month: "February · Amethyst" }, 1599)],
});

const plain = piece("fine-tennis-bracelet");

describe("colourCards", () => {
  it("shows a piece sold in two metals as two cards, each with its own photo and price", () => {
    const cards = colourCards([bangle]);
    expect(cards.map((c) => [c.colour?.value, c.image, c.price, c.variantId])).toEqual([
      ["Gold", "https://cdn.shopify.com/coil-gold.jpg", 1899, "gold"],
      ["Silver", "https://cdn.shopify.com/coil-silver.jpg", 1799, "silver"],
    ]);
    expect(cards[1].compareAtLabel).toBe("₹2,199");
    expect(cards[0].compareAtPrice).toBeUndefined();
  });

  it("gives a ring sold in metals and sizes one card per metal, led by a size that can be bought", () => {
    const cards = colourCards([ring]);
    expect(cards.map((c) => c.colour?.value)).toEqual(["Gold", "Silver"]);
    expect(cards[1].variantId).toBe("Silver-7");
    expect(cards[1].image).toBe("https://cdn.shopify.com/watch-silver.jpg");
  });

  it("keeps sizes, months and pieces sold one way as a single card", () => {
    expect(colourCards([sized, birthstone, plain])).toEqual([sized, birthstone, plain]);
  });

  it("keys and links each colour card to the same product page on its own colour", () => {
    const [gold, silver] = colourCards([bangle]);
    expect([cardKey(gold), cardKey(silver)]).toEqual(["triple-coil-wrap-bangle~Gold", "triple-coil-wrap-bangle~Silver"]);
    expect(pieceHref(silver)).toBe("/jewellery/triple-coil-wrap-bangle?colour=silver");
    expect(pieceHref(plain)).toBe("/jewellery/fine-tennis-bracelet");
  });
});

describe("opening a product page on a colour", () => {
  it("finds the colour option and matches the link's colour in any case", () => {
    expect(colourOption(ring)?.name).toBe("Metal");
    expect(colourOption(sized)).toBeUndefined();
    expect(colourFromParam(bangle, "SILVER")).toEqual({ option: "Metal", value: "Silver" });
    expect(colourFromParam(bangle, "rose")).toBeUndefined();
  });

  it("opens on the named colour, else on the first variant that can be bought", () => {
    expect(openingChoice(bangle, "silver")).toEqual({ Metal: "Silver" });
    expect(openingChoice(bangle, null)).toEqual({ Metal: "Gold" });
    expect(openingChoice(ring, "silver")).toEqual({ Metal: "Silver", Size: "7" });
  });

  it("opens a ring's colour on US 6 when Shopify lists US 5 first", () => {
    expect(openingChoice(starPoint, "silver")).toEqual({ Metal: "Silver", Size: "6" });
    expect(openingChoice(starPoint, null)).toEqual({ Metal: "Gold", Size: "6" });
  });
});
