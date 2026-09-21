import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, Truck, Loader2, Zap } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";
import { CartPromoField } from "@/components/cart/CartExtras";
import { discountedSubtotal, getPromoCode, PROMO_EVENT, resolveCartDiscount } from "@/lib/promo";
import OfferProgress from "@/components/cart/OfferProgress";
import { SHIPPING_CHARGE, addWorkingDays, formatDeliveryDate } from "@/lib/serviceability";
import { Button } from "@/components/ui/button";
import googlePayMark from "@/assets/google-pay-mark.svg";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { shopifyNumericId, trackPixel } from "@/lib/pixel";

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
  const checkoutStarted = useRef(false);
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
    if (!isDrawerOpen) return;
    syncCart();
    /* Re-read the stored code on open. The drawer seeds it once at mount and
       then listens for PROMO_EVENT, so a code written without that event —
       another tab, a restored session — would leave the bag naming a different
       discount from the one the hand-off actually sends. */
    setActivePromoCode(getPromoCode());
  }, [isDrawerOpen, syncCart]);

  const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  /* A dated arrival promise, computed the way a courier counts: working days
     only. Quoting "3–5 working days" makes the shopper do this arithmetic. */
  const arrivesBy = formatDeliveryDate(addWorkingDays(new Date(), 5));

  /* One resolver for the drawer and the checkout hand-off, so the total shown
     here is the total charged. Exactly one discount wins — Fastrr carries a
     single coupon — so this must never render a stacked total it cannot
     deliver. */
  const discount = resolveCartDiscount({ totalItems, promoCode });
  const goodsTotal = discountedSubtotal(subtotal, discount);
  const discountAmount = subtotal - goodsTotal;
  const orderTotal = goodsTotal + SHIPPING_CHARGE;



  const handleCheckout = async () => {
    if (checkoutStarted.current) return;
    checkoutStarted.current = true;

    trackPixel("AddPaymentInfo", {
      currency: items[0]?.currencyCode || "INR",
      value: orderTotal,
      num_items: totalItems,
      content_ids: items.map((item) => shopifyNumericId(item.variantId) ?? item.id),
      content_type: "product",
    });

    try {
      if (user) {
        await supabase.from("member_orders").insert({
          user_id: user.id,
          email: user.email ?? null,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            size: item.size ?? null,
            image: item.image,
            price: item.priceLabel,
          })),
          item_count: totalItems,
          total: orderTotal,
          currency: items[0]?.currencyCode || "INR",
          checkout_url: checkoutUrl,
          status: "checkout_started",
          source: "website",
        });
      }
    } catch {
      /* Account history must never block the payment hand-off. */
    } finally {
      checkout();
      checkoutStarted.current = false;
    }
  };


  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent ref={contentRef} className="inset-y-0 flex h-[100dvh] max-h-[100dvh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[420px]">
        {/* Header */}
        <SheetHeader className="shrink-0 px-4 pb-2.5 pt-[max(12px,env(safe-area-inset-top))] sm:px-5 sm:pb-3 sm:pt-5">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-baseline gap-2 font-cormorant text-[21px] font-semibold text-[var(--nf-text)]">
              Your Bag
              <span className="font-sans text-[11px] font-medium uppercase tracking-[var(--nf-track-16)] text-[color:rgb(var(--nf-ink-rgb)/0.45)]">
                {totalItems === 1 ? "1 piece" : `${totalItems} pieces`}
              </span>
            </SheetTitle>
          </div>
        </SheetHeader>

        <Separator className="shrink-0" />

        {/* The buy-more ladder sits at the top of a filled bag, above the items
            — met on the way in, not discovered next to the total. Hidden on an
            empty bag, where there is nothing to make progress with. */}
        {items.length > 0 && <OfferProgress totalItems={totalItems} />}

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center border border-[color:rgb(var(--nf-gold-rgb)/0.35)] bg-[var(--nf-surface-raised)]">
              <ShoppingBag size={24} strokeWidth={1.3} className="text-[var(--nf-accent-strong)]" />
            </div>
            <p className="mt-5 font-cormorant text-[22px] font-semibold text-[var(--nf-text)]">Your bag is empty</p>
            <p className="mt-2 max-w-[240px] font-cormorant text-[15px] leading-[1.7] text-[color:rgb(var(--nf-ink-rgb)/0.55)]">
              Pieces you choose will gather here, ready when you are.
            </p>
            <Link
              to="/jewellery"
              onClick={() => setDrawerOpen(false)}
              className="mt-7 inline-flex min-h-[48px] items-center bg-[var(--nf-accent-strong)] px-9 text-[12px] font-medium uppercase tracking-[var(--nf-track-16)] text-[var(--nf-text-inverse)] transition-colors duration-200 hover:bg-[var(--nf-accent-quiet)]"
            >
              Continue Shopping
            </Link>
            <Link
              to="/jewellery"
              onClick={() => setDrawerOpen(false)}
              className="mt-4 inline-flex min-h-[44px] items-center px-2 font-cormorant text-[14px] text-[color:rgb(var(--nf-ink-rgb)/0.55)] underline underline-offset-4 transition-colors duration-200"
            >
              View the jewellery
            </Link>
          </div>
        ) : (
          <>
            {/* Scroll region: cart items only — footer CTA always stays visible */}
            <div className="min-h-[88px] flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">

              {/* Lines sit against the summary rather than floating at the top
                  of an empty panel, so a single-item cart reads as one block. */}
              <div className="flex flex-col space-y-2.5 px-4 py-2.5 sm:space-y-4 sm:px-5 sm:py-4">

                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex min-h-[76px] gap-2.5 border-b border-border pb-2.5 last:border-b-0 last:pb-0 sm:min-h-0 sm:gap-3 sm:pb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-[74px] w-[59px] shrink-0 bg-[var(--nf-surface-raised)] object-cover sm:h-[90px] sm:w-[72px]"
                      width={59}
                      height={74}
                      loading="lazy"
                    />
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <p className="line-clamp-1 font-cormorant text-[14px] font-semibold leading-tight text-[var(--nf-text)] sm:line-clamp-2 sm:text-[15px]">{item.name}</p>
                        {lineOptions(item) ? <p className="mt-0.5 truncate text-[10px] text-[color:rgb(var(--nf-ink-rgb)/0.5)] sm:text-[12px]">{lineOptions(item)}</p> : null}
                        <p className="mt-0.5 font-cormorant text-[14px] font-bold text-[var(--nf-text)] sm:mt-1 sm:text-[15px]">{item.priceLabel}</p>
                      </div>
                      <div className="mt-1 flex items-center justify-between sm:mt-2">
                        <div className="inline-flex items-center border border-[color:rgb(var(--nf-ink-rgb)/0.18)]">
                          <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} disabled={isLoading} className="press-scale h-9 w-9" aria-label="Decrease quantity"><Minus size={12} /></Button>
                          <span className="w-7 text-center text-[12px] font-medium sm:w-8 sm:text-[13px]">{item.quantity}</span>
                          <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} disabled={isLoading} className="press-scale h-9 w-9" aria-label="Increase quantity"><Plus size={12} /></Button>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id, item.size)} disabled={isLoading} className="h-11 w-11 text-muted-foreground" aria-label={`Remove ${item.name}`}>
                          <X size={14} className="text-[color:rgb(var(--nf-ink-rgb)/0.5)]" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Footer — always visible above the fold */}
            <div
              className="shrink-0 space-y-1.5 border-t border-[color:rgb(var(--nf-ink-rgb)/0.1)] bg-background px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2.5 sm:space-y-2 sm:px-5 sm:pb-[max(12px,env(safe-area-inset-bottom))] sm:pt-3"
            >
              {/* Delivery — a named date, not a speed. Shoppers buying a gift
                  stall at checkout to work the days out themselves. */}
              <div className="flex min-h-8 items-center gap-2 border border-[color:rgb(var(--nf-gold-rgb)/0.28)] bg-[var(--nf-surface-raised)] px-2.5 py-1.5 sm:px-3 sm:py-2">
                <Truck size={13} strokeWidth={1.5} className="shrink-0 text-[var(--nf-accent-quiet)]" />
                <p className="text-[12px] text-[color:rgb(var(--nf-ink-rgb)/0.7)]">
                  Order today, arrives by <strong className="font-semibold text-[var(--nf-text)]">{arrivesBy}</strong>
                </p>
              </div>

              {/* Promo code */}
              <CartPromoField />

              <div className="space-y-0.5 text-[11px] text-[color:rgb(var(--nf-ink-rgb)/0.6)] sm:space-y-1 sm:text-[12px]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="text-[var(--nf-text)]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Insured shipping</span>
                  <span className="font-medium text-[var(--nf-accent-quiet)]">FREE</span>
                </div>
                {/* The code is named, not just the amount: this is the one the
                    hand-off sends to the checkout, and a shopper who sees a
                    different code on the payment page loses trust in both. */}
                {discountAmount > 0 && discount.code && (
                  <div className="flex items-center justify-between font-medium text-[var(--nf-accent-quiet)]">
                    <span className="tracking-[var(--nf-track-4)]">
                      {discount.code} · {Math.round(discount.rate * 100)}% off
                      {discount.automatic ? " applied" : null}
                    </span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>
              {/* Total — the pre-discount figure stays visible beside it, so
                  what the ladder is worth is read at the moment of paying
                  rather than only at the moment of adding. */}
              <div className="flex items-end justify-between border-t border-[color:rgb(var(--nf-ink-rgb)/0.1)] pt-2 sm:pt-2.5">
                <div>
                  <span className="block text-[9px] font-medium uppercase tracking-[var(--nf-track-10)] text-[color:rgb(var(--nf-ink-rgb)/0.5)]">Total amount</span>
                  {discountAmount > 0 && (
                    <span className="mt-0.5 block text-[10px] font-medium text-[var(--nf-accent-quiet)]">You save {formatPrice(discountAmount)}</span>
                  )}
                </div>
                <span className="flex items-baseline gap-2">
                  {discountAmount > 0 && (
                    <span className="font-cormorant text-[14px] text-[color:rgb(var(--nf-ink-rgb)/0.42)] line-through">
                      {formatPrice(subtotal + SHIPPING_CHARGE)}
                    </span>
                  )}
                  <span className="font-cormorant text-[21px] font-bold leading-none text-[var(--nf-text)] sm:text-[22px]">{formatPrice(orderTotal)}</span>
                </span>
              </div>

              {/* CTA */}
              <Button
                onClick={handleCheckout}
                disabled={isLoading || isSyncing}
                className="mt-2 min-h-[72px] w-full justify-between rounded-[var(--nf-checkout-radius)] border border-[var(--nf-checkout-bg)] bg-[var(--nf-checkout-bg)] px-5 py-3 text-left text-[var(--nf-text-inverse)] shadow-[shadow:var(--nf-checkout-shadow)] transition-[background-color,box-shadow,transform] duration-150 hover:bg-[var(--nf-checkout-bg-hover)] active:translate-y-[3px] active:shadow-[shadow:var(--nf-checkout-shadow-pressed)] sm:min-h-[76px] sm:px-6 sm:py-3.5"
              >
                <span className="flex min-w-0 flex-col items-start gap-1">
                  <span className="flex items-center gap-2 font-sans text-[15px] font-medium tracking-[var(--nf-track-4)] sm:text-[16px]">
                    {isLoading || isSyncing ? <Loader2 size={15} className="animate-spin" /> : null}
                    Proceed To Checkout
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-normal tracking-[var(--nf-track-4)] text-[color:rgb(var(--nf-ivory-rgb)/0.82)] sm:text-[11px]">
                    <Zap size={12} fill="currentColor" aria-hidden="true" />
                    Free insured delivery · COD & prepaid
                  </span>
                </span>
                <span className="flex shrink-0 -space-x-1" aria-label="Paytm, PhonePe and Google Pay accepted">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:rgb(var(--nf-ink-rgb)/0.12)] bg-background text-[7px] font-extrabold tracking-[-0.04em]" aria-label="Paytm">
                    <span className="text-[var(--nf-paytm-navy)]">pay</span><span className="text-[var(--nf-paytm-blue)]">tm</span>
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:rgb(var(--nf-ink-rgb)/0.12)] bg-background text-[15px] font-bold text-[var(--nf-phonepe)]" aria-label="PhonePe">पे</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:rgb(var(--nf-ink-rgb)/0.12)] bg-background" aria-label="Google Pay">
                    <img src={googlePayMark} alt="" className="h-[18px] w-auto" />
                  </span>
                </span>
              </Button>
              <p className="flex min-h-5 w-full items-center justify-center gap-1.5 text-[10px] tracking-[var(--nf-track-4)] text-[color:rgb(var(--nf-ink-rgb)/0.55)] sm:text-[11px]">
                Powered by <strong className="font-semibold text-[var(--nf-text)]">Shiprocket</strong>
              </p>
              <Link to="/jewellery" onClick={() => setDrawerOpen(false)} className="flex min-h-7 items-center justify-center text-center font-cormorant text-[13px] text-[color:rgb(var(--nf-ink-rgb)/0.55)] underline underline-offset-4 transition-colors sm:min-h-[36px] sm:text-[14px]">
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
