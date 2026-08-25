import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, Truck, Lock, Shield, Loader2, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";
import { CartPromoField } from "@/components/cart/CartExtras";
import { joinInnerCircle } from "@/lib/innerCircle";
import { trackPixel } from "@/lib/pixel";
import { supabase } from "@/integrations/supabase/client";
import { getPromoCode, getPromoDiscountRate, PROMO_EVENT } from "@/lib/promo";
import { SHIPPING_CHARGE } from "@/lib/serviceability";

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
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const dismiss = useCallback(() => setDrawerOpen(false), [setDrawerOpen]);
  useSwipeDismiss(contentRef, isDrawerOpen, dismiss);

  // Inner Circle opt-in shown at checkout. Starts unticked: pre-ticked marketing
  // consent is a named dark pattern under the CCPA Dark Patterns Guidelines 2023
  // and isn't valid consent anywhere.
  const [optIn, setOptIn] = useState(false);
  const [optEmail, setOptEmail] = useState("");
  const [promoCode, setActivePromoCode] = useState<string | null>(() => getPromoCode());
  useEffect(() => {
    if (user?.email) setOptEmail(user.email);
  }, [user]);
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

  const discountRate = getPromoDiscountRate(promoCode);
  const discountAmount = Math.round(subtotal * discountRate);
  const orderTotal = subtotal - discountAmount + SHIPPING_CHARGE;

  /* Capture the opt-in email and log the order against the member account,
     then hand over to the Shopify checkout as before. */
  const handleCheckout = async () => {
    /* The shopper is handing over to Shopify's payment step. */
    trackPixel("AddPaymentInfo", { currency: "INR", value: orderTotal, num_items: totalItems });
    try {
      if (optIn && optEmail.trim()) {
        await joinInnerCircle({
          email: optEmail,
          source: "checkout",
          userId: user?.id ?? null,
        });
      }
      if (user) {
        await supabase.from("member_orders").insert({
          user_id: user.id,
          email: user.email ?? optEmail.trim() ?? null,
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            size: i.size ?? null,
            image: i.image,
            price: i.priceLabel,
          })),
          item_count: totalItems,
          total: orderTotal,
        });
      }
    } catch {
      /* never block the checkout on the members-list write */
    }
    checkout();
  };


  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent ref={contentRef} className="w-full sm:max-w-[420px] h-full max-h-[100dvh] flex flex-col p-0 gap-0">
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
            {/* Flat shipping notice */}
            <div className="shrink-0 px-5 py-2.5" style={{ backgroundColor: "hsl(33 30% 97%)" }}>
              <p className="text-[12px] flex items-center gap-1.5" style={{ color: "hsl(0 0% 38%)" }}>
                <Truck size={13} strokeWidth={1.5} />
                Flat shipping of{" "}
                <strong className="font-semibold" style={{ color: "hsl(186 35% 28%)" }}>
                  {formatPrice(SHIPPING_CHARGE)}
                </strong>{" "}
                applies to every order
              </p>
            </div>


            <Separator className="shrink-0" />

            {/* Scroll region: cart items only — footer CTA always stays visible */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">

              <div className="px-5 py-4 space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-[72px] h-[90px] object-cover shrink-0"
                      width={72}
                      height={90}
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <p className="font-cormorant text-[15px] font-semibold truncate" style={{ color: "hsl(0 0% 15%)" }}>{item.name}</p>
                        {lineOptions(item) ? <p className="text-[12px] mt-0.5 truncate" style={{ color: "hsl(0 0% 55%)" }}>{lineOptions(item)}</p> : null}
                        <p className="font-cormorant text-[15px] font-bold mt-1" style={{ color: "hsl(186 35% 28%)" }}>{item.priceLabel}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="inline-flex items-center border" style={{ borderColor: "hsl(0 0% 82%)" }}>
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} disabled={isLoading} className="press-scale w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50" aria-label="Decrease quantity"><Minus size={12} /></button>
                          <span className="w-8 text-center text-[13px] font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} disabled={isLoading} className="press-scale w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50" aria-label="Increase quantity"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeItem(item.id, item.size)} disabled={isLoading} className="p-2 transition-colors hover:bg-muted min-h-[40px] min-w-[40px] flex items-center justify-center disabled:opacity-50" aria-label={`Remove ${item.name}`}>
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
              className="shrink-0 border-t px-5 pt-3 space-y-2.5 pb-[max(12px,env(safe-area-inset-bottom))]"
              style={{ borderColor: "hsl(0 0% 90%)", backgroundColor: "hsl(0 0% 100%)" }}
            >
              {/* Delivery */}
              <div className="flex items-center gap-2 py-1.5 px-3 rounded-sm" style={{ backgroundColor: "hsl(142 30% 96%)" }}>
                <Truck size={13} strokeWidth={1.5} style={{ color: "hsl(142 50% 38%)" }} />
                <p className="text-[12px]" style={{ color: "hsl(0 0% 38%)" }}>
                  Insured delivery in <strong className="font-semibold">3–5 working days</strong>
                </p>
              </div>
              {/* Promo code */}
              <CartPromoField />

              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: "hsl(0 0% 40%)" }}>Subtotal</span>
                <span className="text-[13px] font-medium" style={{ color: "hsl(0 0% 25%)" }}>{formatPrice(subtotal)}</span>
              </div>
              {/* Shipping */}
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: "hsl(0 0% 40%)" }}>Shipping</span>
                <span className="text-[13px] font-medium" style={{ color: "hsl(0 0% 25%)" }}>{formatPrice(SHIPPING_CHARGE)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[13px]" style={{ color: "hsl(142 50% 32%)" }}>
                    {promoCode} ({Math.round(discountRate * 100)}% off)
                  </span>
                  <span className="text-[13px] font-medium" style={{ color: "hsl(142 50% 32%)" }}>−{formatPrice(discountAmount)}</span>
                </div>
              )}
              {/* Total */}
              <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <span className="font-cormorant text-[16px] font-semibold" style={{ color: "hsl(0 0% 25%)" }}>Total</span>
                <span className="font-cormorant text-[18px] font-bold" style={{ color: "hsl(186 35% 28%)" }}>{formatPrice(orderTotal)}</span>
              </div>

              {/* Inner Circle opt-in */}
              <div className="border px-3 py-2.5" style={{ borderColor: "hsl(36 47% 46% / 0.3)", backgroundColor: "hsl(33 41% 96%)" }}>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optIn}
                    onChange={(e) => setOptIn(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 accent-[hsl(186_35%_28%)]"
                  />
                  <span className="text-[12px] leading-[1.5]" style={{ color: "hsl(0 0% 35%)" }}>
                    <Sparkles size={11} className="inline mb-0.5 mr-1" style={{ color: "hsl(36 47% 46%)" }} />
                    Add me to the <strong className="font-semibold">Inner Circle</strong> — first access to new drops and members-only pricing.
                  </span>
                </label>
                {optIn && (
                  <input
                    type="email"
                    value={optEmail}
                    onChange={(e) => setOptEmail(e.target.value)}
                    placeholder="Email address"
                    maxLength={255}
                    className="mt-2 w-full border-b bg-transparent px-1 py-2 text-[12px] outline-none"
                    style={{ borderColor: "hsl(0 0% 80%)", color: "hsl(0 0% 25%)" }}
                  />
                )}
                {!user && (
                  <Link
                    to="/auth"
                    onClick={() => setDrawerOpen(false)}
                    className="mt-1.5 inline-block text-[11px] underline underline-offset-2"
                    style={{ color: "hsl(36 47% 38%)" }}
                  >
                    Create an account to track your orders
                  </Link>
                )}
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
              {/* Trust row */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {["UPI", "COD", "VISA", "MC", "RAZORPAY"].map((b) => (
                  <span key={b} className="px-1.5 py-0.5 text-[9px] font-bold border rounded tracking-wide" style={{ borderColor: "hsl(0 0% 82%)", color: "hsl(0 0% 45%)" }}>{b}</span>
                ))}
                <span className="flex items-center gap-1 text-[10px]" style={{ color: "hsl(0 0% 55%)" }}>
                  <Shield size={10} strokeWidth={1.5} /> Secure checkout
                </span>
              </div>
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
