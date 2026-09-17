import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, Truck, Lock, Shield, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";
import { CartPromoField } from "@/components/cart/CartExtras";
import { getPromoCode, getPromoDiscountRate, PROMO_EVENT } from "@/lib/promo";
import { SHIPPING_CHARGE, addWorkingDays, formatDeliveryDate } from "@/lib/serviceability";
import CheckoutBenefit from "@/components/checkout/CheckoutBenefit";

/* Shopify reports a single-variant product as [{name:"Title",value:"Default Title"}]
   — that is 16 of 18 garments and every jewellery piece. Printing it verbatim put
   "Title: Default Title" on the last screen before payment. */
const lineOptions = (item: { selectedOptions?: Array<{ name: string; value: string }>; size?: string }) => {
  const real = (item.selectedOptions ?? []).filter(
    (o) => o.name.toLowerCase() !== "title" && o.value.toLowerCase() !== "default title"
  );
  if (real.length) return real.map((o) => `${o.name}: ${o.value}`).join(" · ");
  return item.size ? `Size: ${item.size}` : "";
};

const CartDrawer = () => {
  const { items, totalItems, subtotal, updateQuantity, removeItem, isDrawerOpen, setDrawerOpen, checkout, isLoading, isSyncing, syncCart } = useCart();
  const contentRef = useRef<HTMLDivElement>(null);
  const dismiss = useCallback(() => setDrawerOpen(false), [setDrawerOpen]);
  useSwipeDismiss(contentRef, isDrawerOpen, dismiss);

  const [promoCode, setActivePromoCode] = useState<string | null>(() => getPromoCode());
  useEffect(() => {
    const syncPromo = () => setActivePromoCode(getPromoCode());
    window.addEventListener(PROMO_EVENT, syncPromo);
    return () => window.removeEventListener(PROMO_EVENT, syncPromo);
  }, []);

  // Reconcile with the real Shopify cart whenever the drawer opens, so lines
  // left over from an older session can never surprise the shopper.
  useEffect(() => {
    if (isDrawerOpen) syncCart();
  }, [isDrawerOpen, syncCart]);

  const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  /* A dated arrival promise, computed the way a courier counts: working days
     only. Quoting "3–5 working days" makes the shopper do this arithmetic. */
  const arrivesBy = formatDeliveryDate(addWorkingDays(new Date(), 5));

  const discountRate = getPromoDiscountRate(promoCode);
  const discountAmount = Math.round(subtotal * discountRate);
  const orderTotal = subtotal - discountAmount + SHIPPING_CHARGE;


  const handleCheckout = () => checkout();


  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent ref={contentRef} className="bottom-0 top-auto flex h-auto max-h-[92dvh] w-full flex-col gap-0 p-0 sm:inset-y-0 sm:h-full sm:max-h-[100dvh] sm:max-w-[420px]">
        {/* Header */}
        <SheetHeader className="shrink-0 px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-cormorant text-[20px] font-semibold" style={{ color: "hsl(0 0% 15%)" }}>
              Your Cart ({totalItems})
            </SheetTitle>
          </div>
        </SheetHeader>

        <Separator className="shrink-0" />

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-16 h-16 flex items-center justify-center border" style={{ borderColor: "hsl(36 47% 46% / 0.35)", backgroundColor: "hsl(33 41% 95%)" }}>
              <ShoppingBag size={24} strokeWidth={1.3} style={{ color: "hsl(36 47% 46%)" }} />
            </div>
            <p className="mt-5 font-cormorant text-[22px] font-semibold" style={{ color: "hsl(0 0% 18%)" }}>Your cart is empty</p>
            <p className="mt-2 font-cormorant text-[15px] leading-[1.7] max-w-[240px]" style={{ color: "hsl(0 0% 50%)" }}>
              Pieces you choose will gather here, ready when you are.
            </p>
            <Link
              to="/shop"
              onClick={() => setDrawerOpen(false)}
              className="mt-7 px-9 min-h-[48px] text-[12px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 inline-flex items-center"
              style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
            >
              Continue Shopping
            </Link>
            <Link
              to="/jewellery"
              onClick={() => setDrawerOpen(false)}
              className="mt-4 inline-flex items-center min-h-[44px] px-2 font-cormorant text-[14px] underline underline-offset-4 transition-colors duration-200"
              style={{ color: "hsl(0 0% 45%)" }}
            >
              View the jewellery
            </Link>
          </div>
        ) : (
          <>
            {/* Scroll region: cart items only — footer CTA always stays visible */}
            <div className="max-h-[34dvh] min-h-0 overflow-y-auto overscroll-contain sm:flex-1 sm:max-h-none">

              {/* Lines sit against the summary rather than floating at the top
                  of an empty panel, so a single-item cart reads as one block. */}
              <div className="flex flex-col px-5 py-4 space-y-4">

                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-[76px] w-[76px] shrink-0 object-cover"
                      width={72}
                      height={90}
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <p className="line-clamp-2 font-cormorant text-[15px] font-semibold leading-tight" style={{ color: "hsl(0 0% 15%)" }}>{item.name}</p>
                        {lineOptions(item) ? <p className="text-[12px] mt-0.5 truncate" style={{ color: "hsl(0 0% 55%)" }}>{lineOptions(item)}</p> : null}
                        <p className="mt-1 font-cormorant text-[15px] font-bold" style={{ color: "hsl(186 35% 28%)" }}>{item.priceLabel}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="inline-flex items-center border" style={{ borderColor: "hsl(0 0% 82%)" }}>
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} disabled={isLoading} className="press-scale w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50" aria-label="Decrease quantity"><Minus size={12} /></button>
                          <span className="w-8 text-center text-[13px] font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} disabled={isLoading} className="press-scale w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50" aria-label="Increase quantity"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeItem(item.id, item.size)} disabled={isLoading} className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50" aria-label={`Remove ${item.name}`}>
                          <X size={14} style={{ color: "hsl(0 0% 50%)" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Footer — always visible above the fold */}
            <div
              className="shrink-0 space-y-2 border-t px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]"
              style={{ borderColor: "hsl(0 0% 90%)", backgroundColor: "hsl(0 0% 100%)" }}
            >
              {/* Delivery — a named date, not a speed. Shoppers buying a gift
                  stall at checkout to work the days out themselves. */}
              <div className="flex items-center gap-2 border border-border bg-muted/40 px-3 py-2">
                <Truck size={13} strokeWidth={1.5} style={{ color: "hsl(142 50% 38%)" }} />
                <p className="text-[12px]" style={{ color: "hsl(0 0% 38%)" }}>
                  Order today, arrives by <strong className="font-semibold">{arrivesBy}</strong>
                </p>
              </div>

              {/* Promo code */}
              <CartPromoField />

              <div className="space-y-1 text-[12px] text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Insured shipping</span>
                  <span className="text-foreground">{formatPrice(SHIPPING_CHARGE)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-primary">
                    <span>{promoCode} ({Math.round(discountRate * 100)}% off)</span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>
              {/* Total */}
              <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <span className="font-cormorant text-[16px] font-semibold" style={{ color: "hsl(0 0% 25%)" }}>Total</span>
                <span className="font-cormorant text-[18px] font-bold" style={{ color: "hsl(186 35% 28%)" }}>{formatPrice(orderTotal)}</span>
              </div>

              {/* CTA */}
              <button
                onClick={handleCheckout}

                disabled={isLoading || isSyncing}
                className="press-scale w-full py-3.5 text-[13px] font-medium uppercase tracking-[0.1em] flex items-center justify-center gap-2 min-h-[52px] disabled:opacity-70"
                style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 23%)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 28%)")}
              >
                {isLoading || isSyncing ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} strokeWidth={2} />} Secure Checkout
              </button>
              <CheckoutBenefit className="flex w-full" />
              <Link to="/shop" onClick={() => setDrawerOpen(false)} className="flex items-center justify-center min-h-[36px] text-center font-cormorant text-[14px] underline underline-offset-4 transition-colors" style={{ color: "hsl(0 0% 45%)" }}>
                Continue Shopping
              </Link>
            </div>

          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
