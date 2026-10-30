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
 * longer ones off. Trailing qualifiers go whole first ("American Diamond
 * Jewellery, Brilliant-Cut Zircone, 18K Finish" keeps its first two parts),
 * then words. 26 pages ran to 66–76 characters, /jewellery among them.
 */
export const fitTitle = (page: string, brand = " | Naira Flore", max = 65): string => {
  const room = max - brand.length;
  let fit = page.replace(/\s+/g, " ").trim();
  while (fit.length > room) {
    const cut = Math.max(fit.lastIndexOf(", "), fit.lastIndexOf(" · "));
    if (cut <= 0) break;
    fit = fit.slice(0, cut);
  }
  if (fit.length > room) {
    const space = fit.charAt(room) === " " ? room : fit.lastIndexOf(" ", room);
    fit = fit.slice(0, space > 0 ? space : room).replace(/[\s,;:–—-]+$/, "");
  }
  return `${fit}${brand}`;
};
