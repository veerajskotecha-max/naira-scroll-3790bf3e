import { useEffect, useRef, useState } from "react";
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
    image: product2,
    hoverImage: product2Hover,
    name: "Ivory Embroidered Anarkali",
    category: "Designer Anarkali",
    price: "₹22,800",
    tag: "BESTSELLER",
  },
  {
    image: product3,
    hoverImage: product3Hover,
    name: "Terracotta Lehenga Set",
    category: "Contemporary Lehengas",
    price: "₹28,500",
    tag: "NEW ARRIVAL",
  },
  {
    image: product4,
    hoverImage: product4Hover,
    name: "Lavender Chiffon Kurta Set",
    category: "Premium Kurtas",
    price: "₹12,900",
    tag: "NEW ARRIVAL",
  },
  {
    image: product1,
    hoverImage: product1Hover,
    name: "Rose Gold Silk Saree",
    category: "Classic Sarees",
    price: "₹16,200",
    tag: "BESTSELLER",
  },
];

const YouMayAlsoLike = () => {
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

        {/* Desktop/Tablet grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <ProductCard key={i} product={product} index={i} visible={visible} />
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {products.map((product, i) => (
            <div key={i} className="min-w-[260px] snap-start">
              <ProductCard product={product} index={i} visible={visible} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default YouMayAlsoLike;
