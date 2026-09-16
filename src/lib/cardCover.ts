import type { JewelPiece } from "@/data/jewellery";
import { EXPLICIT_COVERS } from "@/hooks/useLiveJewellery";

/**
 * The single photo a piece shows on any card, anywhere on the site.
 *
 * Two rules, in order:
 *  1. A deliberate cover pick (see COVER_PICKS) always wins.
 *  2. Otherwise prefer a clean packshot over an on-model / packaging frame, so
 *     no card ever leads with a gift box or a cropped model shot.
 *
 * Every listing surface must use this — the grid card, the "Most loved" rail
 * and any future rail — or the same piece shows two different covers.
 */
export const cardCover = (piece: JewelPiece): string => {
  const gallery = piece.gallery ?? [];
  if (EXPLICIT_COVERS.has(piece.handle)) return piece.image;

  const named = (g: string) => /worn|model|onmodel|_2_/i.test(g);
  const packaging = (g: string) => /(?:naira[-_ ]?packaging|gift\s*box|shipping\s*carton|_box|-box)/i.test(g);
  const anyNamed = gallery.some(named) || named(piece.image);
  const isWorn = (g: string) => (anyNamed ? named(g) : g === gallery[0]);

  const clean = gallery.find((g) => !isWorn(g) && !packaging(g));
  if (packaging(piece.image)) return clean ?? gallery.find((g) => !packaging(g)) ?? piece.image;
  if (isWorn(piece.image) && clean) return clean;
  return piece.image;
};
