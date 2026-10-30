/*
  Which cart line a piece belongs to: one per piece, size and variant. The key
  used to be the piece and size alone, so Ruby and Emerald Baguette Huggies were
  one line of two Ruby, and a second colour could never reach the bag.
*/
export interface LineIdentity {
  id: string;
  size?: string;
  variantId?: string;
}

export const cartKeyOf = (item: LineIdentity) => `${item.id}__${item.size ?? ""}__${item.variantId ?? ""}`;

/** A remove or a quantity change may name the variant; without one, the
    piece's first line in that size is meant (the old drawer's calls). */
export const findCartLine = <T extends LineIdentity>(items: T[], id: string, size?: string, variantId?: string) =>
  items.find((item) => item.id === id && (item.size ?? "") === (size ?? "") && (!variantId || item.variantId === variantId));

/** A cart line's unit price as Shopify has it, when its answer carried one. */
export const linePrice = (line?: { merchandise?: { price?: { amount: string } } } | null): number | undefined => {
  const amount = Number(line?.merchandise?.price?.amount);
  return line?.merchandise?.price && Number.isFinite(amount) ? amount : undefined;
};

/* A bag line shows Shopify's price, not the one on the card at the tap: a card
   drawn before the live catalogue, or a bag kept across a price change, showed
   ₹699 for a ₹799 piece, and the ladder saving and Total were worked from it. */
export const withShopifyPrice = <T extends { price: number; priceLabel: string }>(line: T, price?: number): T =>
  price === undefined || price === line.price ? line : { ...line, price, priceLabel: `₹${price.toLocaleString("en-IN")}` };
