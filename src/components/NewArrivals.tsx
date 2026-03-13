import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import floralTopLeft from "@/assets/floral-top-left.png";
import floralBottomRight from "@/assets/floral-bottom-right.png";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const products = [
  {
    image: product1,
    name: "Midnight Silk Drape Saree",
    category: "Fusion Sarees",
    price: "₹18,500",
  },
  {
    image: product2,
    name: "Ivory Embroidered Anarkali",
    category: "Designer Anarkali",
    price: "₹22,800",
  },
  {
    image: product3,
    name: "Terracotta Lehenga Set",
    category: "Contemporary Lehengas",
    price: "₹28,500",
  },
  {
    image: product4,
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
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-[70px] md:py-[90px] lg:py-[120px]"
      style={{ backgroundColor: "#E7DCCB" }}
    >
      {/* Decorative florals */}
      <img
        src={floralTopLeft}
        alt=""
        aria-hidden="true"
        className="absolute top-[-10px] left-[-20px] w-[160px] md:w-[220px] lg:w-[300px] opacity-50 pointer-events-none select-none -rotate-12"
      />
      <img
        src={floralBottomRight}
        alt=""
        aria-hidden="true"
        className="absolute bottom-[-10px] right-[-20px] w-[160px] md:w-[220px] lg:w-[300px] opacity-50 pointer-events-none select-none rotate-12"
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Heading */}
        <div
          className={`text-center mb-10 md:mb-12 lg:mb-14 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionDuration: "0.6s" }}
        >
          <h2
            className="font-cormorant text-[28px] md:text-[34px] lg:text-[42px] font-medium italic mb-3"
            style={{ color: "#2D2D2D" }}
          >
            New Arrivals
          </h2>
          <p
            className="font-cormorant text-[14px] md:text-[15px] lg:text-[16px]"
            style={{ color: "#6E6E6E" }}
          >
            The latest trends straight from our studio.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6 lg:gap-7">
          {products.map((product, i) => (
            <div
              key={i}
              className={`group cursor-pointer transition-all ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                transitionDelay: visible ? `${i * 0.1 + 0.15}s` : "0s",
                transitionDuration: "0.6s",
              }}
            >
              {/* Image area with crescent arc */}
              <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: "4/5" }}>
                {/* Card background */}
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(227,216,200,0.6)",
                  }}
                />

                {/* White crescent arc decoration */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: "8%",
                    left: "10%",
                    width: "80%",
                    height: "80%",
                    border: "3px solid rgba(255,255,255,0.7)",
                    borderRadius: "50%",
                    clipPath: "polygon(0 0, 100% 0, 100% 65%, 0 65%)",
                  }}
                />

                {/* Product image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />

                {/* White crescent arc overlay (on top of image for depth) */}
                <div
                  className="absolute pointer-events-none z-10"
                  style={{
                    top: "5%",
                    left: "8%",
                    width: "84%",
                    height: "75%",
                    border: "3.5px solid rgba(255,255,255,0.55)",
                    borderRadius: "50%",
                    clipPath: "polygon(5% 0, 95% 0, 100% 55%, 0 55%)",
                  }}
                />

                {/* NEW ARRIVAL tag — positioned at top-left, overlapping edge */}
                <span
                  className="absolute top-3 left-3 z-20 text-[11px] md:text-[12px] font-medium uppercase tracking-[0.1em] px-2.5 py-1.5"
                  style={{
                    backgroundColor: "#2F5D63",
                    color: "#FFFFFF",
                    borderRadius: "3px",
                  }}
                >
                  NEW ARRIVAL
                </span>
              </div>

              {/* Product info — outside the card */}
              <div className="pt-4 px-1">
                <h3
                  className="font-cormorant text-[16px] lg:text-[18px] font-medium leading-snug"
                  style={{ color: "#2D2D2D" }}
                >
                  {product.name}
                </h3>
                <p
                  className="font-cormorant text-[13px] lg:text-[14px] mt-1"
                  style={{ color: "#7A7A7A" }}
                >
                  {product.category}
                </p>
                <p
                  className="font-cormorant text-[15px] lg:text-[16px] font-semibold mt-2"
                  style={{ color: "#2F5D63" }}
                >
                  FROM <span className="font-bold">{product.price}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div
          className={`flex justify-center mt-12 md:mt-14 lg:mt-16 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: visible ? "0.6s" : "0s", transitionDuration: "0.6s" }}
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-cormorant text-[15px] font-medium uppercase tracking-[0.08em] px-10 py-3.5 rounded-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ backgroundColor: "#2F5D63", color: "#FFFFFF" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#264D52")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2F5D63")}
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
