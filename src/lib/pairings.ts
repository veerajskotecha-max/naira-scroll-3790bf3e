import type { JewelPiece } from "@/data/jewellery";
import { TOP_QUANTITY_OFFER } from "@/lib/promo";
import { choiceNeeded } from "@/lib/variants";

/*
  How the shop's pieces connect: what to suggest beside a piece on its product
  page, and in the bag. Three kinds of link, strongest first:

    - the same set: pieces designed together or sharing a named line, stone
      colour or cut (the Bold Nocturne chain, bracelet and drops; every Verdant
      and emerald piece; the baguettes; the pearls), read from names and tags;
    - the same look: another kind of piece that completes it (FIT), hoops first,
      the shop's proven second piece;
    - the same style: another piece of the same kind for "More …", tennis
      beside tennis, studs beside studs.

  Then the same metal colour and a nearby price. Deterministic, so the rows do
  not reshuffle from one render to the next.
*/

type Family = "silver" | "gold";
/* The name or handle wins: "Serpentine Whisper Chain — Silver" and
   prism-cluster-studs-silver are silver even where the listing names no
   plating and the materials line falls back to gold. */
export const familyOf = (piece: JewelPiece): Family =>
  /\bsilver\b/i.test(piece.name) ||
  /(^|-)silver(-|$)/.test(piece.handle) ||
  (/rhodium|silver/i.test(piece.materials) && !/18k gold/i.test(piece.materials))
    ? "silver"
    : "gold";

const buyable = (piece: JewelPiece) => piece.availableForSale !== false && Boolean(piece.variantId) && Boolean(piece.image);

/* Shopify tags the KAVNAR Edition One pieces "pre-order". Their pages still
   sell them, but a one-tap Add beside another piece must not promise the usual
   delivery date for a piece that may not be on the shelf: they are linked,
   never added in one tap. */
export const isPreorder = (piece: JewelPiece) => (piece.tags ?? []).some((tag) => /^pre-?order$/i.test(tag.trim()));
const oneTap = (piece: JewelPiece) => buyable(piece) && !isPreorder(piece);

/* How a piece is worn. Hoops, huggies included, are a kind of their own: they
   are the shop's second piece, and two pairs stack on one ear. */
export type Kind = "hoops" | "earrings" | "necklace" | "bracelet" | "ring";
export const kindOf = (piece: JewelPiece): Kind => {
  if (piece.category === "Earrings") return /hoop|huggie/i.test(`${piece.name} ${piece.handle}`) ? "hoops" : "earrings";
  if (piece.category === "Necklaces") return "necklace";
  return piece.category === "Bracelets" ? "bracelet" : "ring";
};
export const isHoops = (piece: JewelPiece) => kindOf(piece) === "hoops";

/* The finer style within a category, first match wins. */
const STYLES: Record<JewelPiece["category"], Array<[string, RegExp]>> = {
  Earrings: [["huggies", /huggie/i], ["hoops", /hoop/i], ["ear cuff", /ear cuff/i], ["studs", /stud/i], ["drops", /./]],
  Necklaces: [["lariat", /lariat/i], ["choker", /choker/i], ["set", /\bset\b|layering/i], ["pendant", /heart|bezel|charm|pendant/i], ["chain", /./]],
  Bracelets: [["tennis", /tennis|rivi[eè]re|baguette|lumi[eè]re/i], ["cuff", /cuff/i], ["bangle", /bangle/i], ["chain", /./]],
  Rings: [["band", /band|eternity/i], ["dome", /dome/i], ["open", /\bopen\b/i], ["statement", /./]],
};
export const styleOf = (piece: JewelPiece): string =>
  STYLES[piece.category]?.find(([, pattern]) => pattern.test(piece.name))?.[0] ?? piece.category;

/*
  The lines the catalogue names. A set line is designed or bought together:
  the same named line, stone colour or cut. A motif is a shared look. Read from
  the name, and for pearls from Shopify's Pearl tag too, so a new piece called
  "… Nocturne …" joins its set with no change here.
*/
type Strength = "set" | "motif";
const LINES: Array<[line: string, strength: Strength, pattern: RegExp]> = [
  ["nocturne", "set", /nocturne/i],
  ["duo link", "set", /\bduo link/i],
  ["lumière", "set", /lumi[eè]re/i],
  ["whisper", "set", /whisper/i],
  ["verdant", "set", /verdant|emerald/i],
  ["prism", "set", /prism/i],
  ["rivière", "set", /rivi[eè]re/i],
  ["marquise", "set", /marquise/i],
  ["torsade", "set", /torsade/i],
  ["baguette", "set", /baguette/i],
  ["pearl", "set", /pearl/i],
  ["blush", "set", /blush/i],
  ["droplet", "set", /droplet/i],
  ["baroque", "set", /baroque/i],
  ["molten", "set", /molten/i],
  ["mesh", "set", /mesh/i],
  // Aditya, 25 Oct 2026: the clover drops, chain and station bracelet (with the Clover Charm
  // Necklace and Clover Trio Edit); the twin heart necklace and studs; the watch link bracelet
  // beside the Watch Link Ring.
  ["clover", "set", /clover/i],
  ["twin heart", "set", /twin heart/i],
  ["watch link", "set", /watch link/i],
  ["halo", "motif", /halo/i],
  ["heart", "motif", /heart/i],
  ["star", "motif", /\bstar\b/i],
  ["dome", "motif", /dome/i],
  ["pear drop", "motif", /\bpear\b|dewdrop|teardrop/i],
  ["bow", "motif", /\bbow\b|ribbon/i],
  ["bloom", "motif", /bloom|petal|flower|blossom|clover|quatrefoil/i],
  ["trio", "motif", /\btrio\b/i],
  ["link", "motif", /\blinks?\b|linked|cable|toggle/i],
  ["coil", "motif", /coil|tubogas/i],
  ["éclat", "motif", /[eé]clat/i],
  ["pavé", "motif", /pav[eé]/i],
  ["oval", "motif", /\boval\b/i],
  ["cushion", "motif", /cushion/i],
];
export const linesOf = (piece: JewelPiece): Array<[string, Strength]> => {
  const text = `${piece.name} ${(piece.tags ?? []).some((tag) => /^pearl$/i.test(tag.trim())) ? "pearl" : ""}`;
  return LINES.filter(([, , pattern]) => pattern.test(text)).map(([line, strength]) => [line, strength]);
};
/** The strongest line two pieces share: "set", "motif" or null. */
export const sharedLine = (a: JewelPiece, b: JewelPiece): Strength | null => {
  const theirs = new Map(linesOf(b));
  let best: Strength | null = null;
  for (const [line] of linesOf(a)) {
    const strength = theirs.get(line);
    if (strength === "set") return "set";
    if (strength === "motif") best = "motif";
  }
  return best;
};

/*
  How well one kind completes another, 0 to 3, read from the shop's real
  multi-piece orders. Hoops go with everything. A pair of hoops takes a chain,
  or a second pair stacked beside it (Woven Gold Hoops with Textured Gold Hoops,
  #1099, and with Brushed Gold Huggies, #1059); studs and drops take a hoop for
  the same stack; a bracelet takes a ring for the hand. Any other second piece
  of the same kind is never offered.
*/
const FIT: Record<Kind, Partial<Record<Kind, number>>> = {
  bracelet: { hoops: 3, earrings: 2, necklace: 2, ring: 2 },
  necklace: { hoops: 3, earrings: 2, bracelet: 2, ring: 1 },
  ring: { hoops: 3, earrings: 2, bracelet: 2, necklace: 2 },
  earrings: { hoops: 3, necklace: 3, bracelet: 2, ring: 1 },
  hoops: { necklace: 3, hoops: 2, bracelet: 2, earrings: 1, ring: 1 },
};

/* The second piece shoppers actually buy: Woven Gold Hoops is in every
   multi-piece website order since September (#1059, #1088, #1099). It counts
   for more than a matching metal, so the rhodium Prism Rivière Bracelet, the
   other best-seller, is still offered the gold hoops, as the plan's mock-up
   shows. */
const PROVEN = new Set(["woven-gold-hoops"]);

/**
 * How well `candidate` completes `anchor`, 0 when it does not: the kind it is
 * (FIT), then a shared set or motif, proven sales, the same metal colour and a
 * smaller ticket than the piece already chosen. A shared set outweighs one
 * step of FIT, so a piece's own set comes before the hoops.
 */
export const matchScore = (anchor: JewelPiece, candidate: JewelPiece): number => {
  const fit = FIT[kindOf(anchor)][kindOf(candidate)] ?? 0;
  if (!fit) return 0;
  const line = sharedLine(anchor, candidate);
  return (
    fit * 10 +
    (line === "set" ? 15 : line === "motif" ? 5 : 0) +
    (PROVEN.has(candidate.handle) ? 3 : 0) +
    (familyOf(candidate) === familyOf(anchor) ? 2 : 0) +
    (candidate.price <= anchor.price ? 1 : 0)
  );
};

/** How alike two pieces of the same category are: their line, style, metal and price. */
export const similarScore = (anchor: JewelPiece, candidate: JewelPiece): number => {
  const line = sharedLine(anchor, candidate);
  return (
    (line === "set" ? 6 : line === "motif" ? 3 : 0) +
    (styleOf(candidate) === styleOf(anchor) ? 4 : 0) +
    (familyOf(candidate) === familyOf(anchor) ? 2 : 0) -
    Math.abs(Math.log(candidate.price / Math.max(anchor.price, 1)))
  );
};

/*
  The pieces Shopify holds 20 or more of: the only ones the bag adds in one
  tap, so that add never meets a piece about to sell out. Shopify's counts on
  18 October, rings left out (they need a size) and the pre-order tags left out.
  They also order ties on the product page. A piece that sells out drops out by
  itself (`buyable`). Re-check the list when stock moves.
*/
export const DEEP_STOCK: Readonly<Record<string, number>> = {
  "toggle-link-chain": 80,
  "baguette-tennis-bracelet": 69,
  "prism-riviere-bracelet": 68,
  "woven-gold-hoops": 66,
  "baguette-huggies": 60,
  "bold-nocturne-chain": 54,
  "bold-nocturne-bracelet": 50,
  "kiss-knot-bangle": 40,
  "marquise-layering-set": 40,
  "silk-mesh-cuff": 40,
  "brushed-gold-huggies": 35,
  "ribbon-bead-bracelet": 35,
  "riviere-eternal-bracelet": 34,
  "heartbead-bracelet": 26,
  "baroque-shell-bracelet": 23,
  "serpentine-whisper-chain-silver": 23,
  "bold-nocturne-drops": 20,
  "charm-box-chain": 20,
  "droplet-open-cuff": 20,
  "duo-link-bracelet": 20,
  "duo-link-necklace": 20,
  "emerald-square-ear-cuff": 20,
  "fine-tennis-bracelet": 20,
  "garnet-cable-cuff": 20,
  "marquise-drop-choker": 20,
  "mint-pear-drop-earrings": 20,
  "north-star-bangle": 20,
  "pear-point-open-cuff": 20,
  "petal-flower-studs": 20,
  "serpentine-whisper-chain": 20,
  "triple-coil-wrap-bangle": 20,
};
const STOCK = new Map(Object.entries(DEEP_STOCK));
const stockOf = (piece: JewelPiece) => STOCK.get(piece.handle) ?? 0;

/* Best first; ties to the deeper stock, then the handle. */
const ranked = (pieces: JewelPiece[], score: (piece: JewelPiece) => number) =>
  pieces
    .map((piece) => ({ piece, score: score(piece) }))
    .sort((a, b) => b.score - a.score || stockOf(b.piece) - stockOf(a.piece) || a.piece.handle.localeCompare(b.piece.handle));

/**
 * "Complete the look" on a product page: up to `count` pieces from other
 * categories, the best match first and then one per category, so a bracelet's
 * page offers its own set, the hoops and a ring rather than three earrings.
 * Only pieces a one-tap Add can take: buyable and not pre-order.
 */
export const completeTheLook = (piece: JewelPiece, catalogue: JewelPiece[], count = 3): JewelPiece[] => {
  const candidates = ranked(
    catalogue.filter((p) => p.handle !== piece.handle && p.category !== piece.category && oneTap(p)),
    (p) => matchScore(piece, p),
  )
    .filter(({ score }) => score > 0)
    .map(({ piece: p }) => p);
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

/** Whether a product page's suggestions are mostly its own set ("Complete the set"). */
export const isSetRow = (piece: JewelPiece, pieces: JewelPiece[]) =>
  pieces.filter((p) => sharedLine(piece, p) === "set").length >= 2;

/** "More bracelets": the same category, closest in line, style, metal and price. */
export const moreLikeThis = (piece: JewelPiece, catalogue: JewelPiece[], count = 8): JewelPiece[] =>
  ranked(
    catalogue.filter((p) => p.handle !== piece.handle && p.category === piece.category && buyable(p)),
    (p) => similarScore(piece, p),
  )
    .slice(0, count)
    .map(({ piece: p }) => p);

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
    .filter((p) => STOCK.has(p.handle) && !taken.has(p.handle) && kindOf(p) !== "ring" && oneTap(p) && !choiceNeeded(p))
    .map((p) => ({ piece: p, score: matchScore(anchor, p) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || stockOf(b.piece) - stockOf(a.piece) || a.piece.handle.localeCompare(b.piece.handle));
  if (!scored.length) return null;
  return { anchor, pieces: scored.filter(({ score }) => score === scored[0].score).slice(0, 2).map(({ piece }) => piece) };
};
