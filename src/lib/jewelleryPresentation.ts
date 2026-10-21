import type { JewelPiece } from "@/data/jewellery";

// Listing specs, not the historical generic materials summary, confirm stones.
const evidenceOf = (piece: JewelPiece) =>
  [piece.description?.split(/STYLING TIP:/i)[0], ...(piece.details ?? []), piece.blurb].filter(Boolean).join(" ");

export const hasZirconeStone = (piece: JewelPiece): boolean =>
  /\b(?:zircone|zirconia|cubic zirconia|cz)\b/i.test(evidenceOf(piece));

export const coatingOf = (piece: JewelPiece): string => {
  const details = (piece.details ?? []).find((line) => /^Plating:/i.test(line));
  const plating = details ?? piece.description?.match(/Plating:\s*([\s\S]*?)(?=Material:|Care|$)/i)?.[1] ?? piece.materials;
  const gold = /\bgold\b/i.test(plating);
  const rhodium = /\brhodium\b/i.test(plating);
  const silver = /\bsilver\b/i.test(plating);
  if (gold && (rhodium || silver)) return "Gold & rhodium coated";
  if (rhodium) return "Rhodium coated";
  if (silver) return "Silver coated";
  if (gold) return /18\s*k/i.test(plating) ? "18K gold coated" : "Gold coated";
  return "Coated finish";
};

export const stoneOf = (piece: JewelPiece): string | null => {
  const evidence = evidenceOf(piece);
  const pearl = /\bpearls?\b/i.test(evidence);
  const zircone = hasZirconeStone(piece);
  if (pearl && zircone) return "Pearl & zircone";
  if (zircone) return "Zircone stone";
  if (pearl) return /shell pearl/i.test(evidence) ? "Shell pearl" : /freshwater pearl/i.test(evidence) ? "Freshwater pearl" : "Pearl";
  return null;
};

const coatingCopy = (text: string) => text
  .replace(/gold[- ]tone(?:\s+plated)?/gi, "gold coated")
  .replace(/rhodium[- ]plated(?:\s+silver[- ]tone)?/gi, "rhodium coated")
  .replace(/silver[- ]tone(?:\s+plated)?/gi, "silver coated");

export const PRISM_BRACELET_SIZE_CM = { min: 15, max: 19 } as const;

const productCopy = (piece: JewelPiece, text: string): string => {
  const coated = coatingCopy(text);
  if (piece.handle !== "prism-riviere-bracelet") return coated;
  const { min, max } = PRISM_BRACELET_SIZE_CM;
  return coated
    .replace(/\b18\s*cm\b/gi, `${min}–${max} cm adjustable`)
    .replace(/\b15\s*[-–—]\s*19\s*cm(?:\s+adjustable)?/gi, `${min}–${max} cm adjustable`);
};

// Apply equally to live data, embedded pages and cold-load snapshots without
// altering Shopify's catalogue, stock, prices or the original product name.
export const presentJewellery = (piece?: JewelPiece | null): JewelPiece | null => piece ? {
  ...piece,
  blurb: productCopy(piece, piece.blurb),
  description: piece.description ? productCopy(piece, piece.description) : undefined,
  stylingTip: piece.stylingTip ? productCopy(piece, piece.stylingTip) : undefined,
  details: piece.details?.map((line) => productCopy(piece, line)),
  materials: productCopy(piece, piece.materials),
  care: piece.care ? productCopy(piece, piece.care) : undefined,
} : null;