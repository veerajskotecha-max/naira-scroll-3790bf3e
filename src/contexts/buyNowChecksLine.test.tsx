import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";

/* From the review of 2b702d9 (scratchpad owner-oct30/checkout/rev3, scenarios
   lostcart-buynow and stale-buynow): Buy Now on a piece the bag already holds
   stopped asking Shopify about that line. A bag whose Shopify cart was gone, or
   whose line Shopify had dropped, went to checkout as it showed, with a
   fallback address on a cart Shopify no longer had. Main emptied the bag with
   "Your cart timed out" and opened no checkout. Real src/lib/shopify.ts, only
   fetch stubbed, with a small fake Shopify cart behind it. */
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

/* A fake Shopify: carts by id, each a list of lines. A cart left out of `carts`
   is one Shopify no longer has; a line left out of a cart is one it dropped. */
const shopify = (carts: Cart[], opts: { update?: "throw" } = {}) => {
  const ops: Array<[string, string | undefined]> = [];
  let created = 0;
  let added = 0;
  const node = (c: Cart) => ({ id: c.id, checkoutUrl: c.checkoutUrl, discountCodes: [], lines: { edges: c.lines.map((l) => ({ node: l })) } });
  const gone = (op: string) => new Response(JSON.stringify({ data: { [op]: { cart: null, userErrors: [{ message: "The specified cart does not exist." }] } } }));
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init: { body: string }) => {
    const { query, variables: v } = JSON.parse(init.body);
    const op = (query.match(/(cartCreate|cartLinesUpdate|cartLinesAdd|cartAttributesUpdate|cartDiscountCodesUpdate)\(/) || [])[1];
    ops.push([op, v.cartId]);
    if (op === "cartCreate") {
      const n = ++created;
      const c: Cart = { id: `gid://shopify/Cart/new${n}`, checkoutUrl: `https://www.nairaflore.com/cart/c/new${n}?key=k`, lines: v.input.lines.map((l: { quantity: number; merchandiseId: string }) => ({ id: `gid://shopify/CartLine/new${n}`, quantity: l.quantity, merchandise: { id: l.merchandiseId }, attributes: [] })) };
      carts.push(c);
      return new Response(JSON.stringify({ data: { cartCreate: { cart: node(c), userErrors: [] } } }));
    }
    const c = carts.find((x) => x.id === v.cartId);
    if (!c) return gone(op);
    if (op === "cartLinesUpdate") {
      if (opts.update === "throw") return new Response(JSON.stringify({ errors: [{ message: "Throttled" }] }));
      const line = c.lines.find((l) => l.id === v.lines[0].id);
      if (!line) return new Response(JSON.stringify({ data: { cartLinesUpdate: { cart: node(c), userErrors: [{ message: `The merchandise line with id ${v.lines[0].id} does not exist.` }] } } }));
      line.quantity = v.lines[0].quantity;
    }
    if (op === "cartLinesAdd") c.lines.push({ id: `gid://shopify/CartLine/added${++added}`, quantity: v.lines[0].quantity, merchandise: { id: v.lines[0].merchandiseId }, attributes: [] });
    return new Response(JSON.stringify({ data: { [op]: { cart: node(c), userErrors: [] } } }));
  }));
  return ops;
};

const bagCart = (lines: Array<[string, string]>): Cart => ({
  id: "gid://shopify/Cart/bag",
  checkoutUrl: "https://www.nairaflore.com/cart/c/bag?key=k",
  lines: lines.map(([lineId, merchandise]) => ({ id: lineId, quantity: 1, merchandise: { id: merchandise }, attributes: [] })),
});
const bag = (rows: Array<[typeof bracelet, string]>) =>
  localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "gid://shopify/Cart/bag", checkoutUrl: "https://payments.nairaflore.com/checkouts/cn/bag?key=k", items: rows.map(([p, lineId]) => ({ ...p, quantity: 1, lineId })) }));
const handedOff = () => start.mock.calls[0]?.[0]?.map((l: { variantId: string; quantity: number }) => [l.variantId.split("/").pop(), l.quantity]);
/* The fake cart a checkout address points at, and what it holds. The address
   is Shopify's /checkouts/cn/<cart> with d4ac0c0 and the older /cart/c/<cart>
   without it; either names the same cart, so these checks hold either way. */
const cartIn = (url?: string) => url?.match(/\/(?:checkouts\/cn|cart\/c)\/([^?/]+)/)?.[1];
const cartAt = (carts: Cart[], url?: string) => carts.find((c) => c.id === `gid://shopify/Cart/${cartIn(url)}`);
const holds = (cart?: Cart) => cart?.lines.map((l) => [l.merchandise.id.split("/").pop(), l.quantity]);
const stored = () => JSON.parse(localStorage.getItem("naira-shopify-cart")!) as { cartId: string; items: Array<{ id: string; lineId: string }> };
const fallback = () => start.mock.calls[0]?.[1]?.fallbackUrl as string | undefined;
const events = (name: string) => track.mock.calls.filter(([n]) => n === name).map(([, p]) => p);

describe("Buy Now on a piece the bag already holds asks Shopify about that line first", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    start.mockResolvedValue(true);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.unstubAllGlobals());

  it("hands the line off as it is when Shopify still has it, without adding a unit", async () => {
    bag([[bracelet, "gid://shopify/CartLine/b"]]);
    const ops = shopify([bagCart([["gid://shopify/CartLine/b", bracelet.variantId]])]);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    expect(ops[0]).toEqual(["cartLinesUpdate", "gid://shopify/Cart/bag"]);
    expect(ops.map(([op]) => op)).not.toContain("cartLinesAdd");
    expect(handedOff()).toEqual([["47501788348578", 1]]);
    expect(cartIn(fallback())).toBe("bag");
    expect(events("AddToCart")).toHaveLength(0);
    expect(result.current.items.map((i) => [i.id, i.quantity])).toEqual([["prism-riviere-bracelet", 1]]);
  });

  it("starts a new cart with the piece when Shopify no longer has the bag's cart", async () => {
    bag([[bracelet, "gid://shopify/CartLine/b"]]);
    const ops = shopify([]);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    expect(ops.slice(0, 2).map(([op]) => op)).toEqual(["cartLinesUpdate", "cartCreate"]);
    expect(handedOff()).toEqual([["47501788348578", 1]]);
    expect(cartIn(fallback())).toBe("new1");
    // Nothing more goes to the cart that is gone.
    expect(ops.filter(([, cart]) => cart === "gid://shopify/Cart/bag")).toHaveLength(1);
    expect(events("AddToCart")).toEqual([expect.objectContaining({ id: "prism-riviere-bracelet", price: 2399, quantity: 1 })]);
    expect(events("InitiateCheckout")).toEqual([expect.objectContaining({ value: 2399, num_items: 1 })]);
    expect(JSON.parse(localStorage.getItem("naira-shopify-cart")!).cartId).toBe("gid://shopify/Cart/new1");
    expect(toastError).not.toHaveBeenCalled();
  });

  it("with other pieces on a cart that is gone, checks out the piece alone on a new cart", async () => {
    bag([[hoops, "gid://shopify/CartLine/h"], [bracelet, "gid://shopify/CartLine/b"]]);
    shopify([]);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    expect(handedOff()).toEqual([["47501788348578", 1]]);
    expect(start.mock.calls[0][1].couponCode).toBeNull();
    expect(cartIn(fallback())).toBe("new1");
    // The hoops were on the cart that is gone, as main's emptied bag said.
    expect(result.current.items.map((i) => i.id)).toEqual(["prism-riviere-bracelet"]);
  });

  /* The two cases below hold whether Shopify's "line does not exist" is read
     as one dropped line (39ccbce, f2b05f4, 5bbc08c) or, without those, as a
     lost cart: either way checkout is handed only what Shopify holds. */
  it("adds the piece again when Shopify dropped only its line, so checkout's cart holds it", async () => {
    bag([[bracelet, "gid://shopify/CartLine/b"]]);
    const carts = [bagCart([])];
    const ops = shopify(carts);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    expect(ops[0]).toEqual(["cartLinesUpdate", "gid://shopify/Cart/bag"]);
    expect(handedOff()).toEqual([["47501788348578", 1]]);
    // The Shopify cart checkout falls back to now really holds the piece.
    expect(holds(cartAt(carts, fallback()))).toEqual([["47501788348578", 1]]);
    expect(stored().items.map((i) => i.lineId)).toEqual(carts.find((c) => c.id === stored().cartId)?.lines.map((l) => l.id));
    expect(result.current.items.map((i) => [i.id, i.quantity])).toEqual([["prism-riviere-bracelet", 1]]);
    expect(events("AddToCart")).toEqual([expect.objectContaining({ id: "prism-riviere-bracelet", price: 2399, quantity: 1 })]);
  });

  it("with other pieces in the bag, hands off nothing Shopify does not hold", async () => {
    bag([[hoops, "gid://shopify/CartLine/h"], [bracelet, "gid://shopify/CartLine/b"]]);
    const carts = [bagCart([["gid://shopify/CartLine/h", hoops.variantId]])];
    shopify(carts);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    expect(handedOff()).toContainEqual(["47501788348578", 1]);
    // Whatever goes to checkout (the bag, or the piece alone), the cart behind it holds it.
    expect(holds(cartAt(carts, fallback()))).toEqual(handedOff());
    // And the bag keeps no row its Shopify cart does not hold.
    const own = carts.find((c) => c.id === stored().cartId);
    expect(stored().items.every((i) => own?.lines.some((l) => l.id === i.lineId))).toBe(true);
  });

  it("still hands the line off as it is when the check itself fails", async () => {
    bag([[bracelet, "gid://shopify/CartLine/b"]]);
    shopify([bagCart([["gid://shopify/CartLine/b", bracelet.variantId]])], { update: "throw" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(bracelet); });
    expect(handedOff()).toEqual([["47501788348578", 1]]);
    expect(cartIn(fallback())).toBe("bag");
    expect(events("AddToCart")).toHaveLength(0);
  });
});
