import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { JewelPiece } from "@/data/jewellery";
import { addOnEffect } from "@/lib/promo";
import BagAddOn from "./BagAddOn";

afterEach(cleanup);

const chain: JewelPiece = {
  handle: "toggle-link-chain",
  name: "Toggle Link Chain",
  category: "Necklaces",
  sku: "",
  number: "",
  price: 999,
  priceLabel: "₹999",
  variantId: "gid://shopify/ProductVariant/1",
  availableForSale: true,
  image: "https://cdn.shopify.com/a.jpg",
  blurb: "",
  materials: "",
};
const row = (bag: { subtotal: number; totalItems: number }, rate: number, over: Partial<Parameters<typeof BagAddOn>[0]> = {}) => {
  const onAdd = vi.fn();
  render(
    <MemoryRouter>
      <BagAddOn piece={chain} effect={addOnEffect(bag, chain.price)} rate={rate} totalItems={bag.totalItems} adding={false} disabled={false} onAdd={onAdd} onLeave={() => {}} {...over} />
    </MemoryRouter>,
  );
  return onAdd;
};
const text = () => document.querySelector("[data-bag-addon]")?.textContent ?? "";

describe("BagAddOn: one piece that goes with the bag, one tap away", () => {
  it("says the step one more piece reaches and what it adds to this bag", () => {
    /* One ₹1,049 piece. With the chain: 2,048 at 10% is 1,843.20 → 1,843; it adds 794, not 999. */
    row({ subtotal: 1049, totalItems: 1 }, 0);
    /* The heading is the sentence the bag's foot has always used. */
    expect(document.querySelector(".rn-addon__head")?.textContent).toBe("A second piece takes 10% off your bag");
    expect(text()).toMatch(/Toggle Link Chain/);
    /* Whose figure it is, and no struck price beside it: "Adds ₹794" next
       to a struck ₹999 read as a sale price for the chain. */
    expect(document.querySelector("[data-addon-effect]")?.textContent).toMatch(/^Adds ₹794 to your total/);
    expect(document.querySelector("[data-bag-addon] del")).toBeNull();
  });

  it("counts the whole bag moving up a step", () => {
    /* Two pieces, 3,698 at 10% = 3,328. With the chain: 4,697 at 20% is 3,757.60 → 3,758: adds 430. */
    row({ subtotal: 3698, totalItems: 2 }, 0.1);
    expect(document.querySelector(".rn-addon__head")?.textContent).toBe("A third piece takes 20% off your bag");
    expect(document.querySelector("[data-addon-effect]")?.textContent).toMatch(/^Adds ₹430 to your total/);
    /* On a short screen the heading is not drawn; the step rides after the figure. */
    expect(document.querySelector(".rn-addon__rate")?.textContent?.trim()).toBe("· 20% off your bag");
  });

  it("says a drop as a drop, never as a negative sum", () => {
    /* Three dear pieces at 20%: 12,000 → 9,600. With the chain at 30%: 12,999 → 9,099: the total drops 501. */
    row({ subtotal: 12000, totalItems: 3 }, 0.2);
    expect(text()).toMatch(/Your total drops by ₹501/);
    expect(text()).not.toMatch(/-|Adds/);
  });

  it("adds on a tap, and waits while the bag is busy", () => {
    const onAdd = row({ subtotal: 1049, totalItems: 1 }, 0);
    fireEvent.click(screen.getByRole("button", { name: "Add Toggle Link Chain to bag" }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    cleanup();
    row({ subtotal: 1049, totalItems: 1 }, 0, { disabled: true });
    expect((screen.getByRole("button", { name: "Add Toggle Link Chain to bag" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("opens the piece's own page from its photo and name", () => {
    row({ subtotal: 1049, totalItems: 1 }, 0);
    expect(screen.getByRole("link", { name: "Toggle Link Chain" }).getAttribute("href")).toBe("/jewellery/toggle-link-chain");
  });
});
