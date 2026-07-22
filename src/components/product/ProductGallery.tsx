import { useState, useRef, useEffect, useCallback } from "react";
import { Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/contexts/WishlistContext";
import { useIsMobile } from "@/hooks/use-mobile";

import type { ShopifyProductNode } from "@/lib/shopify";

const placeholderImage = "/placeholder.svg";

const ProductGallery = ({ product }: { product?: ShopifyProductNode | null }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const isMobile = useIsMobile();
  const { toggleItem, isWishlisted } = useWishlist();
  const productImages = product?.images.edges.map((edge) => edge.node.url).filter(Boolean) ?? [];
  const images = productImages.length > 0 ? productImages : [placeholderImage];
  const productId = product?.handle ?? "shopify-product";
  const productName = product?.title ?? "Shopify product";
  const firstImage = images[0] ?? placeholderImage;
  const wishlisted = isWishlisted(productId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const scrollToImage = useCallback((index: number) => {
    if (!scrollRef.current) return;
    isScrolling.current = true;
    scrollRef.current.scrollTo({ left: index * scrollRef.current.offsetWidth, behavior: "smooth" });
    setSelectedImage(index);
    setTimeout(() => { isScrolling.current = false; }, 400);
  }, []);

  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;
    const container = scrollRef.current;
    let timeout: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isScrolling.current) return;
        setSelectedImage(Math.round(container.scrollLeft / container.offsetWidth));
      }, 60);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => { container.removeEventListener("scroll", onScroll); clearTimeout(timeout); };
  }, [isMobile]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItem({ id: productId, name: productName, price: "", image: firstImage });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: productName, text: `Check out ${productName} on Naira Flore`, url };
    try {
      if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(shareData);
      } else if (navigator?.clipboard) {
        await navigator.clipboard.writeText(url);
        toast("Link copied", { description: "Product link copied to clipboard." });
      }
    } catch {
      /* user cancelled or share unsupported — silent */
    }
  };

  const WishlistBtn = (
    <button
      className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center transition-all duration-200"
      style={{ backgroundColor: "hsla(0,0%,100%,0.85)" }}
      onClick={handleWishlist}
      aria-label="Add to wishlist"
    >
      <Heart
        size={17}
        className="transition-colors duration-200"
        style={{
          color: wishlisted ? "hsl(0 70% 55%)" : "hsl(0 0% 40%)",
          fill: wishlisted ? "hsl(0 70% 55%)" : "none",
        }}
      />
    </button>
  );

  const ShareBtn = (
    <button
      className="absolute bottom-16 right-4 z-10 w-10 h-10 flex items-center justify-center transition-all duration-200 shadow-sm"
      style={{ backgroundColor: "hsla(0,0%,100%,0.92)", borderRadius: "50%" }}
      onClick={handleShare}
      aria-label="Share product"
    >
      <Share2 size={15} strokeWidth={1.6} style={{ color: "hsl(0 0% 30%)" }} />
    </button>
  );

  // Mobile: swipeable carousel
  if (isMobile) {
    return (
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {images.map((img, i) => (
            <div key={i} className="w-full shrink-0 snap-center" style={{ aspectRatio: "3/4", backgroundColor: "hsl(0 0% 96%)" }}>
              <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        {WishlistBtn}
        {ShareBtn}
        <div className="flex justify-center gap-2 mt-3 mb-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToImage(i)}
              className="w-1.5 h-1.5 transition-all duration-200"
              style={{
                borderRadius: '50%',
                backgroundColor: selectedImage === i ? "hsl(0 0% 20%)" : "hsl(0 0% 75%)",
                transform: selectedImage === i ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop: two large images, full viewport height, sticky
  return (
    <div className="relative w-full h-full min-h-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-[4px] h-full min-h-full">
        {images.slice(0, 4).map((img, i) => (
          <div
            key={i}
            className="overflow-hidden relative min-h-0"
            style={{ backgroundColor: "hsl(0 0% 96%)", height: "100%" }}
          >
            <img
              src={img}
              alt={`${productName} - View ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
            />
          </div>
        ))}
      </div>
      {WishlistBtn}
      {ShareBtn}
    </div>
  );
};

export default ProductGallery;
