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
  /** Keep the piece visible even when sold out (renders with its badge). */
  showSoldOut?: boolean;
};

export const GOLDEN_HOUR_HANDLES: EditEntry[] = [
  { handle: "riviere-of-light-bracelet", match: ["riviere of light", "prism riviere"], showSoldOut: true },
  { handle: "ribbon-bead-bracelet", match: ["ribbon bead", "yf8156"] },
  { handle: "baroque-shell-bracelet", match: ["baroque shell bracelet", "yf3925"] },
  { handle: "heartbead-bracelet", match: ["heartbead", "heart bead", "yf5215"] },
  { handle: "bold-nocturne-bracelet", match: ["bold nocturne bracelet", "yf5144-bra"] },
  { handle: "bold-nocturne-chain", match: ["bold nocturne chain", "yf5144"] },
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
        entry.match?.some((m) => `${p.name} ${p.sku}`.toLowerCase().includes(m.toLowerCase())),
      );
    }

    if (!piece && entry.fallbackHandle) {
      piece = all.find((p) => p.handle === entry.fallbackHandle);
    }

    if (piece?.availableForSale && !seen.has(piece.handle)) {
      seen.add(piece.handle);
      picked.push(piece);
    }
  }

  return picked;
};
