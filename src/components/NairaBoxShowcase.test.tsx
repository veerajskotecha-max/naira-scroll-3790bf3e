import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

vi.mock("@/components/NairaBox3D", () => ({ default: () => null }));
import NairaBoxShowcase from "./NairaBoxShowcase";

afterEach(cleanup);

describe("NairaBoxShowcase", () => {
  /* The listings say "18K gold tone plated". Dropping "tone" would claim gold
     content the pieces do not have — this pins the wording to the listings. */
  it("names the plating the way the listings do", () => {
    const { container } = render(<NairaBoxShowcase />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/18K gold tone · rhodium plated/i);
    expect(text).not.toMatch(/18K gold(?! tone)/i);
  });

  /* The reel bubble covered the copy at the foot of every product page. The
     band marks itself as a quiet zone and ReelPeek steps aside for it. */
  it("marks itself as a quiet zone that the reel bubble respects", () => {
    const { container } = render(<NairaBoxShowcase />);
    expect(container.querySelector("section[data-quiet-zone]")).not.toBeNull();
    const peek = readFileSync(resolve(__dirname, "reels/ReelPeek.tsx"), "utf8");
    expect(peek).toMatch(/useQuietZone\(\)/);
  });
});
