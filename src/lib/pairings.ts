import type { JewelPiece } from "@/data/jewellery";
import { TOP_QUANTITY_OFFER } from "@/lib/promo";

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
/* The name wins: "Rivière Huggies — Silver" is silver even where its listing
   says nothing of the plating and the materials line falls back to gold. */
export const familyOf = (piece: JewelPiece): Family =>
  /\bsilver\b/i.test(piece.name) || (/rhodium|silver/i.test(piece.materials) && !/18k gold/i.test(piece.materials)) ? "silver" : "gold";

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

/*
  The piece the bag offers to add, beside the piece it would be worn with
  ("Wears well with your bracelet · Woven Gold Hoops · Adds ₹1,109 · saves ₹390").

  From deep stock only: the pieces Shopify holds 20 or more of, so a one-tap
  add never meets a piece about to sell out (almost everything else holds 1 to
  5). Never a ring, which needs a size (Lilac Papillon Ring, 30, is left out
  for that); nothing once the bag holds three, the top of the ladder. The
  counts are Shopify's on 16 October and only order ties: a piece that sells
  out drops out by itself (`buyable`). Re-check the list when stock moves.
*/
export const DEEP_STOCK: Readonly<Record<string, number>> = {
  "toggle-link-chain": 80,
  "prism-riviere-bracelet": 68,
  "woven-gold-hoops": 68,
  "aqua-heart-drops-silver": 30,
  "baguette-halo-drops": 30,
  "bold-dome-huggies": 30,
  "quatrefoil-eclat-studs": 30,
  "torsade-huggies": 30,
  "verdant-cushion-studs": 30,
  "heartbead-bracelet": 28,
  "petite-square-huggies": 22,
  "prism-cluster-studs-silver": 20,
  "riviere-huggies-silver": 20,
};
const STOCK = new Map(Object.entries(DEEP_STOCK));

/* How a piece is worn. Hoops, huggies included, are a kind of their own: they
   are the shop's second piece, and two pairs stack on one ear. */
export type Kind = "hoops" | "earrings" | "necklace" | "bracelet" | "ring";
export const kindOf = (piece: JewelPiece): Kind => {
  if (piece.category === "Earrings") return /hoop|huggie/i.test(`${piece.name} ${piece.handle}`) ? "hoops" : "earrings";
  if (piece.category === "Necklaces") return "necklace";
  return piece.category === "Bracelets" ? "bracelet" : "ring";
};
export const isHoops = (piece: JewelPiece) => kindOf(piece) === "hoops";

/*
  The network: how well one kind completes another, 0 to 3, read from the
  shop's real multi-piece orders. Hoops go with everything. A pair of hoops
  takes a chain, or a second pair stacked beside it (Woven Gold Hoops with
  Textured Gold Hoops, #1099, and with Brushed Gold Huggies, #1059); studs and
  drops take a hoop for the same stack. Any other second piece of the same
  kind is never offered.
*/
const FIT: Record<Kind, Partial<Record<Kind, number>>> = {
  bracelet: { hoops: 3, earrings: 2, necklace: 2 },
  necklace: { hoops: 3, earrings: 2, bracelet: 2 },
  ring: { hoops: 3, earrings: 2, bracelet: 2, necklace: 2 },
  earrings: { hoops: 3, necklace: 3, bracelet: 2 },
  hoops: { necklace: 3, hoops: 2, bracelet: 2, earrings: 1 },
};

/* The second piece shoppers actually buy: Woven Gold Hoops is in every
   multi-piece website order since September (#1059, #1088, #1099). It counts
   for more than a matching metal, so the rhodium Prism Rivière Bracelet, the
   other best-seller, is still offered the gold hoops, as the plan's mock-up
   shows. */
const PROVEN = new Set(["woven-gold-hoops"]);

/**
 * How well `candidate` sits beside `anchor`, 0 when it does not complete the
 * look: the network's fit, then proven sales, the same metal colour and a
 * smaller ticket than the piece already chosen, in that order of weight.
 */
export const addOnScore = (anchor: JewelPiece, candidate: JewelPiece): number => {
  const fit = FIT[kindOf(anchor)][kindOf(candidate)] ?? 0;
  if (!fit) return 0;
  return (
    fit * 10 +
    (PROVEN.has(candidate.handle) ? 3 : 0) +
    (familyOf(candidate) === familyOf(anchor) ? 2 : 0) +
    (candidate.price <= anchor.price ? 1 : 0)
  );
};

const NOUN: Record<Kind, string> = { hoops: "hoops", earrings: "earrings", necklace: "necklace", bracelet: "bracelet", ring: "ring" };
/** "Wears well with your …": the piece the suggestion is for, as a shopper would name it. */
export const wornWithNoun = (piece: JewelPiece) => (/huggie/i.test(`${piece.name} ${piece.handle}`) ? "huggies" : NOUN[kindOf(piece)]);

/**
 * The add-on for a bag: the best match for the piece added last, and a second
 * only if it is exactly as good. `inBag` holds handles in the order they were
 * added. Ties go to the deeper stock, then the handle, so the row never
 * reshuffles between renders.
 */
export const bagAddOns = (
  inBag: string[],
  totalPieces: number,
  catalogue: JewelPiece[],
): { anchor: JewelPiece; pieces: JewelPiece[] } | null => {
  if (totalPieces < 1 || totalPieces >= TOP_QUANTITY_OFFER.minQuantity) return null;
  const anchor = [...inBag]
    .reverse()
    .map((handle) => catalogue.find((p) => p.handle === handle))
    .find((p): p is JewelPiece => Boolean(p));
  if (!anchor) return null;
  const taken = new Set(inBag);
  const scored = catalogue
    .filter((p) => STOCK.has(p.handle) && !taken.has(p.handle) && kindOf(p) !== "ring" && buyable(p))
    .map((p) => ({ piece: p, score: addOnScore(anchor, p) }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (STOCK.get(b.piece.handle) ?? 0) - (STOCK.get(a.piece.handle) ?? 0) ||
        a.piece.handle.localeCompare(b.piece.handle),
    );
  if (!scored.length) return null;
  return { anchor, pieces: scored.filter(({ score }) => score === scored[0].score).slice(0, 2).map(({ piece }) => piece) };
};
