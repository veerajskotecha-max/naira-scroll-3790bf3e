import type { JewelPiece } from "@/data/jewellery";
import { choices, firstBuyable, initialChoice } from "@/lib/variants";

/*
  A piece sold in more than one metal or stone shows each colour as its own
  card in the shop grid: that colour's photo first, its own price, and a link
  that opens the same product page already on that colour, its photo leading
  the gallery. Sizes and birthstone months stay choices on the page; they are
  not colours.
*/
const COLOUR = /^(metal|stone|colou?r|tone|finish|plating)$/i;

/** The option a piece's colours are chosen by ("Metal", "Stone"), when it has one. */
export const colourOption = (piece: JewelPiece) => choices(piece).find((o) => COLOUR.test(o.name.trim()));

/** The colour a page link names (?colour=silver), in the piece's own spelling. */
export const colourFromParam = (piece: JewelPiece, param?: string | null) => {
  const option = colourOption(piece);
  const wanted = param?.trim().toLowerCase();
  const value = wanted ? option?.values.find((v) => v.toLowerCase() === wanted) : undefined;
  return option && value ? { option: option.name, value } : undefined;
};

/** The choices a page opens on: the first buyable variant in the colour its link
    names, else the first buyable variant. */
export const openingChoice = (piece: JewelPiece, param?: string | null): Record<string, string> => {
  const colour = colourFromParam(piece, param);
  const ways = colour ? (piece.variants ?? []).filter((v) => v.options[colour.option] === colour.value) : [];
  return ways.length ? { ...firstBuyable(ways).options } : initialChoice(piece);
};

/** A card's product page: on the colour the card shows, when it shows one. */
export const pieceHref = (piece: JewelPiece) =>
  `/jewellery/${piece.handle}${piece.colour ? `?colour=${encodeURIComponent(piece.colour.value.toLowerCase())}` : ""}`;

/** A stable key for a card: one product can show as several colours. */
export const cardKey = (piece: JewelPiece) => (piece.colour ? `${piece.handle}~${piece.colour.value}` : piece.handle);

/** The grid's cards: one per colour; a piece sold one way, or only in sizes, stays one card. */
export const colourCards = (pieces: JewelPiece[]): JewelPiece[] =>
  pieces.flatMap((piece) => {
    const option = colourOption(piece);
    if (!option || !piece.variants?.length) return [piece];
    const cards = option.values.flatMap((value): JewelPiece[] => {
      const ways = piece.variants!.filter((v) => v.options[option.name] === value);
      if (!ways.length) return [];
      const lead = firstBuyable(ways);
      const compare = lead.compareAtPrice;
      return [
        {
          ...piece,
          colour: { option: option.name, value },
          image: ways.find((v) => v.image)?.image ?? piece.image,
          variantId: lead.id,
          price: lead.price,
          priceLabel: `₹${lead.price.toLocaleString("en-IN")}`,
          compareAtPrice: compare,
          compareAtLabel: compare ? `₹${compare.toLocaleString("en-IN")}` : undefined,
          availableForSale: ways.some((v) => v.availableForSale),
        },
      ];
    });
    return cards.length > 1 ? cards : [piece];
  });
