import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";
import { productFromShopify } from "@/components/ProductCard";
import { fetchShopifyProducts } from "@/lib/shopify";

/**
 * "The Flore Edit" — a slow-turning ring of Indo-Western pieces shown at the
 * foot of the home page. Items rotate with page scroll and drift when idle.
 */
const IndoWesternCarousel = () => {
  const { data: shopifyProducts = [] } = useQuery({
    queryKey: ["shopify-products", "flore-edit"],
    queryFn: () => fetchShopifyProducts(12),
    staleTime: 1000 * 60 * 5,
  });

  const items = useMemo<GalleryItem[]>(() => {
    const pool = shopifyProducts.map(productFromShopify);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    return shuffled.map((p) => ({
      common: p.name,
      binomial: p.category,
      href: `/product/${p.handle}`,
      photo: { url: p.image, text: `${p.name}, Indo-Western piece by Naira Flore` },
    }));
  }, [shopifyProducts]);

  if (items.length === 0) return null;

  return (
    <section
      className="py-14 md:py-20"
      style={{ backgroundColor: "#F4F1EC" }}
      aria-label="The Flore Edit"
    >
      <div className="text-center px-4">
        <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#2F5D63" }}>
          The Flore Edit
        </p>
        <h2 className="mt-2 font-cormorant text-[26px] md:text-[34px]" style={{ color: "#1A1614" }}>
          Indo-Western, in the round
        </h2>
        <p className="mt-1.5 text-[11px] tracking-[0.14em]" style={{ color: "hsl(0 0% 48%)" }}>
          Scroll to turn the carousel
        </p>
        <div
          className="mx-auto mt-4 h-px w-16"
          style={{ backgroundColor: "#AEBDB6" }}
          aria-hidden="true"
        />
      </div>
      <CircularGallery items={items} className="mt-6 md:mt-8" radius={480} />
    </section>
  );
};

export default IndoWesternCarousel;
