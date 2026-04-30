import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard, { productFromShopify } from "@/components/ProductCard";
import { fetchShopifyProducts } from "@/lib/shopify";

const YouMayAlsoLike = ({ currentHandle }: { currentHandle?: string }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { data: shopifyProducts = [], isLoading } = useQuery({
    queryKey: ["shopify-products", "related", currentHandle],
    queryFn: () => fetchShopifyProducts(8),
    staleTime: 1000 * 60 * 5,
  });
  const products = shopifyProducts
    .filter((product) => product.handle !== currentHandle)
    .slice(0, 4)
    .map(productFromShopify);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 transition-all duration-700"
      style={{
        backgroundColor: "hsl(0 0% 100%)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Heading */}
        <h2
          className="font-cormorant text-[28px] md:text-[36px] font-semibold text-center mb-12"
          style={{ color: "hsl(0 0% 15%)" }}
        >
          You May Also Like
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((item) => <div key={item} className="bg-muted animate-pulse" style={{ aspectRatio: "3/4" }} />)}
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Desktop/Tablet grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <ProductCard key={product.handle ?? product.name} product={product} index={i} visible={visible} />
              ))}
            </div>

            {/* Mobile horizontal scroll */}
            <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {products.map((product, i) => (
                <div key={product.handle ?? product.name} className="min-w-[260px] snap-start">
                  <ProductCard product={product} index={i} visible={visible} />
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default YouMayAlsoLike;
