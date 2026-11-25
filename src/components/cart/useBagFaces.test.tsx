import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBagFaces } from "./useBagFaces";

/*
  The bag's heading is Jost 300, a weight a listing page draws nothing in, so
  it used to arrive only after the bag first opened. The bag asks for its
  three weights when its code arrives.
*/
const Probe = () => {
  useBagFaces();
  return null;
};
const withFonts = (fonts: unknown) => Object.defineProperty(document, "fonts", { value: fonts, configurable: true });

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(document, "fonts");
  document.getElementById("nf-fonts")?.remove();
});

describe("useBagFaces", () => {
  it("asks for Jost at the three weights the bag draws, and no other face", () => {
    const load = vi.fn((_font: string) => Promise.resolve([]));
    withFonts({ load });
    render(<Probe />);
    expect(load.mock.calls.map(([font]) => font)).toEqual(['300 14px "Jost"', '400 14px "Jost"', '500 14px "Jost"']);
  });

  /* index.html's font stylesheet is switched on after the page's code: a
     request made before it applies finds no face, so it is made again. */
  it("asks again once the font stylesheet has loaded, and stops listening when the bag goes", () => {
    const link = document.createElement("link");
    link.id = "nf-fonts";
    document.head.appendChild(link);
    const load = vi.fn((_font: string) => Promise.resolve([]));
    withFonts({ load });
    const view = render(<Probe />);
    expect(load).toHaveBeenCalledTimes(3);
    link.dispatchEvent(new Event("load"));
    expect(load).toHaveBeenCalledTimes(6);
    view.unmount();
    link.dispatchEvent(new Event("load"));
    expect(load).toHaveBeenCalledTimes(6);
  });

  it("does nothing, quietly, where the browser cannot be asked", () => {
    expect(() => render(<Probe />)).not.toThrow();
    cleanup();
    withFonts({});
    expect(() => render(<Probe />)).not.toThrow();
  });

  it("is not stopped by a face that fails to load", () => {
    const load = vi.fn((_font: string) => Promise.reject(new Error("offline")));
    withFonts({ load });
    expect(() => render(<Probe />)).not.toThrow();
    expect(load).toHaveBeenCalledTimes(3);
  });
});
