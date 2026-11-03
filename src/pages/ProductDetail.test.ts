import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/* main.tsx waits for a landing page's static imports before React starts. The
   outfit page imported its reviews (and their data and dialog) statically,
   which took its first download to 265.8 KiB gzip against 238 lazy. They sit
   below the gallery and details, as on the jewellery page. */
describe("the outfit product page's first download", () => {
  const page = readFileSync(resolve(__dirname, "ProductDetail.tsx"), "utf8");

  it("loads the reviews on their own", () => {
    expect(page).not.toMatch(/^import CustomerReviews from/m);
    expect(page).toMatch(/const CustomerReviews = lazy\(\(\) => import\("@\/components\/CustomerReviews"\)\);/);
  });
});
