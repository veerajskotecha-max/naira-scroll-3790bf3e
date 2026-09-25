import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mount = vi.fn(() => ({ dispose: () => {} }));
vi.mock("@/lib/nairaFlower/scene", () => ({ mountNairaFlower: mount }));
import NairaWordmark from "./NairaWordmark";

afterEach(() => {
  cleanup();
  mount.mockClear();
  vi.unstubAllGlobals();
});

const flush = () => new Promise((r) => setTimeout(r, 1300));

describe("NairaWordmark", () => {
  /* It replaced an <img alt="NAIRA">; the home link's only name is this. */
  it("is named NAIRA for assistive technology", () => {
    const { getByRole } = render(<NairaWordmark />);
    expect(getByRole("img", { name: "NAIRA" })).toBeTruthy();
  });

  /* The flat flower IS the logo's I until the scene loads, and for good with
     reduced motion or no WebGL — without it the wordmark reads "NA RA". It is
     the wordmark's blush, as the I always was. */
  it("draws the flower-I from the first render, in blush", () => {
    const { container } = render(<NairaWordmark />);
    const flower = container.querySelector("path[data-flower]") as SVGPathElement;
    expect(flower.getAttribute("d")).toMatch(/^M/);
    expect(flower.style.fill).toBe("var(--nf-blush)");
  });

  /* Reduced motion asks for no turning flower; downloading three.js for it
     would be 146 KB spent on nothing. */
  it("never loads the scene with reduced motion on", async () => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce") }));
    render(<NairaWordmark />);
    window.dispatchEvent(new Event("load"));
    await flush();
    expect(mount).not.toHaveBeenCalled();
  });

  /* The flower's own centre sits left of the I's stem. Turned on its own
     centre it wobbled beside the letter; the scene is told the offset so it
     turns on the stem. */
  it("loads the scene once the page has loaded, turning on the I's stem", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<NairaWordmark />);
    window.dispatchEvent(new Event("load"));
    await flush();
    expect(mount).toHaveBeenCalledTimes(1);
    const opts = (mount.mock.calls[0] as unknown[])[1] as { axisOffset: number };
    expect(opts.axisOffset).toBeLessThan(0);
    expect(opts.axisOffset).toBeGreaterThan(-0.2);
  });

  it("keeps the 3D canvas out of the accessibility tree", () => {
    const { container } = render(<NairaWordmark />);
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
  });
});
