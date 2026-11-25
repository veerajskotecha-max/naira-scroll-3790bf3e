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
const bundle = (pieces: JewelPiece[] = [chain, bracelet, sized], more: { anchorInBag?: boolean; anchorNoun?: string } = {}) =>
  render(
    <MemoryRouter>
      <PdpBundle title="Complete the look" anchor={anchor} pieces={pieces} hrefFor={(handle) => `/jewellery/${handle}`} {...more} />
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

  it("keeps three short ones for one line, and lays four out two to a row", () => {
    render(<PdpAssurances items={["Anti-tarnish", "Skin-friendly", "PVD 18K gold coated"]} />);
    expect(document.querySelector(".rn-sure")?.hasAttribute("data-row")).toBe(true);
    cleanup();
    /* A fourth, wrapped freely, was left alone under a row of three. */
    render(<PdpAssurances items={["Anti-tarnish", "Skin-friendly", "PVD 18K gold coated", "Zircone stone"]} />);
    expect(document.querySelector(".rn-sure")?.hasAttribute("data-row")).toBe(false);
  });

  it("names the list for what it holds, not as a claim", () => {
    render(<PdpAssurances items={["Anti-tarnish"]} />);
    expect(document.querySelector(".rn-sure")?.getAttribute("aria-label")).toBe("Materials and finish");
  });
});

describe("PdpTrust: what the shop already promises, under the buttons", () => {
  it("says four things and shows the ways to pay", () => {
    render(<PdpTrust />);
    expect([...document.querySelectorAll(".rn-trust b")].map((b) => b.textContent)).toEqual(["Free shipping", "7-day returns", "3-year assurance", "Cash on delivery"]);
    /* The marks alone: cash on delivery is the grid's fourth line, said once. */
    expect(document.querySelector(".rn-pay")?.textContent).toBe("Pay by UPI, Visa or Mastercard.");
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

  it("promises no more than the shop's own pages do", () => {
    render(<PdpTrust />);
    const said = [...document.querySelectorAll(".rn-trust li")].map((li) => li.textContent);
    /* The returns policy covers a piece that arrives faulty, and the pincode
       rules refuse cash on delivery in some regions. */
    expect(said).toContain("7-day returnsOn eligible pieces");
    expect(said).toContain("Cash on deliveryOn most pincodes");
    expect(said.join(" ")).not.toMatch(/exchange or return|easy/i);
  });
});

describe("PdpOfferTracker: Buy 2 / 3 / 4 as a line that fills with the bag", () => {
  const rung = (n: 2 | 3 | 4) => document.querySelector(`[data-rung="${n}"]`) as HTMLElement;
  const stops = () => [...document.querySelectorAll(".rn-steps__stop")].map((s) => (s.hasAttribute("data-current") ? "current" : s.hasAttribute("data-reached") ? "reached" : "open"));
  const fills = () => ["rn-steps__fill", "rn-steps__ghost"].map((c) => (document.querySelector(`.${c}`) as HTMLElement).style.width);
  const frame = () => act(async () => void (await new Promise((r) => requestAnimationFrame(() => r(null)))));

  it("prices the piece at each step by the bag's rounding, and says any pieces count, with no code", () => {
    render(<PdpOfferTracker price={1049} />);
    expect([...rung(2).children].map((part) => part.textContent)).toEqual(["Buy 2", "10% off", "₹944 each"]);
    expect([...rung(3).children].map((part) => part.textContent)).toEqual(["Buy 3", "20% off", "₹839 each"]);
    expect([...rung(4).children].map((part) => part.textContent)).toEqual(["Buy 4", "30% off", "₹734 each"]);
    expect(document.querySelector(".rn-offer__line")?.textContent).toBe("Mix any pieces. The discount applies in your bag, no code needed.");
    expect(stops()).toEqual(["open", "open", "open"]);
    expect(screen.queryByRole("button", { name: "View bag" })).toBeNull();
  });

  it("keeps the list the phone's buy bar watches", () => {
    render(<PdpOfferTracker price={1049} />);
    expect(document.querySelector("[data-offer-ladder] ul")).not.toBeNull();
    /* Spoken as it is written. */
    expect(document.querySelector("[data-offer-ladder]")?.getAttribute("aria-label")).toBe("Buy more, save more");
    expect(document.querySelector("[data-offer-ladder] .nc-label")?.textContent).toBe("Buy more, save more");
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
    expect(rung(2).querySelector(".nc-sr")?.textContent).toBe(", in your bag");
    /* What adding this piece does is said above the buttons (renew `offerLine`);
       the panel keeps to what its steps cannot say. */
    expect(document.querySelector(".rn-offer__line")?.textContent).toBe("Mix any pieces. No code needed.");
    fireEvent.click(screen.getByRole("button", { name: "View bag" }));
    expect(cart.setDrawerOpen).toHaveBeenCalledWith(true);
  });

  it("draws no paler stretch on an empty bag: it would end before any step", async () => {
    render(<PdpOfferTracker price={1049} />);
    await frame();
    expect(fills()).toEqual(["0%", "0%"]);
  });

  it("steps back for a pre-order choice, which never reaches the bag", async () => {
    cart.totalItems = 2;
    cart.subtotal = 3698;
    render(<PdpOfferTracker price={1049} preorder />);
    await frame();
    expect(fills()).toEqual(["0%", "0%"]);
    expect(stops()).toEqual(["open", "open", "open"]);
    expect(rung(2).textContent).toBe("Buy 210% off");
    expect(document.querySelector(".rn-offer__line")?.textContent).toBe("This offer is for in-stock pieces, not pre-orders.");
    expect(screen.queryByRole("button", { name: "View bag" })).toBeNull();
  });

  it("draws nothing for a piece without a price", () => {
    const { container } = render(<PdpOfferTracker price={0} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("PdpBundle: complete the look, ticked and totalled", () => {
  const label = () => document.querySelector("[data-bundle-label]")?.textContent;

  it("starts with the best match ticked and totals the two by the bag's arithmetic", () => {
    bundle();
    const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(boxes.map((box) => box.checked)).toEqual([true, false]);
    /* 1,049 + 999 = 2,048 at 10% is 1,843.20 → 1,843. */
    expect(sum()).toMatch(/₹1,843was ₹2,048/);
    expect(sum()).toMatch(/You save ₹205/);
    expect(addButton().textContent).toBe("Add 2 pieces₹1,843");
    expect(document.querySelector(".rn-panel__head")?.textContent).toBe("Complete the look2 pieces · 10% off");
  });

  it("re-totals as pieces are ticked and unticked, and its gold label follows the ticks", () => {
    bundle();
    /* One more tick would reach the next step, and the panel says so. */
    expect(document.querySelector("[data-bundle-nudge]")?.textContent).toBe("Tick one more for 20% off all three.");
    fireEvent.click(screen.getByRole("checkbox", { name: /Ribbon Bead Bracelet/ }));
    /* 2,747 at 20% is 2,197.60 → 2,198. */
    expect(sum()).toMatch(/₹2,198was ₹2,747/);
    expect(sum()).toMatch(/You save ₹549/);
    expect(addButton().textContent).toBe("Add 3 pieces₹2,198");
    /* "2 pieces · 10% off" over a sum at 20% was the stale label the reviews found. */
    expect(label()).toBe("3 pieces · 20% off");
    expect(document.querySelector("[data-bundle-nudge]")).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: /Ribbon Bead Bracelet/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Toggle Link Chain/ }));
    expect(sum()).toBe("Tick a piece to add it with this one.");
    expect(label()).toBe("2 pieces · 10% off");
    expect(addButton().disabled).toBe(true);
    expect(addButton().textContent).toBe("Add together");
  });

  it("lists only the pieces one tap can add: one that needs a size is left out", () => {
    bundle();
    expect(document.querySelectorAll("[data-bundle-piece]")).toHaveLength(2);
    expect(document.querySelector('[data-bundle-piece="baguette-eternity-band"]')).toBeNull();
    expect(screen.queryByRole("link", { name: /Choose/ })).toBeNull();
  });

  it("names one piece in each row, not its category", () => {
    bundle();
    const notes = [...document.querySelectorAll("[data-bundle-piece] .rn-bundle__note")].map((note) => note.textContent);
    expect(notes).toEqual(["Necklace", "Bracelet"]);
  });

  it("says what the pieces add to a bag that already holds some, as a change in its total", () => {
    cart.totalItems = 1;
    cart.subtotal = 2399;
    bundle();
    /* Three pieces: 4,447 at 20% is 3,557.60 → 3,558, less the 2,399 there: adds 1,159, saves 889. */
    expect(document.querySelector("[data-bundle-total]")?.textContent).toBe("Adds₹1,159to your total");
    expect(sum()).toMatch(/You save ₹889/);
    /* No struck price beside it, and no figure in the button: here it is not
       a price for these pieces. */
    expect(document.querySelector("[data-bundle-total] del")).toBeNull();
    expect(addButton().textContent).toBe("Add 2 pieces");
    expect(label()).toBe("20% off your whole bag");
  });

  it("adds this piece and each ticked piece, in order, and opens the bag at the tap", async () => {
    bundle();
    fireEvent.click(screen.getByRole("checkbox", { name: /Ribbon Bead Bracelet/ }));
    await act(async () => void fireEvent.click(addButton()));
    expect(cart.setDrawerOpen).toHaveBeenCalledWith(true);
    expect(cart.addItem.mock.calls.map(([line]) => line.id)).toEqual(["woven-gold-hoops", "toggle-link-chain", "ribbon-bead-bracelet"]);
    expect(cart.addItem.mock.calls[0][0]).toBe(anchor.line);
  });

  it("does not add this piece a second time once the bag holds it", async () => {
    /* The bag: the hoops themselves (1,049). */
    cart.totalItems = 1;
    cart.subtotal = 1049;
    bundle([chain, bracelet], { anchorInBag: true });
    expect(document.querySelector("[data-bundle-anchor]")?.textContent).toMatch(/Woven Gold HoopsIn your bag/);
    /* The total is for the ticked piece alone: 2,048 at 10% is 1,843, less the 1,049 there. */
    expect(document.querySelector("[data-bundle-total]")?.textContent).toBe("Adds₹794to your total");
    expect(addButton().textContent).toBe("Add 1 piece");
    await act(async () => void fireEvent.click(addButton()));
    expect(cart.addItem.mock.calls.map(([line]) => line.id)).toEqual(["toggle-link-chain"]);
  });

  it("calls a piece sold as a set a set", () => {
    bundle([chain], { anchorNoun: "This set" });
    expect(document.querySelector("[data-bundle-anchor] .rn-bundle__note")?.textContent).toBe("This set");
  });

  it("adds nothing until its own button is pressed", () => {
    bundle();
    fireEvent.click(screen.getByRole("checkbox", { name: /Ribbon Bead Bracelet/ }));
    expect(cart.addItem).not.toHaveBeenCalled();
    expect(cart.setDrawerOpen).not.toHaveBeenCalled();
  });

  it("draws nothing when no pairing can be added in one tap", () => {
    const { container } = bundle([sized]);
    expect(container.innerHTML).toBe("");
  });
});
