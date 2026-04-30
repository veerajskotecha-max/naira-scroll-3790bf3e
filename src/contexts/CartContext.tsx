import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  addLineToShopifyCart,
  createShopifyCart,
  fetchShopifyCart,
  formatCheckoutUrl,
  removeLineFromShopifyCart,
  updateShopifyCartLine,
} from "@/lib/shopify";

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
  addItem: (item: Omit<CartItem, "quantity" | "lineId">, quantity?: number) => Promise<void>;
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

  const clearCart = useCallback(() => setStoredCart(emptyCart), []);

  const addItem = useCallback(async (item: Omit<CartItem, "quantity" | "lineId">, quantity = 1) => {
    if (!item.variantId) {
      toast.error("This product is not available for checkout yet.");
      return;
    }

    setIsLoading(true);
    try {
      const latest = loadCart();
      const key = getCartKey(item.id, item.size);
      const existing = latest.items.find((cartItem) => getCartKey(cartItem.id, cartItem.size) === key);

      if (!latest.cartId) {
        const result = await createShopifyCart(item.variantId, quantity);
        if (!result) throw new Error("Could not create Shopify cart.");
        setStoredCart({
          cartId: result.cartId,
          checkoutUrl: result.checkoutUrl,
          items: [{ ...item, quantity: result.quantity, lineId: result.lineId }],
        });
        return;
      }

      if (existing) {
        if (!existing.lineId) throw new Error("Cart line is missing. Please add the item again.");
        const nextQuantity = existing.quantity + quantity;
        const result = await updateShopifyCartLine(latest.cartId, existing.lineId, nextQuantity);
        if (result.cartNotFound) {
          clearCart();
          toast.error("Your Shopify cart expired. Please add the item again.");
          return;
        }
        const syncedQuantity = result.quantity ?? nextQuantity;
        setStoredCart((current) => ({
          ...current,
          checkoutUrl: result.checkoutUrl ?? current.checkoutUrl,
          items: current.items.map((cartItem) =>
            getCartKey(cartItem.id, cartItem.size) === key ? { ...cartItem, quantity: syncedQuantity } : cartItem
          ),
        }));
        return;
      }

      const result = await addLineToShopifyCart(latest.cartId, item.variantId, quantity);
      if (result.cartNotFound) {
        clearCart();
        toast.error("Your Shopify cart expired. Please add the item again.");
        return;
      }
      setStoredCart((current) => ({
        ...current,
        checkoutUrl: result.checkoutUrl ?? current.checkoutUrl,
        items: [...current.items, { ...item, quantity: result.quantity ?? quantity, lineId: result.lineId ?? null }],
      }));
    } catch (error) {
      console.error("Failed to add Shopify item", error);
      toast.error("Could not add this item to cart.");
    } finally {
      setIsLoading(false);
    }
  }, [clearCart]);

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
          toast.error("Your Shopify cart expired. Please add the item again.");
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

  const syncCart = useCallback(async () => {
    const latest = loadCart();
    if (!latest.cartId || isSyncing) return;

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
      setIsSyncing(false);
    }
  }, [clearCart, isSyncing]);

  const checkout = useCallback(() => {
    const latestUrl = loadCart().checkoutUrl ?? checkoutUrl;
    if (!latestUrl) {
      toast.error("Add an item before checkout.");
      return;
    }
    window.open(formatCheckoutUrl(latestUrl), "_blank", "noopener,noreferrer");
    setDrawerOpen(false);
  }, [checkoutUrl]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
