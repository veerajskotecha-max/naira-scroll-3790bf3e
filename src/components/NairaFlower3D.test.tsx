import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mount = vi.fn(() => ({ dispose: () => {} }));
vi.mock("@/lib/nairaFlower/scene", () => ({ mountNairaFlower: mount }));
import NairaFlower3D from "./NairaFlower3D";

afterEach(() => {
  cleanup();
  mount.mockClear();
  vi.unstubAllGlobals();
});

const flush = () => new Promise((r) => setTimeout(r, 1300));

describe("NairaFlower3D", () => {
  /* The still is the flower for anyone who never gets the scene, and the
     placeholder for everyone else — the header must never show a blank gap. */
  it("draws the flower as a still from the first render", () => {
    const { container } = render(<NairaFlower3D />);
    expect(container.querySelector("svg path")?.getAttribute("d")).toMatch(/^M/);
  });

  /* Reduced motion asks for no turning flower; downloading three.js for it
     would be 146 KB spent on nothing. */
  it("never loads the scene with reduced motion on", async () => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce") }));
    render(<NairaFlower3D />);
    window.dispatchEvent(new Event("load"));
    await flush();
    expect(mount).not.toHaveBeenCalled();
  });

  it("loads the scene once the page has loaded", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<NairaFlower3D />);
    window.dispatchEvent(new Event("load"));
    await flush();
    expect(mount).toHaveBeenCalledTimes(1);
  });

  /* The owner asked for the wordmark's pink: the flower that is the I in NAIRA
     is blush, and this one is that I lifted out. The still is what shows until
     the scene loads, and forever with reduced motion, so it must be blush too. */
  it("draws the still in the wordmark's blush", () => {
    const { container } = render(<NairaFlower3D />);
    expect((container.querySelector("svg") as SVGElement).style.fill).toBe("var(--nf-blush)");
  });

  /* It is decoration inside the home link; a screen reader should hear
     "NAIRA", not an unnamed image before it. */
  it("is hidden from assistive technology", () => {
    const { container } = render(<NairaFlower3D />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });
});
