import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Heart, MessageSquare, Minus, Plus, ShieldCheck, Sparkles } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import Footer from "@/components/Footer";
import PincodeChecker from "@/components/product/PincodeChecker";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { AtelierSkeleton } from "@/components/ui/atelier-skeleton";
import RingSizeGuideModal from "@/components/jewellery/RingSizeGuideModal";
import PressMarquee from "@/components/jewellery/PressMarquee";
import PdpBuyFacts from "@/components/jewellery/PdpBuyFacts";
import { dailySoldCount } from "@/lib/dailySold";
import { discountPercent } from "@/components/jewellery/JewelPriceTag";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { isAdjustableRing, ADJUSTABLE_FIT_NOTE } from "@/data/ringFit";
import { jewelleryEnquiryUrl, WHATSAPP_NUMBER, PREORDER_NOTE, type JewelPiece } from "@/data/jewellery";
import { absoluteUrl } from "@/lib/absoluteUrl";
import { shopifyImage, shopifyOgImage, shopifySrcSet, OG_IMAGE_SIZE } from "@/lib/shopifyImage";
import { productParams, trackPixel } from "@/lib/pixel";
import { deliveryRangeFromNow } from "@/lib/serviceability";
import { previewProductPath } from "@/lib/preview";

/*
  The redesigned product page, in preview at /preview/jewellery/<handle>.

  Same data, prices, cart and checkout as the live page (JewelDetail.tsx); what
  changes is what the shopper has to read. Set against Nishorama and Bluorng,
  whose first screen is photo, name, price, size and one button, the live page
  said the multi-buy offer three times and shipping and returns four times,
  and carried three assurance tiles, a Wishlist/WhatsApp row, five fold-down
  rows and an assurance grid at the foot. Here each fact is said once:

    price → offer, delivery, sales today → size and finish → Add to cart →
    Details / Care / Delivery tabs → reviews → press → reels → gift box.

  Colours are Naira's (ivory ground, ink, gold detail, deep-sage buttons); the
  html.nf-next class swaps the stock blue-grey palette the shared components
  draw from for the brand one, bag and dialogs included.
*/

const CustomerReviews = lazy(() => import("@/components/CustomerReviews"));
const ReelShopNext = lazy(() => import("@/components/reels/ReelShopNext"));
const FomoPopup = lazy(() => import("@/components/FomoPopup"));

/* Square: 15 of the 16 hero photos are 1:1, and it keeps the name and price
   above the fold on a 390px phone (see JewelDetail.tsx). */
const MOBILE_FRAME = "1/1";
const PRICE_VALID_UNTIL = new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10);

const finishOf = (piece: JewelPiece) => {
  const m = piece.materials.toLowerCase();
  const gold = m.includes("18k gold");
  const rhodium = m.includes("rhodium");
  if (gold && rhodium) return "18K gold & rhodium";
  if (gold) return "18K gold-tone";
  if (rhodium) return "Rhodium";
  return "Demi-gold";
};

const stoneOf = (piece: JewelPiece) => {
  const m = piece.materials.toLowerCase();
  const pearl = m.includes("pearl");
  const zircon = m.includes("zircon");
  if (pearl && zircon) return "Pearl & zircone";
  if (pearl) return "Freshwater pearl";
  if (zircon) return "Brilliant-cut zircone";
  return null;
};

/* "Length: 15-19cm adjustable links" → { label: "Length", value: "15–19 cm adjustable links" }. */
const tidy = (value: string) =>
  value
    .trim()
    .replace(/(\d)\s*-\s*(\d)/g, "$1–$2")
    .replace(/(\d)(cm|mm)\b/g, "$1 $2");

/* Shopify listings end "… Material: Surgical stainless steel Care Waterproof
   and tarnish free, …", and the catalogue folds that care paragraph into the
   last spec. It is split back out here, so the spec reads "Surgical stainless
   steel" and the Care tab gets the piece's own care text. */
const CARE_BREAK = /\s+Care\s+(?=[A-Z])/;
const specsOf = (piece: JewelPiece) => {
  let care: string | null = null;
  const specs = (piece.details ?? []).map((line) => {
    const [spec, careText] = line.split(CARE_BREAK);
    if (careText) care = careText.trim();
    const at = spec.indexOf(":");
    return at > 0 ? { label: spec.slice(0, at).trim(), value: tidy(spec.slice(at + 1)) } : { label: "", value: tidy(spec) };
  });
  return { specs, care };
};

/* The measurement a shopper sizes by. Rings choose a size instead. */
const SIZE_SPECS = ["Length", "Size", "Drop", "Fit"];
const sizeOf = (specs: { label: string; value: string }[]) => {
  for (const label of SIZE_SPECS) {
    const spec = specs.find((s) => s.label.toLowerCase() === label.toLowerCase());
    if (spec) return spec.value;
  }
  return null;
};

const ringSizes: { value: string; status: "available" | "preorder" }[] = [
  { value: "5", status: "preorder" },
  { value: "6", status: "available" },
  { value: "7", status: "preorder" },
];
/* Open-back rings adjust to fit, so every size reads as available. */
const ringSizesFor = (handle?: string) =>
  isAdjustableRing(handle) ? ringSizes.map((s) => ({ ...s, status: "available" as const })) : ringSizes;

const JewelDetailSkeleton = () => (
  <div className="min-h-screen bg-nf-ivory">
    <Helmet>
      <title>Loading piece | Naira Flore</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <span className="sr-only" role="status">Loading piece</span>
    <div className="mx-auto max-w-[1400px] pb-16 pt-[107px] md:px-6 md:pt-[126px]" aria-hidden="true">
      <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <AtelierSkeleton className="w-full" style={{ aspectRatio: MOBILE_FRAME }} />
        <div className="mt-6 px-4 lg:mt-0 lg:px-10">
          <AtelierSkeleton className="h-8 w-4/5" />
          <AtelierSkeleton className="mt-4 h-6 w-1/3" />
          <AtelierSkeleton className="mt-3 h-3 w-3/5" />
          <AtelierSkeleton className="mt-8 h-12 w-full" />
        </div>
      </div>
    </div>
  </div>
);

/* What the pre-built page knew about its piece (see JewelDetail.tsx). */
type EmbeddedPiece = { piece: JewelPiece; rating: { rating: number; count: number } | null };
const readEmbeddedPiece = (handle?: string): EmbeddedPiece | null => {
  if (typeof document === "undefined" || !handle) return null;
  try {
    const data = JSON.parse(document.getElementById("nf-piece")?.textContent || "null") as EmbeddedPiece | null;
    return data?.piece?.handle === handle ? data : null;
  } catch {
    return null;
  }
};
type ReviewWall = typeof import("@/data/reviewWall");

const TABS = [
  { id: "details", label: "Details" },
  { id: "care", label: "Care" },
  { id: "delivery", label: "Delivery" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const label = "font-nf-label text-[10px] uppercase tracking-nf-24 text-nf-gold-shadow";

const JewelDetailNext = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { jewellery, isLive, isLoading: catalogueLoading } = useLiveJewellery();
  const embedded = useMemo(() => readEmbeddedPiece(handle), [handle]);
  const [snapshot, setSnapshot] = useState<JewelPiece[] | null>(null);
  const needSnapshot = !isLive && !embedded && !jewellery.some((j) => j.handle === handle);
  useEffect(() => {
    if (!needSnapshot || snapshot) return;
    let cancelled = false;
    import("@/data/jewellerySnapshot")
      .then((module) => !cancelled && setSnapshot(module.jewellerySnapshot))
      .catch(() => !cancelled && setSnapshot([]));
    return () => {
      cancelled = true;
    };
  }, [needSnapshot, snapshot]);
  const piece = useMemo(
    () =>
      (isLive
        ? jewellery.find((j) => j.handle === handle)
        : embedded?.piece ?? jewellery.find((j) => j.handle === handle) ?? snapshot?.find((j) => j.handle === handle)) ??
      null,
    [handle, jewellery, isLive, embedded, snapshot],
  );
  const snapshotPending = needSnapshot && snapshot === null;
  const isMobile = useIsMobile();
  const { toggleItem, isWishlisted } = useWishlist();
  const { addItem, setDrawerOpen, isDrawerOpen, isLoading: cartLoading } = useCart();

  /* Naira's palette for everything on screen while this page is open,
     including the bag and dialogs, which render outside the page. */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("nf-next");
    return () => root.classList.remove("nf-next");
  }, []);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/jewellery");
  };

  const [selectedSize, setSelectedSize] = useState<string>("One Size");
  const sizedCategory = piece?.category === "Rings";
  const [reviewWall, setReviewWall] = useState<ReviewWall | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("@/data/reviewWall")
      .then((module) => !cancelled && setReviewWall(module))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const pieceName = piece?.name;
  const rating = useMemo(() => {
    if (!pieceName) return null;
    if (reviewWall) return reviewWall.reviewSummary(pieceName, "jewellery");
    return embedded?.piece.name === pieceName ? embedded.rating : null;
  }, [pieceName, reviewWall, embedded]);
  useEffect(() => {
    setSelectedSize(sizedCategory ? "6" : "One Size");
  }, [sizedCategory, piece?.handle]);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [tab, setTab] = useState<TabId>("details");
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  const stickyBarRef = useRef<HTMLDivElement>(null);

  /* A dated promise, recomputed by every real visitor; automated captures
     keep the range (see JewelDetail.tsx). */
  const [arrivesBy, setArrivesBy] = useState<string | null>(null);
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.webdriver) return;
    setArrivesBy(deliveryRangeFromNow());
  }, []);
  const [heartPopped, setHeartPopped] = useState(false);

  useEffect(() => {
    if (!piece) return;
    trackPixel(
      "ViewContent",
      productParams({
        id: piece.handle,
        variantId: piece.variantId,
        name: piece.name,
        price: piece.price,
        category: piece.category,
      }),
    );
  }, [piece?.handle]);

  /* The phone's buy bar shows whenever the Add to cart block is off screen,
     but never over the price and the facts under it. */
  useEffect(() => {
    const check = () => {
      const target = document.getElementById("product-actions");
      if (!target) return;
      const r = target.getBoundingClientRect();
      const offScreen = r.bottom < 0 || r.top > window.innerHeight;
      const price = document.getElementById("product-facts") ?? document.getElementById("product-price");
      const barHeight = stickyBarRef.current?.offsetHeight ?? 72;
      const priceClear = !price || price.getBoundingClientRect().bottom < window.innerHeight - barHeight;
      setStickyBarVisible(offScreen && priceClear);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
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

  /* The counter follows the swipe, read once per frame. */
  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;
    const el = scrollRef.current;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!el.offsetWidth) return;
        const next = Math.round(el.scrollLeft / el.offsetWidth);
        setSelectedImage((cur) => (cur === next ? cur : next));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isMobile, images.length]);

  /* Wait for the catalogue before calling a handle missing (see JewelDetail.tsx). */
  if (!piece) {
    if (catalogueLoading || snapshotPending) return <JewelDetailSkeleton />;
    return <Navigate to="/jewellery" replace />;
  }

  const wishlisted = isWishlisted(piece.handle);
  const adjustable = isAdjustableRing(piece.handle);
  const soldOut = piece.availableForSale === false && !adjustable;
  const isRing = piece.category === "Rings";
  const finish = finishOf(piece);
  const stone = stoneOf(piece);
  const { specs, care: listedCare } = specsOf(piece);
  const size = sizeOf(specs);
  const soldToday = dailySoldCount(piece.handle);
  const enquiryHref = jewelleryEnquiryUrl(piece.name);
  const sizedEnquiryHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Naira Flore, I'd love to order the "${piece.name}"${isRing ? ` in size ${selectedSize}` : ""} (qty ${quantity}). Could you share availability and next steps?`,
  )}`;

  const cartItem = () => ({
    id: piece.handle,
    variantId: piece.variantId,
    name: piece.name,
    price: piece.price,
    priceLabel: piece.priceLabel,
    currencyCode: "INR",
    image: piece.image,
    size: isRing ? `US ${selectedSize}` : undefined,
  });

  const handleAddToCart = async () => {
    await addItem(cartItem(), quantity);
    setDrawerOpen(true);
  };

  /* Sold-out pieces take pre-orders: the cart first, WhatsApp if Shopify refuses. */
  const handlePreOrder = async () => {
    const added = await addItem(cartItem(), quantity).catch(() => false);
    if (added) setDrawerOpen(true);
    else window.open(sizedEnquiryHref, "_blank", "noopener,noreferrer");
  };

  const handleWishlist = () => {
    if (!wishlisted) setHeartPopped(true);
    toggleItem({ id: piece.handle, name: piece.name, price: piece.priceLabel, image: piece.image });
  };

  const canonical = `https://nairaflore.com/jewellery/${piece.handle}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: piece.name,
    description: piece.blurb,
    brand: { "@type": "Brand", name: "Naira Flore" },
    category: piece.category,
    image: [piece.image],
    material: piece.materials,
    url: canonical,
    sku: piece.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: piece.price,
      priceValidUntil: PRICE_VALID_UNTIL,
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Naira Flore" },
      url: canonical,
    },
  };

  const heart = (
    <Heart
      size={17}
      strokeWidth={1.6}
      className={heartPopped ? "heart-pop" : undefined}
      onAnimationEnd={() => setHeartPopped(false)}
      style={{
        color: wishlisted ? "var(--nf-gold-deep)" : "var(--nf-ink)",
        fill: wishlisted ? "var(--nf-gold-deep)" : "none",
      }}
    />
  );
  /* Square, like every corner on the site (tailwind.config.ts sets all radii to 0). */
  const overlayButton =
    "press-scale z-10 flex h-10 w-10 items-center justify-center bg-nf-ivory/90 shadow-[0_2px_10px_-4px_rgb(var(--nf-ink-rgb)/0.35)] backdrop-blur-sm";

  /* The first photo shares one srcset between the two galleries, so it is
     downloaded once whichever the screen shows (see JewelDetail.tsx). */
  const HERO_WIDTHS = [480, 600, 720, 800, 900, 1000, 1200, 1400];
  const HERO_SIZES = "(max-width: 1024px) 100vw, 50vw";
  const prerendering = typeof navigator !== "undefined" && navigator.webdriver;

  const MobileGallery = (
    <div className="relative">
      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
      >
        {images.map((img, i) => (
          <button
            type="button"
            key={i}
            onClick={() => openLightbox(i)}
            className="block w-full shrink-0 cursor-zoom-in snap-center bg-nf-ivory-deep p-0"
            style={{ aspectRatio: MOBILE_FRAME, scrollSnapStop: "always" }}
            aria-label={`Open ${piece.name} image ${i + 1} full screen`}
          >
            {(i === 0 || !prerendering) && (
              <img
                src={shopifyImage(img, 900)}
                srcSet={shopifySrcSet(img, i === 0 ? HERO_WIDTHS : [480, 720, 900, 1200]) || undefined}
                sizes={i === 0 ? HERO_SIZES : "100vw"}
                alt={`${piece.name} view ${i + 1}`}
                className="h-full w-full object-cover"
                width={900}
                height={1200}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding={i === 0 ? "sync" : "async"}
              />
            )}
          </button>
        ))}
      </div>
      <button type="button" onClick={handleWishlist} className={`${overlayButton} absolute right-4 top-3`} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
        {heart}
      </button>
      {images.length > 1 && (
        <span
          className="pointer-events-none absolute bottom-3 left-3 z-10 bg-nf-ivory/85 px-2.5 py-1 font-nf-label text-[11px] tabular-nums tracking-nf-8 text-nf-ink backdrop-blur-sm"
          aria-hidden="true"
        >
          {selectedImage + 1} / {images.length}
        </span>
      )}
    </div>
  );

  const DesktopGallery = (() => {
    const unique = Array.from(new Set(images)).slice(0, 4);
    const count = unique.length;
    const gridClass =
      count <= 1 ? "grid grid-cols-1 grid-rows-1" : count === 2 ? "grid grid-cols-1 grid-rows-2" : "grid grid-cols-2 grid-rows-2";
    return (
      <div className="relative h-full min-h-full w-full">
        <div className={`${gridClass} h-full min-h-full gap-[4px]`}>
          {unique.map((img, i) => (
            <button
              type="button"
              key={img}
              onClick={() => openLightbox(i)}
              className={`relative block min-h-0 w-full cursor-zoom-in overflow-hidden bg-nf-ivory-deep p-0 ${count === 3 && i === 0 ? "col-span-2" : ""}`}
              style={{ height: "100%" }}
              aria-label={`Open ${piece.name} image ${i + 1} full screen`}
            >
              <img
                src={shopifyImage(img, i === 0 ? 900 : 1000)}
                srcSet={shopifySrcSet(img, i === 0 ? HERO_WIDTHS : [600, 800, 1000, 1400]) || undefined}
                sizes={HERO_SIZES}
                alt={`${piece.name} view ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                width={1000}
                height={1000}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding={i === 0 ? "sync" : "async"}
              />
            </button>
          ))}
        </div>
        <button type="button" onClick={handleWishlist} className={`${overlayButton} absolute right-4 top-4`} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
          {heart}
        </button>
      </div>
    );
  })();

  const ogImageUrl = absoluteUrl(shopifyOgImage(piece.image));

  return (
    <div className="min-h-screen bg-nf-ivory text-nf-ink">
      <Helmet>
        <title>{`Preview · ${piece.name} | Naira Flore`}</title>
        {/* Under review: kept out of search, pointing at the live page. */}
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${piece.name} · Demi-Gold Jewellery | Naira Flore`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content={String(OG_IMAGE_SIZE)} />
        <meta property="og:image:height" content={String(OG_IMAGE_SIZE)} />
      </Helmet>
      <JsonLd data={structuredData} />

      {/* Breadcrumb (desktop) */}
      <div className="mx-auto hidden max-w-[1400px] items-center justify-between gap-4 px-6 pb-3 pt-[126px] md:flex lg:pt-[136px]">
        <nav className="flex items-center gap-2 text-[11px] tracking-nf-4 text-nf-ink/55">
          <Link to="/" className="hover:text-nf-ink">Home</Link>
          <span>/</span>
          <Link to="/jewellery" className="hover:text-nf-ink">Jewellery</Link>
          <span>/</span>
          <span className="text-nf-ink/80">{piece.name}</span>
        </nav>
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-nf-16 text-nf-ink/60 transition-colors hover:text-nf-ink"
          aria-label="Go back"
        >
          <ArrowLeft size={13} strokeWidth={1.6} /> Back
        </button>
      </div>

      {/* Phone gallery. Both galleries are in the page and CSS shows one (see JewelDetail.tsx). */}
      <div className="relative pt-[107px] md:hidden">
        <button type="button" onClick={goBack} className={`${overlayButton} absolute left-4 top-[119px] z-20`} aria-label="Go back">
          <ArrowLeft size={17} strokeWidth={1.6} className="text-nf-ink" />
        </button>
        <div className="md:hidden">{MobileGallery}</div>
      </div>

      <div className="mx-auto max-w-[1400px] pb-16 md:px-6">
        <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="hidden md:block">{DesktopGallery}</div>

          <div className="flex w-full flex-col items-stretch px-4 pt-5 md:pt-6 lg:px-10 lg:pt-2 xl:px-12">
            {/* Category and rating; the count always travels with the average. */}
            <div className="flex min-h-[24px] items-center justify-between gap-3">
              <p className={label}>{piece.category}</p>
              {rating && (
                <a
                  href="#customer-reviews"
                  className="-mr-1 inline-flex shrink-0 items-center gap-1 py-1 pl-2 text-[12px] text-nf-ink/60"
                  aria-label={`Rated ${rating.rating} out of 5 from ${rating.count} reviews. Jump to reviews.`}
                >
                  <span aria-hidden="true" className="text-nf-gold">★</span>
                  <span className="font-medium text-nf-ink">{rating.rating}</span>
                  <span className="underline decoration-nf-ink/25 underline-offset-4">{rating.count} reviews</span>
                </a>
              )}
            </div>

            <h1 className="mt-2 font-cormorant text-[27px] font-semibold leading-[1.1] text-nf-ink md:text-[32px] lg:text-[36px]">
              {piece.name}
            </h1>

            <div id="product-price" className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="font-cormorant text-[24px] font-semibold leading-none text-nf-ink md:text-[27px]">{piece.priceLabel}</span>
              {piece.compareAtLabel && (
                <>
                  <span className="text-[13px] text-nf-ink/45 line-through">{piece.compareAtLabel}</span>
                  <span className="font-nf-label text-[11px] font-medium uppercase tracking-nf-8 text-nf-gold-shadow">
                    {discountPercent(piece)}% off
                  </span>
                </>
              )}
              <span className="text-[11px] tracking-nf-4 text-nf-ink/55">incl. taxes</span>
            </div>

            {/* Offer and delivery (with COD) in the first screen, then today's
                sales as one quiet line of the same block. */}
            <div className="mt-3">
              <PdpBuyFacts arrivesBy={arrivesBy} soldOut={soldOut} />
              <p className="mt-1 flex items-start gap-2 text-[12px] leading-[1.45] text-nf-ink/60">
                <Sparkles size={15} strokeWidth={1.6} className="mt-px shrink-0 text-nf-gold-deep" aria-hidden="true" />
                {soldToday} {soldToday === 1 ? "piece" : "pieces"} sold in the last 24 hours
              </p>
            </div>

            {/* Size and finish, the way Nishorama and Bluorng show size: one
                labelled row next to the choice, not inside a fold-down. */}
            <div className="mt-4 border-t border-nf-gold/25">
              {isRing ? (
                <div className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className={label}>Ring size · US</span>
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="-mr-2 inline-flex min-h-[40px] items-center px-2 text-[12px] text-nf-ink underline decoration-nf-gold underline-offset-4"
                    >
                      Size guide
                    </button>
                  </div>
                  <div role="radiogroup" aria-label="Ring size, US" className="mt-1 flex flex-wrap gap-2">
                    {ringSizesFor(piece.handle).map((s) => {
                      const active = selectedSize === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSelectedSize(s.value)}
                          className={`min-h-[46px] min-w-[68px] border px-4 text-[13px] font-medium transition-colors duration-150 ${
                            active
                              ? "border-[var(--nf-cta)] bg-[var(--nf-cta)] text-nf-ivory"
                              : "border-nf-ink/20 bg-transparent text-nf-ink hover:border-nf-ink/45"
                          }`}
                        >
                          {s.value}
                          {s.status === "preorder" && (
                            <span className="block text-[9px] font-normal uppercase tracking-nf-8 opacity-75">Pre-order</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* A sold-out ring is made to order in every size; the line
                      under Pre-order says when it ships. */}
                  {!soldOut && (
                    <p className="mt-2 text-[12px] leading-[1.6] text-nf-ink/65">
                      {adjustable
                        ? `US ${selectedSize} ships now. ${ADJUSTABLE_FIT_NOTE}`
                        : selectedSize === "6"
                          ? "US 6 is in stock and ships now."
                          : `US ${selectedSize} is a pre-order, delivered in 45 days.`}
                    </p>
                  )}
                </div>
              ) : (
                size && (
                  <div className="flex items-baseline justify-between gap-4 border-b border-nf-gold/25 py-2.5">
                    <span className={label}>Size</span>
                    <span className="text-right text-[13px] text-nf-ink">{size}</span>
                  </div>
                )
              )}
              <div className={`flex items-baseline justify-between gap-4 py-2.5 ${isRing ? "mt-3 border-t border-nf-gold/25" : ""}`}>
                <span className={label}>Finish</span>
                <span className="text-right text-[13px] text-nf-ink">
                  {finish}
                  <span className="text-nf-ink/60"> · anti-tarnish · skin-safe</span>
                </span>
              </div>
            </div>
            <RingSizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} highlightSize={selectedSize} />

            {/* Quantity and Add to cart, then one line of assurances. */}
            <div id="product-actions" className="mt-2">
              <div className="flex gap-2">
                <div className="flex h-[54px] w-[34%] max-w-[150px] shrink-0 items-center justify-between border border-nf-ink/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="press-scale flex h-full min-w-11 items-center justify-center text-nf-ink"
                  >
                    <Minus size={15} strokeWidth={1.6} />
                  </button>
                  <span className="text-[15px] font-medium text-nf-ink" aria-live="polite">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="press-scale flex h-full min-w-11 items-center justify-center text-nf-ink"
                  >
                    <Plus size={15} strokeWidth={1.6} />
                  </button>
                </div>
                <button
                  onClick={soldOut ? handlePreOrder : handleAddToCart}
                  disabled={cartLoading}
                  className="press-scale inline-flex h-[54px] flex-1 items-center justify-center bg-[var(--nf-cta)] font-nf-label text-[12.5px] font-medium uppercase tracking-nf-16 text-nf-ivory transition-colors duration-200 hover:bg-[var(--nf-cta-hover)] disabled:opacity-60"
                >
                  {soldOut ? "Pre-order now" : "Add to cart"}
                </button>
              </div>
              {soldOut && (
                <a
                  href={sizedEnquiryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press-scale mt-2 inline-flex h-[48px] w-full items-center justify-center gap-2 border border-nf-ink/25 font-nf-label text-[11.5px] uppercase tracking-nf-16 text-nf-ink"
                >
                  <MessageSquare size={13} strokeWidth={1.6} /> Reserve on WhatsApp
                </a>
              )}
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11.5px] tracking-nf-4 text-nf-ink/60">
                <ShieldCheck size={13} strokeWidth={1.6} className="shrink-0 text-nf-gold-deep" aria-hidden="true" />
                {soldOut ? (
                  "Hand-finished and shipped within 2 weeks"
                ) : (
                  <span>
                    Secure checkout · COD · <Link to="/exchange-return-policy" className="underline decoration-nf-ink/25 underline-offset-4">7-day returns</Link>
                  </span>
                )}
              </p>
            </div>

            {/* Description, care and delivery as three tabs (Bluorng's pattern).
                Every panel stays in the page, so all of it is in the HTML. */}
            <div className="mt-8">
              <div role="tablist" aria-label="About this piece" className="flex border-b border-nf-gold/30">
                {TABS.map((t) => {
                  const on = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      id={`pdp-tab-${t.id}`}
                      aria-selected={on}
                      aria-controls={`pdp-panel-${t.id}`}
                      tabIndex={on ? 0 : -1}
                      onClick={() => setTab(t.id)}
                      onKeyDown={(e) => {
                        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                        const at = TABS.findIndex((x) => x.id === tab);
                        const next = TABS[(at + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
                        setTab(next.id);
                        document.getElementById(`pdp-tab-${next.id}`)?.focus();
                      }}
                      className={`-mb-px min-h-[46px] flex-1 border-b-2 font-nf-label text-[11px] uppercase tracking-nf-16 transition-colors ${
                        on ? "border-nf-gold-deep text-nf-ink" : "border-transparent text-nf-ink/50 hover:text-nf-ink/80"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div id="pdp-panel-details" role="tabpanel" aria-labelledby="pdp-tab-details" hidden={tab !== "details"} className="pt-5">
                <p className="text-[14px] leading-[1.75] text-nf-ink/80">{piece.blurb}</p>
                {specs.length > 0 && (
                  <dl className="mt-5 border-t border-nf-gold/20">
                    {specs.map((s, i) => (
                      <div key={i} className="grid grid-cols-[34%_1fr] gap-3 border-b border-nf-gold/20 py-2.5 text-[13px] leading-[1.55]">
                        <dt className="font-nf-label text-[10.5px] uppercase tracking-nf-10 text-nf-gold-shadow">{s.label || "Detail"}</dt>
                        <dd className="text-nf-ink/85">{s.value}</dd>
                      </div>
                    ))}
                    {stone && !specs.some((s) => /stone/i.test(s.label)) && (
                      <div className="grid grid-cols-[34%_1fr] gap-3 border-b border-nf-gold/20 py-2.5 text-[13px]">
                        <dt className="font-nf-label text-[10.5px] uppercase tracking-nf-10 text-nf-gold-shadow">Stone</dt>
                        <dd className="text-nf-ink/85">{stone}</dd>
                      </div>
                    )}
                  </dl>
                )}
                {/* The spec list names plating and metal; the summary line is for pieces without one. */}
                {specs.length === 0 && <p className="mt-4 text-[12.5px] leading-[1.6] text-nf-ink/60">{piece.materials}</p>}
                {piece.stylingTip && (
                  <p className="mt-4 border-l-2 border-nf-gold/60 pl-3 font-nf-editorial text-[16px] italic leading-[1.5] text-nf-ink/80">
                    {piece.stylingTip}
                  </p>
                )}
              </div>

              <div id="pdp-panel-care" role="tabpanel" aria-labelledby="pdp-tab-care" hidden={tab !== "care"} className="pt-5">
                <div className="space-y-2.5 text-[14px] leading-[1.75] text-nf-ink/80">
                  <p>{piece.care ?? listedCare ?? "Store in the pouch, avoid perfume and chlorinated water, and wipe gently after wear."}</p>
                  <p>Covered by our 2-year plating assurance.</p>
                </div>
              </div>

              <div id="pdp-panel-delivery" role="tabpanel" aria-labelledby="pdp-tab-delivery" hidden={tab !== "delivery"} className="pt-5">
                <div className="space-y-2.5 text-[14px] leading-[1.75] text-nf-ink/80">
                  <p>
                    {arrivesBy && !soldOut ? `Order today and it arrives by ${arrivesBy}. ` : `${PREORDER_NOTE} `}
                    Free insured shipping across India, dispatched from our Mumbai atelier.
                  </p>
                  <p>
                    Cash on delivery available. 7-day returns —{" "}
                    <Link to="/exchange-return-policy" className="underline decoration-nf-gold underline-offset-4">
                      read the policy
                    </Link>
                    .
                  </p>
                </div>
                <PincodeChecker />
                <a
                  href={isRing ? sizedEnquiryHref : enquiryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-[13px] text-nf-ink underline decoration-nf-gold underline-offset-4"
                >
                  <MessageSquare size={14} strokeWidth={1.6} className="text-nf-gold-deep" /> Questions? Chat with us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="min-h-[240px] bg-nf-ivory" aria-hidden="true" />}>
        <CustomerReviews productName={piece.name} variant="jewellery" />
      </Suspense>

      <PressMarquee />

      <Suspense fallback={<div className="min-h-[420px] bg-nf-ivory-deep md:hidden" aria-hidden="true" />}>
        <ReelShopNext hrefFor={previewProductPath} />
      </Suspense>
      <Suspense fallback={null}>
        <FomoPopup
          quiet
          hrefFor={previewProductPath}
          suppressed={isDrawerOpen || lightboxOpen || sizeGuideOpen}
          mobileStickyVisible={stickyBarVisible}
        />
      </Suspense>

      <Footer compact slim />

      {/* Phone buy bar, revealed once the Add to cart block is off screen. */}
      <div
        ref={stickyBarRef}
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-nf-gold/25 bg-nf-ivory/95 px-3 pt-2 backdrop-blur transition-[transform,visibility] duration-300 ease-out md:hidden"
        style={{
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
          className="press-scale flex h-[48px] w-[48px] shrink-0 items-center justify-center border border-nf-ink/20"
        >
          {heart}
        </button>
        <button
          onClick={soldOut ? handlePreOrder : handleAddToCart}
          disabled={cartLoading}
          className="press-scale inline-flex h-[48px] flex-1 items-center justify-center gap-2 bg-[var(--nf-cta)] font-nf-label text-[12px] font-medium uppercase tracking-nf-16 text-nf-ivory hover:bg-[var(--nf-cta-hover)] disabled:opacity-60"
        >
          {soldOut ? "Pre-order" : "Add to cart"}
          <span className="font-normal normal-case tracking-nf-4 text-nf-ivory/80">· {piece.priceLabel}</span>
        </button>
      </div>

      <ImageLightbox images={images} name={piece.name} open={lightboxOpen} initialIndex={lightboxIndex} onOpenChange={setLightboxOpen} />
    </div>
  );
};

export default JewelDetailNext;
