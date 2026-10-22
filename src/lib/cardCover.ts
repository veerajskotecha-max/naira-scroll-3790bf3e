import type { JewelPiece } from "@/data/jewellery";
import { CARD_COVER_FILES } from "@/data/cardCovers";

const fileOf = (url: string) => url.split("?")[0].split("/").pop() ?? "";

/**
 * The single photo a piece shows on any card, anywhere on the site: just the
 * piece, never a model, the gift box or the size guide.
 *
 * A card showing one colour of a piece (see colourCards) leads with that
 * colour's photo. Otherwise, in order:
 *  1. The photo chosen for the piece by eye (data/cardCovers).
 *  2. The product shot that leads its listing in Shopify (piece.cover).
 *  3. A guess: a clean packshot over an on-model or packaging frame.
 *
 * Every listing surface must use this — the grid card, Most loved, the
 * product page's recommendations, the bag's suggestions, search — or the same
 * piece shows two different covers.
 */
export const cardCover = (piece: JewelPiece): string => {
  const gallery = piece.gallery ?? [];
  /* A card for one colour of a piece leads with that colour's own photo. */
  if (piece.colour) return piece.image;

  const packaging = (g: string) =>
    g === piece.sizeGuide || /(?:naira[-_ ]?packaging|gift\s*box|shipping\s*carton|_box|-box|size[-_ ]?guide)/i.test(g);

  const chosen = CARD_COVER_FILES[piece.handle];
  const picked = chosen ? gallery.find((g) => fileOf(g) === chosen) : undefined;
  if (picked) return picked;
  if (piece.cover && !packaging(piece.cover)) return piece.cover;

  const named = (g: string) => /worn|model|onmodel|_2_/i.test(g);
  const anyNamed = gallery.some(named) || named(piece.image);
  const isWorn = (g: string) => (anyNamed ? named(g) : g === gallery[0]);

  const clean = gallery.find((g) => !isWorn(g) && !packaging(g));
  if (packaging(piece.image)) return clean ?? gallery.find((g) => !packaging(g)) ?? piece.image;
  if (isWorn(piece.image) && clean) return clean;
  return piece.image;
};
