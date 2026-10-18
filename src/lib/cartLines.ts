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
