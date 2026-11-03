import { render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CatchAll from "./CatchAll";

/*
  The host answers any address without a file of its own with the homepage's
  pre-built HTML: canonical "/", "index, follow". Whatever the app draws for an
  address that is not a page has to replace both, or the soft 404 is indexed as
  a copy of the homepage. The order-link state did not: it rendered no head.
*/
vi.mock("@/lib/shopperPerformance", () => ({ reportShopperPerformance: vi.fn() }));
vi.mock("@/components/Footer", () => ({ default: () => null }));

const homepageHead = () => {
  document.head.innerHTML =
    '<link rel="canonical" href="https://nairaflore.com/" data-rh="true">' +
    '<meta name="robots" content="index, follow, max-image-preview:large" data-rh="true">' +
    '<meta property="og:url" content="https://nairaflore.com/" data-rh="true">';
};
const head = () => ({
  canonical: document.head.querySelectorAll('link[rel="canonical"]').length,
  ogUrl: document.head.querySelectorAll('meta[property="og:url"]').length,
  robots: [...document.head.querySelectorAll('meta[name="robots"]')].map((m) => m.getAttribute("content")),
});
const mount = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <CatchAll />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("an address that is not a page", () => {
  const realLocation = window.location;
  beforeEach(homepageHead);
  afterEach(() => Object.defineProperty(window, "location", { value: realLocation, configurable: true, writable: true }));

  it("drops the homepage's canonical and says noindex on Coming Soon", async () => {
    mount("/pages/no-such-page");
    await waitFor(() => expect(head()).toEqual({ canonical: 0, ogUrl: 0, robots: ["noindex, follow"] }));
  });

  it("does the same while an order link is handed to Shopify", async () => {
    Object.defineProperty(window, "location", { value: { ...realLocation, replace: vi.fn() }, configurable: true, writable: true });
    mount("/68096065698/orders/fake-token/authenticate");
    await waitFor(() => expect(head()).toEqual({ canonical: 0, ogUrl: 0, robots: ["noindex, follow"] }));
  });
});
