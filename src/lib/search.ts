import type { JewelCategory, JewelPiece } from "@/data/jewellery";

/*
  Shop search over the jewellery catalogue.

  It used to keep any piece whose "title category tags" text contained the
  query, in catalogue order, so "ring" listed six earrings (EarRINGS) before
  the first ring, "riviere" missed Prism Rivière, "gold ring" and
  "silver studs" found nothing, and three of the five Popular chips
  ("Zircone", "Gifting", "Under 1500") always said "Nothing matches".

  Now every word of the query must start a word of the piece (name first,
  then category, then tags, metals and stones), accents and plurals are
  ignored, the stone and price words shoppers use are understood, and the
  best match comes first.
*/

export const normalise = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const words = (text: string) => normalise(text).split(/[^a-z0-9]+/).filter(Boolean);

/* "rings" → "ring", "earrings" → "earring", but "glass" stays "glass". */
const stem = (word: string) =>
  word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;

const STOP = new Set(["a", "an", "and", "the", "for", "with", "in", "of", "my", "jewellery", "jewelry", "jewel", "piece", "rs", "inr"]);

/* Words shoppers type for what the catalogue calls something else, and the
   usual misspellings. Words that also appear in piece names (chain, band,
   cuff, bangle) are left alone so they still find those pieces by name. */
const SYNONYMS: Record<string, string> = {
  zircone: "zirconia",
  zircon: "zirconia",
  cz: "zirconia",
  diamond: "zirconia",
  ad: "zirconia",
  pendant: "necklace",
  earing: "earring",
  eraring: "earring",
  neckles: "necklace",
  neckle: "necklace",
  necklac: "necklace",
  braclet: "bracelet",
  bracelate: "bracelet",
  bracelat: "bracelet",
};

export const CATEGORY_WORDS: Record<string, JewelCategory> = {
  ring: "Rings",
  earring: "Earrings",
  necklace: "Necklaces",
  bracelet: "Bracelets",
};

export interface ParsedQuery {
  terms: string[];
  max: number | null;
  min: number | null;
  /** Set when the query names exactly one category ("rings", "gold earrings"). */
  category: JewelCategory | null;
}

/** "under 1500", "below ₹1,500", "< 1500", "1500 below", "over 2000", "2000+" */
export const parseQuery = (query: string): ParsedQuery => {
  let text = normalise(query).replace(/₹/g, " ").replace(/(\d),(?=\d{3}\b)/g, "$1");
  const price: { max: number | null; min: number | null } = { max: null, min: null };
  const take = (re: RegExp, bound: "max" | "min") => {
    text = text.replace(re, (_m, n: string) => {
      price[bound] = Number(n);
      return " ";
    });
  };
  take(/(?:under|below|less than|upto|up to|within|<=?)\s*(\d{2,6})/g, "max");
  take(/(\d{2,6})\s*(?:and\s+)?(?:under|below|or less|&\s*below)/g, "max");
  take(/(?:over|above|more than|from|>=?)\s*(\d{2,6})/g, "min");
  take(/(\d{2,6})\s*(?:\+|and above|& above|or more|plus)/g, "min");
  const { max, min } = price;

  const terms = words(text)
    .filter((w) => !STOP.has(w))
    .map(stem)
    .map((w) => SYNONYMS[w] ?? w);
  const named = [...new Set(terms.map((t) => CATEGORY_WORDS[t]).filter(Boolean))];
  return { terms, max, min, category: named.length === 1 ? named[0] : null };
};

const matchWord = (fieldWords: string[], term: string) => {
  let best = 0;
  for (const w of fieldWords) {
    if (w === term || stem(w) === term) return 2;
    if (w.startsWith(term)) best = 1;
  }
  return best;
};

/** Pieces matching the query, best first; ties keep the catalogue's order. */
export const searchPieces = (pieces: JewelPiece[], query: string): JewelPiece[] => {
  const { terms, max, min } = parseQuery(query);
  if (!terms.length && max === null && min === null) return [];
  const scored: Array<[number, number, JewelPiece]> = [];
  pieces.forEach((piece, index) => {
    if (max !== null && piece.price > max) return;
    if (min !== null && piece.price < min) return;
    const name = words(piece.name);
    const category = words(piece.category);
    const extra = words(
      [
        ...(piece.tags ?? []),
        piece.colour?.value ?? "",
        ...(piece.options ?? []).flatMap((o) => o.values),
        piece.materials ?? "",
      ].join(" ")
    );
    let score = 0;
    for (const term of terms) {
      const inName = matchWord(name, term);
      const inCategory = matchWord(category, term);
      const s = inName ? 4 + inName : inCategory ? 3 + inCategory : matchWord(extra, term);
      if (!s) return; // every word has to match somewhere
      score += s;
    }
    scored.push([score, index, piece]);
  });
  return scored.sort((a, b) => b[0] - a[0] || a[1] - b[1]).map(([, , piece]) => piece);
};

/** Where "see all" and the keyboard's Go/Enter take the shopper, if the query maps onto the shop page. */
export const shopPageFor = (query: string): string | null => {
  const { terms, max, min, category } = parseQuery(query);
  const onlyCategory = terms.every((t) => CATEGORY_WORDS[t]);
  if (!category && max === null && min === null) return null;
  if (!onlyCategory) return null;
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (max !== null) params.set("under", String(max));
  if (min !== null) params.set("over", String(min));
  return `/jewellery?${params.toString()}`;
};
