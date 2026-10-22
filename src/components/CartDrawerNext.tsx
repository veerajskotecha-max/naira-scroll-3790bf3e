import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Minus, Plus, X } from "lucide-react";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { cartLineFor, variantById, variantLabel } from "@/lib/variants";
import { cardCover } from "@/lib/cardCover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";
import { followOut, useBackToClose } from "@/hooks/useBackToClose";
import {
  discountedSubtotal,
  getPromoCode,
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
import { WHATSAPP_NUMBER, type JewelPiece, type JewelVariant } from "@/data/jewellery";

/*
  The bag, on every page, as the CRO plan of 16 October draws it ("Naira Bag
  CRO Plan"): the deal stays in view, the next piece is one tap away and the
  reasons to trust sit beside the button.

    ‹ Your bag · 1 piece
    A second piece takes 10% off your bag      the ladder, rungs labelled
    the piece, its MRP struck and "₹1,801 off"
    Wears well with your bracelet · one piece, "Adds ₹1,109 · saves ₹390", Add
    [the box] Comes with a Naira gift box     a tap lifts it open
    Total · incl. taxes, one savings line, arrival date
    Checkout · ₹2,399, then payment, returns and plating, and what comes next

  Same cart, discount resolver and checkout hand-off as before: every rupee
  shown, including the add-on's, is the one the checkout charges. CartDrawer.tsx
  is kept so the switch can be undone in one line in App.tsx.
*/

const formatPrice = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const pct = (rate: number) => `${Math.round(rate * 100)}%`;

/* "Metal: Silver · Size: 7": the line's choices, and a ring size noted beside
   them (Star Point Band is sold in gold and silver, sized from the list). */
const lineOptions = (item: { selectedOptions?: Array<{ name: string; value: string }>; size?: string }) =>
  [
    ...(item.selectedOptions ?? [])
      .filter((o) => o.name.toLowerCase() !== "title" && o.value.toLowerCase() !== "default title")
      .map((o) => `${o.name}: ${o.value}`),
    ...(item.size ? [`Size: ${item.size}`] : []),
  ].join(" · ");

/* The two best-sellers, offered in an empty bag: in 7 of the 16 orders of
   1–15 October each, and kept in deep stock. */
const BEST_SELLERS = ["prism-riviere-bracelet", "woven-gold-hoops"];

type Follow = ReturnType<typeof followOut>;

/* One small card with an Add: the pair row, and the empty bag's best-sellers.
   The photo and name open the piece's page, so it can be seen before it is
   added; the bag closes on the way out and the phone's back returns. */
const PieceCard = ({
  piece,
  variant,
  note,
  onAdd,
  busy,
  follow,
}: {
  piece: JewelPiece;
  /** The metal or stone it adds in, when it is sold in more than one. */
  variant?: JewelVariant;
  note?: string;
  onAdd: () => void;
  busy: boolean;
  follow: Follow;
}) => (
  <div data-piece-card={piece.handle} data-variant={variant ? variantLabel(variant) : undefined} className="flex items-center gap-2.5 border border-nf-gold/20 bg-[var(--nf-surface)] px-2 py-1.5">
    <Link to={`/jewellery/${piece.handle}`} onClick={follow} tabIndex={-1} aria-hidden="true" className="shrink-0">
      <img
        src={shopifyImage(variant?.image ?? cardCover(piece), 120) || variant?.image || cardCover(piece)}
        alt=""
        className="h-[45px] w-[36px] bg-nf-ivory-deep object-cover"
        width={36}
        height={45}
        loading="lazy"
      />
    </Link>
    <div className="min-w-0 flex-1">
      <p className="truncate text-[12.5px] leading-[1.3] text-nf-ink">
        <Link to={`/jewellery/${piece.handle}`} onClick={follow} className="underline-offset-4 hover:underline">
          {piece.name}
        </Link>{" "}
        {variant ? `· ${variantLabel(variant)} · ₹${variant.price.toLocaleString("en-IN")}` : `· ${piece.priceLabel}`}
      </p>
      {note && <p className="text-[12px] leading-[1.3] text-nf-ink/75">{note}</p>}
    </div>
    <button
      type="button"
      onClick={onAdd}
      disabled={busy}
      aria-label={`Add ${piece.name}${variant ? ` in ${variantLabel(variant)}` : ""} to bag`}
      className="press-scale inline-flex min-h-[44px] min-w-[52px] shrink-0 items-center justify-center border border-nf-ink px-3 font-nf-label text-[10.5px] font-medium uppercase tracking-nf-16 text-nf-ink transition-colors hover:bg-nf-ink hover:text-nf-ivory disabled:opacity-50"
    >
      {busy ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : "Add"}
    </button>
  </div>
);

/* Project Shades' ladder: a thin track, an open ring at each rung that fills
   once reached, and the offer spelt out under it. */
export const SimpleLadder = ({ totalItems }: { totalItems: number }) => {
  const top = QUANTITY_OFFERS[QUANTITY_OFFERS.length - 1].minQuantity;
  const fill = Math.min(totalItems, top) / top;
  return (
    <div data-ladder className="shrink-0 bg-[var(--nf-surface)] px-5 pb-4 pt-5">
      {/* The explanation rides on top, where the eye lands first: the saving,
          that it runs today, and the urgency of the small-run stock — kept
          small so it never crowds the bag. */}
      <p className="whitespace-nowrap pb-2 text-center font-nf-label text-[8.5px] font-medium uppercase tracking-nf-16 text-nf-ink/60">
        ✦ Up to 20% off today · limited pieces
      </p>
      <div className="relative mx-3 h-[3px] bg-nf-ink/25" role="progressbar" aria-valuemin={0} aria-valuemax={top} aria-valuenow={Math.min(totalItems, top)} aria-label={`${totalItems} of ${top} pieces`}>
        <span className="block h-full bg-nf-ink transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${fill * 100}%` }} />
        {QUANTITY_OFFERS.map((o) => (
          <span
            key={o.code}
            aria-hidden="true"
            className={`absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-300 ${totalItems >= o.minQuantity ? "border-nf-ink bg-nf-ink" : "border-nf-ink/40 bg-[var(--nf-surface)]"}`}
            style={{ left: `${(o.minQuantity / top) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-5 flex justify-around text-[12.5px] text-nf-ink">
        {QUANTITY_OFFERS.map((o) => (
          <span key={o.code} className={totalItems >= o.minQuantity ? "font-medium" : "text-nf-ink/75"}>
            Buy {o.minQuantity} get {pct(o.rate)} off
          </span>
        ))}
      </div>
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
  const { jewellery } = useLiveJewellery(isDrawerOpen);
  const catalogueByHandle = useMemo(() => new Map(jewellery.map((piece) => [piece.handle, piece])), [jewellery]);
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const checkoutStarted = useRef(false);
  const navigate = useNavigate();
  const { requestClose, closeThen, releaseEntry } = useBackToClose("nfBag", isDrawerOpen, setDrawerOpen);
  useSwipeDismiss(contentRef, isDrawerOpen, requestClose);
  const leave = followOut(closeThen, navigate);
  /* A line's own page: jewellery at /jewellery/, anything else at /products/,
     which sends jewellery on and keeps apparel where it is. */
  const pageOf = (item: CartItem) => (catalogueByHandle.has(item.id) ? `/jewellery/${item.id}` : `/products/${item.id}`);

  const [promoCode, setActivePromoCode] = useState<string | null>(() => getPromoCode());
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

  /* The bag in the session recording: opened, and closed with pieces in it. */
  const wasOpen = useRef(false);
  useEffect(() => {
    if (isDrawerOpen && !wasOpen.current) clarityEvent("bag_opened");
    if (!isDrawerOpen && wasOpen.current && items.length) clarityEvent("bag_closed");
    wasOpen.current = isDrawerOpen;
    if (!isDrawerOpen) {
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
    const piece = catalogueByHandle.get(item.id);
    const mrp = (variantById(piece, item.variantId) ?? piece)?.compareAtPrice;
    return mrp && mrp > item.price ? mrp : null;
  };
  const mrpTotal = items.reduce((sum, item) => sum + (mrpOf(item) ?? item.price) * item.quantity, 0) + SHIPPING_CHARGE;
  const youSave = mrpTotal - orderTotal;

  const [adding, setAdding] = useState<string | null>(null);
  const addPiece = async (piece: JewelPiece, event: string, variant?: JewelVariant) => {
    if (adding) return;
    setAdding(piece.handle);
    try {
      const added = await addItem(cartLineFor(piece, variant));
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
    await removeItem(item.id, item.size, item.variantId);
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
  const best = BEST_SELLERS.map((handle) => catalogueByHandle.get(handle)).filter(
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
        className="nf-palette inset-y-0 flex h-[100dvh] font-nf-label max-h-[100dvh] w-full flex-col gap-0 overflow-hidden border-l border-nf-ink/20 bg-[var(--nf-surface)] p-0 text-nf-ink sm:max-w-[420px]"
      >
        <SheetHeader className="shrink-0 border-b border-nf-ink/20 px-4 pb-2.5 pt-[max(12px,env(safe-area-inset-top))] sm:px-5 sm:pt-5">
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

        {items.length > 0 && <SimpleLadder totalItems={totalItems} />}
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
                      <PieceCard key={piece.handle} piece={piece} busy={adding === piece.handle} follow={leave} onAdd={() => addPiece(piece, "bag_empty_added")} />
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
            <div className="flex min-h-[96px] flex-1 flex-col overflow-y-auto overscroll-contain bg-[var(--nf-surface)]">
              <ul className="flex flex-col">
                {items.map((item, index) => (
                  <li key={`${item.id}-${item.size}-${item.variantId}`} data-line={item.id} data-variant={item.variantId} className="flex gap-4 px-5 py-5">
                    <Link to={pageOf(item)} onClick={leave} tabIndex={-1} aria-hidden="true" className="shrink-0">
                      <img
                        src={shopifyImage(item.image, 200) || item.image}
                        alt={item.name}
                        className="h-[90px] w-[72px] bg-nf-ivory-deep object-cover"
                        width={72}
                        height={90}
                        loading={index < 2 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          to={pageOf(item)}
                          onClick={leave}
                          data-line-name
                          className="line-clamp-2 text-[14.5px] font-medium leading-snug text-nf-ink"
                        >
                          {item.name}
                        </Link>
                        <span className="shrink-0 text-[14px] text-nf-ink">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                      {lineOptions(item) ? <p className="mt-0.5 truncate text-[12px] text-nf-ink/60">{lineOptions(item)}</p> : null}
                      <p data-line-price className="mt-1 text-[13.5px] text-nf-ink/80">{item.priceLabel}</p>
                      <div className="mt-3 inline-flex h-10 items-center border border-nf-ink/40">
                        <button
                          type="button"
                          onClick={() => (item.quantity <= 1 ? remove(item) : updateQuantity(item.id, item.size, item.quantity - 1, item.variantId))}
                          disabled={isLoading}
                          className={stepper}
                          aria-label={item.quantity <= 1 ? `Remove ${item.name}` : "Decrease quantity"}
                        >
                          <Minus size={14} strokeWidth={1.5} />
                        </button>
                        <span className="w-8 text-center text-[13px]" aria-label={`Quantity ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1, item.variantId)}
                          disabled={isLoading}
                          className={stepper}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item)}
                        disabled={isLoading}
                        aria-label={`Remove ${item.name}`}
                        className="mt-1 flex min-h-11 items-center gap-1.5 text-[13px] text-nf-ink/60 hover:text-nf-ink disabled:opacity-50"
                      >
                        <X size={14} strokeWidth={1.5} aria-hidden="true" /> Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

            </div>

            {/* The foot, as plain as Project Shades': total, one line of terms,
                one black button. Every extra line here was a reason to pause. */}
            <div data-bag-foot className="shrink-0 border-t border-nf-ink/20 bg-[var(--nf-surface)] px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-medium text-nf-ink">Total</span>
                <span data-total className="text-[17px] font-medium text-nf-ink">{formatPrice(orderTotal)}</span>
              </div>
              {discountAmount > 0 && (
                <p data-you-save className="mt-1 text-[12.5px] font-medium text-nf-gold-text">
                  You save {formatPrice(discountAmount)} · {pct(discount.rate)} {rung ? `for ${rung.minQuantity} pieces` : "with your code"}
                </p>
              )}
              <p className="mt-2 text-[12.5px] leading-[1.5] text-nf-ink/65">
                Tax included. Free insured shipping · arrives {arrivesBy}.
              </p>
              <button
                type="button"
                data-checkout
                onClick={handleCheckout}
                disabled={busy || opening}
                className="press-scale mt-4 flex h-[52px] w-full items-center justify-center gap-2 bg-nf-ink text-[15px] font-medium tracking-[0.02em] text-nf-ivory transition-opacity duration-150 hover:opacity-90 disabled:opacity-80"
              >
                {busy || opening ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                {opening ? "Opening checkout…" : "Checkout"}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawerNext;
