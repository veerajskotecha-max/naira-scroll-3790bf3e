import { describe, expect, it } from "vitest";
import { clipText } from "./clipText";

/* The live blurb of prism-riviere-bracelet, the most-advertised piece. Its
   meta description ended "…cushion cut pastel cubic zirconia " and its
   og:description "…of about 5mm, each s". */
const PRISM =
  "Colour, laid out in a straight line. This 18cm bracelet runs a continuous row of cushion cut pastel cubic zirconia of about 5mm, each stone framed by a fine halo of tiny clear pave, with the shades repeating through aqua blue, soft pink and pale yellow.";

describe("clipText", () => {
  it.each([110, 130, 150])("cuts the blurb between words, inside %i characters, with an ellipsis", (max) => {
    const out = clipText(PRISM, max);
    expect(out.length).toBeLessThanOrEqual(max);
    expect(out.endsWith("…")).toBe(true);
    const body = out.slice(0, -1);
    expect(PRISM.startsWith(body)).toBe(true);
    // The next character in the source ends the word the cut kept.
    expect(PRISM.charAt(body.length)).toMatch(/[\s,.]/);
    expect(body).not.toMatch(/[\s,]$/);
  });

  it("gives the og line its words back", () => {
    expect(clipText(PRISM, 150)).toBe(
      "Colour, laid out in a straight line. This 18cm bracelet runs a continuous row of cushion cut pastel cubic zirconia of about 5mm, each stone framed by…",
    );
  });

  it("leaves copy that fits as it is, spaces tidied", () => {
    expect(clipText("  Hand-set  zircone.\n", 130)).toBe("Hand-set zircone.");
    expect(clipText("", 130)).toBe("");
  });

  it("keeps a word that ends exactly at the limit", () => {
    expect(clipText("abc def ghi", 8)).toBe("abc def…");
  });
});
