import { useEffect, useRef, type RefObject } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import floralBottomRight from "@/assets/floral-bottom-right.png";
import ProductCard, { productFromShopify } from "@/components/ProductCard";
import { fetchShopifyProducts } from "@/lib/shopify";

const NewArrivals = ({
  contentRef,
  onProductsReady,
}: {
  contentRef?: RefObject<HTMLDivElement>;
  onProductsReady?: (ready: boolean) => void;
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { data: shopifyProducts = [], isLoading, isError } = useQuery({
    queryKey: ["shopify-products", "new-arrivals"],
    queryFn: () => fetchShopifyProducts(8),
    staleTime: 1000 * 60 * 5,
  });
  const products = shopifyProducts.slice(0, 4).map(productFromShopify);

  useEffect(() => {
    onProductsReady?.(!isLoading);
  }, [isLoading, onProductsReady]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-10 md:py-14 lg:py-16 pt-10 md:pt-14 lg:pt-[155px] lg:min-h-screen"
    >
      
      <img
        src={floralBottomRight}
        alt=""
        aria-hidden="true"
        className="absolute w-[180px] md:w-[280px] lg:w-[380px] pointer-events-none select-none"
        style={{
          bottom: "-80px",
          right: "-80px",
          transform: "rotate(30deg) scale(1.2)",
          transformOrigin: "center center",
          opacity: 0.68,
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div ref={contentRef} className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Heading */}
        <div data-arrivals-heading className="text-center mb-8 md:mb-10 lg:mb-12">
          <h2
            className="font-cormorant text-[28px] md:text-[34px] lg:text-[42px] font-medium italic mb-2"
            style={{ color: "hsl(0 0% 18%)" }}
          >
            New Arrivals
          </h2>
          <p
            className="font-cormorant text-[14px] md:text-[15px] lg:text-[16px]"
            style={{ color: "hsl(0 0% 43%)" }}
          >
            The latest trends straight from our studio.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 relative z-20">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="bg-muted" style={{ aspectRatio: "3/4" }} />
                <div className="h-4 bg-muted mt-3 w-3/4" />
                <div className="h-3 bg-muted mt-2 w-1/2" />
              </div>
            ))}
          </div>
        ) : isError || products.length === 0 ? (
          <div className="relative z-20 py-14 text-center">
            <p className="font-cormorant text-[20px] font-semibold" style={{ color: "hsl(0 0% 25%)" }}>
              No products found
            </p>
          </div>
        ) : (
          <div data-arrivals-products className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 relative z-20 opacity-0">
            {products.map((product, i) => (
              <ProductCard key={product.handle ?? product.name} product={product} index={i} visible={true} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10 md:mt-12 lg:mt-14">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-cormorant text-[15px] font-medium uppercase tracking-[0.08em] px-10 py-3.5 rounded-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg relative z-20"
            style={{
              backgroundColor: "hsl(186 35% 28%)",
              color: "hsl(0 0% 100%)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "hsl(186 35% 23%)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "hsl(186 35% 28%)")
            }
          >
            VIEW ALL
            <span className="text-[16px]">›</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
