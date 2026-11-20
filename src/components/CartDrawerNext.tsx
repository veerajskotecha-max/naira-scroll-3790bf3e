import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { cartLineFor, variantById } from "@/lib/variants";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { cartKeyOf } from "@/lib/cartLines";
import { discountedCartLines } from "@/lib/cartPricing";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";
import { followOut, useBackToClose } from "@/hooks/useBackToClose";
import {
  discountedSubtotal,
  getPromoCode,
  ladderHeadline,
  PROMO_EVENT,
  QUANTITY_OFFERS,
  resolveCartDiscount,
} from "@/lib/promo";
import { SHIPPING_CHARGE, deliveryRangeFromNow } from "@/lib/serviceability";
import { CleanStyles, cleanButton } from "@/components/clean";
import BagEmpty from "@/components/cart/BagEmpty";
import BagLine from "@/components/cart/BagLine";
import BagOffer from "@/components/cart/BagOffer";
import { BagTrust } from "@/components/cart/BagTrust";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/integrations/supabase/lazy";
import { clarityEvent } from "@/lib/clarity";
import { WHATSAPP_NUMBER, type JewelPiece, type JewelVariant } from "@/data/jewellery";
import { GST_LABEL } from "@/lib/gst";

/*
  The bag, on every page, drawn from the clean system the product page uses
  (components/clean): one face, six colours, one hairline, one button.

    Your bag  2 pieces                                    ×
    Buy 2 · 10% off   Buy 3 · 20% off   Buy 4 · 30% off      the offer, as words
    ━━━━━────────────────────────────────────────────────    over one 2px line
    [photo]  the piece, what the line costs, the price it
             replaces and the rate taken off, − 1 +, Remove
    ─────────────────────────────────────────────────────
    Total                                          ₹2,023
    You save ₹225 · 10% for 2 pieces
    Incl. 3% GST. Free insured shipping · arrives 25–27 Nov.
       ★ Rated 4.5/5 · Trusted by 5,000+ clients   (cart/BagTrust)
             UPI · Cards · Cash on delivery
    [                   CHECKOUT                    ]
              Easy 7-day exchange & returns

  The header, the offer and the foot stay put; only the list scrolls, so the
  total and Checkout never leave the screen. Type and colour come from the
  nc- classes and the --nc- tokens alone; the utilities here are layout.

  Same cart, discount resolver and checkout hand-off as before: every rupee
  shown is the one the checkout charges. CartDrawer.tsx is kept so the switch
  can be undone in one line in App.tsx.
*/

const formatPrice = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
/* "Each" on a line of two or more is one piece at the bag's rate, rounded on
   its own: the product page's figure for that rung (`pieceAtRung`) and, to
   the rupee, the per-piece price Shopify charges. It used to be the line's
   share of the bag's rounded total divided by its pieces, which gave
   "₹799.33 each" for three ₹999 pieces at 20%, and, once rounded, put two
   ₹1,499 pieces at 30% at "₹1,050 each" against ₹1,049 on the product page
   (Shopify: ₹1,049.30) whenever the bag's leftover rupee landed on that line.
   The line's total stays its share of the bag's total, so the lines still
   add up to it. */
const formatUnitPrice = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
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

/* The one hairline, wherever the bag draws a rule. */
const RULE = "border-[color:var(--nc-rule)]";

/* The bag's one reassurance, and the only one it keeps: the way back is as
   easy as the way in. It sits under the button, after the decision, so it
   reads as the reason to press it rather than as another term to get through. */
export const BagReturns = ({
  onLeave,
}: {
  onLeave?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) => (
  <p className="mt-2.5 flex justify-center">
    {/* A 44px target round a 20px line, drawn by a pseudo-element so the
        focus ring keeps to the words: the line sits 12px above the sheet's
        foot, and a ring round the whole target would be cut off there. The
        target reaches 2px over Checkout; that button is drawn above it, so
        it never takes the button's taps. */}
    <Link
      to="/exchange-return-policy"
      onClick={onLeave}
      data-returns
      className="nc-small nc-link relative before:absolute before:inset-x-0 before:-inset-y-3 before:content-['']"
    >
      Easy 7-day exchange &amp; returns
    </Link>
  </p>
);

/* The bag's offer strip (cart/BagOffer): the rungs as one line of words over
   the 2px line. It keeps the name the ladder has always been exported under. */
export const SimpleLadder = BagOffer;

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
    pending,
    addError,
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
  /* The bag as it will be once Shopify answers: the piece on its way in is
     listed and counted from the tap, as a line of its own or one more of a
     line already here. Checkout waits for Shopify (busy, below). */
  const pendingKey = pending ? cartKeyOf(pending) : null;
  const lines = useMemo(() => {
    if (!pending) return items;
    return items.some((item) => cartKeyOf(item) === pendingKey)
      ? items.map((item) => (cartKeyOf(item) === pendingKey ? { ...item, quantity: item.quantity + pending.quantity } : item))
      : [...items, pending];
  }, [items, pending, pendingKey]);
  const lineCount = totalItems + (pending?.quantity ?? 0);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isDrawerOpen) return;
    // Reveal the arriving line, not just the two pieces above the fold.
    const frame = requestAnimationFrame(() => {
      const list = listRef.current;
      const target = list?.querySelector<HTMLElement>("[data-adding]") ?? list?.querySelector<HTMLElement>("li:last-child");
      if (!list || !target) return;
      const bottom = target.getBoundingClientRect().bottom - list.getBoundingClientRect().top;
      if (bottom > list.clientHeight) list.scrollTop += bottom - list.clientHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [isDrawerOpen, pendingKey, lines.length]);
  const lineSubtotal = subtotal + (pending ? pending.price * pending.quantity : 0);
  /* One resolver for the bag and the checkout hand-off: the total shown is the total charged. */
  const discount = resolveCartDiscount({ totalItems: lineCount, promoCode });
  const rung = discount.automatic ? QUANTITY_OFFERS.find((offer) => offer.code === discount.code) : undefined;
  const goodsTotal = discountedSubtotal(lineSubtotal, discount);
  const linePrices = discountedCartLines(lines, discount);
  const discountAmount = lineSubtotal - goodsTotal;
  /* What the next rung takes, said only while nothing is off yet. */
  const nextRung = discountAmount > 0 ? "" : ladderHeadline(lineCount, discount.rate);
  const orderTotal = goodsTotal + SHIPPING_CHARGE;
  const busy = isLoading || isSyncing;

  /* The deal from the product page, kept in view: each piece's MRP from the
     live catalogue, and one saving against it at the total. */
  const mrpOf = (item: CartItem) => {
    const piece = catalogueByHandle.get(item.id);
    const mrp = (variantById(piece, item.variantId) ?? piece)?.compareAtPrice;
    return mrp && mrp > item.price ? mrp : null;
  };
  const mrpTotal = lines.reduce((sum, item) => sum + (mrpOf(item) ?? item.price) * item.quantity, 0) + SHIPPING_CHARGE;
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
    /* No AddPaymentInfo here. It fired on this tap, beside InitiateCheckout,
       before any payment detail exists; Shiprocket's checkout reports its own
       when the shopper actually reaches payment. InitiateCheckout is sent by
       the hand-off itself (CartContext openCheckout). */
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

  const best = BEST_SELLERS.map((handle) => catalogueByHandle.get(handle)).filter(
    (piece): piece is JewelPiece => Boolean(piece && piece.availableForSale !== false && piece.variantId),
  );

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(next) => (next ? setDrawerOpen(true) : requestClose())}>
      <SheetContent
        ref={contentRef}
        closeClassName="hidden"
        /* A full-height sheet: the whole screen on a phone, a 420px drawer
           with a hairline at its left from 640px. The sheet's stock shadow is
           taken off; the dimmed page behind it is separation enough.
           On a screen under 480px high (a phone on its side) the pinned
           parts alone would fill it, so there the sheet scrolls as one
           piece and Checkout is reached by scrolling, never cut off. */
        style={{ boxShadow: "none" }}
        className="nf-palette nf-clean inset-y-0 flex h-[100dvh] max-h-[100dvh] w-full flex-col gap-0 overflow-hidden border-0 p-0 sm:max-w-[420px] sm:border-l sm:border-[color:var(--nc-rule)] [@media(max-height:479px)]:overflow-y-auto"
      >
        <CleanStyles />
        <div className={`flex shrink-0 items-center justify-between border-b ${RULE} pb-1.5 pl-4 pr-1 pt-[max(6px,env(safe-area-inset-top))]`}>
          {/* The title is the sheet's name ("Your bag 2 pieces"). The two
              parts are set side by side, each in its own style: the count
              inside the heading's own element would inherit its tracking. */}
          <SheetTitle className="flex items-baseline gap-2.5">
            <span className="nc-heading nc-heading--sheet">Your bag</span>
            {lineCount > 0 && (
              <>
                {" "}
                <span className="nc-small">{lineCount === 1 ? "1 piece" : `${lineCount} pieces`}</span>
              </>
            )}
          </SheetTitle>
          <button type="button" onClick={requestClose} aria-label="Close bag" className="nc-iconbtn shrink-0">
            <X size={18} strokeWidth={1.25} aria-hidden="true" />
          </button>
        </div>

        {lines.length > 0 && <SimpleLadder totalItems={lineCount} />}
        {removed && (
          <div data-undo role="status" className="nc-notice shrink-0">
            <span className="truncate">{removed.name} removed</span>
            <button type="button" onClick={undo} className="nc-link nc-link--ink nc-tap -mr-2 shrink-0 px-2">
              Undo
            </button>
          </div>
        )}
        {addError && (
          <p data-add-error role="alert" className="nc-notice shrink-0">
            {addError}
          </p>
        )}

        {lines.length === 0 ? (
          <BagEmpty pieces={best} adding={adding} onAdd={(piece) => addPiece(piece, "bag_empty_added")} onLeave={leave} />
        ) : (
          <>
            <div
              ref={listRef}
              data-bag-list
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [@media(max-height:479px)]:flex-none [@media(max-height:479px)]:overflow-visible"
            >
              <ul className="flex flex-col">
                {lines.map((item, index) => {
                  const off = discount.rate > 0;
                  return (
                    <BagLine
                      key={`${item.id}-${item.size}-${item.variantId}`}
                      item={item}
                      href={pageOf(item)}
                      onLeave={leave}
                      options={lineOptions(item)}
                      total={formatPrice(off ? linePrices[index].total : item.price * item.quantity)}
                      was={off ? item.priceLabel : null}
                      each={
                        item.quantity > 1
                          ? `${off ? formatUnitPrice(discountedSubtotal(item.price, discount)) : item.priceLabel} each`
                          : null
                      }
                      off={off ? `${pct(discount.rate)} off` : null}
                      adding={cartKeyOf(item) === pendingKey}
                      busy={isLoading}
                      eager={index < 3}
                      onDecrease={() => (item.quantity <= 1 ? remove(item) : updateQuantity(item.id, item.size, item.quantity - 1, item.variantId))}
                      onIncrease={() => updateQuantity(item.id, item.size, item.quantity + 1, item.variantId)}
                      onRemove={() => remove(item)}
                    />
                  );
                })}
              </ul>
            </div>

            {/* The foot: the total, what was saved (or what the next piece
                saves), the terms in one line, the shop's rating and the ways
                to pay, and one filled button. Every extra line here was a
                reason to pause. */}
            <div data-bag-foot className={`shrink-0 border-t ${RULE} px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3`}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="nc-text nc-text--strong">Total</span>
                <span data-total className="nc-price__now nc-price__now--sheet tabular-nums">{formatPrice(orderTotal)}</span>
              </div>
              {discountAmount > 0 ? (
                <p data-you-save className="nc-small nc-gold">
                  You save {formatPrice(discountAmount)} · {pct(discount.rate)} {rung ? `for ${lineCount} pieces` : "with your code"}
                </p>
              ) : (
                /* Nothing off yet: the line where the saving would be says
                   which piece starts it ("A second piece takes 10% off your
                   bag"), in the saving's own place, so the foot keeps its
                   height as the bag grows. */
                nextRung && (
                  <p data-next-rung className="nc-small nc-gold">
                    {nextRung}
                  </p>
                )
              )}
              {/* One line where it fits. Where it does not (a narrow phone,
                  or a window that crosses into the next month), it breaks
                  between its two sentences, not inside the date. */}
              <p className="nc-small">
                <span className="inline-block">Incl. {GST_LABEL}.</span>{" "}
                <span className="inline-block">Free insured shipping · arrives {arrivesBy}.</span>
              </p>
              {/* The shop's rating and the ways to pay, right above the
                  button (the owner's ask, 16 Nov 2026). */}
              <BagTrust />
              <button
                type="button"
                data-checkout
                onClick={handleCheckout}
                disabled={busy || opening}
                className={`${cleanButton({ fill: "ink", block: true })} relative z-[1] mt-2.5`}
              >
                {busy || opening ? <Loader2 size={14} strokeWidth={1.25} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
                {opening ? "Opening checkout…" : "Checkout"}
              </button>
              <BagReturns onLeave={leave} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawerNext;
