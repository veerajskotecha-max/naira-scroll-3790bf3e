import { describe, expect, it } from "vitest";
import { dropUnusedImagePreloads } from "./unusedPreloads";

const page = (body: string) =>
  '<html><head><link rel="preload" as="image" href="/assets/floral-pattern-bg-q.webp" fetchpriority="high">' +
  '<link rel="preload" as="font" type="font/ttf" href="/fonts/Velista.ttf" crossorigin="">' +
  `</head><body>${body}</body></html>`;

describe("dropUnusedImagePreloads", () => {
  it("drops the hero preload from a page that never shows the hero", () => {
    const html = dropUnusedImagePreloads(page('<h1>Prism Rivière Bracelet</h1><img src="https://cdn.shopify.com/x.jpg">'));
    expect(html).not.toContain("floral-pattern-bg");
    expect(html).toContain("/fonts/Velista.ttf"); // other preloads are not its business
  });

  it("keeps it where the page uses the image", () => {
    const html = dropUnusedImagePreloads(page('<div style="background-image: url(&quot;/assets/floral-pattern-bg-q.webp&quot;)"></div>'));
    expect(html).toContain('<link rel="preload" as="image" href="/assets/floral-pattern-bg-q.webp"');
  });
});
