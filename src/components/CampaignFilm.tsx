import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchShopifyProducts } from "@/lib/shopify";
import { productFromShopify, type Product } from "@/components/ProductCard";
import { shopifyImage, shopifySrcSet } from "@/lib/shopifyImage";

const INSTAGRAM_REEL_URL =
  "https://www.instagram.com/reel/DWJxV5CsWSt/?igsh=MWtxNnEzdXE4d2NmaQ==";

const CampaignFilm = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Pull from the same Shopify query as New Arrivals so cards stay in sync.
  const { data: shopifyProducts = [] } = useQuery({
    queryKey: ["shopify-products", "new-arrivals"],
    queryFn: () => fetchShopifyProducts(8),
    staleTime: 1000 * 60 * 5,
  });
  const featuredProducts: Product[] = shopifyProducts.slice(0, 3).map(productFromShopify);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-[70px] md:py-[90px] lg:py-[120px]"
      style={{ backgroundColor: "hsl(0 0% 96%)" }}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left – Instagram Reel Embed */}
          <div
            className={`transition-all ease-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDuration: "0.6s" }}
          >
            <div
              className="relative overflow-hidden rounded-xl mx-auto"
              style={{
                aspectRatio: "9/16",
                maxWidth: "400px",
                boxShadow: "0 8px 30px -8px hsla(0,0%,0%,0.15)",
                backgroundColor: "hsl(0 0% 8%)",
              }}
            >
              <iframe
                src="https://www.instagram.com/reel/DWJxV5CsWSt/embed/"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                title="NAIRA Campaign Reel"
                style={{ borderRadius: "inherit" }}
              />
            </div>
          </div>

          {/* Right – Content */}
          <div className="flex flex-col justify-center lg:py-6">
            {/* Heading */}
            <div
              className={`transition-all ease-out ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              }`}
              style={{
                transitionDuration: "0.6s",
                transitionDelay: visible ? "0.15s" : "0s",
              }}
            >
              <h2
                className="font-cormorant text-[30px] md:text-[40px] lg:text-[52px] font-medium leading-[1.15]"
                style={{ color: "hsl(0 0% 18%)" }}
              >
                Watch it. Feel it.
                <br />
                <span
                  className="italic"
                  style={{ color: "hsl(20 60% 75%)" }}
                >
                  Own it.
                </span>
              </h2>
            </div>

            {/* Description */}
            <div
              className={`transition-all ease-out ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              }`}
              style={{
                transitionDuration: "0.6s",
                transitionDelay: visible ? "0.25s" : "0s",
              }}
            >
              <p
                className="font-cormorant text-[14px] md:text-[15px] lg:text-[16px] leading-relaxed mt-6 max-w-[480px]"
                style={{ color: "hsl(0 0% 42%)" }}
              >
                See the craftsmanship, colours, and quality of Naira's timeless
                designs.
              </p>
            </div>

            {/* CTA */}
            <div
              className={`mt-8 transition-all ease-out ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDuration: "0.6s",
                transitionDelay: visible ? "0.35s" : "0s",
              }}
            >
              <a
                href={INSTAGRAM_REEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-cormorant text-[14px] font-medium uppercase tracking-[0.08em] px-8 py-3.5 rounded-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor: "hsl(143 14% 63%)",
                  color: "hsl(0 0% 100%)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "hsl(143 14% 55%)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "hsl(143 14% 63%)")
                }
              >
                WATCH ON INSTAGRAM
              </a>
            </div>

            {/* Featured Products */}
            <div
              className={`mt-10 transition-all ease-out ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDuration: "0.6s",
                transitionDelay: visible ? "0.45s" : "0s",
              }}
            >
              <p
                className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.1em] mb-5"
                style={{ color: "hsl(155 18% 48%)" }}
              >
                FEATURED IN THIS CAMPAIGN
              </p>

              <div className="grid grid-cols-3 gap-4 md:gap-5">
                {featuredProducts.length > 0 ? (
                  featuredProducts.map((product, i) => (
                    <FeaturedCard
                      key={product.handle ?? product.id ?? i}
                      product={product}
                      index={i}
                      visible={visible}
                    />
                  ))
                ) : (
                  // Skeletons while products load — keeps the layout from jumping.
                  [0, 1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg" style={{ aspectRatio: "4/5" }} />
                      <div className="h-3 bg-muted mt-2.5 w-3/4" />
                      <div className="h-3 bg-muted mt-1.5 w-1/2" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturedCard = ({
  product,
  index,
  visible,
}: {
  product: Product;
  index: number;
  visible: boolean;
}) => {
  const slug = product.handle ?? product.id ?? "";
  return (
    <Link
      to={`/product/${slug}`}
      className={`group block cursor-pointer transition-all ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{
        transitionDuration: "0.5s",
        transitionDelay: visible ? `${0.5 + index * 0.1}s` : "0s",
      }}
    >
      <div
        className="relative overflow-hidden rounded-lg transition-shadow duration-250 ease-out group-hover:shadow-md"
        style={{ aspectRatio: "4/5" }}
      >
        <img
          src={shopifyImage(product.image, 500)}
          srcSet={shopifySrcSet(product.image, [300, 500, 800])}
          sizes="(min-width: 1024px) 180px, 30vw"
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-250 ease-out group-hover:scale-[1.04]"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="mt-2.5 px-0.5">
        <p
          className="font-cormorant text-[13px] lg:text-[14px] font-medium leading-snug"
          style={{ color: "hsl(0 0% 20%)" }}
        >
          {product.name}
        </p>
        <p
          className="font-cormorant text-[12px] lg:text-[13px] mt-1 font-semibold"
          style={{ color: "hsl(155 18% 48%)" }}
        >
          {product.price}
        </p>
      </div>
    </Link>
  );
};

export default CampaignFilm;
