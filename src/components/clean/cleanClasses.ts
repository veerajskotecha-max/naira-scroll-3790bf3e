/*
  Names for the clean system's classes (clean.css), so a page asks for a
  button or a text style by what it is. Type and colour on the product page
  and in the bag come from these and from nowhere else; Tailwind utilities
  are for layout only (flex, grid, gaps, margins, widths).
*/

/** The class every clean root carries: the product page's outer element and the bag's sheet. */
export const CLEAN_ROOT = "nf-clean";

type ButtonOptions = {
  /** "ink" is the one filled action in view; "line" is every other button. */
  fill?: "ink" | "line";
  /** 52px (the buy buttons, Checkout), 48px (the phone's buy bar) or 44px (inside lists). */
  size?: "lg" | "bar" | "sm";
  /** Full width of its container. */
  block?: boolean;
};

export const cleanButton = ({ fill = "line", size = "lg", block = false }: ButtonOptions = {}) =>
  ["nc-btn", fill === "ink" && "nc-btn--ink", size === "sm" && "nc-btn--sm", size === "bar" && "nc-btn--bar", block && "nc-btn--block"]
    .filter(Boolean)
    .join(" ");

/** The type styles, by role. Eight, in five sizes; see SPEC section 2. */
export const cleanType = {
  /** The piece's name: Jost 300, 26/32 (34/40 from 1024px). */
  title: "nc-title",
  /** A section's heading: Jost 300, 22/28 (28/34 from 1024px). */
  heading: "nc-heading",
  /** The bag's own heading and its empty line: Jost 300, 20/28. */
  sheetHeading: "nc-heading nc-heading--sheet",
  /** Caps label, Jost 500 11/16 at 0.18em, ink. */
  label: "nc-label",
  /** The same label in gold: the eyebrow, and a saving. */
  eyebrow: "nc-label nc-label--gold",
  /** Reading text, Jost 400 14/22, ink. */
  text: "nc-text",
  /** The same, medium: a name that leads a row, "Total". */
  strong: "nc-text nc-text--strong",
  /** Reading text in the second colour. */
  textMuted: "nc-text nc-text--muted",
  /** Supporting text, Jost 400 13/20, muted. */
  small: "nc-small",
  /** Supporting text in ink. */
  smallInk: "nc-small nc-small--ink",
  /** Supporting text in gold: a saving, a reached rung. */
  saving: "nc-small nc-gold",
  /** An underlined link inside text. */
  link: "nc-link",
} as const;
