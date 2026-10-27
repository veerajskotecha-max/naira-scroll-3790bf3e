import { describe, expect, it } from "vitest";
import type { JewelPiece, JewelVariant } from "@/data/jewellery";
import { cardKey, colourCards, colourFromParam, colourOfVariant, colourOption, openingChoice, pieceHref, variantPhoto } from "./colourCards";

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

/* Shopify gives a variant with no photo of its own the listing's first photo,
   so these arrive with the gold photo on their silver variants too, as they
   did on 27 Oct 2026. */
const cdn = (file: string) => `https://cdn.shopify.com/s/files/1/0680/9606/5698/files/${file}?v=1`;
const gid = (n: number) => `gid://shopify/ProductVariant/${n}`;

const cuff = piece("droplet-open-cuff", {
  image: cdn("droplet-open-cuff_4_macro.jpg"),
  gallery: [cdn("droplet-open-cuff_4_macro.jpg"), cdn("droplet-open-cuff_1_main.jpg"), cdn("droplet-open-cuff_3_silver.jpg"), cdn("naira-packaging-b4.jpg")],
  options: [{ name: "Metal", values: ["Gold", "Silver"] }],
  variants: [
    variant(gid(1), { Metal: "Gold" }, 1499, { image: cdn("droplet-open-cuff_1_main.jpg") }),
    variant(gid(2), { Metal: "Silver" }, 1499, { image: cdn("droplet-open-cuff_1_main.jpg") }),
  ],
});

const tubogas = piece("tubogas-dome-ring", {
  category: "Rings",
  image: cdn("tubogas-dome-ring-on-hand-true-size.jpg"),
  gallery: [cdn("tubogas-dome-ring-on-hand-true-size.jpg"), cdn("02ea7c30.jpg")],
  options: [
    { name: "Metal", values: ["Gold", "Silver"] },
    { name: "Size", values: ["6", "7"] },
  ],
  variants: [
    variant(gid(11), { Metal: "Gold", Size: "6" }, 1299, { image: cdn("tubogas-dome-ring-on-hand-true-size.jpg") }),
    variant(gid(12), { Metal: "Gold", Size: "7" }, 1299, { image: cdn("tubogas-dome-ring-on-hand-true-size.jpg") }),
    variant(gid(13), { Metal: "Silver", Size: "6" }, 1299, { image: cdn("tubogas-dome-ring-on-hand-true-size.jpg") }),
    variant(gid(14), { Metal: "Silver", Size: "7" }, 1299, { image: cdn("tubogas-dome-ring-on-hand-true-size.jpg") }),
  ],
});

/* Only US 6 had its own photo in each metal. */
const band = piece("star-point-band", {
  category: "Rings",
  options: [
    { name: "Metal", values: ["Gold", "Silver"] },
    { name: "Size", values: ["5", "6"] },
  ],
  variants: [
    variant(gid(21), { Metal: "Gold", Size: "5" }, 799, { image: cdn("star-point-band-4.jpg") }),
    variant(gid(22), { Metal: "Gold", Size: "6" }, 799, { image: cdn("star-point-band-4.jpg") }),
    variant(gid(23), { Metal: "Silver", Size: "5" }, 799, { image: cdn("star-point-band-4.jpg") }),
    variant(gid(24), { Metal: "Silver", Size: "6" }, 799, { image: cdn("hf_silver.png") }),
  ],
});

describe("each colour in its own photo, never two cards in one", () => {
  it("finds a colour's photo by its file name when Shopify gave its variant the other metal's", () => {
    expect(colourCards([cuff]).map((c) => [c.colour?.value, c.image])).toEqual([
      ["Gold", cdn("droplet-open-cuff_1_main.jpg")],
      ["Silver", cdn("droplet-open-cuff_3_silver.jpg")],
    ]);
  });

  it("takes the photo only that colour's sizes carry", () => {
    expect(colourCards([band]).map((c) => [c.colour?.value, c.image])).toEqual([
      ["Gold", cdn("star-point-band-4.jpg")],
      ["Silver", cdn("hf_silver.png")],
    ]);
  });

  it("keeps a piece photographed in one metal as one card, not a gold card twice", () => {
    expect(colourCards([tubogas])).toEqual([tubogas]);
  });

  it("never repeats a photo across a whole grid", () => {
    const images = colourCards([bangle, ring, cuff, tubogas, band, plain]).map((c) => c.image.split("?")[0]);
    expect(new Set(images).size).toBe(images.length);
  });

  it("shows a variant in its colour's photo, and none for a colour without one", () => {
    expect(variantPhoto(cuff, cuff.variants![1])).toBe(cdn("droplet-open-cuff_3_silver.jpg"));
    expect(variantPhoto(tubogas, tubogas.variants![3])).toBeUndefined();
    expect(variantPhoto(birthstone, birthstone.variants![0])).toBeUndefined();
    expect(variantPhoto(cuff, undefined)).toBeUndefined();
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

  it("reads a catalogue ad's colour from Shopify's variant number, leaving the size to the shopper", () => {
    expect(colourOfVariant(tubogas, "14")).toBe("Silver");
    expect(openingChoice(tubogas, colourOfVariant(tubogas, "14"))).toEqual({ Metal: "Silver", Size: "6" });
    expect(colourOfVariant(cuff, " 2 ")).toBe("Silver");
    expect(colourOfVariant(cuff, "999")).toBeUndefined();
    expect(colourOfVariant(cuff, "gid://shopify/ProductVariant/2")).toBeUndefined();
    expect(colourOfVariant(sized, "1")).toBeUndefined();
    expect(colourOfVariant(cuff, null)).toBeUndefined();
  });
});
