import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JewelPiece } from "@/data/jewellery";
import PdpAssurances from "./PdpAssurances";
import PdpBundle from "./PdpBundle";
import PdpOfferTracker from "./PdpOfferTracker";
import PdpTrust from "./PdpTrust";

const cart = vi.hoisted(() => ({
  totalItems: 0,
  subtotal: 0,
  isLoading: false,
  setDrawerOpen: vi.fn(),
  addItem: vi.fn<(line: { id: string }) => Promise<string>>(async () => "line"),
}));
vi.mock("@/contexts/CartContext", () => ({ useCart: () => cart }));

beforeEach(() => {
  cart.totalItems = 0;
  cart.subtotal = 0;
  cart.isLoading = false;
  cart.setDrawerOpen.mockClear();
  cart.addItem.mockClear();
  localStorage.clear();
});
afterEach(cleanup);

const piece = (over: Partial<JewelPiece>): JewelPiece => ({
  handle: "piece",
  name: "Piece",
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
  ...over,
});
const chain = piece({ handle: "toggle-link-chain", name: "Toggle Link Chain", price: 999, priceLabel: "₹999" });
const bracelet = piece({ handle: "ribbon-bead-bracelet", name: "Ribbon Bead Bracelet", category: "Bracelets", price: 699, priceLabel: "₹699", variantId: "gid://shopify/ProductVariant/2" });
const sized = piece({
  handle: "baguette-eternity-band",
  name: "Baguette Eternity Band",
  category: "Rings",
  price: 899,
  priceLabel: "₹899",
  options: [{ name: "Size", values: ["6", "7"] }],
  variants: [
    { id: "gid://shopify/ProductVariant/6", title: "6", availableForSale: true, price: 899, options: { Size: "6" } },
    { id: "gid://shopify/ProductVariant/7", title: "7", availableForSale: true, price: 899, options: { Size: "7" } },
  ],
});
const anchor = {
  name: "Woven Gold Hoops",
  image: "https://cdn.shopify.com/hoops.jpg",
  price: 1049,
  line: { id: "woven-gold-hoops", variantId: "gid://shopify/ProductVariant/9", name: "Woven Gold Hoops", price: 1049, priceLabel: "₹1,049", currencyCode: "INR", image: "" },
};
const bundle = (pieces: JewelPiece[] = [chain, bracelet, sized]) =>
  render(
    <MemoryRouter>
      <PdpBundle title="Complete the look" anchor={anchor} pieces={pieces} hrefFor={(handle) => `/jewellery/${handle}`} />
    </MemoryRouter>,
  );
const sum = () => document.querySelector(".rn-bundle__sum")?.textContent ?? "";
const addButton = () => document.querySelector("[data-bundle-add]") as HTMLButtonElement;

describe("PdpAssurances: three quick benefits, ticked", () => {
  it("lists what it is given, in order, and skips what a piece does not have", () => {
    render(<PdpAssurances items={["Anti-tarnish", "Skin-friendly", "PVD 18K gold coated", false]} />);
    expect([...document.querySelectorAll(".rn-sure li")].map((li) => li.textContent)).toEqual(["Anti-tarnish", "Skin-friendly", "PVD 18K gold coated"]);
    expect(document.querySelectorAll(".rn-sure svg[aria-hidden='true']")).toHaveLength(3);
  });

  it("draws nothing for a piece with none", () => {
    const { container } = render(<PdpAssurances items={[false, null, undefined]} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("PdpTrust: what the shop already promises, under the buttons", () => {
  it("says four things and shows the ways to pay", () => {
    render(<PdpTrust />);
    expect([...document.querySelectorAll(".rn-trust b")].map((b) => b.textContent)).toEqual(["Free shipping", "7-day returns", "3-year assurance", "Cash on delivery"]);
    expect(document.querySelector(".rn-pay")?.textContent).toMatch(/Pay by UPI, Visa, Mastercard or cash on delivery\./);
    expect(document.querySelector("[data-upi-badges]")).not.toBeNull();
    expect(document.querySelector("[data-mark='visa']")).not.toBeNull();
    expect(document.querySelector("[data-mark='mastercard']")).not.toBeNull();
  });

  it("leaves the ways to pay out for a piece reserved on WhatsApp", () => {
    render(<PdpTrust reserved />);
    expect([...document.querySelectorAll(".rn-trust b")].map((b) => b.textContent)).toEqual(["Free shipping", "7-day returns", "3-year assurance"]);
    expect(document.querySelector(".rn-pay")).toBeNull();
  });

  it("makes no claim of numbers, stock or time", () => {
    const { container } = render(<PdpTrust />);
    expect(container.textContent).not.toMatch(/\bleft\b|sold|viewing|hurry|only \d|today only|minutes/i);
  });
});

describe("PdpOfferTracker: Buy 2 / 3 / 4 as a line that fills with the bag", () => {
  const rung = (n: 2 | 3 | 4) => document.querySelector(`[data-rung="${n}"]`) as HTMLElement;
  const stops = () => [...document.querySelectorAll(".rn-steps__stop")].map((s) => (s.hasAttribute("data-current") ? "current" : s.hasAttribute("data-reached") ? "reached" : "open"));
  const fills = () => ["rn-steps__fill", "rn-steps__ghost"].map((c) => (document.querySelector(`.${c}`) as HTMLElement).style.width);
  const frame = () => act(async () => void (await new Promise((r) => requestAnimationFrame(() => r(null)))));

  it("prices the piece at each step by the bag's rounding, and says no code is needed", () => {
    render(<PdpOfferTracker price={1049} />);
    expect(rung(2).textContent).toBe("Buy 2 · 10% off₹944 each");
    expect(rung(3).textContent).toBe("Buy 3 · 20% off₹839 each");
    expect(rung(4).textContent).toBe("Buy 4 · 30% off₹734 each");
    expect(document.querySelector(".rn-offer__line")?.textContent).toBe("Applied in your bag. No code needed.");
    expect(stops()).toEqual(["open", "open", "open"]);
    expect(screen.queryByRole("button", { name: "View bag" })).toBeNull();
  });

  it("keeps the list the phone's buy bar watches", () => {
    render(<PdpOfferTracker price={1049} />);
    expect(document.querySelector("[data-offer-ladder] ul")).not.toBeNull();
    expect(document.querySelector("[data-offer-ladder]")?.getAttribute("aria-label")).toBe("Buy more, pay less");
  });

  it("fills to the step the bag has reached, with a paler stretch for this piece", async () => {
    cart.totalItems = 2;
    cart.subtotal = 3698;
    render(<PdpOfferTracker price={1049} />);
    /* Empty on the first paint, so the fill is seen arriving... */
    expect(fills()).toEqual(["0%", "0%"]);
    await frame();
    /* ...then two pieces stand on the first stop (1/6 of the line) and a third would reach the second (1/2). */
    const [fill, ghost] = fills().map((w) => Number.parseFloat(w));
    expect(fill).toBeCloseTo(100 / 6, 3);
    expect(ghost).toBeCloseTo(50, 3);
    expect(stops()).toEqual(["current", "open", "open"]);
    expect(document.querySelector("[role='progressbar']")?.getAttribute("aria-valuenow")).toBe("2");
    /* 3,698 + 1,049 = 4,747 at 20% is 3,797.60 → 3,798; the bag stands at 3,698 x 0.9 = 3,328.20 → 3,328: it adds 470. */
    expect(document.querySelector(".rn-offer__line")?.textContent).toBe("Add to bag for 20% off everything: it adds ₹470, not ₹1,049.");
    fireEvent.click(screen.getByRole("button", { name: "View bag" }));
    expect(cart.setDrawerOpen).toHaveBeenCalledWith(true);
  });

  it("steps back for a pre-order choice, which never reaches the bag", async () => {
    cart.totalItems = 2;
    cart.subtotal = 3698;
    render(<PdpOfferTracker price={1049} preorder />);
    await frame();
    expect(fills()).toEqual(["0%", "0%"]);
    expect(stops()).toEqual(["open", "open", "open"]);
    expect(rung(2).textContent).toBe("Buy 2 · 10% off");
    expect(document.querySelector(".rn-offer__line")?.textContent).toBe("Not on pre-orders. In-stock pieces only.");
    expect(screen.queryByRole("button", { name: "View bag" })).toBeNull();
  });

  it("draws nothing for a piece without a price", () => {
    const { container } = render(<PdpOfferTracker price={0} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("PdpBundle: complete the look, ticked and totalled", () => {
  it("starts with the best match ticked and totals the two by the bag's arithmetic", () => {
    bundle();
    const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(boxes.map((box) => box.checked)).toEqual([true, false]);
    /* 1,049 + 999 = 2,048 at 10% is 1,843.20 → 1,843. */
    expect(sum()).toMatch(/₹1,843₹2,048/);
    expect(sum()).toMatch(/You save ₹205 · 10% off 2 pieces/);
    expect(addButton().textContent).toBe("Add 2 pieces₹1,843");
    expect(document.querySelector(".rn-panel__head")?.textContent).toBe("Complete the look2 pieces · 10% off");
  });

  it("re-totals as pieces are ticked and unticked", () => {
    bundle();
    fireEvent.click(screen.getByRole("checkbox", { name: /Ribbon Bead Bracelet/ }));
    /* 2,747 at 20% is 2,197.60 → 2,198. */
    expect(sum()).toMatch(/₹2,198₹2,747/);
    expect(sum()).toMatch(/You save ₹549 · 20% off 3 pieces/);
    expect(addButton().textContent).toBe("Add 3 pieces₹2,198");
    fireEvent.click(screen.getByRole("checkbox", { name: /Ribbon Bead Bracelet/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Toggle Link Chain/ }));
    expect(sum()).toBe("Tick a piece to see what the two cost together.");
    expect(addButton().disabled).toBe(true);
    expect(addButton().textContent).toBe("Tick a piece to pair");
  });

  it("gives no box to a piece that needs a size: it links to its own page", () => {
    bundle();
    expect(screen.queryByRole("checkbox", { name: /Baguette Eternity Band/ })).toBeNull();
    const choose = screen.getByRole("link", { name: "Choose size" });
    expect(choose.getAttribute("href")).toBe("/jewellery/baguette-eternity-band");
  });

  it("says what the pieces add to a bag that already holds some, not a price for them alone", () => {
    cart.totalItems = 1;
    cart.subtotal = 2399;
    bundle();
    /* Three pieces: 4,447 at 20% is 3,557.60 → 3,558, less the 2,399 there: adds 1,159, saves 889. */
    expect(sum()).toMatch(/Adds to your bag: Adds₹1,159₹2,048/);
    expect(sum()).toMatch(/You save ₹889 · 20% off your bag/);
    expect(addButton().textContent).toBe("Add 2 pieces₹1,159");
  });

  it("adds this piece and each ticked piece, in order, and opens the bag at the tap", async () => {
    bundle();
    fireEvent.click(screen.getByRole("checkbox", { name: /Ribbon Bead Bracelet/ }));
    await act(async () => void fireEvent.click(addButton()));
    expect(cart.setDrawerOpen).toHaveBeenCalledWith(true);
    expect(cart.addItem.mock.calls.map(([line]) => line.id)).toEqual(["woven-gold-hoops", "toggle-link-chain", "ribbon-bead-bracelet"]);
    expect(cart.addItem.mock.calls[0][0]).toBe(anchor.line);
  });

  it("adds nothing until its own button is pressed", () => {
    bundle();
    fireEvent.click(screen.getByRole("checkbox", { name: /Ribbon Bead Bracelet/ }));
    expect(cart.addItem).not.toHaveBeenCalled();
    expect(cart.setDrawerOpen).not.toHaveBeenCalled();
  });

  it("starts with nothing ticked when no pairing can be added in one tap", () => {
    bundle([sized]);
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(addButton().disabled).toBe(true);
  });
});
