import type { JewelPiece, JewelVariant } from "@/data/jewellery";
import type { ShopifyProductNode } from "@/lib/shopify";
import { isAdjustableRing } from "@/data/ringFit";
import { cardCover } from "@/lib/cardCover";

/*
  A piece's variants: the metals, stones, sizes and months Shopify sells it in.

  The site used to read only a product's first variant. A second colour could
  not be chosen or added (Baguette Huggies came only in Ruby), a ring's size
  went to Shopify as a note on the size-6 variant, and a piece priced by metal
  (Triple Coil Wrap Bangle, ₹1,899 gold, ₹1,799 silver) showed the gold price
  for silver. The catalogue, the product page and the bag share these.
*/

/* Shopify's stand-in on a piece sold one way: "Title" → "Default Title". */
const placeholder = (name: string) => /^title$/i.test(name.trim());

export const variantsFromNode = (node: ShopifyProductNode): JewelVariant[] =>
  node.variants.edges.map(({ node: v }) => {
    const price = Math.round(Number(v.price.amount));
    const compare = v.compareAtPrice ? Math.round(Number(v.compareAtPrice.amount)) : 0;
    return {
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      price,
      ...(compare > price ? { compareAtPrice: compare } : {}),
      options: Object.fromEntries(v.selectedOptions.filter((o) => !placeholder(o.name)).map((o) => [o.name, o.value])),
      ...(v.image?.url ? { image: v.image.url } : {}),
    };
  });

/** The real choices, in Shopify's order, without its placeholder. */
export const optionsFromNode = (node: ShopifyProductNode) =>
  (node.options ?? []).filter((o) => !placeholder(o.name) && o.values.length > 0).map((o) => ({ name: o.name, values: [...o.values] }));

/** The first variant that can be bought: a page opens on a price the shopper can pay. */
export const firstBuyable = (variants: JewelVariant[]) => variants.find((v) => v.availableForSale) ?? variants[0];

/** What the catalogue takes from a product's variants. Only a piece with a real
    choice carries the list, so the first-paint snapshot stays lean. */
export const variantFields = (node: ShopifyProductNode) => {
  const variants = variantsFromNode(node);
  return {
    lead: variants.length ? firstBuyable(variants) : undefined,
    availableForSale: node.availableForSale && (variants.length ? variants.some((v) => v.availableForSale) : true),
    choice: variants.length > 1 ? { variants, options: optionsFromNode(node) } : {},
  };
};

/** The options a shopper chooses between: those with more than one value. */
export const choices = (piece: JewelPiece) => (piece.options ?? []).filter((o) => o.values.length > 1);

/** The variant that matches every chosen value. */
export const findVariant = (piece: JewelPiece, chosen: Record<string, string>) =>
  piece.variants?.find((v) => Object.entries(v.options).every(([name, value]) => chosen[name] === value));

/** The variant behind a cart line. */
export const variantById = (piece: JewelPiece | undefined, variantId: string) => piece?.variants?.find((v) => v.id === variantId);

/** The choices a page opens on: its first buyable variant's. */
export const initialChoice = (piece: JewelPiece): Record<string, string> =>
  piece.variants?.length ? { ...firstBuyable(piece.variants).options } : {};

/** For one option, whether each value can be bought with the other choices as they are. */
export const buyableValues = (piece: JewelPiece, option: string, chosen: Record<string, string>): Record<string, boolean> => {
  const out: Record<string, boolean> = {};
  for (const value of piece.options?.find((o) => o.name === option)?.values ?? []) {
    out[value] = (piece.variants ?? []).some(
      (v) =>
        v.availableForSale &&
        v.options[option] === value &&
        Object.entries(v.options).every(([name, other]) => name === option || chosen[name] === undefined || chosen[name] === other),
    );
  }
  return out;
};

/** Choosing a value keeps the other choices when a variant has them all;
    otherwise it moves to a variant with the new value, a buyable one first. */
export const choose = (piece: JewelPiece, chosen: Record<string, string>, option: string, value: string): Record<string, string> => {
  const next = { ...chosen, [option]: value };
  if (findVariant(piece, next)) return next;
  const withValue = (piece.variants ?? []).filter((v) => v.options[option] === value);
  const fallback = withValue.find((v) => v.availableForSale) ?? withValue[0];
  return fallback ? { ...fallback.options } : next;
};

/** The option that is a size ("Size", "Ring size"), when the piece is sold in sizes. */
export const sizeOption = (piece: JewelPiece) => choices(piece).find((o) => /size/i.test(o.name))?.name;

/**
 * What the shopper must choose on the piece's own page before it can go in the
 * bag: a size (a piece sold in sizes, or any ring sized to the finger) or a
 * month (a birthstone is personal). A metal or a stone can be added as pictured.
 */
export const choiceNeeded = (piece: JewelPiece): "size" | "month" | null => {
  if (sizeOption(piece)) return "size";
  if (piece.category === "Rings" && !isAdjustableRing(piece.handle)) return "size";
  if (choices(piece).some((o) => /month|birthstone/i.test(o.name))) return "month";
  return null;
};

const pathOf = (url?: string) => (url ?? "").split("?")[0];

/**
 * The variant a one-tap Add takes, for a piece that needs no choice: one in the
 * metal or stone already chosen beside it (`prefer`), else the one pictured,
 * else the first buyable. Undefined for a piece sold one way.
 */
export const oneTapVariant = (piece: JewelPiece, prefer: Record<string, string> = {}): JewelVariant | undefined => {
  const buyable = (piece.variants ?? []).filter((v) => v.availableForSale);
  if (!buyable.length) return undefined;
  for (const [name, value] of Object.entries(prefer)) {
    const match = buyable.find((v) => v.options[name] === value);
    if (match) return match;
  }
  return buyable.find((v) => v.image && pathOf(v.image) === pathOf(piece.image)) ?? buyable[0];
};

/** "Silver · 7": a variant's choices, for a card or a bag line. */
export const variantLabel = (variant?: JewelVariant) => (variant ? Object.values(variant.options).join(" · ") : "");

/** The choices of a cart line, as a lookup ("Metal" → "Silver"). */
export const chosenOf = (line: { selectedOptions?: Array<{ name: string; value: string }> }) =>
  Object.fromEntries((line.selectedOptions ?? []).filter((o) => !placeholder(o.name)).map((o) => [o.name, o.value]));

/** A cart line for a piece in one of its variants, or as it is when sold one way. */
export const cartLineFor = (piece: JewelPiece, variant?: JewelVariant) => {
  const price = variant?.price ?? piece.price;
  const selectedOptions = variant ? Object.entries(variant.options).map(([name, value]) => ({ name, value })) : [];
  return {
    id: piece.handle,
    variantId: variant?.id ?? piece.variantId,
    name: piece.name,
    price,
    priceLabel: `₹${price.toLocaleString("en-IN")}`,
    currencyCode: "INR",
    image: variant?.image ?? cardCover(piece),
    ...(selectedOptions.length ? { selectedOptions, variantTitle: variant?.title } : {}),
  };
};
