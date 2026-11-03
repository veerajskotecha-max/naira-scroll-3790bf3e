import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { productParams, trackPixel } from "@/lib/pixel";

export interface WishlistItem {
  id: string;
  name: string;
  price: string;
  image: string;
  /** Which page the piece opens on. Missing on items saved before it was
      stored; the wishlist looks those up (WishlistDrawer). */
  kind?: "jewellery" | "apparel";
  /** The Shopify variant shown, so the event names Meta's catalogue item as
      Add to cart does; without it the event falls back to the handle. */
  variantId?: string | null;
  /** The price as a number, for the event's value; `price` stays the label. */
  amount?: number;
}

/* AddToWishlist sent the handle as its content id ("molten-bloom-hoops"),
   which matches no catalogue item (the catalogue keys on the numeric variant
   id), and no value or currency. It now has the same shape as AddToCart. */
const wishlistParams = (item: WishlistItem) =>
  productParams({ id: item.id, variantId: item.variantId, name: item.name, price: item.amount });

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isWishlisted: (id: string) => boolean;
  totalItems: number;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "naira-wishlist";

const loadWishlist = (): WishlistItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>(loadWishlist);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Above every error boundary: a throw here (storage blocked) blanked the whole site.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage blocked or full — the list still works for this visit */
    }
  }, [items]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      trackPixel("AddToWishlist", wishlistParams(item));
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      trackPixel("AddToWishlist", wishlistParams(item));
      return [...prev, item];
    });
  }, []);

  const isWishlisted = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, toggleItem, isWishlisted, totalItems, isDrawerOpen, setDrawerOpen }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- the hook lives beside its provider
export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
