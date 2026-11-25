import { useEffect, useState } from "react";
import { getPromoCode, PROMO_EVENT } from "@/lib/promo";

/** The code the shopper has typed, if any, kept in step with promo.ts. */
export const usePromoCode = (): string | null => {
  const [code, setCode] = useState<string | null>(() => getPromoCode());
  useEffect(() => {
    const sync = () => setCode(getPromoCode());
    window.addEventListener(PROMO_EVENT, sync);
    return () => window.removeEventListener(PROMO_EVENT, sync);
  }, []);
  return code;
};
