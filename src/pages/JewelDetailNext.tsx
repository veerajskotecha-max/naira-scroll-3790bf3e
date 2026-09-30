import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Gift, Heart, Leaf, MessageSquare, Plus, Sparkles } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import Footer from "@/components/Footer";
import PincodeChecker from "@/components/product/PincodeChecker";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { AtelierSkeleton } from "@/components/ui/atelier-skeleton";
import RingSizeGuideModal from "@/components/jewellery/RingSizeGuideModal";
import PressMarquee from "@/components/jewellery/PressMarquee";
import { discountPercent } from "@/components/jewellery/JewelPriceTag";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { useReels } from "@/hooks/useReels";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { isAdjustableRing, ADJUSTABLE_FIT_NOTE } from "@/data/ringFit";
import { jewelleryEnquiryUrl, WHATSAPP_NUMBER, PREORDER_NOTE, type JewelPiece } from "@/data/jewellery";
import { absoluteUrl } from "@/lib/absoluteUrl";
import { shopifyImage, shopifyOgImage, shopifySrcSet, OG_IMAGE_SIZE } from "@/lib/shopifyImage";
import { productParams, trackPixel } from "@/lib/pixel";
import { deliveryRangeFromNow } from "@/lib/serviceability";
import { isPreviewPath, previewProductPath } from "@/lib/preview";
import { completeTheLook, moreLikeThis } from "@/lib/pairings";
import { useBackToClose } from "@/hooks/useBackToClose";

/*
  The product page, at /jewellery/<handle> (and at /preview/jewellery/<handle>,
  kept out of search). It replaced JewelDetail.tsx, kept for now so the switch
  can be undone in one line in App.tsx.

  Same data, prices, cart and checkout as before. Set
  against Nishorama, Bluorng, Project Shades, Palmonas and GIVA, it keeps the
  first screen to what a decision needs and folds the rest away, the way
  Nishorama does:

    photo (and the reel the piece is in) → name and price → anti-tarnish,
    skin-friendly and its plating, as Palmonas badges them → ring size (rings
    only) → Add to cart → the gift box line → Details / Care / Delivery &
    returns, closed until asked for → complete the look → reviews → press →
    reels → more of the category.

  Colours are Naira's (ivory ground, ink, gold detail, deep-sage buttons); the
  html.nf-next class swaps the stock blue-grey palette the shared components
  draw from for the brand one, dialogs included. Small text is held to 4.5:1
  or better.

  Outside /preview/ it indexes, links to the product pages and carries the
  structured data and the embedded piece the pre-built page is drawn from.
*/

const CustomerReviews = lazy(() => import("@/components/CustomerReviews"));
const ReelShopNext = lazy(() => import("@/components/reels/ReelShopNext"));
const GalleryReel = lazy(() => import("@/components/reels/GalleryReel"));
const FomoPopup = lazy(() => import("@/components/FomoPopup"));

/* Square: 15 of the 16 hero photos are 1:1, and it keeps the name and price
   above the fold on a 390px phone (see JewelDetail.tsx). */
const MOBILE_FRAME = "1/1";
const PRICE_VALID_UNTIL = new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10);
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const finishOf = (piece: JewelPiece) => {
  const m = piece.materials.toLowerCase();
  const gold = m.includes("18k gold");
  const rhodium = m.includes("rhodium");
  if (gold && rhodium) return "18K gold & rhodium";
  if (gold) return "18K gold-tone";
  if (rhodium) return "Rhodium";
  return "Demi-gold";
};

/* The badges under the price. Every piece is sealed anti-tarnish over a
   hypoallergenic, nickel-free base (the anti-tarnish collection and the Care
   answers say the same); the plating is the piece's own. */
const platingBadge = (finish: string) =>
  finish === "Rhodium" ? "Rhodium-plated" : finish === "18K gold & rhodium" ? "Gold & rhodium" : finish;

/* A gold bar with a glint, drawn like the lucide icons around it. */
const Ingot = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 19h15l-2.8-7.5H7.3L4.5 19Z" />
    <path d="M8.6 15.3h6.8" />
    <path d="M12 8.6V5.6M8.5 9.4 7.1 7.3M15.5 9.4l1.4-2.1" />
  </svg>
);

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
   steel" and Care gets the piece's own care text. */
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

const label = "font-nf-label text-[9.5px] uppercase tracking-nf-24 text-nf-gold-text";
/* A fold-down's row, and its plus, which turns to a cross when open. */
const fold =
  "flex min-h-[50px] cursor-pointer list-none items-center justify-between font-nf-label text-[10px] uppercase tracking-nf-16 text-nf-ink [&::-webkit-details-marker]:hidden";
const foldMark = "shrink-0 text-nf-ink/70 transition-transform duration-200 group-open:rotate-45";

/* A suggested piece: photo, name, price, and a one-tap Add that opens the bag
   with the ladder already counting it. */
const PairingCard = ({ piece, href, compact = false }: { piece: JewelPiece; href: string; compact?: boolean }) => {
  const { addItem, setDrawerOpen, isLoading } = useCart();
  const [adding, setAdding] = useState(false);
  const add = async () => {
    setAdding(true);
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
      setDrawerOpen(true);
    } finally {
      setAdding(false);
    }
  };
  return (
    <article className="flex min-w-0 flex-col">
      <Link to={href} className="block aspect-square overflow-hidden bg-nf-ivory-deep">
        <img
          src={shopifyImage(piece.image, 360)}
          srcSet={shopifySrcSet(piece.image, [240, 360, 480]) || undefined}
          sizes={compact ? "30vw" : "(max-width: 768px) 44vw, 220px"}
          alt={piece.name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          width={360}
          height={360}
        />
      </Link>
      <Link to={href} className="mt-2 line-clamp-2 min-h-[34px] font-cormorant text-[13px] leading-[1.2] text-nf-ink">
        {piece.name}
      </Link>
      <p className="mt-0.5 text-[12px] text-nf-ink/75">{piece.priceLabel}</p>
      {compact && (
        <button
          type="button"
          onClick={add}
          disabled={adding || isLoading}
          aria-label={`Add ${piece.name} to bag`}
          className="press-scale mt-2 h-8 w-full border border-[var(--nf-cta)] font-nf-label text-[10px] uppercase tracking-nf-16 text-[var(--nf-cta)] transition-colors hover:bg-[var(--nf-cta)] hover:text-nf-ivory disabled:opacity-60"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      )}
    </article>
  );
};

const JewelDetailNext = () => {
  const { handle } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inPreview = isPreviewPath(pathname);
  const hrefFor = useCallback((h: string) => (inPreview ? previewProductPath(h) : `/jewellery/${h}`), [inPreview]);
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

  /* Back inside Naira, never off the site. history.length counts every page
     the tab has shown, so a shopper who came from Google, WhatsApp or an ad
     in the same tab was sent back there, and one in a new tab to a blank one.
     React Router numbers its own entries from 0; above 0, or straight after
     another Naira page, the step back is ours. Otherwise go to the jewellery. */
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    let fromNaira = false;
    try {
      fromNaira = !!document.referrer && new URL(document.referrer).origin === window.location.origin;
    } catch {
      /* no usable referrer */
    }
    if (idx > 0 || (fromNaira && window.history.length > 1)) navigate(-1);
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

  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);
  /* The phone's back closes the photo zoom and the size guide, as it does the
     bag, instead of leaving the piece behind them (see useBackToClose). */
  const zoom = useBackToClose("nfZoom", lightboxOpen, setLightboxOpen);
  const guide = useBackToClose("nfSizeGuide", sizeGuideOpen, setSizeGuideOpen);
  /* The rating scrolls to the reviews without a history step of its own, so
     back and ← still go where the shopper came from. */
  const toReviews = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("customer-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
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

  /* The reel a piece appears in becomes the gallery's last slide. Its list is
     a small request, asked for once the first screen has settled (the video
     itself only when the slide is reached); never in the pre-built page. */
  const [reelsWanted, setReelsWanted] = useState(false);
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.webdriver) return;
    const timer = window.setTimeout(() => setReelsWanted(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);
  const { data: reels } = useReels(reelsWanted);
  const galleryReel = useMemo(
    () => (piece ? reels?.find((r) => r.videoUrl && r.products.some((p) => p.handle === piece.handle)) ?? null : null),
    [reels, piece],
  );

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

  /* The phone's buy bar shows whenever Add to cart is not fully on screen —
     so a buy button is visible from the moment the page opens — but never
     over the price. It watches the button itself: the gift line below it
     reaching past the screen's edge put the bar over a button in full view. */
  useEffect(() => {
    const check = () => {
      const target = document.querySelector("#product-actions > button");
      if (!target) return;
      const r = target.getBoundingClientRect();
      const notFullyShown = r.bottom < 0 || r.bottom > window.innerHeight;
      const price = document.getElementById("product-price");
      const barHeight = stickyBarRef.current?.offsetHeight ?? 72;
      const priceClear = !price || price.getBoundingClientRect().bottom < window.innerHeight - barHeight;
      setStickyBarVisible(notFullyShown && priceClear);
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
  const slideCount = images.length + (galleryReel ? 1 : 0);

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

  const pairings = useMemo(() => (piece ? completeTheLook(piece, jewellery, 3) : []), [piece, jewellery]);
  const similar = useMemo(() => (piece ? moreLikeThis(piece, jewellery, 8) : []), [piece, jewellery]);

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
  const saving = piece.compareAtPrice && piece.compareAtPrice > piece.price ? piece.compareAtPrice - piece.price : 0;
  const steel = /stainless steel/i.test(piece.materials);
  const waterproof = /waterproof/i.test(piece.materials) || /waterproof/i.test(listedCare ?? "");
  const enquiryHref = jewelleryEnquiryUrl(piece.name);
  const sizedEnquiryHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Naira Flore, I'd love to order the "${piece.name}"${isRing ? ` in size ${selectedSize}` : ""} Could you share availability and next steps?`,
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
    await addItem(cartItem());
    setDrawerOpen(true);
  };

  /* Sold-out pieces take pre-orders: the cart first, WhatsApp if Shopify refuses. */
  const handlePreOrder = async () => {
    const added = await addItem(cartItem()).catch(() => false);
    if (added) setDrawerOpen(true);
    else window.open(sizedEnquiryHref, "_blank", "noopener,noreferrer");
  };

  const handleWishlist = () => {
    if (!wishlisted) setHeartPopped(true);
    toggleItem({ id: piece.handle, name: piece.name, price: piece.priceLabel, image: piece.image });
  };

  /* Tarnish and skin, answered from the piece's own materials, in Care. */
  const care = [
    {
      q: "Will it tarnish?",
      a: `It is ${finish === "Demi-gold" ? "demi-gold" : finish.toLowerCase()} finished${steel ? " on surgical stainless steel" : ""}${
        waterproof ? ", waterproof and made not to tarnish" : ", made to resist tarnish"
      }, and the finish is covered by our 2-year plating assurance.`,
    },
    {
      q: "Sensitive skin?",
      a: `Every Naira piece is made to be skin-safe for everyday wear${steel ? ", on a surgical stainless steel base" : ""}. If it does not suit you, return it within 7 days.`,
    },
  ];

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
  const title = `${piece.name} · Demi-Gold Jewellery | Naira Flore`;
  const ogImageUrl = absoluteUrl(shopifyOgImage(piece.image));

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
    "press-scale z-10 flex h-10 w-10 items-center justify-center bg-nf-ivory/75 backdrop-blur-sm";

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
        {galleryReel && (
          <div
            className="relative w-full shrink-0 snap-center bg-nf-ink"
            style={{ aspectRatio: MOBILE_FRAME, scrollSnapStop: "always" }}
            aria-label={`${piece.name} in a Naira reel`}
          >
            <Suspense fallback={<div className="h-full w-full bg-nf-ink" />}>
              <GalleryReel reel={galleryReel} active={selectedImage === images.length} />
            </Suspense>
          </div>
        )}
      </div>
      <button type="button" onClick={handleWishlist} className={`${overlayButton} absolute right-4 top-3`} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
        {heart}
      </button>
      {slideCount > 1 && (
        <span
          className="pointer-events-none absolute bottom-3 left-3 z-10 bg-nf-ivory/85 px-2.5 py-1 font-nf-label text-[10.5px] tabular-nums tracking-nf-8 text-nf-ink backdrop-blur-sm"
          aria-hidden="true"
        >
          {selectedImage + 1} / {slideCount}
        </span>
      )}
      {galleryReel && selectedImage < images.length && (
        <span className="pointer-events-none absolute bottom-3 right-3 z-10 bg-nf-ivory/85 px-2.5 py-1 font-nf-label text-[10px] uppercase tracking-nf-16 text-nf-ink backdrop-blur-sm" aria-hidden="true">
          ▶ Video
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

  return (
    <div className="min-h-screen bg-nf-ivory text-nf-ink">
      <Helmet>
        <title>{inPreview ? `Preview · ${title}` : title}</title>
        <meta name="description" content={`${piece.name}, ${piece.blurb.slice(0, 130)}`} />
        <link rel="canonical" href={canonical} />
        {/* Under review at /preview/: kept out of search, pointing at the live page. */}
        <meta name="robots" content={inPreview ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={piece.blurb.slice(0, 150)} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content={String(OG_IMAGE_SIZE)} />
        <meta property="og:image:height" content={String(OG_IMAGE_SIZE)} />
        <meta property="og:image:alt" content={piece.name} />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content="Naira Flore" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={piece.blurb.slice(0, 150)} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>
      <JsonLd data={structuredData} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://nairaflore.com/" },
            { "@type": "ListItem", position: 2, name: "Jewellery", item: "https://nairaflore.com/jewellery" },
            { "@type": "ListItem", position: 3, name: piece.name, item: canonical },
          ],
        }}
      />
      {/* The piece the pre-built page was made from, read by the first render (see JewelDetail.tsx). */}
      <script
        type="application/json"
        id="nf-piece"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ piece, rating }).replace(/</g, "\\u003c") }}
      />

      {/* Breadcrumb (desktop) */}
      <div className="mx-auto hidden max-w-[1400px] items-center justify-between gap-4 px-6 pb-3 pt-[126px] md:flex lg:pt-[136px]">
        <nav className="flex items-center gap-2 text-[11px] tracking-nf-4 text-nf-ink/70">
          <Link to="/" className="hover:text-nf-ink">Home</Link>
          <span>/</span>
          <Link to="/jewellery" className="hover:text-nf-ink">Jewellery</Link>
          <span>/</span>
          <span className="text-nf-ink">{piece.name}</span>
        </nav>
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-nf-16 text-nf-ink/70 transition-colors hover:text-nf-ink"
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

      <div className="mx-auto max-w-[1400px] pb-12 md:px-6">
        <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* On a laptop the photos stay in view while the details scroll past
              them, sized to the screen so the lower row is never cut off. */}
          <div className="hidden md:block lg:sticky lg:top-[140px] lg:h-[calc(100vh-156px)] lg:self-start">{DesktopGallery}</div>

          <div className="flex w-full flex-col items-stretch px-4 pt-5 md:pt-6 lg:px-10 lg:pt-2 xl:px-12">
            {/* Category and rating; the count always travels with the average. */}
            <div className="flex min-h-[24px] items-center justify-between gap-3">
              <p className={label}>{piece.category}</p>
              {rating && (
                <a
                  href="#customer-reviews"
                  onClick={toReviews}
                  className="-mr-1 inline-flex shrink-0 items-center gap-1 py-1 pl-2 text-[11.5px] text-nf-ink/75"
                  aria-label={`Rated ${rating.rating} out of 5 from ${rating.count} reviews. Jump to reviews.`}
                >
                  <span aria-hidden="true" className="text-nf-gold-deep">★</span>
                  <span className="font-medium text-nf-ink">{rating.rating}</span>
                  <span className="underline decoration-nf-ink/25 underline-offset-4">{rating.count} reviews</span>
                </a>
              )}
            </div>

            <h1 className="mt-2 font-cormorant text-[22px] font-semibold leading-[1.1] text-nf-ink md:text-[26px] lg:text-[30px]">
              {piece.name}
            </h1>

            {/* Price, the MRP it replaces and the saving, as the percentage shoppers compare. */}
            <div id="product-price" className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="font-cormorant text-[19px] font-semibold leading-none text-nf-ink md:text-[22px]">{piece.priceLabel}</span>
              {piece.compareAtLabel && saving > 0 && (
                <>
                  <span className="text-[12px] text-nf-ink/65 line-through">{piece.compareAtLabel}</span>
                  <span className="font-nf-label text-[10.5px] font-medium uppercase tracking-nf-8 text-nf-gold-text">
                    {discountPercent(piece)}% off
                  </span>
                </>
              )}
              <span className="text-[10.5px] tracking-nf-4 text-nf-ink/65">incl. taxes</span>
            </div>

            {/* Palmonas' badges as square chips, the brand's corner. One row on a
                360px phone, sized for the widest plating label. */}
            <ul aria-label="Made to last" className="mt-3.5 flex flex-wrap gap-[5px]">
              {[
                { icon: <Sparkles size={11} strokeWidth={1.7} />, text: "Anti-tarnish" },
                { icon: <Leaf size={11} strokeWidth={1.7} />, text: "Skin-friendly" },
                { icon: <Ingot />, text: platingBadge(finish) },
              ].map(({ icon, text }) => (
                <li
                  key={text}
                  className="inline-flex items-center gap-1 border border-nf-gold/30 bg-nf-ivory-deep/70 py-[3px] pl-[3px] pr-2 text-[10px] leading-none text-nf-ink/80 min-[375px]:text-[10.5px]"
                >
                  <span aria-hidden="true" className="flex h-[18px] w-[18px] items-center justify-center bg-nf-blush/35 text-nf-gold-text">
                    {icon}
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            {/* Ring size, the one choice a piece needs before the bag. Every
                other detail waits in the fold-downs below, as on Nishorama. */}
            {isRing && (
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className={label}>Ring size · US</span>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="-mr-2 inline-flex min-h-[40px] items-center px-2 text-[11.5px] text-nf-ink underline decoration-nf-gold underline-offset-4"
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
                        className={`min-h-[42px] min-w-[68px] border px-4 text-[12px] font-medium transition-colors duration-150 ${
                          active
                            ? "border-[var(--nf-cta)] bg-[var(--nf-cta)] text-nf-ivory"
                            : "border-nf-ink/25 bg-transparent text-nf-ink hover:border-nf-ink/50"
                        }`}
                      >
                        {s.value}
                        {s.status === "preorder" && (
                          <span className="block text-[9px] font-normal uppercase tracking-nf-8 opacity-80">Pre-order</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* A sold-out ring is made to order in every size; the line
                    under Pre-order says when it ships. */}
                {!soldOut && (
                  <p className="mt-2 text-[11.5px] leading-[1.6] text-nf-ink/75">
                    {adjustable
                      ? `US ${selectedSize} ships now. ${ADJUSTABLE_FIT_NOTE}`
                      : selectedSize === "6"
                        ? "US 6 is in stock and ships now."
                        : `US ${selectedSize} is a pre-order, delivered in 45 days.`}
                  </p>
                )}
              </div>
            )}
            <RingSizeGuideModal isOpen={sizeGuideOpen} onClose={guide.requestClose} highlightSize={selectedSize} />

            {/* One button. How many is the bag's business (and the ladder's). */}
            <div id="product-actions" className="mt-2">
              <button
                onClick={soldOut ? handlePreOrder : handleAddToCart}
                disabled={cartLoading}
                className="press-scale inline-flex h-[50px] w-full items-center justify-center bg-[var(--nf-cta)] font-nf-label text-[11.5px] font-medium uppercase tracking-nf-16 text-nf-ivory transition-colors duration-200 hover:bg-[var(--nf-cta-hover)] disabled:opacity-60"
              >
                {soldOut ? "Pre-order now" : "Add to cart"}
              </button>
              {soldOut && (
                <a
                  href={sizedEnquiryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press-scale mt-2 inline-flex h-[44px] w-full items-center justify-center gap-2 border border-nf-ink/25 font-nf-label text-[11px] uppercase tracking-nf-16 text-nf-ink"
                >
                  <MessageSquare size={13} strokeWidth={1.6} /> Reserve on WhatsApp
                </a>
              )}
              <p className="mt-3 flex items-center justify-center gap-2 text-center text-[11.5px] text-nf-ink/80">
                <Gift size={14} strokeWidth={1.6} className="shrink-0 text-nf-gold-deep" aria-hidden="true" />
                {soldOut ? "Hand-finished for you and shipped within 2 weeks, gift-boxed" : "Gift-ready: every piece arrives in the Naira gift box"}
              </p>
            </div>

            {/* Details, care and delivery as fold-downs, closed until asked for
                (Nishorama's pattern): the first screen stays the photo, the
                name, the price and the button. Every panel stays in the page,
                so all of it is in the HTML. */}
            <div className="mt-8 border-t border-nf-gold/15">
              <details className="group border-b border-nf-gold/15">
                <summary className={fold}>
                  Details
                  <Plus size={14} strokeWidth={1.4} className={foldMark} aria-hidden="true" />
                </summary>
                <div id="pdp-panel-details" className="pb-6">
                  <p className="text-[13px] leading-[1.7] text-nf-ink/85">{piece.blurb}</p>
                  {specs.length > 0 && (
                    <dl className="mt-5 border-t border-nf-gold/15">
                      {specs.map((s, i) => (
                        <div key={i} className="grid grid-cols-[34%_1fr] gap-3 border-b border-nf-gold/15 py-2.5 text-[12px] leading-[1.55]">
                          <dt className="font-nf-label text-[9.5px] uppercase tracking-nf-10 text-nf-gold-text">{s.label || "Detail"}</dt>
                          <dd className="text-nf-ink/90">{s.value}</dd>
                        </div>
                      ))}
                      {stone && !specs.some((s) => /stone/i.test(s.label)) && (
                        <div className="grid grid-cols-[34%_1fr] gap-3 border-b border-nf-gold/15 py-2.5 text-[12px]">
                          <dt className="font-nf-label text-[9.5px] uppercase tracking-nf-10 text-nf-gold-text">Stone</dt>
                          <dd className="text-nf-ink/90">{stone}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                  {/* The spec list names plating and metal; the summary line is for pieces without one. */}
                  {specs.length === 0 && <p className="mt-4 text-[12px] leading-[1.6] text-nf-ink/75">{piece.materials}</p>}
                  {piece.stylingTip && (
                    <p className="mt-4 border-l-2 border-nf-gold/60 pl-3 font-nf-editorial text-[15px] italic leading-[1.5] text-nf-ink/85">
                      {piece.stylingTip}
                    </p>
                  )}
                </div>
              </details>

              <details className="group border-b border-nf-gold/15">
                <summary className={fold}>
                  Care
                  <Plus size={14} strokeWidth={1.4} className={foldMark} aria-hidden="true" />
                </summary>
                <div id="pdp-panel-care" className="space-y-2.5 pb-6 text-[13px] leading-[1.7] text-nf-ink/85">
                  <p>{piece.care ?? listedCare ?? "Store in the pouch, avoid perfume and chlorinated water, and wipe gently after wear."}</p>
                  {/* The two questions every jewellery buyer asks, answered for this piece. */}
                  {care.map((c) => (
                    <p key={c.q}>
                      <strong className="font-semibold text-nf-ink">{c.q}</strong> {c.a}
                    </p>
                  ))}
                </div>
              </details>

              <details className="group border-b border-nf-gold/15">
                <summary className={fold}>
                  Delivery & returns
                  <Plus size={14} strokeWidth={1.4} className={foldMark} aria-hidden="true" />
                </summary>
                <div id="pdp-panel-delivery" className="pb-6">
                  <div className="space-y-2.5 text-[13px] leading-[1.7] text-nf-ink/85">
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
                    className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-[12px] text-nf-ink underline decoration-nf-gold underline-offset-4"
                  >
                    <MessageSquare size={14} strokeWidth={1.6} className="text-nf-gold-deep" /> Questions? Chat with us on WhatsApp
                  </a>
                </div>
              </details>
            </div>

            {/* A second piece, one tap from the bag: the bag's ladder takes 10%
                off two pieces and 20% off three. */}
            {pairings.length > 0 && (
              <section className="mt-10" aria-labelledby="complete-the-look">
                <div className="flex items-end justify-between gap-3">
                  <h2 id="complete-the-look" className="font-cormorant text-[18px] leading-none text-nf-ink">
                    Complete the look
                  </h2>
                  <p className="font-nf-label text-[9.5px] uppercase tracking-nf-16 text-nf-gold-text">2 pieces · 10% off</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {pairings.map((p) => (
                    <PairingCard key={p.handle} piece={p} href={hrefFor(p.handle)} compact />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="min-h-[240px] bg-nf-ivory" aria-hidden="true" />}>
        <CustomerReviews productName={piece.name} variant="jewellery" />
      </Suspense>

      <PressMarquee />

      <Suspense fallback={<div className="min-h-[420px] bg-nf-ivory-deep md:hidden" aria-hidden="true" />}>
        <ReelShopNext hrefFor={hrefFor} />
      </Suspense>

      {similar.length > 0 && (
        <section className="mx-auto max-w-[1400px] py-10 md:px-6" aria-labelledby="more-like-this">
          <h2 id="more-like-this" className="px-4 font-cormorant text-[19px] leading-none text-nf-ink md:px-0">
            More {piece.category.toLowerCase()}
          </h2>
          <div className="scrollbar-hide mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:grid md:grid-cols-4 md:overflow-visible md:px-0" style={{ overscrollBehaviorX: "contain" }}>
            {similar.map((p) => (
              <div key={p.handle} className="w-[42vw] max-w-[220px] shrink-0 snap-start md:w-auto md:max-w-none">
                <PairingCard piece={p} href={hrefFor(p.handle)} />
              </div>
            ))}
          </div>
        </section>
      )}

      <Suspense fallback={null}>
        <FomoPopup
          quiet
          hrefFor={hrefFor}
          suppressed={isDrawerOpen || lightboxOpen || sizeGuideOpen}
          mobileStickyVisible={stickyBarVisible}
        />
      </Suspense>

      <Footer compact slim />

      {/* Phone buy bar: shown whenever Add to cart is not fully on screen. */}
      <div
        ref={stickyBarRef}
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-nf-gold/15 bg-nf-ivory/95 px-3 pt-2 backdrop-blur transition-[transform,visibility] duration-300 ease-out md:hidden"
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
          className="press-scale flex h-[48px] w-[48px] shrink-0 items-center justify-center border border-nf-ink/25"
        >
          {heart}
        </button>
        <button
          onClick={soldOut ? handlePreOrder : handleAddToCart}
          disabled={cartLoading}
          className="press-scale inline-flex h-[48px] flex-1 items-center justify-center gap-2 bg-[var(--nf-cta)] font-nf-label text-[11.5px] font-medium uppercase tracking-nf-16 text-nf-ivory hover:bg-[var(--nf-cta-hover)] disabled:opacity-60"
        >
          {soldOut ? "Pre-order" : "Add to cart"}
          <span className="font-normal normal-case tracking-nf-4 text-nf-ivory/90">· {piece.priceLabel}</span>
        </button>
      </div>

      <ImageLightbox
        images={images}
        name={piece.name}
        open={lightboxOpen}
        initialIndex={lightboxIndex}
        onOpenChange={(open) => (open ? setLightboxOpen(true) : zoom.requestClose())}
      />
    </div>
  );
};

export default JewelDetailNext;
