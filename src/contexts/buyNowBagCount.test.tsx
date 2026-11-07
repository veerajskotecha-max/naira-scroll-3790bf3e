import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";

/* From the final check of d8a943d (scratchpad owner-oct30/checkout/final,
   scenarios plus-lostcart-buynow and plus-stale1-buynow): the bag shows 2 of
   a piece (+ tapped in the bag), then Shopify loses the cart or drops that
   line, then Buy Now. The piece went back in once, so checkout opened with 1
   at full price and no Buy 2 code, and the bag then showed 1. Two pieces
   earn no rung since 7 Nov 2026 (the owner took Buy 2 away), so the bag here
   shows 3 of the piece: a piece lost on the way would cost the shopper
   BUY3's 20%. With the cart alive the same tap hands off the bag's 3 with
   BUY3. Real src/lib/shopify.ts, only fetch stubbed, with a small fake
   Shopify cart behind it. Nothing here reads the checkout address, so it
   holds whichever address form Shopify's checkout link takes. */
const start = vi.hoisted(() => vi.fn());
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: start }));
const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: (id: string) => id.split("/").pop(), trackPixel: track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
const toastError = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({ toast: { error: toastError } }));

const variant = (id: string) => `gid://shopify/ProductVariant/${id}`;
const bracelet = { id: "prism-riviere-bracelet", variantId: variant("47501788348578"), name: "Prism Rivière Bracelet", price: 2399, priceLabel: "₹2,399", currencyCode: "INR", image: "p.webp" };
const hoops = { id: "woven-gold-hoops", variantId: variant("hoops"), name: "Woven Gold Hoops", price: 1299, priceLabel: "₹1,299", currencyCode: "INR", image: "h.webp" };

type Line = { id: string; quantity: number; merchandise: { id: string }; attributes: [] };
type Cart = { id: string; checkoutUrl: string; lines: Line[] };

/* A fake Shopify: a cart left out of `carts` is one Shopify no longer has; a
   line left out of a cart is one it dropped. */
const shopify = (carts: Cart[]) => {
  const ops: Array<[string, string | undefined, number | undefined]> = [];
  let created = 0;
  let added = 0;
  const node = (c: Cart) => ({ id: c.id, checkoutUrl: c.checkoutUrl, discountCodes: [], lines: { edges: c.lines.map((l) => ({ node: l })) } });
  const gone = (op: string) => new Response(JSON.stringify({ data: { [op]: { cart: null, userErrors: [{ message: "The specified cart does not exist." }] } } }));
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init: { body: string }) => {
    const { query, variables: v } = JSON.parse(init.body);
    const op = (query.match(/(cartCreate|cartLinesUpdate|cartLinesAdd|cartAttributesUpdate|cartDiscountCodesUpdate)\(/) || [])[1];
    ops.push([op, v.cartId, (v.lines ?? v.input?.lines)?.[0]?.quantity]);
    if (op === "cartCreate") {
      const n = ++created;
      const c: Cart = { id: `gid://shopify/Cart/new${n}`, checkoutUrl: `https://www.nairaflore.com/cart/c/new${n}?key=k`, lines: v.input.lines.map((l: { quantity: number; merchandiseId: string }) => ({ id: `gid://shopify/CartLine/new${n}`, quantity: l.quantity, merchandise: { id: l.merchandiseId }, attributes: [] })) };
      carts.push(c);
      return new Response(JSON.stringify({ data: { cartCreate: { cart: node(c), userErrors: [] } } }));
    }
    const c = carts.find((x) => x.id === v.cartId);
    if (!c) return gone(op);
    if (op === "cartLinesUpdate") {
      const line = c.lines.find((l) => l.id === v.lines[0].id);
      if (!line) return new Response(JSON.stringify({ data: { cartLinesUpdate: { cart: node(c), userErrors: [{ message: `The merchandise line with id ${v.lines[0].id} does not exist.` }] } } }));
      line.quantity = v.lines[0].quantity;
    }
    if (op === "cartLinesAdd") c.lines.push({ id: `gid://shopify/CartLine/added${++added}`, quantity: v.lines[0].quantity, merchandise: { id: v.lines[0].merchandiseId }, attributes: [] });
    return new Response(JSON.stringify({ data: { [op]: { cart: node(c), userErrors: [] } } }));
  }));
  return ops;
};

const line = (id: string, merchandise: string, quantity: number): Line => ({ id, quantity, merchandise: { id: merchandise }, attributes: [] });
const bagCart = (lines: Line[]): Cart => ({ id: "gid://shopify/Cart/bag", checkoutUrl: "https://www.nairaflore.com/cart/c/bag?key=k", lines });
/* The bag as the shopper sees it, after + on the bracelet. */
const bag = (rows: Array<[typeof bracelet, string, number]>) =>
  localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "gid://shopify/Cart/bag", checkoutUrl: "https://payments.nairaflore.com/checkouts/cn/bag?key=k", items: rows.map(([p, lineId, quantity]) => ({ ...p, quantity, lineId })) }));
const handedOff = () => start.mock.calls[0]?.[0]?.map((l: { variantId: string; quantity: number }) => [l.variantId.split("/").pop(), l.quantity]);
const coupon = () => start.mock.calls[0]?.[1]?.couponCode;
const stored = () => JSON.parse(localStorage.getItem("naira-shopify-cart")!) as { cartId: string; items: Array<{ id: string; quantity: number }> };
const holds = (cart?: Cart) => cart?.lines.map((l) => [l.merchandise.id.split("/").pop(), l.quantity]);
const events = (name: string) => track.mock.calls.filter(([n]) => n === name).map(([, p]) => p);

describe("Buy Now puts a piece back in as many times as the bag showed it", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    start.mockResolvedValue(true);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.unstubAllGlobals());

  /* Guard: what a working cart hands off, which the two cases below match. */
  it("hands off the bag's 3 with BUY3 when Shopify still has the line", async () => {
    bag([[bracelet, "gid://shopify/CartLine/b", 3]]);
    shopify([bagCart([line("gid://shopify/CartLine/b", bracelet.variantId, 3)])]);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    expect(handedOff()).toEqual([["47501788348578", 3]]);
    expect(coupon()).toBe("BUY3");
    expect(events("AddToCart")).toHaveLength(0);
  });

  /* Two of a piece earn no rung since 7 Nov 2026: the same hand-off carries
     no code at all, never BUY2. */
  it("hands off the bag's 2 with no code when Shopify still has the line", async () => {
    bag([[bracelet, "gid://shopify/CartLine/b", 2]]);
    shopify([bagCart([line("gid://shopify/CartLine/b", bracelet.variantId, 2)])]);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    expect(handedOff()).toEqual([["47501788348578", 2]]);
    expect(coupon()).toBeNull();
    /* 2 x 2,399, charged in full. */
    expect(events("InitiateCheckout")).toEqual([expect.objectContaining({ value: 4798, num_items: 2 })]);
  });

  it("starts a new cart holding the bag's 3 when Shopify no longer has the cart", async () => {
    bag([[bracelet, "gid://shopify/CartLine/b", 3]]);
    const carts: Cart[] = [];
    const ops = shopify(carts);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    expect(ops.slice(0, 2)).toEqual([["cartLinesUpdate", "gid://shopify/Cart/bag", 3], ["cartCreate", undefined, 3]]);
    expect(handedOff()).toEqual([["47501788348578", 3]]);
    expect(coupon()).toBe("BUY3");
    expect(holds(carts.find((c) => c.id === stored().cartId))).toEqual([["47501788348578", 3]]);
    expect(result.current.items.map((i) => [i.id, i.quantity])).toEqual([["prism-riviere-bracelet", 3]]);
    expect(events("AddToCart")).toEqual([expect.objectContaining({ id: "prism-riviere-bracelet", price: 2399, quantity: 3 })]);
    /* The bag's charged Total: 3 x 2,399 = 7,197 with BUY3's 20% off,
       5,757.60, so 5,758 (baa72ac). */
    expect(events("InitiateCheckout")).toEqual([expect.objectContaining({ value: 5758, num_items: 3 })]);
    expect(toastError).not.toHaveBeenCalled();
  });

  it("adds the bag's 3 back on the same cart when Shopify dropped only that line", async () => {
    bag([[bracelet, "gid://shopify/CartLine/b", 3]]);
    const carts = [bagCart([])];
    const ops = shopify(carts);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    expect(ops[0]).toEqual(["cartLinesUpdate", "gid://shopify/Cart/bag", 3]);
    expect(handedOff()).toEqual([["47501788348578", 3]]);
    expect(coupon()).toBe("BUY3");
    expect(holds(carts.find((c) => c.id === stored().cartId))).toEqual([["47501788348578", 3]]);
    expect(result.current.items.map((i) => [i.id, i.quantity])).toEqual([["prism-riviere-bracelet", 3]]);
    expect(events("AddToCart")).toEqual([expect.objectContaining({ id: "prism-riviere-bracelet", price: 2399, quantity: 3 })]);
  });

  it("with the hoops also on a cart that is gone, the bracelet's 3 still go to checkout", async () => {
    bag([[hoops, "gid://shopify/CartLine/h", 1], [bracelet, "gid://shopify/CartLine/b", 3]]);
    shopify([]);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    expect(handedOff()).toEqual([["47501788348578", 3]]);
    expect(coupon()).toBe("BUY3");
    expect(result.current.items.map((i) => [i.id, i.quantity])).toEqual([["prism-riviere-bracelet", 3]]);
  });
});
