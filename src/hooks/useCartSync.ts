import { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";

export const useCartSync = () => {
  const { syncCart } = useCart();

  useEffect(() => {
    syncCart();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") syncCart();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [syncCart]);
};
