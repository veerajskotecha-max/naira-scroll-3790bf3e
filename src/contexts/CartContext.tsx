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

  const addItem = useCallback(async (item: Omit<CartItem, "quantity" | "lineId">, quantity = 1): Promise<string | null> => {
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
        setStoredCart((current) => {
          const nextItems = current.items.filter((cartItem) => getCartKey(cartItem.id, cartItem.size) !== key);
          return nextItems.length === 0
            ? emptyCart
            : { ...current, checkoutUrl: result.checkoutUrl ?? current.checkoutUrl, items: nextItems };
        });
      } else {
        setStoredCart((current) => ({
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
  }, [clearCart]);

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
        setStoredCart((current) => ({
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
  }, [clearCart, removeItem]);

  const isSyncingRef = useRef(false);
  const syncCart = useCallback(async () => {
    const latest = loadCart();
    if (!latest.cartId || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const cart = await fetchShopifyCart(latest.cartId);
      if (!cart || cart.totalQuantity === 0) {
        clearCart();
        return;
      }
      setStoredCart((current) => ({ ...current, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl) }));
    } catch (error) {
      console.error("Failed to sync Shopify cart", error);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [clearCart]);

  const checkout = useCallback(() => {
    const latestUrl = loadCart().checkoutUrl ?? checkoutUrl;
    if (!latestUrl) {
      toast.error("Add an item before checkout.");
      return;
    }
    window.open(applyPromoToCheckoutUrl(formatCheckoutUrl(latestUrl)), "_blank", "noopener,noreferrer");
    setDrawerOpen(false);
  }, [checkoutUrl]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  // Stable value identity so useCart consumers only re-render when a field
  // they read actually changes, not on every provider render.
  const contextValue = useMemo(
    () => ({
      items,
      addItem,
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
    [items, addItem, removeItem, updateQuantity, clearCart, syncCart, checkout, totalItems, subtotal, isDrawerOpen, isLoading, isSyncing, checkoutUrl]
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
