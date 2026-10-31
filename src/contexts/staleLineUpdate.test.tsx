import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";

/* From the review of 39ccbce (scratchpad owner-oct30/checkout/rev1, scenarios
   stale-plus and stale-readd): a bag line Shopify answers "does not exist" for.
   Before 39ccbce that answer was read as a lost cart and the whole bag was
   cleared as "timed out". With 39ccbce, + on that line said "Could not update
   quantity." and Add again said the piece "couldn't be added"; the dead row
   stayed in the bag, and in what checkout was handed, until the bag next
   synced. Real src/lib/shopify.ts, only fetch stubbed. */
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: vi.fn() }));
const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: () => "1", trackPixel: track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
const toastError = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({ toast: { error: toastError } }));

const CART = "gid://shopify/Cart/c1";
const STALE = "gid://shopify/CartLine/stale";
const variant = (id: string) => `gid://shopify/ProductVariant/${id}`;
const row = (id: string, lineId: string) => ({ id, variantId: variant(id), name: `Piece ${id}`, price: 999, priceLabel: "₹999", currencyCode: "INR", image: "x.jpg", quantity: 1, lineId });
const piece = (id: string) => { const { quantity: _q, lineId: _l, ...rest } = row(id, ""); return rest; };
const missing = { message: `The merchandise line with id ${STALE} does not exist.` };

/* A fake Shopify cart that no longer holds the stale line. */
const shopify = (opts: { update?: Array<{ message: string }>; addGivesLine?: boolean } = {}) => {
  const ops: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init: { body: string }) => {
    const { query, variables } = JSON.parse(init.body);
    const op = (query.match(/(cartLinesUpdate|cartLinesAdd|cartLinesRemove)\(/) || [])[1];
    ops.push(op);
    const cart = (lines: Array<{ id: string; quantity: number; merchandise: { id: string } }>) => ({ id: CART, checkoutUrl: "https://c/1", lines: { edges: lines.map((node) => ({ node })) } });
    if (op === "cartLinesUpdate") return new Response(JSON.stringify({ data: { cartLinesUpdate: { cart: cart([]), userErrors: opts.update ?? [missing] } } }));
    if (op === "cartLinesAdd") {
      const lines = opts.addGivesLine === false ? [] : [{ id: "gid://shopify/CartLine/new", quantity: variables.lines[0].quantity, merchandise: { id: variables.lines[0].merchandiseId } }];
      return new Response(JSON.stringify({ data: { cartLinesAdd: { cart: cart(lines), userErrors: [] } } }));
    }
    return new Response(JSON.stringify({ errors: [{ message: `unexpected ${op}` }] }));
  }));
  return ops;
};
const stored = () => JSON.parse(localStorage.getItem("naira-shopify-cart")!);

describe("a bag line Shopify no longer has", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: CART, checkoutUrl: "https://c/1", items: [row("a", "gid://shopify/CartLine/ok"), row("b", STALE)] }));
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.unstubAllGlobals());

  it("+ in the bag drops that row, says why, and keeps the rest of the bag and its cart", async () => {
    shopify();
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.updateQuantity("b", undefined, 2, variant("b")); });
    expect(result.current.items.map((i) => i.id)).toEqual(["a"]);
    expect(toastError).toHaveBeenCalledWith("Piece b was no longer in your bag. Please add it again.");
    expect(toastError).not.toHaveBeenCalledWith("Could not update quantity.");
    expect(stored().cartId).toBe(CART);
  });

  it("+ on the only piece leaves an empty bag", async () => {
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: CART, checkoutUrl: "https://c/1", items: [row("b", STALE)] }));
    shopify();
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.updateQuantity("b", undefined, 2, variant("b")); });
    expect(result.current.items).toEqual([]);
  });

  it("+ still says 'Could not update quantity.' when Shopify refuses for another reason", async () => {
    shopify({ update: [{ message: "Something else went wrong." }] });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.updateQuantity("b", undefined, 2, variant("b")); });
    expect(result.current.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(toastError).toHaveBeenCalledWith("Could not update quantity.");
  });

  it("+ still clears the bag when the cart itself is gone", async () => {
    shopify({ update: [{ message: "The specified cart does not exist." }] });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.updateQuantity("b", undefined, 2, variant("b")); });
    expect(result.current.items).toEqual([]);
    expect(toastError).toHaveBeenCalledWith("Your cart timed out. Please add the piece again.");
  });

  it("Add again puts the piece back as a new line, on the same cart, with one AddToCart", async () => {
    const ops = shopify();
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    let url: string | null = null;
    await act(async () => { url = await result.current.addItem(piece("b")); });
    expect(ops).toEqual(["cartLinesUpdate", "cartLinesAdd"]);
    expect(url).toBeTruthy();
    expect(result.current.items.map((i) => [i.id, i.quantity, i.lineId])).toEqual([["a", 1, "gid://shopify/CartLine/ok"], ["b", 1, "gid://shopify/CartLine/new"]]);
    expect(result.current.addError).toBeNull();
    expect(stored().cartId).toBe(CART);
    expect(track.mock.calls.filter(([name]) => name === "AddToCart")).toHaveLength(1);
  });

  it("Add again that Shopify cannot fill drops the dead row and says the piece couldn't be added", async () => {
    shopify({ addGivesLine: false });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.addItem(piece("b")); });
    expect(result.current.items.map((i) => i.id)).toEqual(["a"]);
    expect(result.current.addError).toBe("Piece b couldn't be added. It may have just sold out.");
    expect(track.mock.calls.filter(([name]) => name === "AddToCart")).toHaveLength(0);
  });
});
