/**
 * One rule for "is this piece from the demi-fine jewellery line?".
 * Ads and the Shopify catalogue link to /product/<handle>, the apparel
 * template, so both the redirect and the fallback copy read from here.
 */

/** The Shopify vendor that holds the demi-fine jewellery line. */
export const JEWELLERY_VENDOR = "naira petite";

const JEWELLERY_TYPE = /ring|earring|necklace|bracelet|pendant|anklet|jewel/;

export const isJewelleryProduct = (product?: {
  vendor?: string | null;
  productType?: string | null;
} | null): boolean => {
  if (!product) return false;
  const vendor = (product.vendor ?? "").trim().toLowerCase();
  const type = (product.productType ?? "").trim().toLowerCase();
  return vendor === JEWELLERY_VENDOR || JEWELLERY_TYPE.test(type);
};
