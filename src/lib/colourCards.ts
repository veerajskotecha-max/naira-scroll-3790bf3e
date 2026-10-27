import type { JewelPiece, JewelVariant } from "@/data/jewellery";
import { choices, firstBuyable, initialChoice, openingVariant } from "@/lib/variants";

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

/** The colour a catalogue ad's link names by Shopify's variant number
    (?variant=50651970109602): Meta links every metal and size of a piece to the
    same page that way. The page opens on that colour, as the ad pictured it;
    the size stays the shopper's to choose. */
export const colourOfVariant = (piece: JewelPiece, param?: string | null) => {
  const option = colourOption(piece);
  const id = param?.trim();
  if (!option || !id || !/^\d+$/.test(id)) return undefined;
  return piece.variants?.find((v) => v.id.split("/").pop() === id)?.options[option.name];
};

/** The choices a page opens on: its opening variant in the colour its link
    names, else the piece's own (see openingVariant). */
export const openingChoice = (piece: JewelPiece, param?: string | null): Record<string, string> => {
  const colour = colourFromParam(piece, param);
  const ways = colour ? (piece.variants ?? []).filter((v) => v.options[colour.option] === colour.value) : [];
  return ways.length ? { ...openingVariant(piece, ways).options } : initialChoice(piece);
};

/** A card's product page: on the colour the card shows, when it shows one. */
export const pieceHref = (piece: JewelPiece) =>
  `/jewellery/${piece.handle}${piece.colour ? `?colour=${encodeURIComponent(piece.colour.value.toLowerCase())}` : ""}`;

/** A stable key for a card: one product can show as several colours. */
export const cardKey = (piece: JewelPiece) => (piece.colour ? `${piece.handle}~${piece.colour.value}` : piece.handle);

const pathOf = (url: string) => url.split("?")[0];
const wordsOf = (text: string) => text.toLowerCase().split(/[^a-z]+/).filter(Boolean);

/*
  The photo each colour of a piece is shown in. Shopify hands a variant with no
  photo of its own the listing's first photo, so a colour without one arrives
  wearing the other metal: Droplet Open Cuff, Tubogas Dome Ring and Star Point
  Band each showed two gold cards on Shop All (27 Oct 2026). A colour's photo is
  one only its own variants carry; else a gallery photo whose file is named for
  it ("droplet-open-cuff_3_silver.jpg"); else the shared photo, for the first
  colour only. A colour left with none gets no card of its own; it is still
  chosen on the product page.
*/
export const colourPhotos = (piece: JewelPiece): Map<string, string> => {
  const photos = new Map<string, string>();
  const option = colourOption(piece);
  if (!option) return photos;
  const carried = new Map(
    option.values.map((value) => [
      value,
      [...new Set((piece.variants ?? []).filter((v) => v.options[option.name] === value && v.image).map((v) => v.image!))],
    ]),
  );
  const colours = (url: string) => option.values.filter((value) => carried.get(value)!.some((u) => pathOf(u) === pathOf(url))).length;
  const handleWords = new Set(wordsOf(piece.handle));
  const named = (value: string) => {
    const wanted = wordsOf(value);
    return (piece.gallery ?? []).find((url) => {
      if (url === piece.sizeGuide) return false;
      const words = wordsOf(pathOf(url).split("/").pop() ?? "").filter((w) => !handleWords.has(w));
      return wanted.every((w) => words.includes(w));
    });
  };
  const shown = new Set<string>();
  for (const value of option.values) {
    const urls = carried.get(value)!;
    const photo = urls.find((url) => colours(url) === 1) ?? named(value) ?? urls[0];
    if (!photo || shown.has(pathOf(photo))) continue;
    shown.add(pathOf(photo));
    photos.set(value, photo);
  }
  return photos;
};

/** The photo a variant is shown in: its colour's own photo (see colourPhotos),
    else Shopify's photo for it. Undefined for a colour with no photo of its own. */
export const variantPhoto = (piece: JewelPiece, variant?: JewelVariant) => {
  const option = colourOption(piece);
  if (!variant) return undefined;
  return option ? colourPhotos(piece).get(variant.options[option.name]) : variant.image;
};

/** The grid's cards: one per colour, each in its own photo; a piece sold one
    way, only in sizes, or photographed in one colour only, stays one card. */
export const colourCards = (pieces: JewelPiece[]): JewelPiece[] =>
  pieces.flatMap((piece) => {
    const option = colourOption(piece);
    if (!option || !piece.variants?.length) return [piece];
    const photos = colourPhotos(piece);
    const cards = option.values.flatMap((value): JewelPiece[] => {
      const ways = piece.variants!.filter((v) => v.options[option.name] === value);
      const image = photos.get(value);
      if (!ways.length || !image) return [];
      const lead = firstBuyable(ways);
      const compare = lead.compareAtPrice;
      return [
        {
          ...piece,
          colour: { option: option.name, value },
          image,
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
