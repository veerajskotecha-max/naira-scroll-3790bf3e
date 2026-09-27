import { describe, expect, it } from "vitest";
import { isOptionalChunkFailure } from "./optionalChunk";

describe("isOptionalChunkFailure", () => {
  it("recognises the 3D chunks, which have a flat fallback", () => {
    expect(isOptionalChunkFailure(new Error("Failed to fetch dynamically imported module: https://nairaflore.com/assets/scene-Bq9CShF5.js"))).toBe(true);
    expect(isOptionalChunkFailure(new Error("Failed to fetch dynamically imported module: https://nairaflore.com/assets/three-D4k2_x9a.js"))).toBe(true);
  });

  it("leaves page code to the reload that recovers a stale build", () => {
    expect(isOptionalChunkFailure(new Error("Failed to fetch dynamically imported module: https://nairaflore.com/assets/JewelDetail-CWQOXrxH.js"))).toBe(false);
    expect(isOptionalChunkFailure(new Error("Unable to preload CSS for /assets/index-Cq67g9dH.css"))).toBe(false);
    expect(isOptionalChunkFailure(undefined)).toBe(false);
  });
});
