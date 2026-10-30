import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { WishlistItem } from "@/contexts/WishlistContext";

const removeItem = vi.fn();
const items: WishlistItem[] = [
  // In JEWELLERY_HANDLES but not the 21-piece bundled catalogue.
  { id: "prism-riviere-bracelet", name: "Prism Rivière Bracelet", price: "₹2,399", image: "https://cdn.shopify.com/a.jpg", kind: "jewellery" },
  // Not jewellery: the apparel page still renders it.
  { id: "ivory-kurta-set", name: "Ivory Kurta Set", price: "₹4,999", image: "https://cdn.shopify.com/b.jpg", kind: "apparel" },
  // Saved before items carried their kind: one piece of jewellery, one outfit.
  { id: "amethyst-carre-bracelet", name: "Amethyst Carré Bracelet", price: "₹2,199", image: "https://cdn.shopify.com/c.jpg" },
  { id: "blush-of-dawn", name: "Blush of Dawn", price: "₹24,000", image: "https://cdn.shopify.com/d.jpg" },
];
vi.mock("@/contexts/WishlistContext", () => ({
  useWishlist: () => ({ items, removeItem, isDrawerOpen: true, setDrawerOpen: () => {} }),
}));

import WishlistDrawer from "./WishlistDrawer";

afterEach(cleanup);

const drawer = () =>
  render(
    <MemoryRouter>
      <WishlistDrawer />
    </MemoryRouter>,
  );

describe("WishlistDrawer", () => {
  /* Remove was a <button> inside the piece's <a>: invalid HTML, its word was
     part of the link's name, and it took preventDefault to stop the tap
     opening the piece — the pattern CLAUDE.md bans after JewelCard. */
  it("puts no interactive element inside a piece's link", () => {
    drawer();
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelectorAll("a button")).toHaveLength(0);
    expect(dialog.querySelectorAll("a a")).toHaveLength(0);
    expect(screen.getByRole("link", { name: "Prism Rivière Bracelet" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove Prism Rivière Bracelet from wishlist" }));
    expect(removeItem).toHaveBeenCalledWith("prism-riviere-bracelet");
  });

  /* Only the bundled 21 pieces linked to /jewellery/<handle>; every other
     piece went to /product/<handle> and hopped through the apparel page. */
  it("opens every jewellery piece on its jewellery page", async () => {
    drawer();
    expect(screen.getByRole("link", { name: "Prism Rivière Bracelet" })).toHaveAttribute("href", "/jewellery/prism-riviere-bracelet");
    expect(screen.getByRole("link", { name: "Ivory Kurta Set" })).toHaveAttribute("href", "/product/ivory-kurta-set");
    // Saved before the kind was stored: looked up in the full handle list.
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Amethyst Carré Bracelet" })).toHaveAttribute("href", "/jewellery/amethyst-carre-bracelet"),
    );
    expect(screen.getByRole("link", { name: "Blush of Dawn" })).toHaveAttribute("href", "/product/blush-of-dawn");
  });
});

/* The drawer is on every page, so the 136-handle list it imported for its
   links rode in the first download of every page (~1 KiB gzip). Nothing the
   app loads before its routes may import the list statically. */
describe("the first download", () => {
  const src = resolve(__dirname, "..");
  const fileOf = (from: string, spec: string) => {
    const base = spec.startsWith("@/") ? resolve(src, spec.slice(2)) : resolve(dirname(from), spec);
    return ["", ".ts", ".tsx", "/index.ts", "/index.tsx"].map((ext) => base + ext).find((f) => /\.tsx?$/.test(f) && existsSync(f));
  };
  const staticImports = (entry: string) => {
    const seen = new Set<string>();
    const walk = (file: string) => {
      if (seen.has(file)) return;
      seen.add(file);
      const code = readFileSync(file, "utf8");
      // import x from "…" and export … from "…", not `import type` and not import("…").
      for (const [, spec] of code.matchAll(/^(?:import|export)\s+(?!type\s)(?:[^"';]*?\sfrom\s+)?["']([^"']+)["']/gm)) {
        if (!spec.startsWith(".") && !spec.startsWith("@/")) continue;
        const next = fileOf(file, spec);
        if (next) walk(next);
      }
    };
    walk(entry);
    return seen;
  };

  it("leaves the full jewellery handle list out", () => {
    const entry = staticImports(resolve(src, "main.tsx"));
    expect(entry).toContain(resolve(src, "components/WishlistDrawer.tsx"));
    expect(entry).not.toContain(resolve(src, "data/jewelleryHandles.ts"));
  });
});
