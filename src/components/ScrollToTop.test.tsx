import { act, render } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ScrollToTop, { isProductPath } from "./ScrollToTop";

let go: (to: string) => void = () => {};
let back: () => void = () => {};
const Nav = () => {
  const navigate = useNavigate();
  go = (to) => navigate(to);
  back = () => navigate(-1);
  return null;
};

/* jsdom does not scroll: the spy moves scrollY itself, and a shopper's scroll
   is a scrollY change plus the scroll event the page listens for. */
const setY = (y: number) => Object.defineProperty(window, "scrollY", { value: y, configurable: true, writable: true });
const shopperScrollsTo = (y: number) => {
  setY(y);
  window.dispatchEvent(new Event("scroll"));
};
const spyScroll = () =>
  vi.spyOn(window, "scrollTo").mockImplementation(((_x: number, y: number) => {
    setY(y);
  }) as unknown as typeof window.scrollTo);

const mount = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ScrollToTop />
      <Nav />
    </MemoryRouter>,
  );

describe("ScrollToTop", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setY(0);
  });

  it("leaves the first page where the shopper has scrolled it", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    mount("/jewellery/prism-riviere-bracelet");
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("still starts a newly opened page at the top", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    mount("/jewellery");
    act(() => go("/jewellery/prism-riviere-bracelet"));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("opens the next product at its top when tapped from the foot of another", () => {
    const scrollTo = spyScroll();
    mount("/jewellery");
    act(() => go("/jewellery/pear-point-open-cuff"));
    act(() => shopperScrollsTo(2700));
    scrollTo.mockClear();
    act(() => go("/jewellery/baroque-shell-bracelet"));
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("opens a product page at its top on back too", () => {
    const scrollTo = spyScroll();
    mount("/jewellery");
    act(() => go("/jewellery/granule-dome-ring"));
    act(() => shopperScrollsTo(2700));
    act(() => go("/jewellery/baroque-shell-bracelet"));
    scrollTo.mockClear();
    act(() => back());
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(scrollTo).not.toHaveBeenCalledWith(0, 2700);
  });

  it("brings the shop grid back to the card the shopper tapped", () => {
    const scrollTo = spyScroll();
    mount("/jewellery");
    act(() => go("/jewellery/collections/rings"));
    act(() => shopperScrollsTo(1800));
    act(() => go("/jewellery/granule-dome-ring"));
    scrollTo.mockClear();
    act(() => back());
    expect(scrollTo).toHaveBeenCalledWith(0, 1800);
  });

  it("keeps the browser's own scroll restore off on every page, product or listing", () => {
    /* jsdom has no history.scrollRestoration; a browser does. Left on "auto"
       for a listing, the browser restored it the moment Back was pressed,
       under the product page still on screen, which glided to its foot. */
    Object.defineProperty(window.history, "scrollRestoration", { value: "auto", configurable: true, writable: true });
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    mount("/jewellery/baroque-shell-bracelet");
    expect(window.history.scrollRestoration).toBe("manual");
    act(() => go("/jewellery/collections/bracelets"));
    expect(window.history.scrollRestoration).toBe("manual");
    delete (window.history as { scrollRestoration?: string }).scrollRestoration;
  });

  it("brings a reloaded listing back to the spot the shopper had", () => {
    sessionStorage.setItem("nf-scroll:default", JSON.stringify({ p: "/jewellery/collections/rings", y: 1800 }));
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([{ type: "reload" }] as unknown as PerformanceEntryList);
    const scrollTo = spyScroll();
    mount("/jewellery/collections/rings");
    expect(scrollTo).toHaveBeenCalledWith(0, 1800);
    sessionStorage.clear();
  });

  it("does not move a freshly opened page to a spot kept from an earlier visit", () => {
    sessionStorage.setItem("nf-scroll:default", JSON.stringify({ p: "/jewellery/collections/rings", y: 1800 }));
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([{ type: "navigate" }] as unknown as PerformanceEntryList);
    const scrollTo = spyScroll();
    mount("/jewellery/collections/rings");
    expect(scrollTo).not.toHaveBeenCalled();
    sessionStorage.clear();
  });

  it("stops re-applying the spot as soon as the shopper touches the page", async () => {
    const scrollTo = spyScroll();
    mount("/jewellery");
    act(() => go("/jewellery/collections/rings"));
    act(() => shopperScrollsTo(1800));
    act(() => go("/jewellery/granule-dome-ring"));
    scrollTo.mockClear();
    act(() => back());
    expect(scrollTo).toHaveBeenCalledWith(0, 1800);
    const calls = scrollTo.mock.calls.length;
    window.dispatchEvent(new Event("touchstart"));
    await new Promise((r) => setTimeout(r, 120));
    expect(scrollTo.mock.calls.length).toBe(calls);
  });

  it("jumps without the page's smooth scrolling", () => {
    const html = document.documentElement;
    html.style.scrollBehavior = "smooth";
    let during = "";
    vi.spyOn(window, "scrollTo").mockImplementation((() => {
      during = html.style.scrollBehavior;
    }) as unknown as typeof window.scrollTo);
    mount("/jewellery");
    act(() => go("/jewellery/baroque-shell-bracelet"));
    expect(during).toBe("auto");
    expect(html.style.scrollBehavior).toBe("smooth");
    html.style.scrollBehavior = "";
  });
});

describe("isProductPath", () => {
  it("knows a product page from a listing", () => {
    expect(isProductPath("/jewellery/baroque-shell-bracelet")).toBe(true);
    expect(isProductPath("/jewelry/granule-dome-ring/")).toBe(true);
    expect(isProductPath("/products/linen-co-ord")).toBe(true);
    expect(isProductPath("/jewellery")).toBe(false);
    expect(isProductPath("/jewellery/collections/rings")).toBe(false);
    expect(isProductPath("/jewellery/collections")).toBe(false);
    expect(isProductPath("/")).toBe(false);
  });
});
