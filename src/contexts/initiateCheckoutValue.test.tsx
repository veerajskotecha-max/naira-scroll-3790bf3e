import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";

/*
  InitiateCheckout's value was the bag's sum before its discount: a two-piece
  bag (2399 + 999) told Meta 3398 while the bag showed, and the shopper was
  charged, its Total after BUY2 (₹3,058 at today's 10%). It now reports the
  bag's Total.
*/
const mocks = vi.hoisted(() => ({ track: vi.fn(), start: vi.fn(), promo: { code: null as string | null } }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: vi.fn(),
  createShopifyCart: vi.fn(),
  applyCartDiscountCodes: vi.fn(async () => ({ applied: true })),
  fetchShopifyCart: vi.fn(),
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: vi.fn(),
  updateShopifyCartLine: vi.fn(),
  updateCartTrackingAttributes: vi.fn(),
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: mocks.start }));
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: (id?: string) => id?.split("/").pop(), trackPixel: mocks.track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("@/lib/promo", async (importActual) => ({ ...(await importActual<typeof import("@/lib/promo")>()), getPromoCode: () => mocks.promo.code }));

const line = (id: string, variant: string, price: number, quantity = 1) => ({
  id, variantId: `gid://shopify/ProductVariant/${variant}`, name: id, price, priceLabel: `₹${price}`, currencyCode: "INR", image: "x.jpg", quantity, lineId: `line-${id}`,
});
const bag = (...items: ReturnType<typeof line>[]) =>
  localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "cart-1", checkoutUrl: "https://payments.nairaflore.com/cart/c/1", items }));
const initiateCheckout = () => mocks.track.mock.calls.filter(([event]) => event === "InitiateCheckout").map(([, params]) => params);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mocks.promo.code = null;
  mocks.start.mockResolvedValue(true);
});

describe("InitiateCheckout's value is what the shopper is charged", () => {
  it.each([
    ["one piece, no offer", [line("prism-riviere-bracelet", "47501788348578", 2399)], null, 2399, null],
    ["two pieces, BUY2 (10%)", [line("prism-riviere-bracelet", "47501788348578", 2399), line("brushed-gold-huggies", "47501787594914", 999)], null, 3058, "BUY2"],
    ["three pieces, BUY3 (20%)", [line("prism-riviere-bracelet", "47501788348578", 2399, 2), line("brushed-gold-huggies", "47501787594914", 999)], null, 4638, "BUY3"],
    // 2,997 at 20% is 2,397.60: the bag rounds once, to 2,398.
    ["three of one piece, BUY3 (20%)", [line("brushed-gold-huggies", "47501787594914", 999, 3)], null, 2398, "BUY3"],
    ["one piece with a typed 10% code", [line("prism-riviere-bracelet", "47501788348578", 2399)], "NAIRA10", 2159, "NAIRA10"],
    // NAIRA10 (10%) ties BUY2 (10%) at two pieces: on a tie the rung goes, at the same charge.
    ["two pieces with the typed 10% code", [line("prism-riviere-bracelet", "47501788348578", 2399), line("brushed-gold-huggies", "47501787594914", 999)], "NAIRA10", 3058, "BUY2"],
    // FRIENDSANDFAMILY (20%) beats BUY2 (10%) at two pieces: the typed code goes, and the value is its 20% off.
    ["two pieces with the typed 20% code", [line("prism-riviere-bracelet", "47501788348578", 2399), line("brushed-gold-huggies", "47501787594914", 999)], "FRIENDSANDFAMILY", 2718, "FRIENDSANDFAMILY"],
    // FRIENDSANDFAMILY ties BUY3 at three pieces but covers only the jewellery in Shopify: the rung goes.
    ["three pieces with the typed 20% code", [line("prism-riviere-bracelet", "47501788348578", 2399, 2), line("brushed-gold-huggies", "47501787594914", 999)], "FRIENDSANDFAMILY", 4638, "BUY3"],
  ])("%s", async (_bag, items, code, charged, coupon) => {
    bag(...items);
    mocks.promo.code = code;
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      result.current.checkout();
    });
    await vi.waitFor(() => expect(mocks.start).toHaveBeenCalledTimes(1));
    const [params] = initiateCheckout();
    expect(params.value).toBe(charged);
    expect(params.currency).toBe("INR");
    // The items and their own prices are unchanged.
    expect(params.contents).toEqual(items.map((i) => ({ id: i.variantId.split("/").pop(), quantity: i.quantity, item_price: i.price })));
    // The coupon handed to Shiprocket is the same discount.
    expect(mocks.start.mock.calls[0][1].couponCode).toBe(coupon);
  });
});
