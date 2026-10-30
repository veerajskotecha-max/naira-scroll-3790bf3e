import type { JewelPiece } from "@/data/jewellery";
import { openingChoice } from "@/lib/colourCards";
import { productParams } from "@/lib/pixel";
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
