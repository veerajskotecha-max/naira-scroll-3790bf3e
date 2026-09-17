import { lazy, Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { discountPercent } from "@/components/jewellery/JewelPriceTag";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { absoluteUrl } from "@/lib/absoluteUrl";
import { shopifyOgImage, OG_IMAGE_SIZE } from "@/lib/shopifyImage";
import { productParams, trackPixel } from "@/lib/pixel";
import { QUANTITY_OFFERS, TOP_QUANTITY_OFFER } from "@/lib/promo";
import { Helmet } from "react-helmet-async";
import { Heart, Minus, Plus, Truck, MessageSquare, ArrowLeft, ZoomIn, ShoppingBag, TicketPercent } from "lucide-react";

import { toast } from "sonner";
import Footer from "@/components/Footer";
import { reviewSummary } from "@/components/CustomerReviews";
import PincodeChecker from "@/components/product/PincodeChecker";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { AtelierAccordionTrigger } from "@/components/ui/atelier-accordion";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { AtelierSkeleton } from "@/components/ui/atelier-skeleton";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { isAdjustableRing, ADJUSTABLE_FIT_NOTE } from "@/data/ringFit";
import RingSizeGuideModal from "@/components/jewellery/RingSizeGuideModal";
import PressMarquee from "@/components/jewellery/PressMarquee";
import ReelPeek from "@/components/reels/ReelPeek";
import MobileReelShop from "@/components/reels/MobileReelShop";
import FomoPopup from "@/components/FomoPopup";
import CheckoutBenefit from "@/components/checkout/CheckoutBenefit";

import { shopifyImage, shopifySrcSet } from "@/lib/shopifyImage";



import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { addWorkingDays, formatDeliveryDate } from "@/lib/serviceability";
import { jewellery as staticJewellery, jewelleryEnquiryUrl, WHATSAPP_NUMBER, PREORDER_NOTE, type JewelPiece } from "@/data/jewellery";

const CustomerReviews = lazy(() => import("@/components/CustomerReviews"));


/* Key facts distilled from the approved data model: finish and stone are
   read out of the materials line, edition from the engraved number. */
const deriveKeyFacts = (piece: JewelPiece): { label: string; value: string }[] => {
  const m = piece.materials.toLowerCase();
  const hasGold = m.includes("18k gold");
  const hasRhodium = m.includes("rhodium");
  const finish = hasGold && hasRhodium ? "18k gold & rhodium" : hasGold ? "18k gold" : hasRhodium ? "Rhodium" : "Demi-gold";
  const hasPearl = m.includes("pearl");
  const hasZircone = m.includes("zircon");
  const stone = hasPearl && hasZircone ? "Pearl & zircone" : hasPearl ? "Freshwater pearl" : hasZircone ? "Brilliant-cut zircone" : "Polished metal";
  return [
    { label: "Finish", value: finish },
    { label: "Stone", value: stone },
    piece.category === "Rings"
      ? { label: "Fit", value: isAdjustableRing(piece.handle) ? "Adjustable · US 6–8" : "Fixed size" }
      : { label: "Category", value: piece.category },
  ];
};


const ringSizes: { value: string; label: string; status: "available" | "preorder" }[] = [
  { value: "5", label: "US 5 (Pre-order · 45 days delivery)", status: "preorder" },
  { value: "6", label: "US 6", status: "available" },
  { value: "7", label: "US 7 (Pre-order · 45 days delivery)", status: "preorder" },
];

/** Size list for a specific ring: open-back styles adjust to fit, so every
    size button reads as available — never pre-order, never out of stock. */
const ringSizesFor = (handle?: string) =>
  isAdjustableRing(handle)
    ? ringSizes.map((s) => ({
        ...s,
        status: "available" as const,
        label: s.value === "6" ? "US 6 — Adjustable (fits US 6–8)" : `US ${s.value} — Adjustable fit`,
      }))
    : ringSizes;


/* Shown only while the Shopify catalogue is still in flight and the handle
   hasn't resolved yet — mirrors the PDP's two-column shape so the layout
   doesn't jump when the real piece arrives. */
const JewelDetailSkeleton = () => (
  <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
    <Helmet>
      <title>Loading piece | Naira Flore</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <span className="sr-only" role="status">Loading piece</span>
    <div className="max-w-[1400px] mx-auto md:px-6 pt-[94px] md:pt-[112px] pb-16" aria-hidden="true">
      <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <AtelierSkeleton className="w-full" style={{ aspectRatio: MOBILE_FRAME }} />
        <div className="mt-6 lg:mt-0 px-4 lg:px-8 xl:px-10">
          <AtelierSkeleton className="h-8 w-4/5" />
          <AtelierSkeleton className="mt-4 h-6 w-1/3" />
          <AtelierSkeleton className="mt-3 h-3 w-3/5" />
          <AtelierSkeleton className="mt-8 h-12 w-full" />
          <AtelierSkeleton className="mt-3 h-12 w-full" />
        </div>
      </div>
    </div>
  </div>
);

/* Square, not the 3/4 this used to be. Two reasons, both measured.

   15 of the 16 live hero images are exactly 1:1 (1649², 1500², 896²), so the
   taller frame was cropping a quarter off almost every one of them.

   And it lifts the decision information above the fold: at 3/4 the name and
   price landed at 1.06 and 1.12 folds on a 390px phone, underneath a buy bar
   pinned to the bottom of the screen at 0.94 — the shopper was being offered
   the button before the price. */
const MOBILE_FRAME = "1/1";

/* Google wants a validity horizon on an Offer. Rolling twelve months keeps the
   markup fresh without anyone having to remember to edit a hardcoded date. */
const PRICE_VALID_UNTIL = new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10);

const JewelDetail = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { jewellery, isLoading: catalogueLoading } = useLiveJewellery();
  const piece = useMemo(() => jewellery.find((j) => j.handle === handle) ?? null, [handle, jewellery]);
  const isMobile = useIsMobile();
  const { toggleItem, isWishlisted } = useWishlist();
  const { addItem, buyNow, setDrawerOpen, isDrawerOpen, isLoading: cartLoading } = useCart();
  const [buying, setBuying] = useState(false);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/jewellery");
  };

  /* `piece` is null on the first render of a Shopify-only handle, so seeding
     this from it locked 6 of 10 rings to "One Size" for the whole visit — a
     blank dropdown on every cold load (ad click, shared link, search). */
  const [selectedSize, setSelectedSize] = useState<string>("One Size");
  const sizedCategory = piece?.category === "Rings";
  /* Contentsquare's 2026 benchmark puts mobile scroll rate at 45.2% — the average
     visitor never reaches the page's midpoint. The rating sat at 5.14 folds, so
     most shoppers never saw it. It moves up beside the title, always paired with
     its count. */
  const rating = useMemo(
    () => (piece ? reviewSummary(piece.name, "jewellery") : null),
    [piece?.name]
  );
  useEffect(() => {
    setSelectedSize(sizedCategory ? "6" : "One Size");
  }, [sizedCategory, piece?.handle]);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  const stickyBarRef = useRef<HTMLDivElement>(null);

  /* Baymard: 41% of sites quote a shipping speed rather than a date, and test
     participants opened calendars to count business days themselves, reaching
     conflicting conclusions from identical wording. Amazon and Flipkart have
     trained Indian shoppers to expect a date, and 11 of 17 Indian D2C product
     pages surveyed carry one.

     Five working days is the rest-of-India figure — the conservative end, since
     Baymard found a shown date is read as a promise and a missed one does more
     damage than a vague range.

     Held back from the prerenderer. Prerendering drives a real headless browser,
     so effects run and whatever this sets is captured into the static HTML — I
     checked, and a build today baked "arrives by Thu, 3 Sept" into the file. That
     HTML can sit for weeks, so crawlers and no-JS visitors would read a delivery
     date that has already passed. Automated captures keep the range; every real
     visitor recomputes the date on load. */
  const [arrivesBy, setArrivesBy] = useState<string | null>(null);
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.webdriver) return;
    setArrivesBy(formatDeliveryDate(addWorkingDays(new Date(), 5)));
  }, []);
  const [heartPopped, setHeartPopped] = useState(false);

  /* Meta Pixel ViewContent — once per piece viewed. */
  useEffect(() => {
    if (!piece) return;
    trackPixel("ViewContent", productParams({
      id: piece.handle,
      variantId: piece.variantId,
      name: piece.name,
      price: piece.price,
      category: piece.category,
    }));
  }, [piece?.handle]);

  /* The mobile buy bar shows whenever the inline CTA block is off screen —
     below the fold on landing as well as scrolled past above. It used to wait
     for `bottom < 0` only, so the whole stretch from the fold down to the CTA
     (~750px on a 852px phone) offered no way to buy at all.

     It is held back until the price has entered the viewport, though. Pinned
     to the bottom of the screen it rendered at ~0.94 folds while the name and
     price sat at 1.06 and 1.12 — so the very first thing a shopper could do
     was buy something whose price they had not been shown yet. */
  useEffect(() => {
    const check = () => {
      const target = document.getElementById("product-actions");
      if (!target) return;
      const r = target.getBoundingClientRect();
      const offScreen = r.bottom < 0 || r.top > window.innerHeight;
      /* Never let the bar sit on top of the price. Pinned to the bottom of the
         screen it covered it outright — the shopper saw the name, two buy
         buttons, and no price at all. */
      const price = document.getElementById("product-price");
      const barHeight = stickyBarRef.current?.offsetHeight ?? 72;
      const priceClear =
        !price || price.getBoundingClientRect().bottom < window.innerHeight - barHeight;
      setStickyBarVisible(offScreen && priceClear);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    /* The first check runs before the gallery images have loaded, when the page
       is still short and the CTA is wrongly on screen. Nothing re-checked until
       the shopper scrolled, so the bar stayed hidden on a page they had not
       touched. Watching the document height catches the reflow instead. */
    const ro = new ResizeObserver(check);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      ro.disconnect();
    };
  }, [handle]);

  const images = useMemo(() => {
    if (!piece) return [];
    return piece.gallery && piece.gallery.length > 0 ? piece.gallery : [piece.image];
  }, [piece]);

  const scrollToImage = useCallback((index: number) => {
    if (!scrollRef.current) return;
    isScrolling.current = true;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.offsetWidth,
      behavior: reduced ? "auto" : "smooth",
    });
    setSelectedImage(index);
    setTimeout(() => { isScrolling.current = false; }, 400);
  }, []);

  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;
    const el = scrollRef.current;
    /* The dots used to update 60ms after the finger stopped, so they lagged a
       beat behind the photo. Reading the position on an animation frame keeps
       the active dot moving with the swipe, and coalescing to one frame costs
       nothing on the scroll thread. */
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (isScrolling.current || !el.offsetWidth) return;
        const next = Math.round(el.scrollLeft / el.offsetWidth);
        setSelectedImage((cur) => (cur === next ? cur : next));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
    /* images.length matters as much as isMobile here. The gallery only mounts
       once the live Shopify catalogue resolves, so on first run scrollRef was
       still null and this bailed out — and with isMobile alone in the deps it
       never ran again. The listener was never attached on a cold load, which is
       why swiping the photos left the dots sitting on the first one; only
       tapping a dot moved them, because that sets the index directly. */
  }, [isMobile, images.length]);

  /* The live Shopify catalogue only lands after first paint, so on a cold load
     (ad click, shared link, search result) a handle that exists solely in
     Shopify is not in `jewellery` yet. Redirecting here bounced 25 of the 44
     product links straight back to the listing — wait for the query to settle
     before deciding the piece really doesn't exist. */
  if (!piece) {
    if (catalogueLoading) return <JewelDetailSkeleton />;
    return <Navigate to="/jewellery" replace />;
  }

  const wishlisted = isWishlisted(piece.handle);
  /* Live Shopify stock state, refreshed by useLiveJewel. */
  /* Adjustable open-back rings flex to fit, so they never read as sold out —
     a low Shopify count just means the next piece is finished to order. */
  const adjustable = isAdjustableRing(piece.handle);
  const soldOut = piece.availableForSale === false && !adjustable;
  const keyFacts = deriveKeyFacts(piece);
  const enquiryHref = jewelleryEnquiryUrl(piece.name);
  const sizedEnquiryHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Naira Flore, I'd love to order the "${piece.name}"${piece.category === "Rings" ? ` in size ${selectedSize}` : ""} (qty ${quantity}). Could you share availability and next steps?`
  )}`;

  const cartItem = () => ({
    id: piece.handle,
    variantId: piece.variantId,
    name: piece.name,
    price: piece.price,
    priceLabel: piece.priceLabel,
    currencyCode: "INR",
    image: piece.image,
    size: piece.category === "Rings" ? `US ${selectedSize}` : undefined,
  });

  /* Shopify-backed pre-order: real variant, real cart, real checkout. */
  const addToCart = async () => {
    await addItem(
      {
        id: piece.handle,
        variantId: piece.variantId,
        name: piece.name,
        price: piece.price,
        priceLabel: piece.priceLabel,
        currencyCode: "INR",
        image: piece.image,
        size: piece.category === "Rings" ? `US ${selectedSize}` : undefined,
      },
      quantity
    );
  };

  const handleAddToCart = async () => {
    await addToCart();
    setDrawerOpen(true);
  };

  /* Pre-order now: adds to the Shopify cart and opens Shopify checkout in one
     step, using the checkout URL the add returned (no stale-cart race). */
  const handleBuyNow = async () => {
    setBuying(true);
    try {
      await buyNow(cartItem(), quantity);
    } finally {
      setBuying(false);
    }
  };

  /* Sold-out pieces take pre-orders: try the cart first, and if Shopify
     refuses the variant, fall back to a WhatsApp reservation. */
  const handlePreOrder = async () => {
    const added = await addToCart().catch(() => false);
    if (added) setDrawerOpen(true);
    else window.open(sizedEnquiryHref, "_blank", "noopener,noreferrer");
  };

  const handleWishlist = () => {
    if (!wishlisted) setHeartPopped(true);
    toggleItem({ id: piece.handle, name: piece.name, price: piece.priceLabel, image: piece.image });
  };
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: piece.name,
    description: piece.blurb,
    brand: { "@type": "Brand", name: "Naira Flore" },
    category: piece.category,
    image: [piece.image],
    material: piece.materials,
    url: `https://nairaflore.com/jewellery/${piece.handle}`,
    // ponytail: no aggregateRating until real per-product reviews exist — emitting a
    // site-wide constant here is fabricated structured data. Re-add from Judge.me data.
    sku: piece.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      /* The pre-order era is over: Shopify prices arrive through useLiveJewellery
         and the page renders them. An Offer without a price is invalid, so Google
         was dropping the Product rich result across every jewellery page. */
      price: piece.price,
      priceValidUntil: PRICE_VALID_UNTIL,
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Naira Flore" },
      url: `https://nairaflore.com/jewellery/${piece.handle}`,
    },
  };

  const WishlistBtn = (
    <button
      className="press-scale absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center"
      style={{ backgroundColor: "hsla(0,0%,100%,0.85)" }}
      onClick={handleWishlist}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={17}
        className={heartPopped ? "heart-pop" : undefined}
        onAnimationEnd={() => setHeartPopped(false)}
        style={{ color: wishlisted ? "hsl(0 70% 55%)" : "hsl(0 0% 40%)", fill: wishlisted ? "hsl(0 70% 55%)" : "none" }}
      />
    </button>
  );
  const Gallery = isMobile ? (
    <div className="relative">
      {/* The overlays are positioned against this wrapper, which covers only the
          photo. When they shared a box with the dot strip, a taller strip pushed
          the "tap to zoom" badge off the image and onto the dots. */}
      <div className="relative">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          /* Keeps a horizontal swipe inside the gallery instead of handing it to
             the browser's back gesture or bouncing the whole page sideways. */
          overscrollBehaviorX: "contain",
        }}
      >
        {images.map((img, i) => (
          <button
            type="button"
            key={i}
            onClick={() => openLightbox(i)}
            className="w-full shrink-0 snap-center block p-0 cursor-zoom-in"
            style={{
              aspectRatio: MOBILE_FRAME,
              backgroundColor: "#F4EBE2",
              /* Belongs on the snap item, not the scroll port. A quick flick used
                 to fly past three or four photos; stopping at every snap point
                 makes one swipe move exactly one image. */
              scrollSnapStop: "always",
            }}
            aria-label={`Open ${piece.name} image ${i + 1} full screen`}
          >
            <img
              src={shopifyImage(img, 900)}
              srcSet={shopifySrcSet(img, [480, 720, 900, 1200]) || undefined}
              sizes="100vw"
              alt={`${piece.name} view ${i + 1}`}
              className="w-full h-full object-cover"
              width={900}
              height={1200}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              decoding={i === 0 ? "sync" : "async"}
            />
          </button>
        ))}
          </div>
          {WishlistBtn}
          <span
            aria-hidden="true"
            className="absolute bottom-3 left-4 z-10 inline-flex items-center gap-1.5 bg-background/90 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
          >
            <ZoomIn size={12} strokeWidth={1.7} /> Tap to zoom
          </span>
          {images.length > 1 && (
            <div
              className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-2"
              role="group"
              aria-label={`${piece.name} images`}
            >
              {images.map((_, i) => {
            const active = selectedImage === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => scrollToImage(i)}
                aria-label={`View image ${i + 1} of ${images.length}`}
                aria-current={active ? "true" : undefined}
                data-active={active ? "true" : "false"}
                className={`h-3 w-3 rounded-full border border-foreground/35 transition-colors ${active ? "bg-foreground" : "bg-background/60"}`}
              />
            );
              })}
            </div>
          )}
      </div>
    </div>
  ) : (
    (() => {
      /* Desktop/tablet: only ever show each photo once. Layout adapts to how
         many unique images the piece actually has (1 → full bleed, 2 → split,
         3 → hero + pair, 4 → 2×2). */
      const unique = Array.from(new Set(images)).slice(0, 4);
      const count = unique.length;
      const gridClass =
        count <= 1
          ? "grid grid-cols-1 grid-rows-1"
          : count === 2
            ? "grid grid-cols-1 grid-rows-2"
            : "grid grid-cols-2 grid-rows-2";
      return (
        <div className="relative w-full h-full min-h-full">
          <div className={`${gridClass} gap-[4px] h-full min-h-full`}>
            {unique.map((img, i) => (
              <button
                type="button"
                key={img}
                onClick={() => openLightbox(i)}
                className={`overflow-hidden relative min-h-0 block w-full p-0 cursor-zoom-in ${count === 3 && i === 0 ? "col-span-2" : ""}`}
                style={{ backgroundColor: "#F4EBE2", height: "100%" }}
                aria-label={`Open ${piece.name} image ${i + 1} full screen`}
              >
            <img
              src={shopifyImage(img, 1000)}
              srcSet={shopifySrcSet(img, [600, 800, 1000, 1400]) || undefined}
              sizes="(max-width: 1024px) 100vw, 50vw"
              alt={`${piece.name} view ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
              width={1000}
              height={1000}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              decoding={i === 0 ? "sync" : "async"}
            />
          </button>
        ))}
      </div>
      {WishlistBtn}
    </div>
  );
    })()
  );


  /* Social crawlers fetch og:image inline and drop oversized files without a
     word, so the preview must point at a small JPEG, not the 2048px master. */
  const ogImageUrl = absoluteUrl(shopifyOgImage(piece.image));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <Helmet>
        <title>{piece.name} · Demi-Gold Jewellery | Naira Flore</title>
        <meta name="description" content={`${piece.name}, ${piece.blurb.slice(0, 130)}`} />
        <link rel="canonical" href={`https://nairaflore.com/jewellery/${piece.handle}`} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${piece.name} · Demi-Gold Jewellery | Naira Flore`} />
        <meta property="og:description" content={piece.blurb.slice(0, 150)} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content={String(OG_IMAGE_SIZE)} />
        <meta property="og:image:height" content={String(OG_IMAGE_SIZE)} />
        <meta property="og:image:alt" content={piece.name} />
        <meta property="og:url" content={`https://nairaflore.com/jewellery/${piece.handle}`} />
        <meta property="og:site_name" content="Naira Flore" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${piece.name} · Demi-Gold Jewellery | Naira Flore`} />
        <meta name="twitter:description" content={piece.blurb.slice(0, 150)} />
        <meta name="twitter:image" content={ogImageUrl} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://nairaflore.com/" },
              { "@type": "ListItem", position: 2, name: "Jewellery", item: "https://nairaflore.com/jewellery" },
              { "@type": "ListItem", position: 3, name: piece.name, item: `https://nairaflore.com/jewellery/${piece.handle}` },
            ],
          })}
        </script>
      </Helmet>

      {/* Breadcrumb (desktop) */}
      <div className="max-w-[1400px] mx-auto px-6 pt-[100px] md:pt-[112px] lg:pt-[120px] pb-3 hidden md:flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-[11px] tracking-[0.04em]" style={{ color: "hsl(0 0% 55%)" }}>
          <Link to="/" className="hover:text-foreground">Home</Link><span>/</span>
          <Link to="/jewellery" className="hover:text-foreground">Jewellery</Link><span>/</span>
          <span style={{ color: "hsl(0 0% 30%)" }}>{piece.name}</span>
        </nav>
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] hover:text-foreground transition-colors"
          style={{ color: "hsl(0 0% 45%)" }}
          aria-label="Go back"
        >
          <ArrowLeft size={13} strokeWidth={1.6} /> Back
        </button>
      </div>

      {/* Mobile gallery */}
      <div className="md:hidden pt-[94px] relative">
        <button
          onClick={goBack}
          className="absolute top-[106px] left-4 z-20 w-11 h-11 flex items-center justify-center shadow-md"
          style={{ backgroundColor: "hsla(0,0%,100%,0.92)", borderRadius: "50%" }}
          aria-label="Go back"
        >
          <ArrowLeft size={16} strokeWidth={1.6} style={{ color: "hsl(0 0% 20%)" }} />
        </button>
        {/* Rendered in exactly one of the two slots. Both used to mount it and
            hide one with CSS, which put two copies in the DOM sharing a single
            scrollRef — React handed the ref to whichever mounted last, so on a
            phone the listener sat on the hidden 0-width copy. Swiping moved
            photos the code never measured, which is why the dots never followed
            the finger, and tapping a dot scrolled the invisible gallery. */}
        {isMobile && Gallery}
      </div>


      <div className="max-w-[1400px] mx-auto md:px-6 pb-24 md:pb-24">
        <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="hidden md:block">{!isMobile && Gallery}</div>

          {/* Details */}
          <div className="mt-5 md:mt-0 lg:py-2 flex flex-col w-full items-stretch px-4 lg:px-8 xl:px-10">
            {/* Category, and the rating alongside it.

                Contentsquare's 2026 benchmark puts mobile scroll rate at 45.2% —
                the average visitor never reaches the page's midpoint, and this
                rating sat at 5.14 folds. It rides on the category row because
                that row was half empty, so surfacing it costs almost no height:
                the price still clears the fold. Baymard surveyed 5,170+ people
                and found a star average without a count erodes trust, so the
                count is never rendered without it. */}
            <div className="flex items-center justify-between gap-3 min-h-[26px]">
              <p className="text-[10px] tracking-[0.34em]" style={{ color: "#B0843A", fontFamily: "'Jost', 'Inter', sans-serif" }}>
                {piece.category.toUpperCase()} · DEMI-GOLD
              </p>
              {rating && (
                <a
                  href="#customer-reviews"
                  className="inline-flex shrink-0 items-center gap-1 text-[12px] tracking-[0.02em] py-1 pl-2 -mr-1"
                  style={{ color: "hsl(0 0% 35%)" }}
                  aria-label={`Rated ${rating.rating} out of 5 from ${rating.count} reviews. Jump to reviews.`}
                >
                  <span aria-hidden="true" style={{ color: "#B0843A" }}>★</span>
                  <span className="font-medium" style={{ color: "hsl(0 0% 15%)" }}>{rating.rating}</span>
                  <span className="underline underline-offset-4" style={{ color: "hsl(0 0% 48%)" }}>
                    ({rating.count})
                  </span>
                </a>
              )}
            </div>

            {/* Title */}
            <h1 className="font-cormorant text-[26px] md:text-[32px] lg:text-[36px] font-semibold leading-[1.15] tracking-[-0.01em] mt-2" style={{ color: "hsl(0 0% 12%)" }}>
              {piece.name}
            </h1>

            {/* Live price from the Shopify listing */}
            <div id="product-price" className="mt-3 flex flex-wrap items-baseline gap-2">
              <span className="font-cormorant text-[24px] md:text-[28px] font-semibold" style={{ color: "hsl(0 0% 12%)" }}>
                {piece.priceLabel}
              </span>
              {piece.compareAtLabel && (
                <>
                  <span className="text-[14px] line-through" style={{ color: "hsl(0 0% 55%)" }}>
                    {piece.compareAtLabel}
                  </span>
                  <span className="text-[11.5px] font-medium tracking-[0.04em]" style={{ color: "#8A6A2A" }}>
                    {discountPercent(piece)}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="mt-1.5 text-[12px] tracking-[0.02em] leading-relaxed" style={{ color: "hsl(0 0% 48%)" }}>
              Inclusive of taxes · ₹150 insured shipping across India
            </p>
            {/* The delivery + returns promise sits at the buy moment, not only
                in the footer: it is the last question before Add to Cart. */}
            <p className="mt-1 text-[12px] font-medium tracking-[0.02em] leading-relaxed" style={{ color: "hsl(186 35% 28%)" }}>
              {arrivesBy ? `Order today, arrives by ${arrivesBy}` : PREORDER_NOTE} · 7-day returns · 2-year plating assurance
            </p>


            {/* Size / Quantity / CTA moved directly under the price for conversion */}


            <div className="my-4 hidden md:block" style={{ borderTop: "1px solid hsl(0 0% 88%)" }} />

            {/* Size / One-size */}
            <div className={piece.category === "Rings" ? "mt-4 md:mt-0" : "hidden md:block"}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] uppercase tracking-[0.14em] font-medium" style={{ color: "hsl(0 0% 25%)" }}>
                  {piece.category === "Rings" ? "Ring Size (US)" : "Size"}
                </span>
                {piece.category === "Rings" ? (
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="inline-flex items-center text-[11px] underline underline-offset-4 tracking-[0.02em] min-h-[44px] px-2 -mr-2"
                    style={{ color: "hsl(186 35% 28%)" }}
                  >
                    Size chart
                  </button>
                ) : (
                  <a href={enquiryHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[11px] underline underline-offset-4 tracking-[0.02em] min-h-[44px] px-2 -mr-2" style={{ color: "hsl(186 35% 28%)" }}>
                    Sizing help
                  </a>
                )}

              </div>
              {piece.category === "Rings" ? (
                <>
                  {/* Buttons, not a dropdown. Baymard: 57% of sites hide size
                      behind a select, and a dropdown conceals both the range of
                      sizes and which are available until the shopper opens it.
                      Three ring sizes fit on one row at 390px. */}
                  <div role="radiogroup" aria-label="Ring size, US" className="flex flex-wrap gap-2">
                    {ringSizesFor(piece.handle).map((s) => {
                      const active = selectedSize === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSelectedSize(s.value)}
                          className="min-w-[64px] min-h-[44px] px-4 border text-[13px] font-medium tracking-[0.02em] transition-colors duration-150"
                          style={{
                            borderColor: active ? "hsl(0 0% 12%)" : "hsl(0 0% 80%)",
                            backgroundColor: active ? "hsl(0 0% 12%)" : "transparent",
                            color: active ? "hsl(0 0% 100%)" : "hsl(0 0% 20%)",
                          }}
                        >
                          US {s.value}
                          {s.status === "preorder" && (
                            <span className="block text-[9.5px] font-normal tracking-[0.08em] uppercase opacity-70">
                              Pre-order
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[12px] leading-[1.6]" style={{ color: "hsl(0 0% 45%)" }}>
                    {adjustable
                      ? `US ${selectedSize} is in stock and ships now. ${ADJUSTABLE_FIT_NOTE}`
                      : selectedSize === "6"
                        ? "US 6 is in stock and ships now."
                        : `US ${selectedSize} is a pre-order — 45 days delivery.`}
                    {" "}
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="underline underline-offset-4"
                      style={{ color: "hsl(186 35% 28%)" }}
                    >
                      Not sure of your size?
                    </button>
                  </p>


                </>
              ) : (
                <div className="w-full h-11 flex items-center px-3 border text-[13px]" style={{ borderColor: "hsl(0 0% 80%)", color: "hsl(0 0% 20%)" }}>
                  One Size · adjustable
                </div>
              )}
            </div>
            <RingSizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} highlightSize={selectedSize} />


            {/* Quantity — desktop only; on a phone it pushes the CTA below the
                fold and can be changed in the cart. */}
            <div className="mt-4 hidden md:block">
              <span className="text-[11px] uppercase tracking-[0.14em] font-medium block mb-2.5" style={{ color: "hsl(0 0% 25%)" }}>Quantity</span>
              <div className="inline-flex items-center border" style={{ borderColor: "hsl(0 0% 80%)" }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" className="w-11 h-11 flex items-center justify-center hover:bg-muted">
                  <Minus size={13} style={{ color: "hsl(0 0% 30%)" }} />
                </button>
                <span className="w-12 text-center text-[13px] font-medium" style={{ color: "hsl(0 0% 20%)" }} aria-live="polite">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" className="w-11 h-11 flex items-center justify-center hover:bg-muted">
                  <Plus size={13} style={{ color: "hsl(0 0% 30%)" }} />
                </button>
              </div>
            </div>

            {/* CTA block: live Shopify cart + checkout, WhatsApp supports.
                Add to Cart leads in brand gold — a warm, high-contrast primary
                converts better than an outline ghost button. */}
            <div id="product-actions" className="mt-4 md:mt-6">
              {soldOut ? (
                <button
                  onClick={handlePreOrder}
                  disabled={buying || cartLoading}
                  className="press-scale w-full h-[54px] inline-flex items-center justify-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors duration-200 hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#B0843A", color: "hsl(0 0% 100%)" }}
                >
                  Pre-order Now
                </button>
              ) : (
                <div className="flex gap-2 md:block">
                  <div className="flex h-[54px] w-[38%] shrink-0 items-center justify-between border border-border md:hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" className="press-scale flex h-full min-w-11 items-center justify-center text-foreground">
                      <Minus size={15} />
                    </button>
                    <span className="text-[15px] font-medium text-foreground" aria-live="polite">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" className="press-scale flex h-full min-w-11 items-center justify-center text-foreground">
                      <Plus size={15} />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={buying || cartLoading}
                    className="press-scale inline-flex h-[54px] flex-1 items-center justify-center gap-2 bg-foreground text-[12px] font-medium uppercase tracking-[0.12em] text-background transition-colors duration-200 hover:opacity-90 disabled:opacity-60 md:w-full"
                  >
                    <ShoppingBag size={16} strokeWidth={1.6} /> Add to Cart
                  </button>
                </div>
              )}
              {soldOut ? (
                <a
                  href={sizedEnquiryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press-scale w-full h-[50px] mt-3 inline-flex items-center justify-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors duration-200 hover:opacity-90"
                  style={{ backgroundColor: "hsl(0 0% 12%)", color: "hsl(0 0% 100%)" }}
                >
                  <MessageSquare size={13} /> Reserve on WhatsApp
                </a>
              ) : null}

              {!soldOut && <CheckoutBenefit className="mt-2 flex" />}
              <p className="mt-1.5 text-center text-[11px] tracking-[0.02em]" style={{ color: "hsl(0 0% 50%)" }}>
                {soldOut ? (
                  "Reserve today — your piece is hand-finished and ships within 2 weeks."
                ) : (
                  <>
                    {/* 60% of Baymard's subjects looked for the returns policy on the
                        product page itself, and 44% of sites neither show nor link it
                        there. This said "Easy returns" and linked nowhere. */}
                    Insured delivery ·{" "}
                    <Link
                      to="/exchange-return-policy"
                      className="underline underline-offset-4"
                      style={{ color: "hsl(0 0% 35%)" }}
                    >
                      7-day returns
                    </Link>
                  </>
                )}
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleWishlist}
                  className="press-scale flex-1 h-[46px] text-[11px] font-medium uppercase tracking-[0.12em] border transition-colors duration-200 inline-flex items-center justify-center gap-2 hover:border-[hsl(0_0%_45%)]"
                  style={{ borderColor: "hsl(0 0% 74%)", color: "hsl(0 0% 30%)", backgroundColor: "transparent" }}
                >
                  <Heart size={14} style={{ fill: wishlisted ? "hsl(0 70% 55%)" : "none", color: wishlisted ? "hsl(0 70% 55%)" : "hsl(0 0% 30%)" }} />
                  {wishlisted ? "Saved" : "Wishlist"}
                </button>
                <a
                  href={sizedEnquiryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-[46px] inline-flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] border transition-colors duration-200 hover:border-[hsl(0_0%_45%)]"
                  style={{ borderColor: "hsl(0 0% 74%)", color: "hsl(0 0% 30%)" }}
                >
                  <MessageSquare size={13} /> WhatsApp
                </a>
              </div>
            </div>

            {/* Delivery + shipping reassurance */}
            <div
              className="mt-5 hidden md:flex items-start gap-2 border px-3 py-2.5"
              style={{ borderColor: "hsl(36 40% 80%)", backgroundColor: "hsl(36 60% 96%)" }}
            >
              <Truck size={13} strokeWidth={1.6} className="mt-[2px] shrink-0" style={{ color: "#9A7634" }} />
              <p className="text-[12px] leading-[1.6]" style={{ color: "hsl(0 0% 32%)" }}>
                <strong className="font-medium">
                  {arrivesBy ? `Order today, arrives by ${arrivesBy}.` : PREORDER_NOTE}
                </strong>{" "}
                Dispatched insured from our Mumbai atelier, with easy 7-day returns.
              </p>
            </div>

            {/* Codes stay visible so the offer feels concrete, while the bag
                still applies the best eligible one without shopper effort. */}
            <section
              className="mt-4 border-y border-[color:rgb(var(--nf-gold-rgb)/0.38)] bg-[var(--nf-surface-raised)] px-3 py-3"
              aria-label="Multi-buy offers"
            >
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[var(--nf-track-18)] text-[var(--nf-accent-quiet)]">
                <TicketPercent size={14} strokeWidth={1.6} aria-hidden="true" />
                <span>The Naira Pairing Offer</span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 divide-x divide-[color:rgb(var(--nf-gold-rgb)/0.32)]">
                {QUANTITY_OFFERS.map((offer) => (
                  <div key={offer.code} className="px-3 first:pl-0 last:pr-0">
                    <p className="text-[15px] font-semibold leading-none text-[var(--nf-text)]">
                      Buy {offer.minQuantity}, save {Math.round(offer.rate * 100)}%
                    </p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[var(--nf-track-16)] text-[var(--nf-accent-quiet)]">
                      Code <span className="font-semibold text-[var(--nf-text)]">{offer.code}</span>
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-2.5 border-t border-[color:rgb(var(--nf-ink-rgb)/0.08)] pt-2 text-[10px] leading-[1.5] text-muted-foreground">
                Your best eligible code is applied automatically in your bag.
              </p>
            </section>

            {/* Mobile: the arrival date already sits under the price, so this
                line only repeats the shipping and returns terms. */}
            <p className="mt-3 md:hidden text-[12px] leading-[1.6]" style={{ color: "hsl(0 0% 40%)" }}>
              ₹150 insured shipping · 7-day returns
            </p>


            {/* Key facts, at a glance */}
            <dl className="mt-4 hidden md:flex flex-wrap gap-2" aria-label="Key facts">
              {keyFacts.map((fact) => (
                <div key={fact.label} className="border px-3 py-1.5" style={{ borderColor: "hsl(36 30% 84%)", backgroundColor: "hsl(33 41% 97%)" }}>
                  <dt className="text-[8.5px] uppercase tracking-[0.18em]" style={{ color: "#9A7634", fontFamily: "'Jost', 'Inter', sans-serif" }}>
                    {fact.label}
                  </dt>
                  <dd className="mt-0.5 text-[12px] leading-tight tracking-[0.01em]" style={{ color: "hsl(0 0% 22%)" }}>
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 hidden md:block">
              <PincodeChecker />
            </div>

            <div className="my-4" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

            {/* Compact product information: one source for each buying fact. */}
            <div id="product-material-details" />
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AtelierAccordionTrigger>Product Details</AtelierAccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pb-2 text-[13px] leading-[1.7]" style={{ color: "hsl(0 0% 45%)" }}>
                    <p>{piece.blurb}</p>
                    {piece.details?.map((spec) => <p key={spec}>• {spec}</p>)}
                    <p>{piece.materials}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AtelierAccordionTrigger>Care &amp; Plating Assurance</AtelierAccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1.5 pb-2 text-[13px] leading-[1.7]" style={{ color: "hsl(0 0% 45%)" }}>
                    <p>{piece.care ?? "Store in the pouch, avoid perfume and chlorinated water, and wipe gently after wear."}</p>
                    <p>Covered by our 2-year plating assurance.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="delivery" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AtelierAccordionTrigger>Delivery &amp; Returns</AtelierAccordionTrigger>
                <AccordionContent>
                  <div className="text-[13px] leading-[1.7] pb-2 space-y-1.5" style={{ color: "hsl(0 0% 45%)" }}>
                    <p>{PREORDER_NOTE} Flat ₹150 insured shipping across India.</p>
                    <p>7-day returns apply. <Link to="/exchange-return-policy" className="underline underline-offset-4">Read policy</Link></p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              {/* Phone only: pincode check and key facts live inside dropdowns
                  so the page stays short. */}
              <AccordionItem value="pincode" className="border-b md:hidden" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AtelierAccordionTrigger>Check Delivery Date</AtelierAccordionTrigger>
                <AccordionContent>
                  <div className="pb-2">
                    <PincodeChecker />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="facts" className="border-b md:hidden" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AtelierAccordionTrigger>Highlights</AtelierAccordionTrigger>
                <AccordionContent>
                  <dl className="pb-2 space-y-1.5 text-[13px] leading-[1.7]" style={{ color: "hsl(0 0% 45%)" }}>
                    {keyFacts.map((fact) => (
                      <div key={fact.label} className="flex gap-2">
                        <dt style={{ color: "hsl(0 0% 30%)" }}>{fact.label}:</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </div>
        </div>
      </div>

      <Suspense fallback={<div className="min-h-[240px] bg-white" aria-hidden="true" />}>
        <CustomerReviews productName={piece.name} variant="jewellery" />
      </Suspense>

      <PressMarquee />

      <MobileReelShop />

      {!isMobile && <ReelPeek suppressed={isDrawerOpen || lightboxOpen || sizeGuideOpen} />}
      <FomoPopup
        suppressed={isDrawerOpen || lightboxOpen || sizeGuideOpen}
        mobileStickyVisible={stickyBarVisible}
      />
      
      <Footer compact />

      {/* Sticky mobile enquire bar, revealed after the CTA scrolls past */}
      <div
        ref={stickyBarRef}
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-white/95 backdrop-blur px-3 pt-2 flex items-center gap-2 transition-[transform,visibility] duration-300 ease-out"
        style={{
          borderColor: "hsl(0 0% 90%)",
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
          transform: stickyBarVisible ? "translateY(0)" : "translateY(110%)",
          visibility: stickyBarVisible ? "visible" : "hidden",
          pointerEvents: stickyBarVisible ? "auto" : "none",
        }}
        aria-hidden={!stickyBarVisible}
      >
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="press-scale h-[48px] w-[48px] shrink-0 flex items-center justify-center border"
          style={{ borderColor: "hsl(0 0% 74%)" }}
        >
          <Heart size={16} style={{ fill: wishlisted ? "hsl(0 70% 55%)" : "none", color: wishlisted ? "hsl(0 70% 55%)" : "hsl(0 0% 25%)" }} />
        </button>
        {soldOut ? (
          <>
            <button
              onClick={handlePreOrder}
              disabled={buying || cartLoading}
              className="press-scale flex-1 h-[48px] inline-flex items-center justify-center text-[11px] font-medium uppercase tracking-[0.12em] border disabled:opacity-60"
              style={{ borderColor: "hsl(0 0% 24%)", color: "hsl(0 0% 15%)" }}
            >
              Pre-order
            </button>
            <a
              href={sizedEnquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="press-scale flex-1 h-[48px] inline-flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em]"
              style={{ backgroundColor: "hsl(0 0% 12%)", color: "#fff" }}
            >
              Reserve
            </a>
          </>
        ) : (
          <>
            <button
              onClick={handleAddToCart}
              disabled={buying || cartLoading}
              className="press-scale h-[48px] w-full inline-flex items-center justify-center text-[11px] font-medium uppercase tracking-[0.12em] disabled:opacity-60"
              style={{ backgroundColor: "hsl(0 0% 12%)", color: "#fff" }}
            >
              Add to Cart
            </button>
          </>
        )}

      </div>

      <ImageLightbox
        images={images}
        name={piece.name}
        open={lightboxOpen}
        initialIndex={lightboxIndex}
        onOpenChange={setLightboxOpen}
      />

    </div>
  );
};

export default JewelDetail;
