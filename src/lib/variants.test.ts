import { describe, expect, it } from "vitest";
import type { JewelPiece, JewelVariant } from "@/data/jewellery";
import type { ShopifyProductNode } from "@/lib/shopify";
import { cartKeyOf, findCartLine } from "./cartLines";
import {
  buyableValues,
  cartLineFor,
  choiceNeeded,
  choose,
  chosenOf,
  findVariant,
  initialChoice,
  oneTapVariant,
  variantFields,
  variantLabel,
  variantsFromNode,
} from "./variants";

const img = (name: string) => `https://cdn.shopify.com/s/files/1/0680/9606/5698/files/${name}.jpg?v=1792193135`;
const v = (id: string, options: Record<string, string>, extra: Partial<JewelVariant> = {}): JewelVariant => ({
  id: `gid://shopify/ProductVariant/${id}`,
  title: Object.values(options).join(" / "),
  availableForSale: true,
  price: 1199,
  options,
  ...extra,
});
const piece = (handle: string, category: JewelPiece["category"], variants: JewelVariant[], options: JewelPiece["options"], extra: Partial<JewelPiece> = {}): JewelPiece => ({
  handle,
  name: handle,
  category,
  sku: "",
  number: "1",
  price: variants[0]?.price ?? 1199,
  priceLabel: "",
  variantId: variants[0]?.id ?? "",
  availableForSale: true,
  image: variants[0]?.image ?? "",
  blurb: "",
  materials: "",
  variants,
  options,
  ...extra,
});

/* As Shopify sells them on 18 October. */
const huggies = piece(
  "baguette-huggies",
  "Earrings",
  ["Ruby", "Crystal", "Emerald", "Amethyst"].map((stone) => v(`huggies-${stone}`, { Stone: stone }, { image: img(`huggies-${stone}`) })),
  [{ name: "Stone", values: ["Ruby", "Crystal", "Emerald", "Amethyst"] }],
  { image: img("huggies-Crystal") },
);
const band = piece(
  "baguette-eternity-band",
  "Rings",
  ["Ruby", "Emerald", "Amethyst"].flatMap((stone) => ["6", "7", "8"].map((size) => v(`band-${stone}-${size}`, { Stone: stone, Size: size }, { price: 1299 }))),
  [
    { name: "Stone", values: ["Ruby", "Emerald", "Amethyst"] },
    { name: "Size", values: ["6", "7", "8"] },
  ],
);
const duet = piece(
  "golden-duet-ring",
  "Rings",
  [v("duet-6", { "Ring size": "6" }), v("duet-7", { "Ring size": "7" }, { availableForSale: false }), v("duet-8", { "Ring size": "8" }, { availableForSale: false })],
  [{ name: "Ring size", values: ["6", "7", "8"] }],
);
const bangle = piece(
  "triple-coil-wrap-bangle",
  "Bracelets",
  [v("coil-gold", { Metal: "Gold" }, { price: 1899 }), v("coil-silver", { Metal: "Silver" }, { price: 1799, image: img("coil-silver") })],
  [{ name: "Metal", values: ["Gold", "Silver"] }],
);
const birthstone = piece(
  "birthstone-heart-necklace",
  "Necklaces",
  ["January · Garnet", "May · Emerald"].map((month, i) => v(`month-${i}`, { Month: month }, { price: 999 })),
  [{ name: "Month", values: ["January · Garnet", "May · Emerald"] }],
);
const droplet = piece("droplet-open-ring", "Rings", [v("drop-gold", { Metal: "Gold" }), v("drop-silver", { Metal: "Silver" })], [{ name: "Metal", values: ["Gold", "Silver"] }]);
const cushion = piece("cushion-halo-ring", "Rings", [], undefined, { variants: undefined, variantId: "gid://shopify/ProductVariant/cushion" });
const vintage = piece("vintage-halo-ring", "Rings", [], undefined, { variants: undefined, variantId: "gid://shopify/ProductVariant/vintage" });
/* Star Point Band from 23 October: US 5 to 8 in each metal, US 5 listed first. */
const starPoint = piece(
  "star-point-band",
  "Rings",
  ["Gold", "Silver"].flatMap((metal) => ["5", "6", "7", "8"].map((size) => v(`star-${metal}-${size}`, { Metal: metal, Size: size }, { price: 799 }))),
  [
    { name: "Metal", values: ["Gold", "Silver"] },
    { name: "Size", values: ["5", "6", "7", "8"] },
  ],
);

describe("reading Shopify's variants", () => {
  const node = {
    availableForSale: true,
    options: [
      { name: "Metal", values: ["Gold", "Silver"] },
    ],
    variants: {
      edges: [
        { node: { id: "g", title: "Gold", availableForSale: false, price: { amount: "1899.00", currencyCode: "INR" }, compareAtPrice: null, selectedOptions: [{ name: "Metal", value: "Gold" }], image: null } },
        { node: { id: "s", title: "Silver", availableForSale: true, price: { amount: "1799.00", currencyCode: "INR" }, compareAtPrice: { amount: "1700.00", currencyCode: "INR" }, selectedOptions: [{ name: "Metal", value: "Silver" }], image: { url: img("silver") } } },
      ],
    },
  } as unknown as ShopifyProductNode;

  it("keeps every variant with its own price, photo and choice; an MRP only when above the price", () => {
    expect(variantsFromNode(node)).toEqual([
      { id: "g", title: "Gold", availableForSale: false, price: 1899, options: { Metal: "Gold" } },
      { id: "s", title: "Silver", availableForSale: true, price: 1799, options: { Metal: "Silver" }, image: img("silver") },
    ]);
  });

  it("leads with the first variant that can be bought, and counts the piece buyable if any variant is", () => {
    const fields = variantFields(node);
    expect(fields.lead?.id).toBe("s");
    expect(fields.availableForSale).toBe(true);
    expect(fields.choice).toEqual({ variants: variantsFromNode(node), options: [{ name: "Metal", values: ["Gold", "Silver"] }] });
  });

  it("leaves Shopify's Title placeholder out, and a piece sold one way without a choice", () => {
    const single = {
      availableForSale: true,
      options: [{ name: "Title", values: ["Default Title"] }],
      variants: { edges: [{ node: { id: "x", title: "Default Title", availableForSale: true, price: { amount: "999.00", currencyCode: "INR" }, selectedOptions: [{ name: "Title", value: "Default Title" }] } }] },
    } as unknown as ShopifyProductNode;
    expect(variantsFromNode(single)[0].options).toEqual({});
    expect(variantFields(single).choice).toEqual({});
  });
});

describe("choosing a variant on the product page", () => {
  it("opens on the first buyable variant's choices", () => {
    expect(initialChoice(band)).toEqual({ Stone: "Ruby", Size: "6" });
    expect(initialChoice(cushion)).toEqual({});
  });

  it("opens a ring on US 6 when Shopify lists a smaller size first, else on the first it can sell", () => {
    expect(initialChoice(starPoint)).toEqual({ Metal: "Gold", Size: "6" });
    const goldSixGone = { ...starPoint, variants: starPoint.variants!.map((x) => (x.id.endsWith("Gold-6") ? { ...x, availableForSale: false } : x)) };
    expect(initialChoice(goldSixGone)).toEqual({ Metal: "Gold", Size: "5" });
  });

  it("finds the variant for a full choice, and none for a partial one", () => {
    expect(findVariant(band, { Stone: "Emerald", Size: "7" })?.id).toBe("gid://shopify/ProductVariant/band-Emerald-7");
    expect(findVariant(band, { Stone: "Emerald" })).toBeUndefined();
  });

  it("marks each value buyable or not, with the other choices kept", () => {
    expect(buyableValues(duet, "Ring size", {})).toEqual({ "6": true, "7": false, "8": false });
    const soldOutSeven = { ...band, variants: band.variants!.map((x) => (x.id.endsWith("Emerald-7") ? { ...x, availableForSale: false } : x)) };
    expect(buyableValues(soldOutSeven, "Size", { Stone: "Emerald", Size: "6" })).toEqual({ "6": true, "7": false, "8": true });
    expect(buyableValues(soldOutSeven, "Size", { Stone: "Ruby", Size: "6" })).toEqual({ "6": true, "7": true, "8": true });
  });

  it("keeps the other choices when it can: a new stone in the same size", () => {
    expect(choose(band, { Stone: "Ruby", Size: "8" }, "Stone", "Amethyst")).toEqual({ Stone: "Amethyst", Size: "8" });
    expect(choose(bangle, { Metal: "Gold" }, "Metal", "Silver")).toEqual({ Metal: "Silver" });
  });
});

describe("what a one-tap Add needs, and takes", () => {
  it("asks for a size (a piece sold in sizes, a ring sized to the finger) or a month; adds a metal or stone", () => {
    expect(choiceNeeded(band)).toBe("size");
    expect(choiceNeeded(duet)).toBe("size");
    expect(choiceNeeded(vintage)).toBe("size");
    expect(choiceNeeded(cushion)).toBeNull(); // adjusts to fit US 5 to 9
    expect(choiceNeeded(birthstone)).toBe("month");
    expect(choiceNeeded(huggies)).toBeNull();
    expect(choiceNeeded(bangle)).toBeNull();
    expect(choiceNeeded(droplet)).toBeNull(); // open at the back: adjusts to fit
  });

  it("takes the metal or stone chosen beside it, else the one pictured, else the first buyable", () => {
    expect(oneTapVariant(huggies, { Stone: "Emerald" })?.options).toEqual({ Stone: "Emerald" });
    expect(oneTapVariant(huggies, { Metal: "Silver" })?.options).toEqual({ Stone: "Crystal" }); // pictured
    expect(oneTapVariant(bangle, { Metal: "Silver" })?.price).toBe(1799);
    expect(oneTapVariant({ ...huggies, image: "" })?.options).toEqual({ Stone: "Ruby" });
  });

  it("never takes a sold-out variant, and none at all for a piece sold one way", () => {
    const rubyGone = { ...huggies, variants: huggies.variants!.map((x) => (x.options.Stone === "Emerald" ? { ...x, availableForSale: false } : x)) };
    expect(oneTapVariant(rubyGone, { Stone: "Emerald" })?.options.Stone).not.toBe("Emerald");
    expect(oneTapVariant(cushion)).toBeUndefined();
  });
});

describe("the cart line for a variant", () => {
  it("carries the variant's id, price, photo and choices", () => {
    const silver = bangle.variants![1];
    expect(cartLineFor(bangle, silver)).toEqual({
      id: "triple-coil-wrap-bangle",
      variantId: silver.id,
      name: "triple-coil-wrap-bangle",
      price: 1799,
      priceLabel: "₹1,799",
      currencyCode: "INR",
      image: img("coil-silver"),
      selectedOptions: [{ name: "Metal", value: "Silver" }],
      variantTitle: "Silver",
    });
    expect(variantLabel(band.variants![4])).toBe("Emerald · 7");
    expect(chosenOf(cartLineFor(bangle, silver))).toEqual({ Metal: "Silver" });
  });

  it("is the piece as it is when sold one way", () => {
    expect(cartLineFor(cushion)).toMatchObject({ id: "cushion-halo-ring", variantId: "gid://shopify/ProductVariant/cushion" });
    expect(cartLineFor(cushion)).not.toHaveProperty("selectedOptions");
  });
});

describe("cart lines", () => {
  const ruby = { id: "baguette-huggies", variantId: "ruby" };
  const emerald = { id: "baguette-huggies", variantId: "emerald" };

  it("keeps two colours of one piece on two lines (they used to merge into one line of two Ruby)", () => {
    expect(cartKeyOf(ruby)).not.toBe(cartKeyOf(emerald));
    expect(cartKeyOf({ ...ruby, size: "US 7" })).not.toBe(cartKeyOf(ruby));
  });

  it("finds the named variant's line, or the piece's first line when no variant is named", () => {
    expect(findCartLine([ruby, emerald], "baguette-huggies", undefined, "emerald")).toBe(emerald);
    expect(findCartLine([ruby, emerald], "baguette-huggies")).toBe(ruby);
    expect(findCartLine([ruby], "baguette-huggies", "US 7")).toBeUndefined();
  });
});
