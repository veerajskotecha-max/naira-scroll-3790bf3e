import { useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, Truck, Lock, Shield, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";

const FREE_SHIPPING_THRESHOLD = 2999;

const CartDrawer = () => {
  const { items, totalItems, subtotal, updateQuantity, removeItem, isDrawerOpen, setDrawerOpen, checkout, isLoading, isSyncing } = useCart();
  const contentRef = useRef<HTMLDivElement>(null);
  const dismiss = useCallback(() => setDrawerOpen(false), [setDrawerOpen]);
  useSwipeDismiss(contentRef, isDrawerOpen, dismiss);

  const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent ref={contentRef} className="w-full sm:max-w-[420px] flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-cormorant text-[20px] font-semibold" style={{ color: "hsl(0 0% 15%)" }}>
              Your Cart ({totalItems})
            </SheetTitle>
          </div>
        </SheetHeader>

        <Separator />

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
              Explore the jewellery
            </Link>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            <div className="px-5 py-3" style={{ backgroundColor: "hsl(33 30% 97%)" }}>
              {amountToFreeShipping > 0 ? (
                <p className="text-[12px] mb-2 flex items-center gap-1.5" style={{ color: "hsl(0 0% 38%)" }}>
                  <Truck size={13} strokeWidth={1.5} />
                  Add{" "}
                  <strong className="font-semibold" style={{ color: "hsl(186 35% 28%)" }}>
                    {formatPrice(amountToFreeShipping)}
                  </strong>{" "}
                  more for <strong className="font-semibold">free shipping</strong>
                </p>
              ) : (
                <p className="text-[12px] mb-2 flex items-center gap-1.5 font-medium" style={{ color: "hsl(142 60% 30%)" }}>
                  <Truck size={13} strokeWidth={1.5} />
                  Free shipping unlocked on this order
                </p>
              )}
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "hsl(0 0% 88%)" }}>
                <div
                  className="h-full rounded-full transition-[width,background-color] duration-500 ease-out"
                  style={{
                    width: `${shippingProgress}%`,
                    backgroundColor: shippingProgress >= 100 ? "hsl(142 60% 40%)" : "hsl(186 35% 38%)",
                  }}
                />
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-[80px] h-[100px] object-cover shrink-0"
                    width={80}
                    height={100}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <p className="font-cormorant text-[15px] font-semibold truncate" style={{ color: "hsl(0 0% 15%)" }}>{item.name}</p>
                      {item.selectedOptions?.length ? <p className="text-[12px] mt-0.5" style={{ color: "hsl(0 0% 55%)" }}>{item.selectedOptions.map((option) => `${option.name}: ${option.value}`).join(" · ")}</p> : item.size && <p className="text-[12px] mt-0.5" style={{ color: "hsl(0 0% 55%)" }}>Size: {item.size}</p>}
                      <p className="font-cormorant text-[15px] font-bold mt-1" style={{ color: "hsl(186 35% 28%)" }}>{item.priceLabel}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center border" style={{ borderColor: "hsl(0 0% 82%)" }}>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="press-scale w-11 h-11 flex items-center justify-center hover:bg-muted" aria-label="Decrease quantity"><Minus size={12} /></button>
                        <span className="w-8 text-center text-[13px] font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="press-scale w-11 h-11 flex items-center justify-center hover:bg-muted" aria-label="Increase quantity"><Plus size={12} /></button>
                      </div>
                      <button onClick={() => removeItem(item.id, item.size)} className="p-2 transition-colors hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={`Remove ${item.name}`}>
                        <X size={14} style={{ color: "hsl(0 0% 50%)" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t px-5 py-4 space-y-3" style={{ borderColor: "hsl(0 0% 90%)" }}>
              {/* Delivery */}
              <div className="flex items-center gap-2 py-2 px-3 rounded-sm" style={{ backgroundColor: "hsl(142 30% 96%)" }}>
                <Truck size={13} strokeWidth={1.5} style={{ color: "hsl(142 50% 38%)" }} />
                <p className="text-[12px]" style={{ color: "hsl(0 0% 38%)" }}>
                  Estimated delivery: <strong className="font-semibold">3–7 working days</strong>
                </p>
              </div>
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="font-cormorant text-[16px] font-semibold" style={{ color: "hsl(0 0% 25%)" }}>Subtotal</span>
                <span className="font-cormorant text-[18px] font-bold" style={{ color: "hsl(186 35% 28%)" }}>{formatPrice(subtotal)}</span>
              </div>
              {/* CTA */}
              <button
                onClick={checkout}
                disabled={isLoading || isSyncing}
                className="press-scale w-full py-4 text-[13px] font-medium uppercase tracking-[0.1em] flex items-center justify-center gap-2 min-h-[52px] disabled:opacity-70"
                style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 23%)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 28%)")}
              >
                {isLoading || isSyncing ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} strokeWidth={2} />} Secure Checkout
              </button>
              {/* Trust badges */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {["UPI", "VISA", "MC", "RAZORPAY"].map((b) => (
                    <span key={b} className="px-2 py-1 text-[10px] font-bold border rounded tracking-wide" style={{ borderColor: "hsl(0 0% 82%)", color: "hsl(0 0% 45%)" }}>{b}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={11} strokeWidth={1.5} style={{ color: "hsl(0 0% 55%)" }} />
                  <span className="text-[11px]" style={{ color: "hsl(0 0% 55%)" }}>256-bit SSL encrypted · 100% secure</span>
                </div>
              </div>
              <Link to="/shop" onClick={() => setDrawerOpen(false)} className="flex items-center justify-center min-h-[44px] text-center font-cormorant text-[14px] underline underline-offset-4 transition-colors" style={{ color: "hsl(0 0% 45%)" }}>
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
