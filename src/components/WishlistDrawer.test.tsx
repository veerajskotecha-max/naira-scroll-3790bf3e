import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

const removeItem = vi.fn();
const items = [
  // In JEWELLERY_HANDLES but not the 21-piece bundled catalogue.
  { id: "prism-riviere-bracelet", name: "Prism Rivière Bracelet", price: "₹2,399", image: "https://cdn.shopify.com/a.jpg" },
  // Not jewellery: the apparel page still renders it.
  { id: "ivory-kurta-set", name: "Ivory Kurta Set", price: "₹4,999", image: "https://cdn.shopify.com/b.jpg" },
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
  it("opens every jewellery piece on its jewellery page", () => {
    drawer();
    expect(screen.getByRole("link", { name: "Prism Rivière Bracelet" })).toHaveAttribute("href", "/jewellery/prism-riviere-bracelet");
    expect(screen.getByRole("link", { name: "Ivory Kurta Set" })).toHaveAttribute("href", "/product/ivory-kurta-set");
  });
});
