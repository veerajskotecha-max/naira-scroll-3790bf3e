/**
 * Shortens copy to at most `max` characters for a meta or social description.
 * A cut lands between words and ends in an ellipsis, inside the limit.
 *
 * Every product page cut its blurb at a fixed character count, so search
 * results and link previews ended mid-word ("…each s", "…pearls, glas").
 */
export const clipText = (text: string, max: number): string => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  // Room for the ellipsis; the word that straddles the limit goes whole.
  const head = clean.slice(0, max - 1);
  const space = clean.charAt(max - 1) === " " ? head.length : head.lastIndexOf(" ");
  const words = space > 0 ? head.slice(0, space) : head;
  return `${words.replace(/[\s,;:.–—-]+$/, "")}…`;
};

/**
 * A page title with the brand, at most `max` characters: search results cut
 * longer ones off. 26 pages ran to 66–76 characters, /jewellery among them.
 *
 * A title that is too long keeps only what comes before its FIRST ", " or
 * " · ", then words if that is still too long. Peeling parts off the end
 * instead left half a list: "Zirconia vs Diamond, Sparkle, Hardness and Cost
 * Compared" became "Zirconia vs Diamond, Sparkle". A page whose first part
 * alone reads badly gets a shorter title of its own in its data.
 */
export const fitTitle = (page: string, brand = " | Naira Flore", max = 65): string => {
  const room = max - brand.length;
  let fit = page.replace(/\s+/g, " ").trim();
  if (fit.length > room) {
    const cuts = [fit.indexOf(", "), fit.indexOf(" · ")].filter((i) => i > 0);
    if (cuts.length) fit = fit.slice(0, Math.min(...cuts));
  }
  if (fit.length > room) {
    const space = fit.charAt(room) === " " ? room : fit.lastIndexOf(" ", room);
    fit = fit.slice(0, space > 0 ? space : room).replace(/[\s,;:–—-]+$/, "");
  }
  return `${fit}${brand}`;
};
