import type { JewelPiece } from "@/data/jewellery";

/*
  Which pieces to suggest next to a piece, and in the bag.

  The bag's multi-buy ladder (2 pieces 10% off, 3 pieces 20% off) is the offer,
  so the useful suggestion is a second piece that completes the look: another
  category (a bracelet suggests earrings, a necklace and a ring, not three more
  bracelets), in the same metal colour, near the same price, in stock and
  addable in one tap. Deterministic, so the row does not reshuffle on every
  render.
*/

type Family = "silver" | "gold";
const familyOf = (piece: JewelPiece): Family =>
  /rhodium|silver/i.test(piece.materials) && !/18k gold/i.test(piece.materials) ? "silver" : "gold";

const buyable = (piece: JewelPiece) => piece.availableForSale !== false && Boolean(piece.variantId) && Boolean(piece.image);

/* Metal colour first, then closeness in price (ratio, so ₹1,200 vs ₹2,400 counts like ₹2,400 vs ₹4,800). */
const rank = (anchor: JewelPiece) => (piece: JewelPiece) =>
  (familyOf(piece) === familyOf(anchor) ? 0 : 10) + Math.abs(Math.log(piece.price / Math.max(anchor.price, 1)));

const byRank = (anchor: JewelPiece, pieces: JewelPiece[]) => {
  const score = rank(anchor);
  return [...pieces].sort((a, b) => score(a) - score(b) || a.handle.localeCompare(b.handle));
};

/** Up to `count` pieces from other categories, one per category first. */
export const completeTheLook = (piece: JewelPiece, catalogue: JewelPiece[], count = 3): JewelPiece[] => {
  const candidates = byRank(
    piece,
    catalogue.filter((p) => p.handle !== piece.handle && p.category !== piece.category && buyable(p)),
  );
  const picked: JewelPiece[] = [];
  const categories = new Set<string>();
  for (const p of candidates) {
    if (picked.length >= count) break;
    if (categories.has(p.category)) continue;
    categories.add(p.category);
    picked.push(p);
  }
  for (const p of candidates) {
    if (picked.length >= count) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked;
};

/** More of the same category, nearest in metal colour and price. */
export const moreLikeThis = (piece: JewelPiece, catalogue: JewelPiece[], count = 8): JewelPiece[] =>
  byRank(
    piece,
    catalogue.filter((p) => p.handle !== piece.handle && p.category === piece.category && buyable(p)),
  ).slice(0, count);

/** Suggestions for the bag: complete the look of what is already in it, never a piece already there. */
export const bagPairings = (inBag: string[], catalogue: JewelPiece[], count = 2): JewelPiece[] => {
  const anchor = catalogue.find((p) => p.handle === inBag[0]);
  if (!anchor) return [];
  const taken = new Set(inBag);
  return completeTheLook(anchor, catalogue, count + inBag.length)
    .filter((p) => !taken.has(p.handle))
    .slice(0, count);
};
