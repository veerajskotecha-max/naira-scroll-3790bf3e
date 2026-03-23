import { useEffect, useRef, useState } from "react";
import { Play, Instagram } from "lucide-react";
import campaignPoster from "@/assets/campaign-video-poster.jpg";
import featured1 from "@/assets/featured-1.jpg";
import featured2 from "@/assets/featured-2.jpg";
import featured3 from "@/assets/featured-3.jpg";

const INSTAGRAM_REEL_URL =
  "https://www.instagram.com/reel/DWJxV5CsWSt/?igsh=MWtxNnEzdXE4d2NmaQ==";

const featuredProducts = [
  { image: featured1, name: "Midnight Silk Drape Saree", price: "₹18,500" },
  { image: featured2, name: "Lavender Chiffon Kurta Set", price: "₹12,900" },
  { image: featured3, name: "Terracotta Lehenga Set", price: "₹24,500" },
];

const CampaignFilm = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);

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

  const handleLoadEmbed = () => {
    setEmbedLoaded(true);
  };

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
                backgroundColor: "hsl(0 0% 92%)",
              }}
            >
              {!embedLoaded ? (
                /* Thumbnail fallback with play button */
                <button
                  onClick={handleLoadEmbed}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 cursor-pointer group"
                  aria-label="Load Instagram Reel"
                >
                  <img
                    src={campaignPoster}
                    alt="Campaign reel preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Dark overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, hsla(0,0%,0%,0.3), hsla(0,0%,0%,0.1))",
                    }}
                  />

                  {/* INSTAGRAM REEL pill */}
                  <span
                    className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-[11px] md:text-[12px] font-medium uppercase tracking-[0.08em] px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: "hsl(0 0% 100%)",
                      color: "hsl(0 0% 25%)",
                    }}
                  >
                    <Instagram size={14} />
                    INSTAGRAM REEL
                  </span>

                  {/* Play button */}
                  <div
                    className="relative z-20 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform duration-200 group-hover:scale-110"
                    style={{
                      backgroundColor: "hsla(0,0%,100%,0.85)",
                    }}
                  >
                    <Play
                      size={28}
                      className="ml-1"
                      style={{ color: "hsl(0 0% 20%)" }}
                    />
                  </div>
                </button>
              ) : (
                /* Instagram Embed iframe */
                <iframe
                  src={`https://www.instagram.com/reel/DWJxV5CsWSt/embed/`}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  title="NAIRA Campaign Instagram Reel"
                  style={{ borderRadius: "inherit" }}
                />
              )}
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
                Watch. Feel.
                <br />
                <span
                  className="italic"
                  style={{ color: "hsl(20 60% 75%)" }}
                >
                  Own It.
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
                Discover how our Indo-Western pieces move, flow, and define
                confidence. See the craftsmanship, feel the quality, and imagine
                yourself in these timeless designs.
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
                <Instagram size={16} />
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
                {featuredProducts.map((product, i) => (
                  <FeaturedCard key={i} product={product} index={i} visible={visible} />
                ))}
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
  product: (typeof featuredProducts)[0];
  index: number;
  visible: boolean;
}) => (
  <div
    className={`group cursor-pointer transition-all ease-out ${
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
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-250 ease-out group-hover:scale-[1.04]"
        loading="lazy"
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
  </div>
);

export default CampaignFilm;
