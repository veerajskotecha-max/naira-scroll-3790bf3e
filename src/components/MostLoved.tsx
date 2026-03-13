import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";
import floralTopLeft from "@/assets/floral-top-left.png";
import floralBottomRight from "@/assets/floral-bottom-right.png";
import product1 from "@/assets/product-1.jpg";
import product1Hover from "@/assets/product-1-hover.jpg";
import product2 from "@/assets/product-2.jpg";
import product2Hover from "@/assets/product-2-hover.jpg";
import product3 from "@/assets/product-3.jpg";
import product3Hover from "@/assets/product-3-hover.jpg";
import product4 from "@/assets/product-4.jpg";
import product4Hover from "@/assets/product-4-hover.jpg";

const products = [
  {
    image: product1,
    hoverImage: product1Hover,
    name: "Royal Banarasi Silk Saree",
    category: "Heritage Sarees",
    price: "₹24,500",
  },
  {
    image: product2,
    hoverImage: product2Hover,
    name: "Blush Organza Lehenga",
    category: "Bridal Lehengas",
    price: "₹32,800",
  },
  {
    image: product3,
    hoverImage: product3Hover,
    name: "Sage Green Anarkali Set",
    category: "Designer Anarkali",
    price: "₹19,900",
  },
  {
    image: product4,
    hoverImage: product4Hover,
    name: "Pearl White Sharara Set",
    category: "Festive Collection",
    price: "₹15,500",
  },
];

const MostLovedCard = ({
  product,
  index,
  visible,
}: {
  product: (typeof products)[0];
  index: number;
  visible: boolean;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`group cursor-pointer transition-all ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{
        transitionDelay: visible ? `${index * 0.1 + 0.15}s` : "0s",
        transitionDuration: "0.6s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden rounded-lg"
        style={{ aspectRatio: "4/5" }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-500 ease-out"
          style={{ opacity: hovered ? 0 : 1 }}
          loading="lazy"
        />
        <img
          src={product.hoverImage}
          alt={`${product.name} alternate view`}
          className="absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-500 ease-out"
          style={{ opacity: hovered ? 1 : 0 }}
          loading="lazy"
        />

        <span
          className="absolute top-3 left-3 z-20 text-[11px] md:text-[12px] font-medium uppercase tracking-[0.1em] px-2.5 py-1.5"
          style={{
            backgroundColor: "hsl(186 35% 28%)",
            color: "hsl(0 0% 100%)",
            borderRadius: "3px",
          }}
        >
          MOST LOVED
        </span>

        {/* Wishlist heart */}
        <button
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: "hsla(0,0%,100%,0.85)",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(-4px)",
          }}
          aria-label="Add to wishlist"
        >
          <Heart size={14} style={{ color: "hsl(0 0% 30%)" }} />
        </button>

        {/* Add to Cart overlay */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-center pb-4 transition-all duration-300 ease-out"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <button
            className="flex items-center gap-2 px-6 py-2.5 rounded-md text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200"
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
            <ShoppingBag size={14} />
            Add to Cart
          </button>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-1/3 z-10 rounded-b-lg transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to top, hsla(0,0%,0%,0.35), transparent)",
            opacity: hovered ? 1 : 0,
          }}
        />
      </div>

      <div className="pt-4 px-1">
        <h3
          className="font-cormorant text-[16px] lg:text-[18px] font-medium leading-snug"
          style={{ color: "hsl(0 0% 18%)" }}
        >
          {product.name}
        </h3>
        <p
          className="font-cormorant text-[13px] lg:text-[14px] mt-1"
          style={{ color: "hsl(0 0% 48%)" }}
        >
          {product.category}
        </p>
        <p
          className="font-cormorant text-[15px] lg:text-[16px] font-semibold mt-2"
          style={{ color: "hsl(186 35% 28%)" }}
        >
          FROM <span className="font-bold">{product.price}</span>
        </p>
      </div>
    </div>
  );
};

const MostLoved = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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
      className="relative w-full overflow-hidden py-10 md:py-14 lg:py-16"
      style={{ backgroundColor: "hsl(33 30% 85%)" }}
    >
      {/* Decorative florals */}
      <img
        src={floralTopLeft}
        alt=""
        aria-hidden="true"
        className="absolute top-[-20px] left-[-30px] w-[140px] md:w-[200px] lg:w-[280px] opacity-45 pointer-events-none select-none"
      />
      <img
        src={floralBottomRight}
        alt=""
        aria-hidden="true"
        className="absolute bottom-[-20px] right-[-30px] w-[140px] md:w-[200px] lg:w-[280px] opacity-45 pointer-events-none select-none"
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Heading row */}
        <div
          className={`flex items-end justify-between mb-8 md:mb-10 lg:mb-12 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionDuration: "0.6s" }}
        >
          <div className="text-center flex-1">
            <h2
              className="font-cormorant text-[28px] md:text-[34px] lg:text-[42px] font-medium italic mb-2"
              style={{ color: "hsl(0 0% 18%)" }}
            >
              Most Loved Pieces
            </h2>
            <p
              className="font-cormorant text-[14px] md:text-[15px] lg:text-[16px]"
              style={{ color: "hsl(0 0% 43%)" }}
            >
              The latest trends straight from our studio.
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center gap-1.5 font-cormorant text-[14px] font-medium tracking-[0.04em] whitespace-nowrap transition-colors duration-200 shrink-0 ml-6"
            style={{ color: "hsl(186 35% 28%)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "hsl(186 35% 20%)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "hsl(186 35% 28%)")
            }
          >
            View All <span className="text-[16px]">›</span>
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-5 lg:gap-6">
          {products.map((product, i) => (
            <MostLovedCard
              key={i}
              product={product}
              index={i}
              visible={visible}
            />
          ))}
        </div>

        {/* Mobile View All */}
        <div
          className={`flex justify-center mt-8 md:hidden transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            transitionDelay: visible ? "0.6s" : "0s",
            transitionDuration: "0.6s",
          }}
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-cormorant text-[14px] font-medium uppercase tracking-[0.08em] px-8 py-3 rounded-md transition-all duration-300"
            style={{
              backgroundColor: "hsl(186 35% 28%)",
              color: "hsl(0 0% 100%)",
            }}
          >
            VIEW ALL <span className="text-[16px]">›</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MostLoved;
