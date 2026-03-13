import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Star, Heart, Minus, Plus, Truck, RotateCcw, ShieldCheck, Ruler } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import Footer from "@/components/Footer";
import CustomerReviews from "@/components/CustomerReviews";
import MaterialsCraft from "@/components/MaterialsCraft";
import NairaPhilosophy from "@/components/NairaPhilosophy";
import YouMayAlsoLike from "@/components/YouMayAlsoLike";
import StickyAddToCart from "@/components/StickyAddToCart";
import UrgencyNotification from "@/components/UrgencyNotification";

import product1 from "@/assets/product-1.jpg";
import product1Hover from "@/assets/product-1-hover.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const thumbnails = [product1, product1Hover, product2, product3, product4];
const sizes = ["XS", "S", "M", "L", "XL"];

const ProductDetail = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Sync scroll position when tapping thumbnails on mobile
  const scrollToImage = useCallback((index: number) => {
    if (!scrollRef.current) return;
    isScrolling.current = true;
    const container = scrollRef.current;
    container.scrollTo({ left: index * container.offsetWidth, behavior: "smooth" });
    setSelectedImage(index);
    setTimeout(() => { isScrolling.current = false; }, 400);
  }, []);

  // Detect active slide on swipe
  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;
    const container = scrollRef.current;
    let timeout: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isScrolling.current) return;
        const index = Math.round(container.scrollLeft / container.offsetWidth);
        setSelectedImage(index);
      }, 60);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => { container.removeEventListener("scroll", onScroll); clearTimeout(timeout); };
  }, [isMobile]);

  const WishlistButton = (
    <button
      className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200"
      style={{ backgroundColor: "hsla(0,0%,100%,0.9)" }}
      onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
    >
      <Heart
        size={18}
        className="transition-colors duration-200"
        style={{
          color: wishlisted ? "hsl(0 70% 55%)" : "hsl(0 0% 40%)",
          fill: wishlisted ? "hsl(0 70% 55%)" : "none",
        }}
      />
    </button>
  );

  const MobileGallery = (
    <div className="relative md:hidden">
      {/* Swipeable image carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {thumbnails.map((img, i) => (
          <div
            key={i}
            className="w-full shrink-0 snap-center"
            style={{ aspectRatio: "4/5", backgroundColor: "hsl(0 0% 97%)" }}
          >
            <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {WishlistButton}
      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-3 mb-1">
        {thumbnails.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToImage(i)}
            className="w-2 h-2 rounded-full transition-all duration-200"
            style={{
              backgroundColor: selectedImage === i ? "hsl(186 35% 28%)" : "hsl(0 0% 78%)",
              transform: selectedImage === i ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );

  const DesktopGallery = (
    <div className="lg:w-[58%] hidden md:flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 md:w-[80px] shrink-0 overflow-x-auto md:overflow-visible">
        {thumbnails.map((thumb, i) => (
          <button
            key={i}
            onClick={() => setSelectedImage(i)}
            className="shrink-0 w-[64px] h-[64px] md:w-[72px] md:h-[72px] rounded-md overflow-hidden border-2 transition-all duration-200"
            style={{
              borderColor: selectedImage === i ? "hsl(186 35% 28%)" : "hsl(0 0% 88%)",
              opacity: selectedImage === i ? 1 : 0.7,
            }}
          >
            <img src={thumb} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {/* Main Image */}
      <div
        className="relative flex-1 rounded-lg overflow-hidden cursor-zoom-in"
        style={{ aspectRatio: "3/4", backgroundColor: "hsl(0 0% 97%)" }}
        onClick={() => setZoomed(!zoomed)}
      >
        <img
          src={thumbnails[selectedImage]}
          alt="Midnight Silk Drape Saree"
          className="w-full h-full object-cover transition-transform duration-500 ease-out"
          style={{ transform: zoomed ? "scale(1.5)" : "scale(1)" }}
        />
        {WishlistButton}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(0 0% 100%)" }}>
      {/* Breadcrumb - hidden on mobile */}
      <div className="max-w-[1200px] mx-auto px-4 pt-28 pb-4 hidden md:block">
        <nav className="flex items-center gap-2 text-[13px] font-cormorant" style={{ color: "hsl(0 0% 55%)" }}>
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/shop" className="transition-colors hover:text-foreground">Shop</Link>
          <span>/</span>
          <span style={{ color: "hsl(0 0% 30%)" }}>Midnight Silk Drape Saree</span>
        </nav>
      </div>

      {/* Mobile: full-width gallery at top */}
      <div className="md:hidden pt-20">
        {MobileGallery}
      </div>

      {/* Main Product Section */}
      <div className="max-w-[1200px] mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">
          {DesktopGallery}

          {/* Right Column – Product Details */}
          <div className="lg:w-[42%] flex flex-col">
            {/* Title */}
            <h1
              className="font-cormorant text-[28px] md:text-[34px] font-semibold leading-[1.2] md:leading-tight max-w-[320px] md:max-w-none mt-4 md:mt-0"
              style={{ color: "hsl(0 0% 15%)" }}
            >
              Midnight Silk Drape Saree
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-1.5 md:mt-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} style={{ color: "hsl(45 93% 47%)", fill: "hsl(45 93% 47%)" }} />
                ))}
              </div>
              <span className="text-[13px] font-cormorant" style={{ color: "hsl(0 0% 45%)" }}>
                5.00 (393)
              </span>
            </div>

            {/* Price */}
            <p
              className="font-cormorant text-[26px] font-bold mt-2 md:mt-5"
              style={{ color: "hsl(186 35% 28%)" }}
            >
              ₹18,500
            </p>

            {/* Description - moved after variants on mobile via order */}
            <p
              className="font-cormorant text-[15px] leading-relaxed mt-4 max-w-[420px] order-last md:order-none"
              style={{ color: "hsl(0 0% 40%)" }}
            >
              A contemporary take on the classic saree, featuring pre-draped pleats and a structured bodice. Crafted from premium midnight blue silk.
            </p>

            {/* Highlight */}
            <div className="flex items-center gap-2 mt-4 md:mt-5 order-last md:order-none">
              <Ruler size={15} style={{ color: "hsl(186 35% 28%)" }} />
              <span className="text-[13px] font-cormorant font-medium" style={{ color: "hsl(0 0% 35%)" }}>
                Handcrafted in 60 days
              </span>
            </div>

            <Separator className="my-4 md:my-6" />

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] uppercase tracking-[0.1em] font-medium" style={{ color: "hsl(0 0% 25%)" }}>
                  Size
                </span>
                <button className="text-[12px] underline font-cormorant" style={{ color: "hsl(186 35% 28%)" }}>
                  Size Guide
                </button>
              </div>
              <div className="flex gap-2.5">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="w-11 h-11 rounded-md text-[13px] font-medium transition-all duration-200 border"
                    style={{
                      backgroundColor: selectedSize === size ? "hsl(186 35% 28%)" : "transparent",
                      color: selectedSize === size ? "hsl(0 0% 100%)" : "hsl(0 0% 30%)",
                      borderColor: selectedSize === size ? "hsl(186 35% 28%)" : "hsl(0 0% 82%)",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-4 md:mt-6">
              <span className="text-[13px] uppercase tracking-[0.1em] font-medium block mb-3" style={{ color: "hsl(0 0% 25%)" }}>
                Quantity
              </span>
              <div className="inline-flex items-center border rounded-md" style={{ borderColor: "hsl(0 0% 82%)" }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-muted"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-[14px] font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-muted"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div id="product-actions" className="flex gap-4 mt-[18px] md:mt-8">
              <button
                className="flex-1 h-[50px] rounded-md text-[13px] font-medium uppercase tracking-[0.1em] transition-colors duration-200"
                style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 23%)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 28%)")}
              >
                Add to Cart
              </button>
              <button
                className="flex-1 h-[50px] rounded-md text-[13px] font-medium uppercase tracking-[0.1em] border-2 transition-colors duration-200"
                style={{ borderColor: "hsl(186 35% 28%)", color: "hsl(186 35% 28%)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "hsl(186 35% 28%)";
                  e.currentTarget.style.color = "hsl(0 0% 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "hsl(186 35% 28%)";
                }}
              >
                Buy Now
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-between mt-8 py-4 px-2 rounded-md" style={{ backgroundColor: "hsl(0 0% 97%)" }}>
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: RotateCcw, label: "7-Day Returns" },
                { icon: ShieldCheck, label: "Secure Checkout" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={16} style={{ color: "hsl(186 35% 28%)" }} />
                  <span className="text-[12px] font-medium" style={{ color: "hsl(0 0% 35%)" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <Accordion type="single" collapsible defaultValue="description" className="mt-8">
              <AccordionItem value="description">
                <AccordionTrigger className="font-cormorant text-[16px] font-semibold" style={{ color: "hsl(0 0% 20%)" }}>
                  Description
                </AccordionTrigger>
                <AccordionContent>
                  <p className="font-cormorant text-[14px] leading-relaxed" style={{ color: "hsl(0 0% 45%)" }}>
                    The Midnight Silk Drape Saree is a contemporary masterpiece that reimagines the traditional saree for the modern woman.
                    Featuring pre-draped pleats and a structured bodice, this piece offers effortless elegance without the complexity of traditional draping.
                    Crafted from premium midnight blue silk with delicate hand-embroidered details along the pallu.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="font-cormorant text-[16px] font-semibold" style={{ color: "hsl(0 0% 20%)" }}>
                  Shipping & Returns
                </AccordionTrigger>
                <AccordionContent>
                  <p className="font-cormorant text-[14px] leading-relaxed" style={{ color: "hsl(0 0% 45%)" }}>
                    Free standard shipping on all orders. Express delivery available for ₹500.
                    Easy returns within 7 days of delivery. Items must be unworn with original tags attached.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="fabric">
                <AccordionTrigger className="font-cormorant text-[16px] font-semibold" style={{ color: "hsl(0 0% 20%)" }}>
                  Fabric & Care
                </AccordionTrigger>
                <AccordionContent>
                  <p className="font-cormorant text-[14px] leading-relaxed" style={{ color: "hsl(0 0% 45%)" }}>
                    100% Pure Silk. Dry clean only. Store in a cool, dry place away from direct sunlight.
                    Use a muslin cloth while ironing.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      <CustomerReviews />
      <MaterialsCraft />
      <YouMayAlsoLike />
      <NairaPhilosophy />
      <Footer />
      <StickyAddToCart
        image={product1}
        title="Midnight Silk Drape Saree"
        price="₹18,500"
        selectedSize={selectedSize}
      />
      <UrgencyNotification />
    </div>
  );
};

export default ProductDetail;
