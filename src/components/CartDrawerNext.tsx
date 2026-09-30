import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { bagPairings } from "@/lib/pairings";
import { QUANTITY_OFFERS } from "@/lib/promo";
import { isPreviewPath, previewProductPath } from "@/lib/preview";
import type { JewelPiece } from "@/data/jewellery";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";
import { followOut, useBackToClose } from "@/hooks/useBackToClose";
import { CartPromoField } from "@/components/cart/CartExtras";
import OfferProgress from "@/components/cart/OfferProgress";
import { discountedSubtotal, getPromoCode, PROMO_EVENT, resolveCartDiscount } from "@/lib/promo";
import { SHIPPING_CHARGE, deliveryRangeFromNow } from "@/lib/serviceability";
import googlePayMark from "@/assets/google-pay-mark.svg";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/integrations/supabase/lazy";
import { shopifyNumericId, trackPixel } from "@/lib/pixel";
import { shopifyImage } from "@/lib/shopifyImage";

/*
  The bag for the redesigned product page (shown on /preview/ pages only).

  Same cart, discount resolver and checkout hand-off as CartDrawer.tsx. What
  goes: the second "Free insured shipping" (it is in the arrival line), the
  facts packed inside the checkout button, "Powered by Shiprocket" and the
  "Continue shopping" link (the back arrow is that). The ground is Naira's
  ivory rather than white, and Checkout is the deep-sage button with the total
  on it; the UPI marks sit under it instead of inside it.
*/

const lineOptions = (item: { selectedOptions?: Array<{ name: string; value: string }>; size?: string }) => {
  const real = (item.selectedOptions ?? []).filter(
    (o) => o.name.toLowerCase() !== "title" && o.value.toLowerCase() !== "default title",
  );
  if (real.length) return real.map((o) => `${o.name}: ${o.value}`).join(" · ");
  return item.size ? `Size: ${item.size}` : "";
};

const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const PayMarks = () => (
  <span className="flex -space-x-1" aria-label="Paytm, PhonePe and Google Pay accepted">
    <span className="flex h-6 w-6 items-center justify-center border border-nf-ink/10 bg-white text-[5.5px] font-extrabold tracking-[-0.04em]" aria-label="Paytm">
      <span className="text-[var(--nf-paytm-navy)]">pay</span>
      <span className="text-[var(--nf-paytm-blue)]">tm</span>
    </span>
    <span className="flex h-6 w-6 items-center justify-center border border-nf-ink/10 bg-white text-[12px] font-bold text-[var(--nf-phonepe)]" aria-label="PhonePe">
      पे
    </span>
    <span className="flex h-6 w-6 items-center justify-center border border-nf-ink/10 bg-white" aria-label="Google Pay">
      <img src={googlePayMark} alt="" className="h-[15px] w-auto" />
    </span>
  </span>
);

/* "Add one more": two pieces that complete the look of what is in the bag,
   while a rung of the ladder is still ahead. Adding one moves the bar and
   the total at once; the bag stays open. */
const BagPairings = ({
  inBag,
  totalItems,
  onPick,
}: {
  inBag: string[];
  totalItems: number;
  /* Closes the bag on the way to the piece's page. */
  onPick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) => {
  const { jewellery } = useLiveJewellery();
  const { addItem, isLoading } = useCart();
  const [adding, setAdding] = useState<string | null>(null);
  const picks = useMemo(() => bagPairings(inBag, jewellery, 2), [inBag.join(","), jewellery]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = QUANTITY_OFFERS.find((offer) => totalItems < offer.minQuantity);
  if (!next || picks.length === 0) return null;
  const hrefFor = (h: string) => (isPreviewPath(window.location.pathname) ? previewProductPath(h) : `/jewellery/${h}`);
  const add = async (piece: JewelPiece) => {
    setAdding(piece.handle);
    try {
      await addItem({
        id: piece.handle,
        variantId: piece.variantId,
        name: piece.name,
        price: piece.price,
        priceLabel: piece.priceLabel,
        currencyCode: "INR",
        image: piece.image,
        size: piece.category === "Rings" ? "US 6" : undefined,
      });
    } finally {
      setAdding(null);
    }
  };
  const away = next.minQuantity - totalItems;
  return (
    <section className="mx-4 mb-4 border-t border-nf-gold/25 pt-4 sm:mx-5" aria-labelledby="bag-pairings">
      <p id="bag-pairings" className="font-nf-label text-[10.5px] uppercase tracking-nf-16 text-nf-gold-text">
        Add {away === 1 ? "one more" : `${away} more`} · save {Math.round(next.rate * 100)}%
      </p>
      <ul className="mt-2">
        {picks.map((piece) => (
          <li key={piece.handle} className="flex items-center gap-3 py-2">
            <Link to={hrefFor(piece.handle)} onClick={onPick} className="block h-14 w-14 shrink-0 overflow-hidden bg-nf-ivory-deep">
              <img src={shopifyImage(piece.image, 160)} alt={piece.name} className="h-full w-full object-cover" loading="lazy" width={56} height={56} />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate font-cormorant text-[15px] font-semibold leading-tight text-nf-ink">{piece.name}</p>
              <p className="mt-0.5 text-[12.5px] text-nf-ink/75">{piece.priceLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => add(piece)}
              disabled={isLoading || adding !== null}
              aria-label={`Add ${piece.name} to bag`}
              className="press-scale h-9 shrink-0 bg-[var(--nf-cta)] px-4 font-nf-label text-[10.5px] uppercase tracking-nf-16 text-nf-ivory transition-colors hover:bg-[var(--nf-cta-hover)] disabled:opacity-60"
            >
              {adding === piece.handle ? "Adding…" : "Add"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

const CartDrawerNext = () => {
  const { items, totalItems, subtotal, updateQuantity, removeItem, isDrawerOpen, setDrawerOpen, checkout, checkoutUrl, isLoading, isSyncing, syncCart } =
    useCart();
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const checkoutStarted = useRef(false);
  const navigate = useNavigate();
  const { requestClose, closeThen, releaseEntry } = useBackToClose("nfBag", isDrawerOpen, setDrawerOpen);
  useSwipeDismiss(contentRef, isDrawerOpen, requestClose);
  const leave = followOut(closeThen, navigate);

  const [promoCode, setActivePromoCode] = useState<string | null>(() => getPromoCode());
  useEffect(() => {
    const syncPromo = () => setActivePromoCode(getPromoCode());
    window.addEventListener(PROMO_EVENT, syncPromo);
    return () => window.removeEventListener(PROMO_EVENT, syncPromo);
  }, []);
  useEffect(() => {
    if (!isDrawerOpen) return;
    syncCart();
    setActivePromoCode(getPromoCode());
  }, [isDrawerOpen, syncCart]);

  const arrivesBy = deliveryRangeFromNow();
  /* One resolver for the bag and the checkout hand-off: the total shown is the total charged. */
  const discount = resolveCartDiscount({ totalItems, promoCode });
  const goodsTotal = discountedSubtotal(subtotal, discount);
  const discountAmount = subtotal - goodsTotal;
  const orderTotal = goodsTotal + SHIPPING_CHARGE;
  const busy = isLoading || isSyncing;

  const handleCheckout = async () => {
    if (checkoutStarted.current) return;
    checkoutStarted.current = true;
    await releaseEntry();
    trackPixel("AddPaymentInfo", {
      currency: items[0]?.currencyCode || "INR",
      value: orderTotal,
      num_items: totalItems,
      content_ids: items.map((item) => shopifyNumericId(item.variantId) ?? item.id),
      content_type: "product",
    });
    try {
      if (user) {
        const supabase = await getSupabase();
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

  const stepper = "press-scale flex h-9 w-9 items-center justify-center text-nf-ink disabled:opacity-40";

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(next) => (next ? setDrawerOpen(true) : requestClose())}>
      <SheetContent
        ref={contentRef}
        closeClassName="hidden sm:flex"
        className="inset-y-0 flex h-[100dvh] max-h-[100dvh] w-full flex-col gap-0 overflow-hidden border-l border-nf-gold/25 bg-nf-ivory p-0 text-nf-ink sm:max-w-[420px]"
      >
        <SheetHeader className="shrink-0 border-b border-nf-gold/25 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-5 sm:pt-5">
          <div className="flex items-center">
            <button
              type="button"
              onClick={requestClose}
              aria-label="Back to shopping"
              className="-my-1.5 -ml-3 -mr-1 flex h-11 w-11 shrink-0 items-center justify-center text-nf-ink active:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nf-gold-deep sm:hidden"
            >
              <ChevronLeft size={22} strokeWidth={1.4} aria-hidden="true" />
            </button>
            <SheetTitle className="flex items-baseline gap-2.5 font-cormorant text-[22px] font-semibold text-nf-ink">
              Your bag
              <span className="font-nf-label text-[10.5px] font-medium uppercase tracking-nf-16 text-nf-ink/70">
                {totalItems === 1 ? "1 piece" : `${totalItems} pieces`}
              </span>
            </SheetTitle>
          </div>
        </SheetHeader>

        {items.length > 0 && <OfferProgress totalItems={totalItems} />}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag size={28} strokeWidth={1.2} className="text-nf-gold-deep" aria-hidden="true" />
            <p className="mt-4 font-cormorant text-[22px] font-semibold text-nf-ink">Your bag is empty</p>
            <p className="mt-2 max-w-[240px] font-nf-editorial text-[16px] leading-[1.6] text-nf-ink/75">
              Pieces you choose will gather here, ready when you are.
            </p>
            <Link
              to="/jewellery"
              onClick={leave}
              className="mt-7 inline-flex min-h-[48px] items-center bg-[var(--nf-cta)] px-9 font-nf-label text-[12px] font-medium uppercase tracking-nf-16 text-nf-ivory transition-colors hover:bg-[var(--nf-cta-hover)]"
            >
              Explore jewellery
            </Link>
          </div>
        ) : (
          <>
            <div className="min-h-[96px] flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
              <ul className="flex flex-col px-4 sm:px-5">
                {items.map((item) => (
                  <li key={`${item.id}-${item.size}`} className="flex gap-3 border-b border-nf-gold/20 py-3.5 last:border-b-0">
                    <img
                      src={shopifyImage(item.image, 200) || item.image}
                      alt={item.name}
                      className="h-[90px] w-[72px] shrink-0 bg-nf-ivory-deep object-cover"
                      width={72}
                      height={90}
                      loading="lazy"
                    />
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <p className="line-clamp-2 font-cormorant text-[16px] font-semibold leading-tight text-nf-ink">{item.name}</p>
                        {lineOptions(item) ? <p className="mt-0.5 truncate text-[11.5px] text-nf-ink/70">{lineOptions(item)}</p> : null}
                        <p className="mt-1 text-[13.5px] font-medium text-nf-ink">{item.priceLabel}</p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center border border-nf-ink/20">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            disabled={isLoading}
                            className={stepper}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} strokeWidth={1.6} />
                          </button>
                          <span className="w-7 text-center text-[13px] font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            disabled={isLoading}
                            className={stepper}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} strokeWidth={1.6} />
                          </button>
                        </div>
                        {/* A word, not a cross: a cross here reads as "close". */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.size)}
                          disabled={isLoading}
                          aria-label={`Remove ${item.name}`}
                          className="-mr-1 inline-flex min-h-11 items-center px-1 text-[12px] text-nf-ink/70 underline decoration-nf-ink/25 underline-offset-4 hover:text-nf-ink disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <BagPairings inBag={items.map((item) => item.id)} totalItems={totalItems} onPick={leave} />
            </div>

            <div className="shrink-0 space-y-2.5 border-t border-nf-gold/25 bg-nf-ivory px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pb-[max(14px,env(safe-area-inset-bottom))]">
              <p className="flex items-center gap-2 text-[12.5px] text-nf-ink/75">
                <Truck size={14} strokeWidth={1.5} className="shrink-0 text-nf-gold-deep" aria-hidden="true" />
                <span>
                  Arrives by <strong className="font-semibold text-nf-ink">{arrivesBy}</strong> · free insured shipping · gift‑boxed
                </span>
              </p>

              <CartPromoField />

              <div className="space-y-1 text-[12.5px] text-nf-ink/75">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="text-nf-ink">{formatPrice(subtotal)}</span>
                </div>
                {/* The code is named: it is the one the checkout receives. */}
                {discountAmount > 0 && discount.code && (
                  <div className="flex items-center justify-between font-medium text-nf-gold-text">
                    <span className="tracking-nf-4">
                      {discount.code} · {Math.round(discount.rate * 100)}% off{discount.automatic ? " applied" : null}
                    </span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-nf-gold-text">Free</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between border-t border-nf-gold/20 pt-2.5">
                <span className="font-nf-label text-[10.5px] font-medium uppercase tracking-nf-16 text-nf-ink/75">
                  Total
                  {discountAmount > 0 && <span className="ml-2 normal-case tracking-nf-4 text-nf-gold-text">you save {formatPrice(discountAmount)}</span>}
                </span>
                <span className="flex items-baseline gap-2">
                  {discountAmount > 0 && (
                    <span className="font-cormorant text-[14px] text-nf-ink/65 line-through">{formatPrice(subtotal + SHIPPING_CHARGE)}</span>
                  )}
                  <span className="font-cormorant text-[23px] font-bold leading-none text-nf-ink">{formatPrice(orderTotal)}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={busy}
                className="press-scale flex h-[54px] w-full items-center justify-center gap-2 bg-[var(--nf-cta)] font-nf-label text-[13px] font-medium uppercase tracking-nf-16 text-nf-ivory transition-colors duration-150 hover:bg-[var(--nf-cta-hover)] disabled:opacity-70"
              >
                {busy ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : null}
                Checkout · {formatPrice(orderTotal)}
              </button>
              <p className="flex items-center justify-center gap-2 pb-0.5 text-[11.5px] text-nf-ink/75">
                <PayMarks />
                UPI, cards or cash on delivery
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawerNext;
