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
    price: "FROM ₹18,500",
  },
  {
    image: product2,
    name: "Ivory Embroidered Anarkali",
    category: "Designer Anarkali",
    price: "FROM ₹22,800",
  },
  {
    image: product3,
    name: "Terracotta Lehenga Set",
    category: "Contemporary Lehengas",
    price: "FROM ₹28,500",
  },
  {
    image: product4,
    name: "Lavender Chiffon Kurta Set",
    category: "Premium Kurtas",
    price: "FROM ₹12,900",
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
      { threshold: 0.15 }
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
        className="absolute top-[-20px] left-[-30px] w-[140px] md:w-[200px] lg:w-[260px] opacity-40 pointer-events-none select-none"
      />
      <img
        src={floralBottomRight}
        alt=""
        aria-hidden="true"
        className="absolute bottom-[-20px] right-[-30px] w-[140px] md:w-[200px] lg:w-[260px] opacity-40 pointer-events-none select-none"
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Heading */}
        <div
          className={`text-center mb-10 transition-all duration-600 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionDuration: "0.6s" }}
        >
          <h2
            className="font-cormorant text-[28px] md:text-[34px] lg:text-[42px] font-medium mb-4"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6 lg:gap-8">
          {products.map((product, i) => (
            <div
              key={i}
              className={`group rounded-lg overflow-hidden p-3 transition-all duration-300 ease-out cursor-pointer hover:shadow-md ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                backgroundColor: "#FFFDF9",
                border: "1px solid #E3D8C8",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transitionDelay: visible ? `${i * 0.1 + 0.15}s` : "0s",
                transitionDuration: "0.6s",
              }}
            >
              {/* Image container */}
              <div className="relative overflow-hidden rounded-md" style={{ aspectRatio: "4/5" }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {/* NEW ARRIVAL tag */}
                <span
                  className="absolute top-3 left-3 text-[12px] font-medium uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-sm"
                  style={{
                    backgroundColor: "#2F5D63",
                    color: "#FFFFFF",
                  }}
                >
                  NEW ARRIVAL
                </span>
              </div>

              {/* Card info */}
              <div className="pt-4 pb-1 px-1">
                <h3
                  className="font-cormorant text-[16px] lg:text-[18px] font-medium leading-snug"
                  style={{ color: "#2D2D2D" }}
                >
                  {product.name}
                </h3>
                <p
                  className="font-cormorant text-[14px] mt-1.5"
                  style={{ color: "#7A7A7A" }}
                >
                  {product.category}
                </p>
                <p
                  className="font-cormorant text-[16px] font-semibold mt-2"
                  style={{ color: "#2F5D63" }}
                >
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div
          className={`flex justify-center mt-12 md:mt-14 lg:mt-16 transition-all duration-600 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: visible ? "0.6s" : "0s", transitionDuration: "0.6s" }}
        >
          <Link
            to="/shop"
            className="font-cormorant text-[14px] font-medium uppercase tracking-[0.08em] px-9 py-3.5 rounded-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              backgroundColor: "#2F5D63",
              color: "#FFFFFF",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#264D52")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2F5D63")
            }
          >
            VIEW ALL →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
