import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(__dirname, "..", file), "utf8");

/* axe on the live site: no <main> landmark on the home page, Shop All or any
   product page; a second banner on Shop All (its hero was a <header>); and
   headings that skipped levels (the home "The edit." h3 and the footer h4s
   straight after an h1). Screen-reader users navigate by exactly these. */
describe("page landmarks", () => {
  it.each(["pages/Index.tsx", "pages/Jewellery.tsx", "pages/JewelDetailNext.tsx"])(
    "%s has one <main>, closed before the footer",
    (file) => {
      const code = read(file);
      expect(code.match(/<main[\s>]/g)).toHaveLength(1);
      expect(code.match(/<\/main>/g)).toHaveLength(1);
      expect(code.indexOf("</main>")).toBeLessThan(code.lastIndexOf("<Footer"));
    },
  );

  it("leaves the site header the only banner on Shop All", () => {
    expect(read("pages/Jewellery.tsx")).not.toMatch(/<header[\s>]/);
  });

  it("keeps the shared sections' headings one level under the page's h1", () => {
    expect(read("components/Footer.tsx")).not.toMatch(/<h[3-6][\s>]/);
    expect(read("components/jewellery/JewelleryCategories.tsx")).not.toMatch(/<h[3-6][\s>]/);
  });
});
