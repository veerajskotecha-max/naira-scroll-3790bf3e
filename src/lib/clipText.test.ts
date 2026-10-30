import { describe, expect, it } from "vitest";
import { clipText, fitTitle } from "./clipText";
import { allArticles, allLandings } from "@/data/seoContent";

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

/* 26 pages had titles of 66–76 characters that search results cut off, most
   because " | Naira Flore" followed a full "Topic, qualifier" title. */
describe("fitTitle", () => {
  it("drops trailing qualifiers whole before words", () => {
    expect(fitTitle("Demi-Fine Jewellery Online India, Anti-Tarnish 18K Gold Finish")).toBe("Demi-Fine Jewellery Online India | Naira Flore");
    expect(fitTitle("American Diamond Jewellery, Brilliant-Cut Zircone, 18K Finish")).toBe(
      "American Diamond Jewellery, Brilliant-Cut Zircone | Naira Flore",
    );
    expect(fitTitle("Serpentine Whisper Chain — Silver · Demi-Gold Jewellery")).toBe("Serpentine Whisper Chain — Silver | Naira Flore");
  });

  it("leaves a title that fits as it is", () => {
    expect(fitTitle("Prism Rivière Bracelet · Demi-Gold Jewellery")).toBe("Prism Rivière Bracelet · Demi-Gold Jewellery | Naira Flore");
    expect(fitTitle("Track Your Order")).toBe("Track Your Order | Naira Flore");
  });

  it("cuts a single long phrase between words", () => {
    const out = fitTitle("A very long product name that keeps going well past any limit at all");
    expect(out.length).toBeLessThanOrEqual(65);
    expect(out).toBe("A very long product name that keeps going well past | Naira Flore");
  });

  it("keeps every landing and journal title within 65 characters", () => {
    const pages = [...allLandings.map((c) => c.metaTitle), ...allArticles.map((a) => a.metaTitle)].map((t) =>
      fitTitle(t.replace(/ \| Naira Flore$/, "")),
    );
    expect(pages.filter((t) => t.length > 65)).toEqual([]);
    // Shortening must not leave two pages with one title.
    expect(pages.filter((t, i) => pages.indexOf(t) !== i)).toEqual([]);
  });
});
