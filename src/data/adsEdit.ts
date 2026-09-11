import type { JewelPiece } from "@/data/jewellery";

/* The Golden Hour — a private, ads-only edit.
   Not linked anywhere in the site navigation; reachable only by URL.
   Ordered exactly as listed: the grid follows this order. */

export type EditEntry = {
  /** Preferred catalogue handle. */
  handle?: string;
  /** Fallback: match a live Shopify title (case-insensitive substring). */
  match?: string[];
  /** Used when neither the handle nor the title match resolves. */
  fallbackHandle?: string;
};

export const GOLDEN_HOUR_HANDLES: EditEntry[] = [
  { handle: "ivory-clasp-chain", match: ["toggle link"] },
  { handle: "woven-gold-hoops", match: ["woven gold hoop"] },
  { match: ["prism riv", "prism"], fallbackHandle: "riviere-of-light-bracelet" },
  { handle: "molten-bloom-hoops", match: ["molten"] },
  { match: ["heartbead", "heart bead"], fallbackHandle: "cuban-pearl-bracelet" },
  { handle: "charm-box-chain", match: ["charm box"] },
  { handle: "cushion-halo-ring", match: ["cushion halo"] },
  { handle: "brushed-gold-huggies", match: ["brushed gold huggies", "huggie"] },
  { handle: "blush-halo-ring", match: ["blush cluster"], fallbackHandle: "chevron-whisper-ring" },
  { handle: "heart-whisper-studs", match: ["pearl drop"] },
];

/** Resolve the edit against the live catalogue, keeping the curated order. */
export const resolveEdit = (all: JewelPiece[], entries = GOLDEN_HOUR_HANDLES): JewelPiece[] => {
  const picked: JewelPiece[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    let piece: JewelPiece | undefined;

    if (entry.handle) piece = all.find((p) => p.handle === entry.handle);

    if (!piece && entry.match?.length) {
      piece = all.find((p) =>
        entry.match!.some((m) => p.name.toLowerCase().includes(m.toLowerCase())),
      );
    }

    if (!piece && entry.fallbackHandle) {
      piece = all.find((p) => p.handle === entry.fallbackHandle);
    }

    if (piece && !seen.has(piece.handle)) {
      seen.add(piece.handle);
      picked.push(piece);
    }
  }

  return picked;
};
