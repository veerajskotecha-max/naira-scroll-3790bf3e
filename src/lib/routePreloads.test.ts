import { describe, expect, it } from "vitest";
import { keepOnlyRoutePreloads, staticClosure, type ViteManifest } from "./routePreloads";

const manifest: ViteManifest = {
  "index.html": { file: "assets/index-E.js", imports: ["_vendor-V.js"] },
  "_vendor-V.js": { file: "assets/vendor-V.js" },
  "src/pages/JewelDetail.tsx": { file: "assets/JewelDetail-J.js", imports: ["index.html", "_vendor-V.js", "_Footer-F.js"] },
  "_Footer-F.js": { file: "assets/Footer-F.js" },
  "src/components/CustomerReviews.tsx": { file: "assets/CustomerReviews-C.js" },
};

describe("staticClosure", () => {
  it("collects the page chunk and what it imports statically", () => {
    expect([...staticClosure(manifest, "src/pages/JewelDetail.tsx")].sort()).toEqual(
      ["/assets/Footer-F.js", "/assets/JewelDetail-J.js", "/assets/index-E.js", "/assets/vendor-V.js"],
    );
  });
});

describe("keepOnlyRoutePreloads", () => {
  const head =
    '<link rel="modulepreload" crossorigin="" href="/assets/vendor-V.js">' +
    '<link rel="modulepreload" as="script" crossorigin="" href="/assets/JewelDetail-J.js">' +
    '<link rel="modulepreload" as="script" crossorigin="" href="/assets/CustomerReviews-C.js">' +
    '<link rel="modulepreload" as="script" crossorigin="" href="/assets/supabase-S.js">';

  it("keeps the page's own code and drops what the page loads later on purpose", () => {
    const html = keepOnlyRoutePreloads(head, staticClosure(manifest, "src/pages/JewelDetail.tsx"));
    expect(html).toContain("/assets/JewelDetail-J.js");
    expect(html).toContain("/assets/vendor-V.js"); // written by the build, never touched
    expect(html).not.toContain("CustomerReviews");
    expect(html).not.toContain("supabase");
  });
});
