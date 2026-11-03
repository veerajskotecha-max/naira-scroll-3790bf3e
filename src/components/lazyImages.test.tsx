import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Testimonials from "./Testimonials";
import Craftsmanship from "./Craftsmanship";
import FounderStoryTeaser from "./FounderStoryTeaser";

/* React 18 sets an <img>'s attributes in the order they are written. The home
   page is served pre-built, and React's first render replaces that DOM; when
   it sets src before loading="lazy", Chromium finds the URL the pre-built copy
   already listed and starts the download on the spot. Eleven outfit and
   testimonial photos (~1.5 MB), 4,700-6,900px below an 839px screen, were
   fetched with the page unscrolled. loading must come first. */
const lazyImgs = (html: string) => html.match(/<img\b[^>]*\bloading="lazy"[^>]*>/g) ?? [];

describe("below-the-fold home images", () => {
  it.each([
    ["Testimonials", <Testimonials key="t" />],
    ["Craftsmanship", <Craftsmanship key="c" />],
    ["FounderStoryTeaser", <FounderStoryTeaser key="f" />],
  ])("%s marks each image lazy before giving it a src", (_name, element) => {
    const imgs = lazyImgs(renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>));
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) expect(img.indexOf("loading=")).toBeLessThan(img.indexOf("src="));
  });
});
