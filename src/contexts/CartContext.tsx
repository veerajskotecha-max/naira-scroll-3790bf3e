import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  applyCartDiscountCodes,
  addLineToShopifyCart,
  createShopifyCart,
  fetchShopifyCart,
  formatCheckoutUrl,
  removeLineFromShopifyCart,
  updateShopifyCartLine,
  updateCartTrackingAttributes,
} from "@/lib/shopify";
import { applyPromoToCheckoutUrl, discountedSubtotal, getPromoCode, resolveCartDiscount } from "@/lib/promo";
import { SHIPPING_CHARGE } from "@/lib/serviceability";
import { isFastrrEnabled, primeFastrr, startFastrrCheckout } from "@/lib/fastrr";
import { productParams, shopifyNumericId, trackPixel } from "@/lib/pixel";
import { cartKeyOf, findCartLine } from "@/lib/cartLines";
import { setClarityTag } from "@/lib/clarity";
import { withSessionUtm } from "@/lib/landingUtm";

export interface CartItem {
  id: string;
  variantId: string;
  lineId: string | null;
  name: string;
  price: number;
  priceLabel: string;
  currencyCode: string;
  image: string;
  quantity: number;
  size?: string;
  variantTitle?: string;
  selectedOptions?: Array<{ name: string; value: string }>;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "lineId">, quantity?: number) => Promise<string | null>;
  buyNow: (item: Omit<CartItem, "quantity" | "lineId">, quantity?: number) => Promise<void>;
  removeItem: (id: string, size?: string, variantId?: string) => Promise<void>;
  updateQuantity: (id: string, size: string | undefined, quantity: number, variantId?: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  checkout: () => void;
  totalItems: number;
  subtotal: number;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  isLoading: boolean;
  isSyncing: boolean;
  checkoutUrl: string | null;
  /** The piece on its way into the bag while Shopify adds it, else null. */
  pending: CartItem | null;
  /** Why the last add failed, for the bag to say; null once the bag closes. */
  addError: string | null;
}


const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "naira-shopify-cart";

interface StoredCart {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
}

const emptyCart: StoredCart = { items: [], cartId: null, checkoutUrl: null };

const loadCart = (): StoredCart => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...emptyCart, ...JSON.parse(stored) } : emptyCart;
  } catch {
    return emptyCart;
  }
};

const keyOf = cartKeyOf;
const findLine = findCartLine;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [storedCart, setStoredCart] = useState<StoredCart>(loadCart);
  const [isDrawerOpen, setDrawerOpenState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  /* The bag opens at the Add tap and shows the piece on its way in while
     Shopify adds it, a second or two on 4G; the real line then takes its
     place. If Shopify cannot add it, the open bag says why. */
  const [pending, setPending] = useState<CartItem | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const drawerOpenRef = useRef(false);
  /* Adds under way, and how many have started: a sync must not run over one
     (see syncCart). */
  const addsInFlight = useRef(0);
  const addsStarted = useRef(0);
  /* Removals under way, by line. An add of the same line (the bag's Undo)
     waits for its removal: run beside it, the add updated the line Shopify
     was deleting, Shopify refused, and the bag was lost. */
  const removals = useRef(new Map<string, Promise<void>>());

  const { items, cartId, checkoutUrl } = storedCart;

  /* Guarded like commitCart: with storage blocked ("Block all cookies", some
     in-app WebViews) a throw here, above every error boundary, unmounted the
     whole app and left a blank page a second after the pre-built one showed. */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCart));
    } catch {
      /* storage blocked or full — state still updates */
    }
  }, [storedCart]);

  /* The ref is set with the state, not after the render: an Add opens the bag
     and starts adding in the same tap, and an add that fails at once must
     know the bag is open (or the shopper gets the message twice). */
  const setDrawerOpen = useCallback((open: boolean) => {
    drawerOpenRef.current = open;
    setDrawerOpenState(open);
  }, []);
  useEffect(() => {
    drawerOpenRef.current = isDrawerOpen;
    if (!isDrawerOpen) setAddError(null);
  }, [isDrawerOpen]);

  /* Fetch the Fastrr script only once a shopper actually opens the bag, so the
     third-party file never lands on first paint of a browsing session. */
  useEffect(() => {
    if (isDrawerOpen) primeFastrr();
  }, [isDrawerOpen]);

  /* Persist synchronously AND update React state. The synchronous write matters:
     "Buy now" reads the cart back from storage right after adding, before React
     has flushed the state update + effect. Without it checkout saw a stale cart
     and wrongly reported "Add an item before checkout". */
  const commitCart = useCallback((next: StoredCart | ((current: StoredCart) => StoredCart)) => {
    const resolved = typeof next === "function" ? (next as (c: StoredCart) => StoredCart)(loadCart()) : next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
    } catch {
      /* storage full / private mode — state still updates */
    }
    setStoredCart(resolved);
    return resolved;
  }, []);

  const clearCart = useCallback(() => {
    commitCart(emptyCart);
  }, [commitCart]);

  const addItemToCart = useCallback(async (item: Omit<CartItem, "quantity" | "lineId">, quantity = 1): Promise<string | null> => {
    /* Said in the bag when it is open, as it now is for every Add on a
       product page; a toast otherwise. */
    const fail = (message: string) => {
      setAddError(message);
      if (!drawerOpenRef.current) toast.error(message);
      return null;
    };
    if (!item.variantId) return fail("This product is not available for checkout yet.");

    setIsLoading(true);
    setAddError(null);
    setPending({ ...item, quantity, lineId: null });
    addsInFlight.current += 1;
    addsStarted.current += 1;
    const unavailable = `${item.name} couldn't be added. It may have just sold out.`;
    const key = keyOf(item);
    try {
      await removals.current.get(key);
      const latest = loadCart();
      const existing = latest.items.find((cartItem) => keyOf(cartItem) === key);

      if (!latest.cartId) {
        const result = await createShopifyCart(item.variantId, quantity, item.size);
        /* Shopify leaves a piece it cannot sell out of the cart, without an error. */
        if (!result) return fail(unavailable);
        commitCart({
          cartId: result.cartId,
          checkoutUrl: result.checkoutUrl,
          items: [{ ...item, quantity: result.quantity, lineId: result.lineId }],
        });
        return result.checkoutUrl;
      }

      if (existing?.lineId) {
        const nextQuantity = existing.quantity + quantity;
        const result = await updateShopifyCartLine(latest.cartId, existing.lineId, nextQuantity);
        if (result.cartNotFound) {
          clearCart();
          return fail("Your cart timed out. Please add the piece again.");
        }
        if (!result.lineMissing) {
          const syncedQuantity = result.quantity ?? nextQuantity;
          if (syncedQuantity < nextQuantity) fail(`Only ${syncedQuantity} of ${item.name} left, all in your bag.`);
          const committed = commitCart((current) => ({
            ...current,
            checkoutUrl: result.checkoutUrl ?? current.checkoutUrl,
            items: current.items.map((cartItem) =>
              keyOf(cartItem) === key ? { ...cartItem, quantity: syncedQuantity } : cartItem
            ),
          }));
          return committed.checkoutUrl;
        }
        /* Shopify no longer has the bag's line for this piece, so its row is
           stale (the next sync would drop it). Drop it now and add the piece
           as a new line, as if the bag had not held it. */
        commitCart((current) => ({ ...current, items: current.items.filter((cartItem) => keyOf(cartItem) !== key) }));
      }

      const result = await addLineToShopifyCart(latest.cartId, item.variantId, quantity, item.size);
      if (result.cartNotFound) {
        clearCart();
        return fail("Your cart timed out. Please add the piece again.");
      }
      /* No line back means Shopify did not add it. Committing it anyway left a
         row in the bag that the next sync silently dropped. */
      if (!result.lineId) return fail(unavailable);
      const committed = commitCart((current) => ({
        ...current,
        checkoutUrl: result.checkoutUrl ?? current.checkoutUrl,
        // An orphaned local row (no lineId) for the same piece would double-count.
        items: [
          ...current.items.filter((cartItem) => keyOf(cartItem) !== key),
          { ...item, quantity: result.quantity ?? quantity, lineId: result.lineId ?? null },
        ],
      }));
      return committed.checkoutUrl;
    } catch (error) {
      console.error("Failed to add Shopify item", error);
      const said = error instanceof Error ? error.message : "";
      return fail(/sold out|out of stock|not enough|not available|isn't available/i.test(said) ? `${item.name} has just sold out.` : `${item.name} couldn't be added. Please try again.`);
    } finally {
      addsInFlight.current -= 1;
      setIsLoading(false);
      setPending(null);
    }
  }, [clearCart, commitCart]);

  /* Meta Pixel AddToCart — only on a successful add (a checkout URL came back). */
  const addItem = useCallback(async (item: Omit<CartItem, "quantity" | "lineId">, quantity = 1) => {
    const url = await addItemToCart(item, quantity);
    if (url) {
      trackPixel("AddToCart", productParams({
        id: item.id,
        variantId: item.variantId,
        name: item.name,
        price: item.price,
        currencyCode: item.currencyCode,
        quantity,
      }));
    }
    return url;
  }, [addItemToCart]);

  const removeItem = useCallback(async (id: string, size?: string, variantId?: string) => {
    const latest = loadCart();
    const item = findLine(latest.items, id, size, variantId);
    if (!item) return;
    const key = keyOf(item);

    setIsLoading(true);
    const removal = (async () => {
      try {
        if (latest.cartId && item.lineId) {
          const result = await removeLineFromShopifyCart(latest.cartId, item.lineId);
          if (result.cartNotFound) {
            clearCart();
            return;
          }
          commitCart((current) => {
            const nextItems = current.items.filter((cartItem) => keyOf(cartItem) !== key);
            return nextItems.length === 0
              ? emptyCart
              : { ...current, checkoutUrl: result.checkoutUrl ?? current.checkoutUrl, items: nextItems };
          });
        } else {
          commitCart((current) => ({
            ...current,
            items: current.items.filter((cartItem) => keyOf(cartItem) !== key),
          }));
        }
      } catch (error) {
        console.error("Failed to remove Shopify item", error);
        toast.error("Could not remove this item.");
      } finally {
        // An Undo waiting on this removal keeps the bag busy until it lands.
        if (!addsInFlight.current) setIsLoading(false);
      }
    })();
    removals.current.set(key, removal);
    await removal;
    if (removals.current.get(key) === removal) removals.current.delete(key);
  }, [clearCart, commitCart]);

  const updateQuantity = useCallback(async (id: string, size: string | undefined, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      await removeItem(id, size, variantId);
      return;
    }

    const latest = loadCart();
    const item = findLine(latest.items, id, size, variantId);
    if (!item) return;
    const key = keyOf(item);

    setIsLoading(true);
    try {
      if (latest.cartId && item.lineId) {
        const result = await updateShopifyCartLine(latest.cartId, item.lineId, quantity);
        if (result.cartNotFound) {
          clearCart();
          toast.error("Your cart timed out. Please add the piece again.");
          return;
        }
        /* Shopify no longer has this line: drop the row, as the next sync
           would, and say why it went (the shopper asked for more, not less). */
        if (result.lineMissing) {
          commitCart((current) => {
            const nextItems = current.items.filter((cartItem) => keyOf(cartItem) !== key);
            return nextItems.length === 0 ? emptyCart : { ...current, items: nextItems };
          });
          toast.error(`${item.name} was no longer in your bag. Please add it again.`);
          return;
        }
        const syncedQuantity = result.quantity ?? quantity;
        commitCart((current) => ({
          ...current,
          checkoutUrl: result.checkoutUrl ?? current.checkoutUrl,
          items: current.items.map((cartItem) => (keyOf(cartItem) === key ? { ...cartItem, quantity: syncedQuantity } : cartItem)),
        }));
      }
    } catch (error) {
      console.error("Failed to update Shopify quantity", error);
      toast.error("Could not update quantity.");
    } finally {
      setIsLoading(false);
    }
  }, [clearCart, commitCart, removeItem]);

  const isSyncingRef = useRef(false);
  /**
   * Reconcile the local cart with the real Shopify cart.
   *
   * The Shopify cart lives server-side and outlives localStorage, so the two can
   * drift: lines added in an older session (or on another device) stayed on the
   * Shopify cart and reappeared at checkout even though the drawer looked empty.
   * We now make Shopify match exactly what the drawer shows — stale server lines
   * are deleted, quantities are pulled from Shopify, and local rows whose line no
   * longer exists are dropped.
   */
  const syncCart = useCallback(async () => {
    const latest = loadCart();
    /* An add under way gets the cart back from Shopify itself. A sync beside it
       (the bag now opens at the tap, and syncs as it opens) would take the new
       line for a stale one and delete it, or commit the bag from before it. */
    if (!latest.cartId || isSyncingRef.current || addsInFlight.current > 0) return;
    const adds = addsStarted.current;
    const addBegan = () => addsStarted.current !== adds;

    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const cart = await fetchShopifyCart(latest.cartId);
      if (addBegan()) return;
      if (!cart) {
        clearCart();
        return;
      }

      const serverLines = cart.lines.edges.map((edge) => edge.node);
      const knownLineIds = new Set(latest.items.map((item) => item.lineId).filter(Boolean) as string[]);
      const orphanLines = serverLines.filter((line) => !knownLineIds.has(line.id));

      let checkoutUrlValue = cart.checkoutUrl;
      for (const orphan of orphanLines) {
        if (addBegan()) return;
        const removal = await removeLineFromShopifyCart(latest.cartId, orphan.id);
        if (removal.checkoutUrl) checkoutUrlValue = removal.checkoutUrl;
      }

      const serverById = new Map(serverLines.map((line) => [line.id, line]));
      const reconciled = latest.items
        .filter((item) => item.lineId && serverById.has(item.lineId))
        .map((item) => ({ ...item, quantity: serverById.get(item.lineId!)!.quantity }));

      if (addBegan()) return;
      if (reconciled.length === 0) {
        clearCart();
        return;
      }

      commitCart((current) => ({
        ...current,
        cartId: latest.cartId,
        checkoutUrl: formatCheckoutUrl(checkoutUrlValue),
        items: reconciled,
      }));
    } catch (error) {
      console.error("Failed to sync Shopify cart", error);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [clearCart, commitCart]);

  /* What goes to checkout: the whole bag, or (Buy Now beside other pieces)
     only the given lines, on a Shopify cart of their own. */
  const openCheckout = useCallback(async (url: string, only?: { items: CartItem[]; cartId: string }) => {
    const latest = loadCart();
    const lines = only?.items ?? latest.items;
    const value = Number(lines.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2));

    /* The one discount the order actually gets. The bag earns BUY2 on two or
       more pieces; a typed code can beat it. Resolved once here so the code
       put on the cart, the code handed to Fastrr, the total shown in the
       drawer and the value Meta is told are all the same discount. */
    const resolved = resolveCartDiscount({
      totalItems: lines.reduce((sum, i) => sum + i.quantity, 0),
      promoCode: getPromoCode(),
    });
    /* What the shopper is about to be charged: the bag's Total. It was the
       sum before the discount (3398 for a two-piece BUY2 bag charged 2888). */
    const charged = discountedSubtotal(value, resolved) + SHIPPING_CHARGE;
    trackPixel("InitiateCheckout", {
      currency: lines[0]?.currencyCode || "INR",
      // Meta requires a positive numeric value.
      ...(charged > 0 ? { value: charged } : {}),
      num_items: lines.reduce((sum, i) => sum + i.quantity, 0),
      content_ids: lines.map((i) => shopifyNumericId(i.variantId) ?? i.id),
      contents: lines.map((i) => ({
        id: shopifyNumericId(i.variantId) ?? i.id,
        quantity: i.quantity,
        item_price: Number(i.price.toFixed(2)),
      })),
      content_type: "product",
    });
    /* Clarity stops at our domain — Shopify's checkout is another origin we
       cannot instrument on this plan. Tagging the handoff is what makes the
       two halves separable: sessions that reached payment vs sessions that
       never did. */
    setClarityTag("reached_checkout", "yes");
    setClarityTag("checkout_value", String(Math.round(value)));
    /* Carry the anonymous visitor id and click id onto the cart so Shopify's
       server-side Purchase event can be matched back to this session. Never
       block checkout on it. A cart of Buy Now's own got them a moment ago. */
    if (!only && latest.cartId) {
      try {
        await updateCartTrackingAttributes(latest.cartId);
      } catch (error) {
        console.error("Could not attach tracking attributes to cart", error);
      }
    }

    let target = applyPromoToCheckoutUrl(formatCheckoutUrl(url), resolved.code);

    /* Put the discount on the cart, not just in the query string. ?discount= is
       honoured on Shopify's /cart/... permalinks, but we hand over at
       /checkouts/cn/<token>, where it is not documented to apply — and if it
       silently does not, the drawer quotes one total and Shopify charges
       another (₹245 more on a ₹2,449 piece). Setting it on the
       cart makes it travel with the cart. The URL parameter stays as a
       harmless belt-and-braces. */
    const code = resolved.code;
    const cartId = only ? only.cartId : loadCart().cartId;
    if (code && cartId) {
      /* That call runs 437ms at the median and up to 1.2s, so the button has to
         say something. Without this the shopper taps Secure Checkout and nothing
         visibly happens for a second — which reads as a broken button. */
      setIsLoading(true);
      try {
        const res = await applyCartDiscountCodes(cartId, [code]);
        if (res.checkoutUrl) target = applyPromoToCheckoutUrl(res.checkoutUrl, resolved.code);
      } catch (error) {
        /* Never block checkout on the discount call — the query string still
           carries the code, and Shopify's own field accepts it at checkout. */
        console.error("Could not attach discount to cart", error);
      } finally {
        setIsLoading(false);
      }
    } else if (cartId) {
      /* One piece earns no code: take an earlier rung's off the cart (it
         stayed there after a removal). Not awaited, so a one-piece checkout
         is never held up; a rung's code never applies to one piece, so the
         price cannot change whichever way the call lands. */
      void (async () => {
        try {
          await applyCartDiscountCodes(cartId, []);
        } catch (error) {
          console.error("Could not clear cart discount", error);
        }
      })();
    }

    /* Straight to checkout in this tab.

       This used to call window.open(target, "_blank", "noopener,noreferrer")
       first and fall back to navigation "if the popup was blocked". That test
       could never pass: per the HTML spec window.open returns null whenever
       noopener is set — verified null on 100 of 100 calls — so the fallback
       always ran regardless. The call either did nothing, tripped a
       popup-blocked warning, or opened a stray tab that the navigation below
       then orphaned. Same-tab hand-off is what Shopify's own buttons do, and it
       keeps the shopper's back button working. */
    /* Shiprocket Fastrr, when switched on, replaces only the page the shopper
       pays on — the bag was still built in Shopify above, and the finished
       order comes back to Shopify. Anything less than a usable URL (script
       blocked, slow, empty response) falls through to Shopify's own checkout
       rather than leaving the button dead. */
    /* Shopify's checkout gets the session's campaign on its address too. */
    target = withSessionUtm(target);
    if (isFastrrEnabled()) {
      setIsLoading(true);
      try {
        const started = await startFastrrCheckout(only ? only.items : loadCart().items, { couponCode: resolved.code, fallbackUrl: target });
        if (started) {
          /* Fastrr takes over the screen itself — no navigation from us. */
          setDrawerOpen(false);
          return;
        }
      } catch (error) {
        console.error("Falling back to Shopify checkout", error);
      } finally {
        setIsLoading(false);
      }
    }

    window.location.assign(target);
    setDrawerOpen(false);
  }, [setDrawerOpen]);

  const checkout = useCallback(() => {
    const latestUrl = loadCart().checkoutUrl ?? checkoutUrl;
    if (!latestUrl) {
      toast.error("Add an item before checkout.");
      return;
    }
    openCheckout(latestUrl);
  }, [checkoutUrl, openCheckout]);

  /* Buy Now hands off a line the bag already holds once Shopify says it still
     has it. Setting the line to the quantity it already has adds nothing, and
     is the one call the second add used to make. Without it, a bag whose
     Shopify cart had gone (run out after some days, or used for a Shopify
     checkout order), or whose line was taken out in another tab, went to
     checkout as it showed, on a cart Shopify no longer had. In those cases
     the piece goes in again as if the bag had not held it: on a new cart when
     the cart is gone, as a new line when only its line is. It goes in as many
     times as the bag showed it (2 after + in the bag), so checkout gets what
     a working cart would have handed off, not 1 at full price. If Shopify
     has fewer of the piece left than the bag showed, checkout gets what it
     has and the shopper is told why, in the words an Add over the stock left
     uses (main's second add said it on this tap too). */
  const confirmInBag = useCallback(async (item: Omit<CartItem, "quantity" | "lineId">, line: CartItem, quantity: number): Promise<string | null> => {
    const { cartId, checkoutUrl: url } = loadCart();
    if (!cartId || !line.lineId) return url;
    const key = keyOf(item);
    const sayIfFewer = (wanted: number) => {
      const kept = loadCart().items.find((cartItem) => keyOf(cartItem) === key)?.quantity;
      if (kept === undefined || kept >= wanted) return;
      const message = `Only ${kept} of ${item.name} left, all in your bag.`;
      setAddError(message);
      if (!drawerOpenRef.current) toast.error(message);
    };
    setIsLoading(true);
    try {
      const result = await updateShopifyCartLine(cartId, line.lineId, line.quantity);
      const again = Math.max(quantity, line.quantity);
      if (result.cartNotFound) {
        clearCart();
        const readded = await addItem(item, again);
        if (readded) sayIfFewer(again);
        return readded;
      }
      /* Its one other refusal: Shopify no longer has this line. */
      if (!result.success) {
        commitCart((current) => ({ ...current, items: current.items.filter((cartItem) => keyOf(cartItem) !== key) }));
        const readded = await addItem(item, again);
        if (readded) sayIfFewer(again);
        return readded;
      }
      const committed = commitCart((current) => ({
        ...current,
        checkoutUrl: result.checkoutUrl ?? current.checkoutUrl,
        items: current.items.map((cartItem) => (keyOf(cartItem) === key ? { ...cartItem, quantity: result.quantity ?? cartItem.quantity } : cartItem)),
      }));
      sayIfFewer(line.quantity);
      return committed.checkoutUrl;
    } catch (error) {
      /* Never hold checkout on the check itself: the line goes as it is. */
      console.error("Could not check the bag line with Shopify", error);
      return url;
    } finally {
      setIsLoading(false);
    }
  }, [addItem, clearCart, commitCart]);

  /* One-tap "Pre-order now / Shop now": add to the Shopify cart, then go straight
     to Shopify checkout using the URL that add returned (no stale-state race).
     A line already in the bag goes as it is: adding again sent a shopper who
     tapped Add and then Buy Now to pay for two (and earned BUY2 on the way).
     A shopper who picked more than the bag holds (the outfit page's quantity
     stepper) gets the line raised to that many first, not that many more.
     With other pieces in the bag, only this one goes to checkout and the rest
     stay in the bag for later: Shopify's checkout (Fastrr's fallback) gets a
     cart of its own holding just this line. */
  const buyNow = useCallback(async (item: Omit<CartItem, "quantity" | "lineId">, quantity = 1) => {
    const latest = loadCart();
    const inBag = latest.items.find((line) => line.lineId && keyOf(line) === keyOf(item));
    const url = !inBag
      ? await addItem(item, quantity)
      : inBag.quantity < quantity
        ? await addItem(item, quantity - inBag.quantity)
        : await confirmInBag(item, inBag, quantity);
    if (!url) {
      toast.error("Could not open checkout. Please try again.");
      return;
    }
    const bag = loadCart();
    const line = bag.items.find((l) => l.lineId && keyOf(l) === keyOf(item));
    if (line && bag.items.length > 1) {
      let own: Awaited<ReturnType<typeof createShopifyCart>> = null;
      try {
        own = await createShopifyCart(line.variantId, line.quantity, line.size);
      } catch (error) {
        console.error("Could not start a cart for this piece", error);
      }
      if (!own) {
        toast.error("Could not open checkout. Please try again.");
        return;
      }
      await openCheckout(own.checkoutUrl, { items: [{ ...line, quantity: own.quantity, lineId: own.lineId }], cartId: own.cartId });
      return;
    }
    await openCheckout(url);
  }, [addItem, confirmInBag, openCheckout]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  // Stable value identity so useCart consumers only re-render when a field
  // they read actually changes, not on every provider render.
  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      buyNow,
      removeItem,
      updateQuantity,
      clearCart,
      syncCart,
      checkout,
      totalItems,
      subtotal,
      isDrawerOpen,
      setDrawerOpen,
      isLoading,
      isSyncing,
      checkoutUrl,
      pending,
      addError,
    }),
    [items, addItem, buyNow, removeItem, updateQuantity, clearCart, syncCart, checkout, totalItems, subtotal, isDrawerOpen, setDrawerOpen, isLoading, isSyncing, checkoutUrl, pending, addError]
  );


  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
