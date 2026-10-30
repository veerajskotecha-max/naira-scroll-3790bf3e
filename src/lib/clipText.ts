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
