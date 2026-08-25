import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductDetails from "./ProductDetails";
import type { ShopifyProductNode } from "@/lib/shopify";

// The component only needs cart actions to exist; nothing here exercises them.
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addItem: vi.fn(), setDrawerOpen: vi.fn() }),
}));

const money = { amount: "2500.00", currencyCode: "INR" };

const makeProduct = (sizes: Array<{ value: string; ok: boolean }>): ShopifyProductNode =>
  ({
    id: "gid://shopify/Product/1",
    title: "Test Piece",
    description: "A test piece.",
    handle: "test-piece",
    productType: "Ring",
    vendor: "Naira Flore",
    tags: [],
    availableForSale: sizes.some((s) => s.ok),
    priceRange: { minVariantPrice: money },
    images: { edges: [{ node: { url: "https://example.com/a.png", altText: null } }] },
    options: [{ name: "Size", values: sizes.map((s) => s.value) }],
    variants: {
      edges: sizes.map((s, i) => ({
        node: {
          id: `gid://shopify/ProductVariant/${i}`,
          title: s.value,
          availableForSale: s.ok,
          price: money,
          selectedOptions: [{ name: "Size", value: s.value }],
        },
      })),
    },
  }) as unknown as ShopifyProductNode;

const renderPDP = (p: ShopifyProductNode) =>
  render(
    <MemoryRouter>
      <ProductDetails product={p} />
    </MemoryRouter>,
  );

/** The primary CTA row, so we don't match the sticky bar or other buttons. */
const actions = () => document.querySelector("#product-actions")!;
const actionButtons = () =>
  Array.from(actions().querySelectorAll("button")).map((b) => ({
    text: b.textContent?.trim() ?? "",
    disabled: (b as HTMLButtonElement).disabled,
  }));

describe("ProductDetails stock gating", () => {
  it("offers Add to Cart when the default size is in stock", () => {
    renderPDP(makeProduct([{ value: "S", ok: true }, { value: "M", ok: true }]));
    const [add, buy] = actionButtons();
    expect(add.text).toBe("Add to Cart");
    expect(add.disabled).toBe(false);
    expect(buy.text).toBe("Buy It Now");
  });

  it("disables the CTA and offers a WhatsApp notify path when the size is sold out", () => {
    // First size is selected by default and is sold out.
    renderPDP(makeProduct([{ value: "S", ok: false }, { value: "M", ok: true }]));
    const [add, buy] = actionButtons();
    expect(add.text).toBe("Sold Out");
    expect(add.disabled).toBe(true);
    expect(buy.text).toBe("Notify Me on WhatsApp");
    expect(buy.disabled).toBe(false); // the lead-capture path stays clickable
  });

  it("does not block products that have no size variants", () => {
    const p = makeProduct([{ value: "S", ok: true }]);
    // Strip size options entirely, as most jewellery SKUs do.
    (p as unknown as { options: unknown[] }).options = [];
    p.variants.edges[0].node.selectedOptions = [];
    renderPDP(p);
    expect(actionButtons()[0].disabled).toBe(false);
  });

  it("still renders the price and delivery promise when sold out", () => {
    renderPDP(makeProduct([{ value: "S", ok: false }]));
    expect(screen.getByText(/Taxes included/)).toBeTruthy();
    // The fixture is productType "Ring", so this renders the jewellery window.
    expect(screen.getAllByText(/3–5 working days/).length).toBeGreaterThan(0);
  });

  /*
    The delivery badge and the info line below it are rendered separately, and
    only the info line was made jewellery-aware. A ring showed "Ships in 3–7
    working days" directly above "Delivery in 3–5 working days" — the same page
    stating two windows. They must agree, whichever product type renders.
  */
  it("quotes one delivery window, not two", () => {
    for (const [productType, expected, wrong] of [
      ["Ring", "3–5 working days", "3–7 working days"],
      ["Saree", "3–7 working days", "3–5 working days"],
    ] as const) {
      const { unmount } = renderPDP({
        ...makeProduct([{ value: "S", ok: true }]),
        productType,
      } as ShopifyProductNode);
      expect(screen.getAllByText(new RegExp(expected)).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(new RegExp(wrong)).length).toBe(0);
      unmount();
    }
  });
});
