import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import floralTopLeft from "@/assets/floral-top-left.png";
import floralBottomRight from "@/assets/floral-bottom-right.png";
import ProductCard from "@/components/ProductCard";
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
    name: "Midnight Silk Drape Saree",
    category: "Fusion Sarees",
    price: "₹18,500",
  },
  {
    image: product2,
    hoverImage: product2Hover,
    name: "Ivory Embroidered Anarkali",
    category: "Designer Anarkali",
    price: "₹22,800",
  },
  {
    image: product3,
    hoverImage: product3Hover,
    name: "Terracotta Lehenga Set",
    category: "Contemporary Lehengas",
    price: "₹28,500",
  },
  {
    image: product4,
    hoverImage: product4Hover,
    name: "Lavender Chiffon Kurta Set",
    category: "Premium Kurtas",
    price: "₹12,900",
  },
];

const NewArrivals = () => {
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
      className="relative w-full overflow-visible py-10 md:py-14 lg:py-16"
      style={{ backgroundColor: "hsl(33 30% 85%)" }}
    >
      {/* Decorative florals — prominent diagonal entry */}
      <img
        src={floralTopLeft}
        alt=""
        aria-hidden="true"
        className="absolute w-[180px] md:w-[280px] lg:w-[380px] pointer-events-none select-none"
        style={{
          top: "-80px",
          left: "-80px",
          transform: "rotate(-30deg) scale(1.2)",
          transformOrigin: "center center",
          opacity: 0.72,
          zIndex: 0,
        }}
      />
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
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Heading */}
        <div
          className={`text-center mb-8 md:mb-10 lg:mb-12 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionDuration: "0.6s" }}
        >
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

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-5 lg:gap-6">
          {products.map((product, i) => (
            <ProductCard
              key={i}
              product={product}
              index={i}
              visible={visible}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div
          className={`flex justify-center mt-10 md:mt-12 lg:mt-14 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            transitionDelay: visible ? "0.6s" : "0s",
            transitionDuration: "0.6s",
          }}
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-cormorant text-[15px] font-medium uppercase tracking-[0.08em] px-10 py-3.5 rounded-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
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
