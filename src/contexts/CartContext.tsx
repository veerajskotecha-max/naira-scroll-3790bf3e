import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  addLineToShopifyCart,
  createShopifyCart,
  fetchShopifyCart,
  formatCheckoutUrl,
  removeLineFromShopifyCart,
  updateShopifyCartLine,
} from "@/lib/shopify";
import { applyPromoToCheckoutUrl } from "@/lib/promo";
import { productParams, trackPixel } from "@/lib/pixel";

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
  removeItem: (id: string, size?: string) => Promise<void>;
  updateQuantity: (id: string, size: string | undefined, quantity: number) => Promise<void>;
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

const getCartKey = (id: string, size?: string) => `${id}__${size ?? ""}`;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [storedCart, setStoredCart] = useState<StoredCart>(loadCart);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const { items, cartId, checkoutUrl } = storedCart;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCart));
  }, [storedCart]);

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
    if (!item.variantId) {
      toast.error("This product is not available for checkout yet.");
      return null;
    }

    setIsLoading(true);
    try {
      const latest = loadCart();
      const key = getCartKey(item.id, item.size);
      const existing = latest.items.find((cartItem) => getCartKey(cartItem.id, cartItem.size) === key);

      if (!latest.cartId) {
        const result = await createShopifyCart(item.variantId, quantity);
        if (!result) throw new Error("Could not create Shopify cart.");
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
          toast.error("Your cart timed out. Please add the piece again.");
          return null;
        }
        const syncedQuantity = result.quantity ?? nextQuantity;
        const committed = commitCart((current) => ({
          ...current,
          checkoutUrl: result.checkoutUrl ?? current.checkoutUrl,
          items: current.items.map((cartItem) =>
            getCartKey(cartItem.id, cartItem.size) === key ? { ...cartItem, quantity: syncedQuantity } : cartItem
          ),
        }));
        return committed.checkoutUrl;
      }

      const result = await addLineToShopifyCart(latest.cartId, item.variantId, quantity);
      if (result.cartNotFound) {
        clearCart();
        toast.error("Your cart timed out. Please add the piece again.");
        return null;
      }
      const committed = commitCart((current) => ({
        ...current,
        checkoutUrl: result.checkoutUrl ?? current.checkoutUrl,
        // An orphaned local row (no lineId) for the same piece would double-count.
        items: [
          ...current.items.filter((cartItem) => getCartKey(cartItem.id, cartItem.size) !== key),
          { ...item, quantity: result.quantity ?? quantity, lineId: result.lineId ?? null },
        ],
      }));
      return committed.checkoutUrl;
    } catch (error) {
      console.error("Failed to add Shopify item", error);
      toast.error("Could not add this item to cart.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearCart, commitCart]);

  /* Meta Pixel AddToCart — only on a successful add (a checkout URL came back). */
  const addItem = useCallback(async (item: Omit<CartItem, "quantity" | "lineId">, quantity = 1) => {
    const url = await addItemToCart(item, quantity);
    if (url) {
      trackPixel("AddToCart", productParams({
        id: item.id,
        name: item.name,
        price: item.price,
        currencyCode: item.currencyCode,
        quantity,
      }));
    }
    return url;
  }, [addItemToCart]);

  const removeItem = useCallback(async (id: string, size?: string) => {
    const latest = loadCart();
    const key = getCartKey(id, size);
    const item = latest.items.find((cartItem) => getCartKey(cartItem.id, cartItem.size) === key);
    if (!item) return;

    setIsLoading(true);
    try {
      if (latest.cartId && item.lineId) {
        const result = await removeLineFromShopifyCart(latest.cartId, item.lineId);
        if (result.cartNotFound) {
          clearCart();
          return;
        }
        commitCart((current) => {
          const nextItems = current.items.filter((cartItem) => getCartKey(cartItem.id, cartItem.size) !== key);
          return nextItems.length === 0
            ? emptyCart
            : { ...current, checkoutUrl: result.checkoutUrl ?? current.checkoutUrl, items: nextItems };
        });
      } else {
        commitCart((current) => ({
          ...current,
          items: current.items.filter((cartItem) => getCartKey(cartItem.id, cartItem.size) !== key),
        }));
      }
    } catch (error) {
      console.error("Failed to remove Shopify item", error);
      toast.error("Could not remove this item.");
    } finally {
      setIsLoading(false);
    }
  }, [clearCart, commitCart]);

  const updateQuantity = useCallback(async (id: string, size: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id, size);
      return;
    }

    const latest = loadCart();
    const key = getCartKey(id, size);
    const item = latest.items.find((cartItem) => getCartKey(cartItem.id, cartItem.size) === key);
    if (!item) return;

    setIsLoading(true);
    try {
      if (latest.cartId && item.lineId) {
        const result = await updateShopifyCartLine(latest.cartId, item.lineId, quantity);
        if (result.cartNotFound) {
          clearCart();
          toast.error("Your cart timed out. Please add the piece again.");
          return;
        }
        const syncedQuantity = result.quantity ?? quantity;
        commitCart((current) => ({
          ...current,
          checkoutUrl: result.checkoutUrl ?? current.checkoutUrl,
          items: current.items.map((cartItem) => (getCartKey(cartItem.id, cartItem.size) === key ? { ...cartItem, quantity: syncedQuantity } : cartItem)),
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
    if (!latest.cartId || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const cart = await fetchShopifyCart(latest.cartId);
      if (!cart) {
        clearCart();
        return;
      }

      const serverLines = cart.lines.edges.map((edge) => edge.node);
      const knownLineIds = new Set(latest.items.map((item) => item.lineId).filter(Boolean) as string[]);
      const orphanLines = serverLines.filter((line) => !knownLineIds.has(line.id));

      let checkoutUrlValue = cart.checkoutUrl;
      for (const orphan of orphanLines) {
        const removal = await removeLineFromShopifyCart(latest.cartId, orphan.id);
        if (removal.checkoutUrl) checkoutUrlValue = removal.checkoutUrl;
      }

      const serverById = new Map(serverLines.map((line) => [line.id, line]));
      const reconciled = latest.items
        .filter((item) => item.lineId && serverById.has(item.lineId))
        .map((item) => ({ ...item, quantity: serverById.get(item.lineId!)!.quantity }));

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

  const openCheckout = useCallback((url: string) => {
    const latest = loadCart();
    trackPixel("InitiateCheckout", {
      currency: latest.items[0]?.currencyCode || "INR",
      value: latest.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      num_items: latest.items.reduce((sum, i) => sum + i.quantity, 0),
      content_ids: latest.items.map((i) => i.id),
      content_type: "product",
    });
    const target = applyPromoToCheckoutUrl(formatCheckoutUrl(url));
    const opened = window.open(target, "_blank", "noopener,noreferrer");
    // Popup blockers reject window.open outside a direct click (Buy now awaits
    // a network call first) — fall back to same-tab navigation.
    if (!opened || opened.closed) window.location.assign(target);
    setDrawerOpen(false);
  }, []);

  const checkout = useCallback(() => {
    const latestUrl = loadCart().checkoutUrl ?? checkoutUrl;
    if (!latestUrl) {
      toast.error("Add an item before checkout.");
      return;
    }
    openCheckout(latestUrl);
  }, [checkoutUrl, openCheckout]);

  /* One-tap "Pre-order now / Shop now": add to the Shopify cart, then go straight
     to Shopify checkout using the URL that add returned (no stale-state race). */
  const buyNow = useCallback(async (item: Omit<CartItem, "quantity" | "lineId">, quantity = 1) => {
    const url = await addItem(item, quantity);
    const target = url ?? loadCart().checkoutUrl;
    if (!target) {
      toast.error("Could not open checkout. Please try again.");
      return;
    }
    openCheckout(target);
  }, [addItem, openCheckout]);

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
    }),
    [items, addItem, buyNow, removeItem, updateQuantity, clearCart, syncCart, checkout, totalItems, subtotal, isDrawerOpen, isLoading, isSyncing, checkoutUrl]
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
