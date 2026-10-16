import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Minus, Plus } from "lucide-react";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { bagAddOns, familyOf, wornWithNoun } from "@/lib/pairings";
import BagGiftBox from "@/components/giftbox/BagGiftBox";
import ringGold from "@/assets/naira-box-ring-sm.webp";
import ringSilver from "@/assets/naira-box-ring-sm-silver.webp";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";
import { followOut, useBackToClose } from "@/hooks/useBackToClose";
import { CartPromoField } from "@/components/cart/CartExtras";
import LadderBand from "@/components/cart/LadderBand";
import {
  addOnEffect,
  discountedSubtotal,
  getPromoCode,
  isAcceptedPromoCode,
  normalizePromoCode,
  PROMO_EVENT,
  QUANTITY_OFFERS,
  resolveCartDiscount,
} from "@/lib/promo";
import { SHIPPING_CHARGE, deliveryRangeFromNow } from "@/lib/serviceability";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/integrations/supabase/lazy";
import { shopifyNumericId, trackPixel } from "@/lib/pixel";
import { shopifyImage } from "@/lib/shopifyImage";
import { clarityEvent } from "@/lib/clarity";
import { WHATSAPP_NUMBER, type JewelPiece } from "@/data/jewellery";

/*
  The bag, on every page, as the CRO plan of 16 October draws it ("Naira Bag
  CRO Plan"): the deal stays in view, the next piece is one tap away and the
  reasons to trust sit beside the button.

    ‹ Your bag · 1 piece
    A second piece takes 10% off your bag      the ladder, rungs labelled
    the piece, its MRP struck and "₹1,801 off"
    Wears well with your bracelet · one piece, "Adds ₹1,109 · saves ₹390", Add
    [the box] Comes with a Naira gift box     a tap lifts it open
    Have a promo code? · Questions? WhatsApp us
    Total · incl. taxes, one savings line, arrival date
    Checkout · ₹2,399, then payment, returns and plating, and what comes next

  Same cart, discount resolver and checkout hand-off as before: every rupee
  shown, including the add-on's, is the one the checkout charges. CartDrawer.tsx
  is kept so the switch can be undone in one line in App.tsx.
*/

const formatPrice = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const pct = (rate: number) => `${Math.round(rate * 100)}%`;

const lineOptions = (item: { selectedOptions?: Array<{ name: string; value: string }>; size?: string }) => {
  const real = (item.selectedOptions ?? []).filter(
    (o) => o.name.toLowerCase() !== "title" && o.value.toLowerCase() !== "default title",
  );
  if (real.length) return real.map((o) => `${o.name}: ${o.value}`).join(" · ");
  return item.size ? `Size: ${item.size}` : "";
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/* A piece from the catalogue as a cart line. */
const asCartItem = (piece: JewelPiece) => ({
  id: piece.handle,
  variantId: piece.variantId,
  name: piece.name,
  price: piece.price,
  priceLabel: piece.priceLabel,
  currencyCode: "INR",
  image: piece.image,
});

/* The two best-sellers, offered in an empty bag: in 7 of the 16 orders of
   1–15 October each, and kept in deep stock. */
const BEST_SELLERS = ["prism-riviere-bracelet", "woven-gold-hoops"];

/* One small card with an Add: the pair row, and the empty bag's best-sellers. */
const PieceCard = ({ piece, note, onAdd, busy }: { piece: JewelPiece; note?: string; onAdd: () => void; busy: boolean }) => (
  <div data-piece-card={piece.handle} className="flex items-center gap-2.5 border border-nf-gold/20 bg-white px-2 py-1.5">
    <img
      src={shopifyImage(piece.image, 120) || piece.image}
      alt=""
      className="h-[45px] w-[36px] shrink-0 bg-nf-ivory-deep object-cover"
      width={36}
      height={45}
      loading="lazy"
    />
    <div className="min-w-0 flex-1">
      <p className="truncate text-[12.5px] leading-[1.3] text-nf-ink">
        {piece.name} · {piece.priceLabel}
      </p>
      {note && <p className="text-[12px] leading-[1.3] text-nf-ink/75">{note}</p>}
    </div>
    <button
      type="button"
      onClick={onAdd}
      disabled={busy}
      aria-label={`Add ${piece.name} to bag`}
      className="press-scale inline-flex min-h-[32px] shrink-0 items-center justify-center border border-nf-ink px-3 font-nf-label text-[10.5px] font-medium uppercase tracking-nf-16 text-nf-ink transition-colors hover:bg-nf-ink hover:text-nf-ivory disabled:opacity-50"
    >
      {busy ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : "Add"}
    </button>
  </div>
);

/* "Comes with a Naira gift box", with the box itself, small and floating. A
   tap lifts it into a larger view above the row where it opens, the ring rises
   and it shuts again, so the bag never gives it room of its own. The ring is
   silver when the latest piece is silver-toned, gold otherwise. */
const GiftRow = ({ items }: { items: CartItem[] }) => {
  const { jewellery } = useLiveJewellery();
  const [lifted, setLifted] = useState(false);
  const [ringUp, setRingUp] = useState(false);
  const still = prefersReducedMotion();
  const latest = jewellery.find((piece) => piece.handle === items[items.length - 1]?.id);
  const ring = latest && familyOf(latest) === "silver" ? ringSilver : ringGold;
  return (
    <div data-gift-row className="relative flex items-center gap-2 px-4 py-1 sm:px-5">
      <span className={`-my-1 transition-opacity duration-200 ${lifted ? "opacity-0" : ""}`}>
        <BagGiftBox
          size={20}
          ring={ring}
          onTap={
            still
              ? undefined
              : () => {
                  if (lifted) return;
                  setLifted(true);
                  clarityEvent("bag_gift_opened");
                }
          }
        />
      </span>
      <p className="text-[11.5px] text-nf-ink/80">Comes with a Naira gift box</p>
      {lifted && (
        <div
          data-gift-lifted
          className="absolute bottom-[calc(100%-8px)] left-2 z-20 flex flex-col items-center border border-nf-gold/25 bg-nf-ivory px-3 pb-2 shadow-[0_16px_32px_-18px_rgb(var(--nf-ink-rgb)/0.55)] duration-200 animate-in fade-in zoom-in-90 sm:left-3"
          style={{ transformOrigin: "16px 100%" }}
        >
          <BagGiftBox
            size={60}
            ring={ring}
            autoOpen
            onRing={setRingUp}
            onDone={() => {
              setRingUp(false);
              setLifted(false);
            }}
          />
          <p className="-mt-1 font-nf-label text-[9.5px] uppercase tracking-nf-16 text-nf-gold-text" aria-live="polite">
            {ringUp ? "Your piece comes in this box" : "The Naira gift box"}
          </p>
        </div>
      )}
    </div>
  );
};

const CartDrawerNext = () => {
  const {
    items,
    totalItems,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    isDrawerOpen,
    setDrawerOpen,
    checkout,
    checkoutUrl,
    isLoading,
    isSyncing,
    syncCart,
  } = useCart();
  const { jewellery } = useLiveJewellery();
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const checkoutStarted = useRef(false);
  const navigate = useNavigate();
  const { requestClose, closeThen, releaseEntry } = useBackToClose("nfBag", isDrawerOpen, setDrawerOpen);
  useSwipeDismiss(contentRef, isDrawerOpen, requestClose);
  const leave = followOut(closeThen, navigate);

  const [promoCode, setActivePromoCode] = useState<string | null>(() => getPromoCode());
  const [promoOpen, setPromoOpen] = useState(false);
  /* Every tap answered at once: the hand-off can take two network waits. */
  const [opening, setOpening] = useState(false);
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
  const codeAdded = Boolean(promoCode && isAcceptedPromoCode(normalizePromoCode(promoCode)));

  /* The bag in the session recording: opened, and closed with pieces in it. */
  const wasOpen = useRef(false);
  useEffect(() => {
    if (isDrawerOpen && !wasOpen.current) clarityEvent("bag_opened");
    if (!isDrawerOpen && wasOpen.current && items.length) clarityEvent("bag_closed");
    wasOpen.current = isDrawerOpen;
    if (!isDrawerOpen) {
      setPromoOpen(false);
      setOpening(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen]);

  const arrivesBy = deliveryRangeFromNow();
  /* One resolver for the bag and the checkout hand-off: the total shown is the total charged. */
  const discount = resolveCartDiscount({ totalItems, promoCode });
  const rung = discount.automatic ? QUANTITY_OFFERS.find((offer) => offer.code === discount.code) : undefined;
  const goodsTotal = discountedSubtotal(subtotal, discount);
  const discountAmount = subtotal - goodsTotal;
  const orderTotal = goodsTotal + SHIPPING_CHARGE;
  const busy = isLoading || isSyncing;

  /* The deal from the product page, kept in view: each piece's MRP from the
     live catalogue, and one saving against it at the total. */
  const mrpOf = (item: CartItem) => {
    const mrp = jewellery.find((piece) => piece.handle === item.id)?.compareAtPrice;
    return mrp && mrp > item.price ? mrp : null;
  };
  const mrpTotal = items.reduce((sum, item) => sum + (mrpOf(item) ?? item.price) * item.quantity, 0) + SHIPPING_CHARGE;
  const youSave = mrpTotal - orderTotal;

  /* The pair row: one piece that completes the look, with its exact effect. */
  const offer = useMemo(() => bagAddOns(items.map((item) => item.id), totalItems, jewellery), [items, totalItems, jewellery]);
  const offerKey = offer?.pieces.map((piece) => piece.handle).join(",") ?? "";
  const shownFor = useRef("");
  useEffect(() => {
    if (!isDrawerOpen || !offerKey || shownFor.current === offerKey) return;
    shownFor.current = offerKey;
    clarityEvent("bag_pair_shown");
  }, [isDrawerOpen, offerKey]);
  useEffect(() => {
    if (!isDrawerOpen) shownFor.current = "";
  }, [isDrawerOpen]);

  const [adding, setAdding] = useState<string | null>(null);
  const addPiece = async (piece: JewelPiece, event: string) => {
    if (adding) return;
    setAdding(piece.handle);
    try {
      const added = await addItem(asCartItem(piece));
      if (added) clarityEvent(event);
    } finally {
      setAdding(null);
    }
  };

  /* Remove comes with an Undo: "−" at one piece removes it outright. The
     notice is pinned under the band, out of the scrolling list, so a piece
     removed from low in a long bag still shows its Undo. */
  const [removed, setRemoved] = useState<CartItem | null>(null);
  useEffect(() => {
    if (!removed) return;
    const timer = window.setTimeout(() => setRemoved(null), 6000);
    return () => window.clearTimeout(timer);
  }, [removed]);
  const remove = async (item: CartItem) => {
    setRemoved(item);
    await removeItem(item.id, item.size);
  };
  const undo = async () => {
    const item = removed;
    setRemoved(null);
    if (!item) return;
    await addItem(
      {
        id: item.id,
        variantId: item.variantId,
        name: item.name,
        price: item.price,
        priceLabel: item.priceLabel,
        currencyCode: item.currencyCode,
        image: item.image,
        size: item.size,
        variantTitle: item.variantTitle,
        selectedOptions: item.selectedOptions,
      },
      item.quantity,
    );
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello Naira Flore, I have a question about my bag: ${items.map((item) => (item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name)).join(", ")}.`,
  )}`;

  const handleCheckout = async () => {
    if (checkoutStarted.current) return;
    checkoutStarted.current = true;
    setOpening(true);
    clarityEvent("bag_checkout_tapped");
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
      window.setTimeout(() => setOpening(false), 8000);
    }
  };

  const stepper =
    "press-scale relative flex h-8 w-8 items-center justify-center text-nf-ink before:absolute before:-inset-1.5 before:content-[''] disabled:opacity-40";
  const best = BEST_SELLERS.map((handle) => jewellery.find((piece) => piece.handle === handle)).filter(
    (piece): piece is JewelPiece => Boolean(piece && piece.availableForSale !== false && piece.variantId),
  );

  const undoNotice = removed && (
    <div data-undo className="flex shrink-0 items-center justify-between gap-3 border-b border-nf-gold/15 bg-nf-ivory-deep px-4 py-2 text-[12px] text-nf-ink sm:px-5" role="status">
      <span className="truncate">{removed.name} removed</span>
      <button type="button" onClick={undo} className="min-h-[36px] shrink-0 px-1 font-medium text-[var(--nf-cta)] underline underline-offset-4">
        Undo
      </button>
    </div>
  );

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(next) => (next ? setDrawerOpen(true) : requestClose())}>
      <SheetContent
        ref={contentRef}
        closeClassName="hidden sm:flex"
        className="nf-palette inset-y-0 flex h-[100dvh] font-nf-label max-h-[100dvh] w-full flex-col gap-0 overflow-hidden border-l border-nf-gold/15 bg-nf-ivory p-0 text-nf-ink sm:max-w-[420px]"
      >
        <SheetHeader className="shrink-0 border-b border-nf-gold/15 px-4 pb-2.5 pt-[max(12px,env(safe-area-inset-top))] sm:px-5 sm:pt-5">
          <div className="flex items-center">
            <button
              type="button"
              onClick={requestClose}
              aria-label="Back to shopping"
              className="-my-1.5 -ml-3 -mr-1 flex h-11 w-11 shrink-0 items-center justify-center text-nf-ink active:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nf-gold-deep sm:hidden"
            >
              <ChevronLeft size={22} strokeWidth={1.4} aria-hidden="true" />
            </button>
            <SheetTitle className="flex items-baseline gap-2.5 font-nf-editorial text-[20px] font-medium leading-none text-nf-ink">
              Your bag
              {totalItems > 0 && (
                <span className="font-nf-label text-[9.5px] font-medium uppercase tracking-nf-16 text-nf-ink/70">
                  {totalItems === 1 ? "1 piece" : `${totalItems} pieces`}
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {items.length > 0 && <LadderBand totalItems={totalItems} appliedRate={discount.rate} />}
        {undoNotice}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex flex-1 flex-col justify-center px-6 py-8">
              <p className="text-center font-nf-editorial text-[20px] font-medium text-nf-ink">Your bag is empty</p>
              {best.length > 0 && (
                <div className="mt-5">
                  <p className="font-nf-label text-[9.5px] font-medium uppercase tracking-nf-16 text-nf-gold-text">Most loved</p>
                  <div className="mt-2 grid gap-2">
                    {best.map((piece) => (
                      <PieceCard key={piece.handle} piece={piece} busy={adding === piece.handle} onAdd={() => addPiece(piece, "bag_empty_added")} />
                    ))}
                  </div>
                </div>
              )}
              <Link
                to="/jewellery"
                onClick={leave}
                className="mx-auto mt-6 inline-flex min-h-[44px] items-center px-2 font-nf-label text-[11px] font-medium uppercase tracking-nf-16 text-[var(--nf-cta)] underline underline-offset-4"
              >
                Explore jewellery
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex min-h-[96px] flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
              <ul className="flex flex-col">
                {items.map((item) => {
                  const mrp = mrpOf(item);
                  return (
                    <li key={`${item.id}-${item.size}`} data-line={item.id} className="flex gap-3 border-b border-nf-gold/15 px-4 py-3 sm:px-5">
                      <img
                        src={shopifyImage(item.image, 200) || item.image}
                        alt={item.name}
                        className="h-[80px] w-[64px] shrink-0 bg-nf-ivory-deep object-cover"
                        width={64}
                        height={80}
                        loading="lazy"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="line-clamp-2 font-nf-editorial text-[15.5px] font-medium leading-tight text-nf-ink">{item.name}</p>
                        {lineOptions(item) ? <p className="mt-0.5 truncate text-[11px] text-nf-ink/70">{lineOptions(item)}</p> : null}
                        <p data-line-price className="mt-1 text-[13px] text-nf-ink">
                          <span className="font-medium">{item.priceLabel}</span>
                          {mrp && (
                            <>
                              <s className="ml-1.5 text-[12px] text-nf-ink/65">{formatPrice(mrp)}</s>
                              <span className="ml-1.5 text-[11.5px] font-medium text-nf-gold-text">{formatPrice(mrp - item.price)} off</span>
                            </>
                          )}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-1.5">
                          <div className="inline-flex items-center border border-nf-ink/20">
                            <button
                              type="button"
                              onClick={() => (item.quantity <= 1 ? remove(item) : updateQuantity(item.id, item.size, item.quantity - 1))}
                              disabled={isLoading}
                              className={stepper}
                              aria-label={item.quantity <= 1 ? `Remove ${item.name}` : "Decrease quantity"}
                            >
                              <Minus size={13} strokeWidth={1.6} />
                            </button>
                            <span className="w-6 text-center text-[12px] font-medium" aria-label={`Quantity ${item.quantity}`}>
                              {item.quantity}
                            </span>
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
                            onClick={() => remove(item)}
                            disabled={isLoading}
                            aria-label={`Remove ${item.name}`}
                            className="-mr-1 inline-flex min-h-11 items-center px-1 text-[11px] text-nf-ink/70 underline decoration-nf-ink/25 underline-offset-4 hover:text-nf-ink disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {offer && (
                <section data-pair className="border-b border-nf-gold/15 px-4 pb-3 pt-2.5 sm:px-5" aria-label="Wears well with your piece">
                  <p className="font-nf-label text-[9.5px] font-medium uppercase tracking-nf-16 text-nf-gold-text">
                    Wears well with your {wornWithNoun(offer.anchor)}
                  </p>
                  <div className="mt-2 grid gap-2">
                    {offer.pieces.map((piece) => {
                      const effect = addOnEffect({ subtotal, totalItems, promoCode }, piece.price);
                      return (
                        <PieceCard
                          key={piece.handle}
                          piece={piece}
                          busy={adding === piece.handle}
                          note={effect.saves > 0 ? `Adds ${formatPrice(effect.adds)} · saves ${formatPrice(effect.saves)}` : `Adds ${formatPrice(effect.adds)}`}
                          onAdd={() => addPiece(piece, "bag_pair_added")}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              <GiftRow items={items} />

              <div className="px-4 pb-2 sm:px-5">
                {!codeAdded && !promoOpen && (
                  <p className="flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-nf-ink/75">
                    <button
                      type="button"
                      onClick={() => {
                        setPromoOpen(true);
                        clarityEvent("bag_promo_opened");
                      }}
                      className="min-h-[32px] underline decoration-nf-ink/30 underline-offset-4 hover:text-nf-ink"
                    >
                      Have a promo code?
                    </button>
                    <span aria-hidden="true">·</span>
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="min-h-[32px] leading-[32px] underline decoration-nf-ink/30 underline-offset-4 hover:text-nf-ink">
                      Questions? WhatsApp us
                    </a>
                  </p>
                )}
                {(codeAdded || promoOpen) && (
                  <div className="pt-1">
                    <CartPromoField inUse={!discount.automatic} startOpen={promoOpen} />
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-[32px] items-center text-[11.5px] text-nf-ink/75 underline decoration-nf-ink/30 underline-offset-4">
                      Questions? WhatsApp us
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div data-bag-foot className="shrink-0 space-y-1.5 border-t border-nf-gold/15 bg-nf-ivory px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 sm:px-5 sm:pb-[max(14px,env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between">
                <span className="font-nf-label text-[9.5px] font-medium uppercase tracking-nf-16 text-nf-ink/75">Total · incl. taxes</span>
                <span className="flex items-baseline gap-1.5">
                  {youSave > 0 && <s data-mrp-total className="font-nf-editorial text-[14px] text-nf-ink/65">{formatPrice(mrpTotal)}</s>}
                  <span data-total className="font-nf-editorial text-[21px] font-medium leading-none text-nf-ink">{formatPrice(orderTotal)}</span>
                </span>
              </div>
              <div className="text-[11px] leading-[1.45]">
                {/* One saving, against MRP and the ladder together, never two
                    percentages added up. The discount is named for what it is,
                    never by its code. */}
                {youSave > 0 && (
                  <p data-you-save className="font-medium text-nf-gold-text">
                    You save {formatPrice(youSave)}
                    {mrpTotal > subtotal + SHIPPING_CHARGE ? " against MRP" : ""}
                    {discountAmount > 0 ? ` · includes ${pct(discount.rate)} ${rung ? `for ${rung.minQuantity} pieces` : "with your code"}` : ""}
                  </p>
                )}
                <p className="text-nf-ink/70">
                  Free insured shipping · arrives <span className="text-nf-ink/85">{arrivesBy}</span>
                </p>
              </div>

              <button
                type="button"
                data-checkout
                onClick={handleCheckout}
                disabled={busy || opening}
                className="press-scale flex h-[48px] w-full items-center justify-center gap-2 bg-[var(--nf-cta)] font-nf-label text-[11.5px] font-medium uppercase tracking-nf-16 text-nf-ivory transition-colors duration-150 hover:bg-[var(--nf-cta-hover)] disabled:opacity-80"
              >
                {busy || opening ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : null}
                {opening ? "Opening secure checkout…" : `Checkout · ${formatPrice(orderTotal)}`}
              </button>
              <ul data-trust className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[10.5px] text-nf-ink/75">
                {["UPI, cards or cash on delivery", "7-day returns", "2-year plating assurance"].map((line) => (
                  <li key={line} className="whitespace-nowrap">
                    <span aria-hidden="true" className="mr-1 font-semibold text-[var(--nf-cta)]">
                      ✓
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <p className="text-center text-[10.5px] text-nf-ink/70">Next: a quick OTP, then address and payment</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawerNext;
