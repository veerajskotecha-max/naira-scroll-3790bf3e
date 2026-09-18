import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

const toggleItem = vi.fn();
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addItem: vi.fn(), isLoading: false }),
}));
vi.mock("@/contexts/WishlistContext", () => ({
  useWishlist: () => ({ toggleItem, isWishlisted: () => false }),
}));
vi.mock("@/components/jewellery/JewelQuickView", () => ({ default: () => null }));

import JewelCard from "./JewelCard";
import type { JewelPiece } from "@/data/jewellery";

afterEach(cleanup);

const piece = {
  handle: "star-point-band",
  name: "Star Point Band",
  price: 1999,
  priceLabel: "₹1,999",
  image: "https://cdn.shopify.com/x.jpg",
  images: ["https://cdn.shopify.com/x.jpg"],
  category: "Rings",
  variantId: "gid://shopify/ProductVariant/1",
} as unknown as JewelPiece;

const card = () =>
  render(
    <MemoryRouter>
      <JewelCard piece={piece} index={0} />
    </MemoryRouter>,
  );

describe("JewelCard", () => {
  /*
    The wishlist heart used to be rendered INSIDE the card's <a>. An anchor may
    not contain interactive content, and on a phone the tap landed in the
    anchor's activation path as well as the button's — it took a preventDefault
    to stop the card navigating, and the card still played its press animation
    as though the tile had been tapped. Saving a piece and opening it are
    different intentions and must not share a target.

    /jewellery carries 96% of the site's rage clicks and 63% of its dead
    clicks, so a control on this card that reads as ambiguous is expensive.
  */
  it("puts no interactive element inside the card link", () => {
    const { container } = card();
    expect(container.querySelectorAll("a button")).toHaveLength(0);
    expect(container.querySelectorAll("a a")).toHaveLength(0);
  });

  it("still renders the heart, outside the link", () => {
    const { container } = card();
    const heart = screen.getByLabelText(/wishlist/i);
    expect(heart).toBeInTheDocument();
    expect(heart.closest("a")).toBeNull();
  });

  it("saves the piece without navigating", () => {
    card();
    const heart = screen.getByLabelText(/wishlist/i);
    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    fireEvent(heart, clickEvent);
    expect(toggleItem).toHaveBeenCalled();
    // Nothing above it to navigate, so the click never needs cancelling.
    expect(clickEvent.defaultPrevented).toBe(false);
  });

  it("keeps the whole packshot a link to the piece", () => {
    const { container } = card();
    const links = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(links).toContain("/jewellery/star-point-band");
  });
});
