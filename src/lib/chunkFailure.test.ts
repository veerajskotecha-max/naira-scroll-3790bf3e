// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearChunkReloadFlag, handlePreloadError, isChunkImportFailure, reloadForStaleChunk } from "./chunkFailure";

/*
  Pins the crash the shopper sees when a page's code never arrives. Each browser
  words a failed dynamic import differently, and the recovery only fires for the
  wording it recognises — Safari's "Importing a module script failed" is the one
  that blanked the screen on an iPhone, so it must never be dropped from the
  list, and a genuinely missing file must not reload the tab forever.
*/

describe("isChunkImportFailure", () => {
  it("recognises every browser's wording for a page file that never arrived", () => {
    expect(isChunkImportFailure(new TypeError("Importing a module script failed."))).toBe(true); // Safari / WebKit
    expect(isChunkImportFailure(new TypeError("Failed to fetch dynamically imported module: https://nairaflore.com/assets/Jewellery-CWQOXrxH.js"))).toBe(true); // Chrome
    expect(isChunkImportFailure(new Error("error loading dynamically imported module: https://nairaflore.com/assets/Jewellery-CWQOXrxH.js"))).toBe(true); // Firefox
    expect(isChunkImportFailure(new Error("Unable to preload CSS for /assets/index-Cq67g9dH.css"))).toBe(true);
    expect(isChunkImportFailure(new Error("Loading chunk 42 failed"))).toBe(true);
  });

  it("does not treat an ordinary page error as a missing file", () => {
    expect(isChunkImportFailure(new TypeError("Cannot read properties of undefined (reading 'map')"))).toBe(false);
    expect(isChunkImportFailure(new Error(""))).toBe(false);
    expect(isChunkImportFailure(undefined)).toBe(false);
  });
});

describe("reloadForStaleChunk", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("reloads once, then lets the caller show a way out", () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload },
      configurable: true,
      writable: true,
    });

    expect(reloadForStaleChunk()).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    // Second attempt: the tab already tried, so it must not loop.
    expect(reloadForStaleChunk()).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("a deliberate retry is allowed to make a fresh attempt", () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload },
      configurable: true,
      writable: true,
    });

    reloadForStaleChunk();
    expect(reloadForStaleChunk()).toBe(false);

    clearChunkReloadFlag();
    expect(reloadForStaleChunk()).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });
});

/* Vite's import helper hands back undefined when its preloadError event is
   prevented. Prevented after the one reload was spent, a missing page file
   reached the error panel as "Cannot read properties of undefined (reading
   'default')" instead of the import failure it was. */
describe("handlePreloadError", () => {
  const failure = (payload: unknown) =>
    Object.assign(new Event("vite:preloadError", { cancelable: true }), { payload });
  const missingPage = new TypeError(
    "Failed to fetch dynamically imported module: https://nairaflore.com/assets/JewelDetailNext-Zi3Qz6BX.js",
  );
  let reload = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    reload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload },
      configurable: true,
      writable: true,
    });
  });

  it("holds the failure back only while the page reloads", () => {
    const first = failure(missingPage);
    handlePreloadError(first);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(first.defaultPrevented).toBe(true);
  });

  it("lets the real error through once the reload is spent", () => {
    handlePreloadError(failure(missingPage));
    const again = failure(missingPage);
    handlePreloadError(again);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(again.defaultPrevented).toBe(false);
  });

  it("never reloads, or holds back, for a 3D decoration", () => {
    const three = failure(new TypeError("Failed to fetch dynamically imported module: https://nairaflore.com/assets/three-sES_xdo2.js"));
    handlePreloadError(three);
    expect(reload).not.toHaveBeenCalled();
    expect(three.defaultPrevented).toBe(false);
  });
});
