import type { JewelPiece } from "@/data/jewellery";
import type { CategoryLanding } from "@/data/seoContent";
import { isAdjustableRing } from "@/data/ringFit";
import { hasZirconeStone } from "@/lib/jewelleryPresentation";

const identity = (piece: JewelPiece) => `${piece.name} ${piece.handle.replace(/-/g, " ")} ${(piece.tags ?? []).join(" ")}`;
const matches = (piece: JewelPiece, pattern: RegExp) => pattern.test(identity(piece));
const gold = (piece: JewelPiece) => piece.colour
  ? /gold/i.test(piece.colour.value)
  : matches(piece, /\bgold\b/i);

// Specialist landings must not silently become the whole parent category.
const selectors: Record<string, (piece: JewelPiece) => boolean> = {
  "adjustable-rings": (p) => isAdjustableRing(p.handle) || matches(p, /\badjustable\b/i),
  "hoop-earrings": (p) => matches(p, /hoops?|huggies?/i),
  "stud-earrings": (p) => matches(p, /\bstuds?\b/i),
  "zirconia-earrings": hasZirconeStone,
  "solitaire-rings": (p) => matches(p, /solitaire/i),
  "cocktail-rings": (p) => matches(p, /cocktail|statement|cluster|halo|dome|duet|papillon|trio/i),
  "couple-rings": (p) => matches(p, /band|duet|linked|pair|trio/i),
  "layered-necklaces": (p) => matches(p, /layer|lariat|chain|choker/i),
  "pendant-sets": (p) => matches(p, /pendant|necklace|\bset\b/i),
  "chain-for-women": (p) => matches(p, /chain/i),
  "evil-eye-bracelets": (p) => matches(p, /evil[- ]?eye/i),
  "charm-bracelets": (p) => matches(p, /charm|station|bead|heart|star/i),
  "pearl-jewellery": (p) => matches(p, /\bpearl\b/i),
  "rose-gold-jewellery": (p) => p.colour ? /rose[- ]?gold/i.test(p.colour.value) : matches(p, /rose[- ]?gold/i),
  "gold-plated-jewellery": gold,
  "18k-gold-plated-jewellery": gold,
  "american-diamond-jewellery": hasZirconeStone,
  "minimal-jewellery": (p) => matches(p, /minimal|dainty|petite|fine|whisper|stud|huggie|bezel/i),
  "office-wear-jewellery": (p) => matches(p, /everyday|minimal|dainty|petite|fine|whisper|stud|huggie|bezel|chain/i),
};

export const collectionPieces = (pieces: JewelPiece[], landing: Pick<CategoryLanding, "slug" | "category">) =>
  pieces.filter((piece) => (!landing.category || piece.category === landing.category) && (selectors[landing.slug]?.(piece) ?? true));

export const matchesOccasion = (piece: JewelPiece, tag: string) => {
  if ((piece.tags ?? []).some((t) => t.trim().toLowerCase() === tag.trim().toLowerCase())) return true;
  if (/^everyday$/i.test(tag)) return selectors["office-wear-jewellery"](piece);
  if (/^festive$|^wedding$/i.test(tag)) return hasZirconeStone(piece) || matches(piece, /pearl|statement|drop|layer|nocturne/i);
  return false;
};