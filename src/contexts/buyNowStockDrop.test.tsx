import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";

/* From the second final check of the Buy Now card (scratchpad
   owner-oct30/checkout/final/fin2, scenario plus-cap-alive-buynow, and
   repro/buyNowStockDrop.test.tsx): the bag shows 2 of the bracelet (+ in the
   bag), then Shopify has only 1 left. Buy Now on the bracelet opened checkout
   with 1 at full price and the bag dropped to 1, with no message. Main
   raised the line, Shopify kept 1, and the shopper was told "Only 1 of ...
   left, all in your bag." before the same checkout. The same holds when the
   cart is gone or the line was dropped and the piece goes back in. Real
   src/lib/shopify.ts, only fetch stubbed, with a small fake Shopify cart that
   keeps no more of a piece than it has left. */
const start = vi.hoisted(() => vi.fn());
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: start }));
const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: (id: string) => id.split("/").pop(), trackPixel: track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
const toastError = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({ toast: { error: toastError } }));

const bracelet = { id: "prism-riviere-bracelet", variantId: "gid://shopify/ProductVariant/47501788348578", name: "Prism Rivière Bracelet", price: 2399, priceLabel: "₹2,399", currencyCode: "INR", image: "p.webp" };
const SHORT = "Only 1 of Prism Rivière Bracelet left, all in your bag.";

type Line = { id: string; quantity: number; merchandise: { id: string }; attributes: [] };
type Cart = { id: string; checkoutUrl: string; lines: Line[] };

/* A fake Shopify with `stock` of the bracelet left: it keeps no more than
   that on any line. A cart left out of `carts` is one Shopify no longer has;
   a line left out of a cart is one it dropped. */
const shopify = (carts: Cart[], stock: number) => {
  let created = 0;
  let added = 0;
  const keep = (q: number) => Math.min(q, stock);
  const node = (c: Cart) => ({ id: c.id, checkoutUrl: c.checkoutUrl, discountCodes: [], lines: { edges: c.lines.map((l) => ({ node: l })) } });
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init: { body: string }) => {
    const { query, variables: v } = JSON.parse(init.body);
    const op = (query.match(/(cartCreate|cartLinesUpdate|cartLinesAdd|cartAttributesUpdate|cartDiscountCodesUpdate)\(/) || [])[1];
    if (op === "cartCreate") {
      const n = ++created;
      const c: Cart = { id: `gid://shopify/Cart/new${n}`, checkoutUrl: `https://www.nairaflore.com/cart/c/new${n}?key=k`, lines: v.input.lines.map((l: { quantity: number; merchandiseId: string }) => ({ id: `gid://shopify/CartLine/new${n}`, quantity: keep(l.quantity), merchandise: { id: l.merchandiseId }, attributes: [] })) };
      carts.push(c);
      return new Response(JSON.stringify({ data: { cartCreate: { cart: node(c), userErrors: [] } } }));
    }
    const c = carts.find((x) => x.id === v.cartId);
    if (!c) return new Response(JSON.stringify({ data: { [op]: { cart: null, userErrors: [{ message: "The specified cart does not exist." }] } } }));
    if (op === "cartLinesUpdate") {
      const line = c.lines.find((l) => l.id === v.lines[0].id);
      if (!line) return new Response(JSON.stringify({ data: { cartLinesUpdate: { cart: node(c), userErrors: [{ message: `The merchandise line with id ${v.lines[0].id} does not exist.` }] } } }));
      line.quantity = keep(v.lines[0].quantity);
    }
    if (op === "cartLinesAdd") c.lines.push({ id: `gid://shopify/CartLine/added${++added}`, quantity: keep(v.lines[0].quantity), merchandise: { id: v.lines[0].merchandiseId }, attributes: [] });
    return new Response(JSON.stringify({ data: { [op]: { cart: node(c), userErrors: [] } } }));
  }));
};

const bagCart = (lines: Line[]): Cart => ({ id: "gid://shopify/Cart/bag", checkoutUrl: "https://www.nairaflore.com/cart/c/bag?key=k", lines });
const braceletLine = (quantity: number): Line => ({ id: "gid://shopify/CartLine/b", quantity, merchandise: { id: bracelet.variantId }, attributes: [] });
/* The bag as the shopper sees it, after + on the bracelet. */
const bagShowsTwo = () =>
  localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "gid://shopify/Cart/bag", checkoutUrl: "https://payments.nairaflore.com/checkouts/cn/bag?key=k", items: [{ ...bracelet, quantity: 2, lineId: "gid://shopify/CartLine/b" }] }));
const handedOff = () => start.mock.calls[0]?.[0]?.map((l: { quantity: number }) => l.quantity);
const events = (name: string) => track.mock.calls.filter(([n]) => n === name).map(([, p]) => p);

describe("Buy Now when Shopify has fewer left than the bag shows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    start.mockResolvedValue(true);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.unstubAllGlobals());

  const buyNow = async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    return result;
  };

  it("says why checkout gets 1 when the cart still works", async () => {
    bagShowsTwo();
    shopify([bagCart([braceletLine(2)])], 1);
    const result = await buyNow();
    expect(handedOff()).toEqual([1]);
    expect(result.current.items[0].quantity).toBe(1);
    expect(toastError).toHaveBeenCalledWith(SHORT);
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(result.current.addError).toBe(SHORT);
    expect(events("InitiateCheckout")).toEqual([expect.objectContaining({ value: 2399, num_items: 1 })]);
  });

  it("says why checkout gets 1 when the cart is gone and the piece goes back in", async () => {
    bagShowsTwo();
    shopify([], 1);
    const result = await buyNow();
    expect(handedOff()).toEqual([1]);
    expect(result.current.items[0].quantity).toBe(1);
    expect(toastError).toHaveBeenCalledWith(SHORT);
    expect(toastError).toHaveBeenCalledTimes(1);
  });

  it("says why checkout gets 1 when only the line was dropped and the piece goes back in", async () => {
    bagShowsTwo();
    shopify([bagCart([])], 1);
    const result = await buyNow();
    expect(handedOff()).toEqual([1]);
    expect(result.current.items[0].quantity).toBe(1);
    expect(toastError).toHaveBeenCalledWith(SHORT);
    expect(toastError).toHaveBeenCalledTimes(1);
  });

  /* Guards: with enough left, nothing is said, on each of the three routes. */
  it.each([
    ["the cart still works", () => [bagCart([braceletLine(2)])]],
    ["the cart is gone", () => []],
    ["only the line was dropped", () => [bagCart([])]],
  ])("says nothing when Shopify has enough left and %s", async (_case, carts) => {
    bagShowsTwo();
    shopify(carts(), 5);
    const result = await buyNow();
    expect(handedOff()).toEqual([2]);
    expect(result.current.items[0].quantity).toBe(2);
    expect(toastError).not.toHaveBeenCalled();
    expect(result.current.addError).toBeNull();
  });
});
