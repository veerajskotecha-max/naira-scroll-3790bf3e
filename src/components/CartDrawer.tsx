import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, Truck, Lock, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";
import { CartPromoField } from "@/components/cart/CartExtras";
import { discountedSubtotal, getPromoCode, PROMO_EVENT, resolveCartDiscount } from "@/lib/promo";
import OfferProgress from "@/components/cart/OfferProgress";
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



  const handleCheckout = () => checkout();


  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent ref={contentRef} className="bottom-0 top-auto flex h-auto max-h-[92dvh] w-full flex-col gap-0 p-0 sm:inset-y-0 sm:h-full sm:max-h-[100dvh] sm:max-w-[420px]">
        {/* Header */}
        <SheetHeader className="shrink-0 px-5 pt-5 pb-3">
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
              to="/shop"
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
            <div className="max-h-[34dvh] min-h-0 overflow-y-auto overscroll-contain sm:flex-1 sm:max-h-none">

              {/* Lines sit against the summary rather than floating at the top
                  of an empty panel, so a single-item cart reads as one block. */}
              <div className="flex flex-col px-5 py-4 space-y-4">

                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-[90px] w-[72px] shrink-0 bg-[var(--nf-surface-raised)] object-cover"
                      width={72}
                      height={90}
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <p className="line-clamp-2 font-cormorant text-[15px] font-semibold leading-tight text-[var(--nf-text)]">{item.name}</p>
                        {lineOptions(item) ? <p className="mt-0.5 truncate text-[12px] text-[color:rgb(var(--nf-ink-rgb)/0.5)]">{lineOptions(item)}</p> : null}
                        <p className="mt-1 font-cormorant text-[15px] font-bold text-[var(--nf-text)]">{item.priceLabel}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="inline-flex items-center border border-[color:rgb(var(--nf-ink-rgb)/0.18)]">
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} disabled={isLoading} className="press-scale w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50" aria-label="Decrease quantity"><Minus size={12} /></button>
                          <span className="w-8 text-center text-[13px] font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} disabled={isLoading} className="press-scale w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50" aria-label="Increase quantity"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeItem(item.id, item.size)} disabled={isLoading} className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50" aria-label={`Remove ${item.name}`}>
                          <X size={14} className="text-[color:rgb(var(--nf-ink-rgb)/0.5)]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Footer — always visible above the fold */}
            <div
              className="shrink-0 space-y-2 border-t border-[color:rgb(var(--nf-ink-rgb)/0.1)] bg-white px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]"
            >
              {/* Delivery — a named date, not a speed. Shoppers buying a gift
                  stall at checkout to work the days out themselves. */}
              <div className="flex items-center gap-2 border border-[color:rgb(var(--nf-gold-rgb)/0.28)] bg-[var(--nf-surface-raised)] px-3 py-2">
                <Truck size={13} strokeWidth={1.5} className="shrink-0 text-[var(--nf-accent-quiet)]" />
                <p className="text-[12px] text-[color:rgb(var(--nf-ink-rgb)/0.7)]">
                  Order today, arrives by <strong className="font-semibold text-[var(--nf-text)]">{arrivesBy}</strong>
                </p>
              </div>

              {/* Promo code */}
              <CartPromoField />

              <div className="space-y-1 text-[12px] text-[color:rgb(var(--nf-ink-rgb)/0.6)]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="text-[var(--nf-text)]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Insured shipping</span>
                  <span className="text-[var(--nf-text)]">{formatPrice(SHIPPING_CHARGE)}</span>
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
              <div className="flex items-baseline justify-between border-t border-[color:rgb(var(--nf-ink-rgb)/0.1)] pt-1.5">
                <span className="font-cormorant text-[16px] font-semibold text-[var(--nf-text)]">Total</span>
                <span className="flex items-baseline gap-2">
                  {discountAmount > 0 && (
                    <span className="font-cormorant text-[14px] text-[color:rgb(var(--nf-ink-rgb)/0.42)] line-through">
                      {formatPrice(subtotal + SHIPPING_CHARGE)}
                    </span>
                  )}
                  <span className="font-cormorant text-[19px] font-bold text-[var(--nf-text)]">{formatPrice(orderTotal)}</span>
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={handleCheckout}

                disabled={isLoading || isSyncing}
                className="press-scale flex min-h-[52px] w-full items-center justify-center gap-2 bg-[var(--nf-accent-strong)] py-3.5 text-[13px] font-medium uppercase tracking-[var(--nf-track-10)] text-[var(--nf-text-inverse)] transition-colors duration-200 hover:bg-[var(--nf-accent-quiet)] disabled:opacity-70"
              >
                {isLoading || isSyncing ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} strokeWidth={2} />} Secure Checkout
              </button>
              <CheckoutBenefit className="flex w-full" />
              <Link to="/shop" onClick={() => setDrawerOpen(false)} className="flex min-h-[36px] items-center justify-center text-center font-cormorant text-[14px] text-[color:rgb(var(--nf-ink-rgb)/0.55)] underline underline-offset-4 transition-colors">
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
