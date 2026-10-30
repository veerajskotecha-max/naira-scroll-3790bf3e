import type { JewelPiece } from "@/data/jewellery";

/* What a product photo is, for the alt text and the gallery's own ordering.

   Every gallery photo used to be "<name> view N" — the size guide and the
   gift box included — while Shopify holds a written description for nine in
   ten of them ("Star Point Band, Gold — macro of one four-point star set with
   four stones", "Size guide — Star Point Band"). The description is used when
   it says more than the name; otherwise the size guide and the box still say
   what they are, and anything else keeps "<name> view N". */

/** A listing's size guide photo: alt text or file name says "size guide". */
export const SIZE_GUIDE = /size[-_ ]?guide/i;
/** The Naira gift box, by file name or alt text. */
export const PACKAGING = /(?:naira[-_ ]?packaging|gift\s*box|shipping\s*carton)/i;

const path = (url: string) => url.split("?")[0];
const plain = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Shopify's alt text by photo, kept where it describes more than the name. */
export const descriptiveAlts = (
  name: string,
  edges: Array<{ node: { url: string; altText: string | null } }>,
): Record<string, string> =>
  Object.fromEntries(
    edges.flatMap(({ node }) => {
      const alt = (node.altText ?? "").trim();
      const bare = plain(alt);
      return bare && bare !== "catalog square" && bare !== plain(name) ? [[path(node.url), alt]] : [];
    }),
  );

/** The alt text for gallery photo `index` of `piece`. */
export const galleryAlt = (piece: Pick<JewelPiece, "name" | "galleryAlt">, url: string, index: number): string =>
  piece.galleryAlt?.[path(url)] ??
  (SIZE_GUIDE.test(url)
    ? `Size guide — ${piece.name}`
    : PACKAGING.test(url)
      ? `The Naira gift box ${piece.name} arrives in`
      : `${piece.name} view ${index + 1}`);
