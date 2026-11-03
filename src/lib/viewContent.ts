import type { JewelPiece } from "@/data/jewellery";
import { colourFromParam, openingChoice } from "@/lib/colourCards";
import { productParams, shopifyNumericId } from "@/lib/pixel";
import { findVariant } from "@/lib/variants";

/**
 * ViewContent for a jewellery page: the variant the page opens on, as the
 * shopper sees it selected — the colour its link names (a shop-grid colour
 * card's ?colour=, a catalogue ad's ?variant=), a ring's US 6, else the first
 * that can be bought.
 *
 * It used to send the piece's lead variant whatever the page showed: the
 * Silver Triple Coil Wrap Bangle ad (?variant=50651931672738) opened on Silver
 * and reported Gold (50651931639970), so the view was credited to the other
 * catalogue item. A piece with no variants yet keeps its lead variant.
 */
export const viewContentParams = (piece: JewelPiece, colourParam?: string | null) => {
  const opening = findVariant(piece, openingChoice(piece, colourParam));
  return productParams({
    id: piece.handle,
    variantId: opening?.id ?? piece.variantId,
    name: piece.name,
    price: opening?.price ?? piece.price,
    category: piece.category,
  });
};

/**
 * Whether the piece as drawn can place the colour or catalogue variant its link
 * names, so the view can go out at once. Read the way the page reads the link:
 * ?colour= first (an empty one names nothing), else a numeric ?variant=.
 *
 * Star Point Band's first-paint copy (bundled in jewellery.ts) has no colours
 * or sizes, so neither its Silver card link (?colour=silver) nor its Silver
 * catalogue ad (?variant=50652105605282) can be placed until Shopify answers;
 * its own lead (?variant=47501788774562, Gold / 6) and a plain link can.
 */
export const linkPlaced = (piece: JewelPiece, search: URLSearchParams): boolean => {
  const colour = search.get("colour");
  if (colour !== null) return !colour.trim() || Boolean(colourFromParam(piece, colour));
  const variant = search.get("variant")?.trim();
  if (!variant || !/^\d+$/.test(variant)) return true;
  const ids = piece.variants?.length ? piece.variants.map((v) => v.id) : [piece.variantId];
  return ids.some((id) => shopifyNumericId(id) === variant);
};
