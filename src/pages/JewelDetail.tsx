import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { discountPercent } from "@/components/jewellery/JewelPriceTag";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { absoluteUrl } from "@/lib/absoluteUrl";
import { productParams, trackPixel } from "@/lib/pixel";
import { Helmet } from "react-helmet-async";
import { Heart, Share2, Minus, Plus, Phone, Mail, MessageCircle, Truck, Sparkles, ShieldCheck, ReceiptText, MessageSquare, ArrowLeft } from "lucide-react";

import { toast } from "sonner";
import Footer from "@/components/Footer";
import CollectionCarousel from "@/components/CollectionCarousel";
import RecentlyViewed from "@/components/RecentlyViewed";
import CustomerReviews from "@/components/CustomerReviews";
import PincodeChecker from "@/components/product/PincodeChecker";
import DetailsTabs from "@/components/product/DetailsTabs";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { AtelierAccordionTrigger } from "@/components/ui/atelier-accordion";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { AtelierSkeleton } from "@/components/ui/atelier-skeleton";
import JewelTrustStrip from "@/components/jewellery/JewelTrustStrip";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { isAdjustableRing, ADJUSTABLE_FIT_NOTE } from "@/data/ringFit";
import RingSizeGuideModal from "@/components/jewellery/RingSizeGuideModal";


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { jewellery as staticJewellery, jewelleryEnquiryUrl, WHATSAPP_NUMBER, PREORDER_NOTE, type JewelPiece } from "@/data/jewellery";


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

/** Size list for a specific ring: open-back styles flag US 6 as adjustable. */
const ringSizesFor = (handle?: string) =>
  isAdjustableRing(handle)
    ? ringSizes.map((s) => (s.value === "6" ? { ...s, label: "US 6 — Adjustable (fits US 6–8)" } : s))
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
        <AtelierSkeleton className="w-full" style={{ aspectRatio: "3/4" }} />
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

const JewelDetail = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { jewellery, isLoading: catalogueLoading } = useLiveJewellery();
  const piece = useMemo(() => jewellery.find((j) => j.handle === handle) ?? null, [handle, jewellery]);
  const isMobile = useIsMobile();
  const { toggleItem, isWishlisted } = useWishlist();
  const { addItem, buyNow, setDrawerOpen, isLoading: cartLoading } = useCart();
  const [buying, setBuying] = useState(false);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/jewellery");
  };

  const [selectedSize, setSelectedSize] = useState<string>(piece?.category === "Rings" ? "6" : "One Size");
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
     (~750px on a 852px phone) offered no way to buy at all. */
  useEffect(() => {
    const check = () => {
      const target = document.getElementById("product-actions");
      if (!target) return;
      const r = target.getBoundingClientRect();
      setStickyBarVisible(r.bottom < 0 || r.top > window.innerHeight);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [handle]);

  const images = useMemo(() => {
    if (!piece) return [];
    return piece.gallery && piece.gallery.length > 0 ? piece.gallery : [piece.image];
  }, [piece]);

  const scrollToImage = useCallback((index: number) => {
    if (!scrollRef.current) return;
    isScrolling.current = true;
    scrollRef.current.scrollTo({ left: index * scrollRef.current.offsetWidth, behavior: "smooth" });
    setSelectedImage(index);
    setTimeout(() => { isScrolling.current = false; }, 400);
  }, []);

  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;
    const el = scrollRef.current;
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (isScrolling.current) return;
        setSelectedImage(Math.round(el.scrollLeft / el.offsetWidth));
      }, 60);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [isMobile]);

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
  const soldOut = piece.availableForSale === false;
  const keyFacts = deriveKeyFacts(piece);
  /* Same-category pieces lead the recommendations; the atelier's other
     work fills any remaining slots. */
  const sameCategory = jewellery.filter((j) => j.handle !== piece.handle && j.category === piece.category);
  const otherPieces = jewellery.filter((j) => j.handle !== piece.handle && j.category !== piece.category);
  const related = [...sameCategory, ...otherPieces].slice(0, 4);
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

  const handleWishlist = () => {
    if (!wishlisted) setHeartPopped(true);
    toggleItem({ id: piece.handle, name: piece.name, price: piece.priceLabel, image: piece.image });
  };
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: piece.name, text: `Check out ${piece.name} on Naira Flore`, url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); toast("Link copied"); }
    } catch { /* silent */ }
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
      // No price. jewellery.ts marks it "internal record only; not displayed
      // during pre-order", and the page shows "Price shared on WhatsApp enquiry"
      // instead — publishing it here contradicted the visible page.
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Naira Flore" },
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
  const ShareBtn = (
    <button
      className="press-scale absolute bottom-16 right-4 z-10 w-11 h-11 flex items-center justify-center shadow-sm"
      style={{ backgroundColor: "hsla(0,0%,100%,0.92)", borderRadius: "50%" }}
      onClick={handleShare}
      aria-label="Share piece"
    >
      <Share2 size={15} strokeWidth={1.6} style={{ color: "hsl(0 0% 30%)" }} />
    </button>
  );

  const Gallery = isMobile ? (
    <div className="relative">
      <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {images.map((img, i) => (
          <button
            type="button"
            key={i}
            onClick={() => openLightbox(i)}
            className="w-full shrink-0 snap-center block p-0 cursor-zoom-in"
            style={{ aspectRatio: "3/4", backgroundColor: "#F4EBE2" }}
            aria-label={`Open ${piece.name} image ${i + 1} full screen`}
          >
            <img src={img} alt={`${piece.name} view ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {WishlistBtn}
      {ShareBtn}
      {images.length > 1 && (
        <div className="flex justify-center gap-1 mt-2 mb-1">
          {images.map((_, i) => (
            <button key={i} onClick={() => scrollToImage(i)} aria-label={`View image ${i + 1}`} className="w-8 h-8 flex items-center justify-center">
              <span
                className="w-1.5 h-1.5 transition-[transform,background-color] duration-200 ease-out"
                style={{ borderRadius: "50%", backgroundColor: selectedImage === i ? "hsl(0 0% 20%)" : "hsl(0 0% 75%)", transform: selectedImage === i ? "scale(1.4)" : "scale(1)" }}
              />
            </button>
          ))}
        </div>
      )}
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
                <img src={img} alt={`${piece.name} view ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]" />
              </button>
            ))}
          </div>
          {WishlistBtn}
          {ShareBtn}
        </div>
      );
    })()
  );


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
        <meta property="og:image" content={absoluteUrl(piece.image)} />
        <meta property="og:image:alt" content={piece.name} />
        <meta property="og:url" content={`https://nairaflore.com/jewellery/${piece.handle}`} />
        <meta property="og:site_name" content="Naira Flore" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${piece.name} · Demi-Gold Jewellery | Naira Flore`} />
        <meta name="twitter:description" content={piece.blurb.slice(0, 150)} />
        <meta name="twitter:image" content={absoluteUrl(piece.image)} />
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
        {Gallery}
      </div>


      <div className="max-w-[1400px] mx-auto md:px-6 pb-24 md:pb-24">
        <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="hidden md:block">{Gallery}</div>

          {/* Details */}
          <div className="mt-5 md:mt-0 lg:py-2 flex flex-col w-full items-stretch px-4 lg:px-8 xl:px-10">
            {/* Category */}
            <p className="text-[10px] tracking-[0.34em]" style={{ color: "#B0843A", fontFamily: "'Jost', 'Inter', sans-serif" }}>
              {piece.category.toUpperCase()} · DEMI-GOLD
            </p>

            {/* Title */}
            <h1 className="font-cormorant text-[26px] md:text-[32px] lg:text-[36px] font-semibold leading-[1.15] tracking-[-0.01em] mt-2" style={{ color: "hsl(0 0% 12%)" }}>
              {piece.name}
            </h1>

            {/* Live price from the Shopify listing */}
            <div className="mt-3 flex flex-wrap items-baseline gap-2">
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
              <span className="text-[11px] tracking-[0.06em]" style={{ color: "hsl(0 0% 48%)" }}>
                inclusive of all taxes
              </span>
            </div>
            <p className="mt-1.5 text-[12px] tracking-[0.02em] leading-relaxed" style={{ color: "hsl(0 0% 48%)" }}>
              MRP inclusive of all taxes · flat ₹150 insured shipping across India
            </p>

            {/* Size / Quantity / CTA moved directly under the price for conversion */}


            <div className="my-4" style={{ borderTop: "1px solid hsl(0 0% 88%)" }} />

            {/* Size / One-size */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] uppercase tracking-[0.14em] font-medium" style={{ color: "hsl(0 0% 25%)" }}>
                  {piece.category === "Rings" ? "Ring Size (US)" : "Size"}
                </span>
                <a href={enquiryHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[11px] underline underline-offset-4 tracking-[0.02em] min-h-[44px] px-2 -mr-2" style={{ color: "hsl(186 35% 28%)" }}>
                  Sizing help
                </a>
              </div>
              {piece.category === "Rings" ? (
                <>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full h-11 text-[13px] font-medium tracking-[0.02em] rounded-none border" style={{ borderColor: "hsl(0 0% 80%)", color: "hsl(0 0% 20%)" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {ringSizesFor(piece.handle).map((s) => (
                        <SelectItem key={s.value} value={s.value} className="text-[13px] rounded-none">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-[12px] leading-[1.6]" style={{ color: "hsl(0 0% 45%)" }}>
                    {selectedSize === "6"
                      ? isAdjustableRing(piece.handle)
                        ? `US 6 is in stock and ships now. ${ADJUSTABLE_FIT_NOTE}`
                        : "US 6 is in stock and ships now."
                      : `US ${selectedSize} is a pre-order — 45 days delivery.`}
                  </p>

                </>
              ) : (
                <div className="w-full h-11 flex items-center px-3 border text-[13px]" style={{ borderColor: "hsl(0 0% 80%)", color: "hsl(0 0% 20%)" }}>
                  One Size · adjustable
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-4">
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
            <div id="product-actions" className="mt-6">
              {soldOut ? (
                <a
                  href={sizedEnquiryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press-scale w-full h-[54px] inline-flex items-center justify-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] border transition-colors duration-200 hover:border-[hsl(0_0%_35%)]"
                  style={{ borderColor: "hsl(0 0% 24%)", color: "hsl(0 0% 15%)" }}
                >
                  <MessageSquare size={13} /> Notify me on WhatsApp
                </a>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={buying || cartLoading}
                  className="press-scale w-full h-[54px] inline-flex items-center justify-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors duration-200 hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#B0843A", color: "hsl(0 0% 100%)" }}
                >
                  Add to Cart
                </button>
              )}
              <button
                onClick={handleBuyNow}
                disabled={soldOut || buying || cartLoading}
                className="press-scale w-full h-[50px] mt-3 inline-flex items-center justify-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors duration-200 hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "hsl(0 0% 12%)", color: "hsl(0 0% 100%)" }}
              >
                {soldOut ? "Sold Out" : buying ? "Opening checkout…" : "Shop Now"}
              </button>

              <p className="mt-2 text-center text-[11px] tracking-[0.02em]" style={{ color: "hsl(0 0% 50%)" }}>
                {soldOut ? "This piece is currently sold out — we'll let you know the moment it's back." : "Secure payments · Insured delivery · Easy returns"}
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
              className="mt-5 flex items-start gap-2 border px-3 py-2.5"
              style={{ borderColor: "hsl(36 40% 80%)", backgroundColor: "hsl(36 60% 96%)" }}
            >
              <Truck size={13} strokeWidth={1.6} className="mt-[2px] shrink-0" style={{ color: "#9A7634" }} />
              <p className="text-[12px] leading-[1.6]" style={{ color: "hsl(0 0% 32%)" }}>
                <strong className="font-medium">{PREORDER_NOTE}</strong> Dispatched insured from
                our Mumbai atelier, with easy 7-day returns.
              </p>
            </div>

            {/* Offers — the coupon hub shoppers expect before they commit */}
            <div className="mt-3 border px-3 py-3" style={{ borderColor: "hsl(0 0% 88%)" }}>
              <p className="text-[9px] tracking-[0.24em]" style={{ color: "hsl(0 0% 45%)", fontFamily: "'Jost', 'Inter', sans-serif" }}>
                AVAILABLE OFFERS
              </p>
              <ul className="mt-2 space-y-1.5">
                {[
                  { code: "NAIRA10", text: "10% off your first order" },
                  { code: null, text: "Flat ₹150 insured shipping — anywhere in India, any order size" },
                  { code: null, text: "2-year plating assurance on all demi-fine pieces" },
                ].map((o) => (
                  <li key={o.text} className="flex items-start gap-2 text-[12px] leading-[1.6]" style={{ color: "hsl(0 0% 32%)" }}>
                    <span aria-hidden="true" style={{ color: "#B0843A" }}>✦</span>
                    <span>
                      {o.code && (
                        <strong
                          className="mr-1.5 border px-1.5 py-[1px] text-[10.5px] tracking-[0.1em] font-medium"
                          style={{ borderColor: "hsl(36 40% 76%)", color: "#8A6A2A" }}
                        >
                          {o.code}
                        </strong>
                      )}
                      {o.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key facts, at a glance */}
            <dl className="mt-4 flex flex-wrap gap-2" aria-label="Key facts">
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

            {/* Availability / delivery badge — live from Shopify */}
            <div className="flex items-center gap-2 mt-3">
              {soldOut ? (
                <>
                  <span className="inline-block w-[7px] h-[7px] rounded-full" style={{ backgroundColor: "hsl(0 65% 50%)" }} />
                  <span className="text-[12px] uppercase tracking-[0.12em] font-medium" style={{ color: "hsl(0 65% 42%)" }}>
                    Sold Out
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-block w-[7px] h-[7px] rounded-full" style={{ backgroundColor: "hsl(142 50% 40%)" }} />
                  <span className="text-[12px] uppercase tracking-[0.12em] font-medium" style={{ color: "hsl(142 50% 30%)" }}>
                    In Stock
                  </span>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mt-5 py-3 border-y" style={{ borderColor: "hsl(0 0% 90%)" }}>
              {[
                { icon: Sparkles, label: "Anti-Tarnish Sealed" },
                { icon: ShieldCheck, label: "18k Demi-Gold" },
                { icon: ReceiptText, label: "Secure Payments" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon size={16} strokeWidth={1.4} style={{ color: "hsl(186 35% 28%)" }} />
                  <span className="text-[10px] uppercase tracking-[0.1em] leading-tight" style={{ color: "hsl(0 0% 30%)" }}>{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <PincodeChecker />
            </div>



            {/* Jewellery assurances */}
            <JewelTrustStrip />

            {/* Policy links */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <Link to="/exchange-return-policy" className="inline-flex items-center min-h-[44px] font-cormorant text-[12px] tracking-[0.02em] underline underline-offset-4" style={{ color: "hsl(0 0% 45%)" }}>Exchange &amp; Return Policy</Link>
              <span className="text-[10px]" style={{ color: "hsl(0 0% 75%)" }}>|</span>
              <Link to="/faqs" className="inline-flex items-center min-h-[44px] font-cormorant text-[12px] tracking-[0.02em] underline underline-offset-4" style={{ color: "hsl(0 0% 45%)" }}>FAQs</Link>
            </div>

            <div className="my-4" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

            {/* Details tabs */}
            <DetailsTabs
              tabs={[
                {
                  id: "details",
                  label: "Details",
                  content: (
                    <div className="space-y-3">
                      <p className="text-[13px] leading-[1.7]" style={{ color: "hsl(0 0% 40%)" }}>{piece.blurb}</p>
                      {piece.details?.length ? (
                        <dl className="space-y-1">
                          {piece.details.map((spec) => {
                            const at = spec.indexOf(":");
                            // A spec that lost its label still gets shown, just unlabelled.
                            if (at < 0) return (
                              <dd key={spec} className="text-[13px] leading-[1.7]" style={{ color: "hsl(0 0% 40%)" }}>{spec}</dd>
                            );
                            return (
                              <div key={spec} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                                <dt
                                  className="shrink-0 pt-[3px] text-[10px] uppercase tracking-[0.14em] sm:w-[92px]"
                                  style={{ color: "#9A7634" }}
                                >
                                  {spec.slice(0, at)}
                                </dt>
                                <dd className="text-[13px] leading-[1.7]" style={{ color: "hsl(0 0% 40%)" }}>
                                  {spec.slice(at + 1).trim()}
                                </dd>
                              </div>
                            );
                          })}
                        </dl>
                      ) : null}
                      {piece.stylingTip && (
                        <p className="text-[12.5px] leading-[1.7]" style={{ color: "hsl(0 0% 40%)" }}>
                          <span className="uppercase tracking-[0.14em] text-[10px] mr-1.5" style={{ color: "#9A7634" }}>Styling tip</span>
                          {piece.stylingTip}
                        </p>
                      )}
                      <p className="text-[12px] italic leading-[1.7]" style={{ color: "hsl(0 0% 50%)", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        {piece.materials}
                      </p>
                    </div>
                  ),
                },
                {
                  id: "care",
                  label: "Care",
                  content: piece.care ? (
                    <p className="text-[13px] leading-[1.8]" style={{ color: "hsl(0 0% 40%)" }}>{piece.care}</p>
                  ) : (
                    <ul className="text-[13px] leading-[1.8] list-disc pl-4" style={{ color: "hsl(0 0% 40%)" }}>
                      <li>Store in the pouch provided, away from moisture.</li>
                      <li>Avoid contact with perfume, lotion, and chlorinated water.</li>
                      <li>Wipe gently with the polishing cloth; re-plating available.</li>
                    </ul>
                  ),
                },

              ]}
            />

            <div className="my-5" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

            {/* Accordions */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="info" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AtelierAccordionTrigger>Materials</AtelierAccordionTrigger>
                <AccordionContent><p className="text-[13px] leading-[1.7] pb-2" style={{ color: "hsl(0 0% 45%)" }}>{piece.materials}</p></AccordionContent>
              </AccordionItem>
              <AccordionItem value="delivery" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AtelierAccordionTrigger>Delivery Timelines</AtelierAccordionTrigger>
                <AccordionContent>
                  <div className="text-[13px] leading-[1.7] pb-2 space-y-1.5" style={{ color: "hsl(0 0% 45%)" }}>
                    <p>• {PREORDER_NOTE}</p>
                    <p>• Flat ₹150 shipping across India, insured in transit.</p>
                    <p>• Enter your pincode above for a dated delivery estimate.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="disclaimer" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AtelierAccordionTrigger>Disclaimer</AtelierAccordionTrigger>
                <AccordionContent>
                  <div className="text-[13px] leading-[1.7] pb-2 space-y-1.5" style={{ color: "hsl(0 0% 45%)" }}>
                    <p>• Each piece carries gentle variation, part of its character.</p>
                    <p>• Stone tone may vary slightly from screen colours.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="additional" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AtelierAccordionTrigger>Additional Information</AtelierAccordionTrigger>
                <AccordionContent>
                  <div className="text-[13px] leading-[1.7] pb-2 space-y-1.5" style={{ color: "hsl(0 0% 45%)" }}>
                    <p>• WhatsApp / WhatsApp Call: <span className="font-semibold" style={{ color: "hsl(0 0% 20%)" }}>+91 9561557935</span></p>
                    <p>• Manufactured and marketed by Naira Flore</p>
                    <p>• Address: Flat 7, Veeraj Blossom, Karanyogi Nagar, Maharashtra – 422002</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="my-4" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

            {/* Help */}
            <div className="w-full">
              <span className="text-[11px] uppercase tracking-[0.14em] font-medium block mb-3" style={{ color: "hsl(0 0% 30%)" }}>Need Help?</span>
              <div className="flex flex-col md:flex-row w-full">
                {[
                  { icon: Phone, label: "Call Us", href: `tel:+${WHATSAPP_NUMBER}` },
                  { icon: Mail, label: "Email Us", href: "mailto:shopatnaira@gmail.com" },
                  { icon: MessageCircle, label: "WhatsApp", href: enquiryHref },
                ].map(({ icon: Icon, label, href }, idx) => (
                  <a
                    key={label}
                    href={href}
                    target={label === "WhatsApp" ? "_blank" : undefined}
                    rel={label === "WhatsApp" ? "noopener noreferrer" : undefined}
                    className="flex-1 flex items-center justify-center gap-2 py-3 min-h-[44px] text-[12px] tracking-[0.02em] transition-colors duration-200 hover:text-foreground"
                    style={{
                      color: "hsl(0 0% 35%)",
                      borderTop: "1px solid hsl(0 0% 90%)",
                      borderBottom: "1px solid hsl(0 0% 90%)",
                      borderLeft: idx === 0 ? "1px solid hsl(0 0% 90%)" : "none",
                      borderRight: "1px solid hsl(0 0% 90%)",
                    }}
                  >
                    <Icon size={15} strokeWidth={1.5} />{label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomerReviews productName={piece.name} variant="jewellery" />

      {/* Related jewellery */}
      <section className="py-16 md:py-20" style={{ backgroundColor: "#FBF3EC" }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <h2 className="font-cormorant text-[26px] md:text-[34px] text-center" style={{ color: "#1A1614" }}>You may also like</h2>
          <p className="text-center mt-2 text-[12px] tracking-[0.3em]" style={{ color: "#B0843A", fontFamily: "'Jost', 'Inter', sans-serif" }}>
            {sameCategory.length >= 2 ? `MORE ${piece.category.toUpperCase()} FROM THE ATELIER` : "FROM THE DEMI-GOLD ATELIER"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
            {related.map((r) => (
              <Link key={r.handle} to={`/jewellery/${r.handle}`} className="group">
                <div className="aspect-square overflow-hidden" style={{ backgroundColor: "#F4EBE2" }}>
                  <img src={r.image} alt={r.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-3 text-[10px] tracking-[0.3em]" style={{ color: "#B0843A", fontFamily: "'Jost', 'Inter', sans-serif" }}>{r.category.toUpperCase()}</p>
                <h3 className="mt-1 font-cormorant text-[18px] md:text-[20px]" style={{ color: "#1A1614" }}>{r.name}</h3>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ color: "#9A7634", fontFamily: "'Jost', 'Inter', sans-serif" }}>
                  <span aria-hidden className="h-[5px] w-[5px]" style={{ borderRadius: "50%", backgroundColor: "#C99A4C" }} />
                  {r.priceLabel}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CollectionCarousel excludeHandle={piece?.handle} />

      <RecentlyViewed
        current={
          piece && {
            handle: piece.handle,
            name: piece.name,
            price: piece.priceLabel,
            image: piece.image,
            to: `/jewellery/${piece.handle}`,
          }
        }
      />


      <Footer />

      {/* Sticky mobile enquire bar, revealed after the CTA scrolls past */}
      <div
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
            <span
              className="flex-1 h-[48px] inline-flex items-center justify-center text-[11px] font-medium uppercase tracking-[0.12em] border"
              style={{ borderColor: "hsl(0 0% 80%)", color: "hsl(0 0% 45%)" }}
            >
              Sold Out
            </span>
            <a
              href={sizedEnquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="press-scale flex-1 h-[48px] inline-flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em]"
              style={{ backgroundColor: "hsl(0 0% 12%)", color: "#fff" }}
            >
              Notify me
            </a>
          </>
        ) : (
          <>
            <button
              onClick={handleAddToCart}
              disabled={buying || cartLoading}
              className="press-scale flex-1 h-[48px] inline-flex items-center justify-center text-[11px] font-medium uppercase tracking-[0.12em] border disabled:opacity-60"
              style={{ borderColor: "hsl(0 0% 24%)", color: "hsl(0 0% 15%)" }}
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={buying || cartLoading}
              className="press-scale flex-1 h-[48px] inline-flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] disabled:opacity-60"
              style={{ backgroundColor: "hsl(0 0% 12%)", color: "#fff" }}
            >
              {buying ? "Opening…" : "Shop now"}
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
