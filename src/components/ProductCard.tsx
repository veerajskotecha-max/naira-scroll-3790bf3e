import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";

export interface Product {
  id?: string;
  image: string;
  hoverImage: string;
  name: string;
  category: string;
  price: string;
  tag?: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  visible?: boolean;
}

const toSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const ProductCard = ({ product, index = 0, visible = true }: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const slug = product.id || toSlug(product.name);

  return (
    <div
      className={`group transition-all ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{
        transitionDelay: visible ? `${index * 0.1 + 0.15}s` : "0s",
        transitionDuration: "0.6s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${slug}`} className="block cursor-pointer">
        {/* Image area */}
        <div
          className="relative overflow-hidden rounded-lg transition-shadow duration-300"
          style={{
            aspectRatio: "3/4",
            boxShadow: hovered ? "0 8px 24px hsl(0 0% 0% / 0.1)" : "0 2px 8px hsl(0 0% 0% / 0.04)",
          }}
        >
          {/* Primary image */}
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover rounded-lg transition-all duration-500 ease-out"
            style={{
              opacity: hovered ? 0 : 1,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            loading="lazy"
          />
          {/* Hover image */}
          <img
            src={product.hoverImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 w-full h-full object-cover rounded-lg transition-all duration-500 ease-out"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            loading="lazy"
          />

          {/* Tag */}
          <span
            className="absolute top-3 left-3 z-20 text-[11px] md:text-[12px] font-medium uppercase tracking-[0.1em] px-2.5 py-1.5"
            style={{
              backgroundColor: "hsl(186 35% 28%)",
              color: "hsl(0 0% 100%)",
              borderRadius: "3px",
            }}
          >
            {product.tag || "NEW ARRIVAL"}
          </span>

          {/* Wishlist icon */}
          <button
            className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              backgroundColor: "hsla(0,0%,100%,0.85)",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setWishlisted(!wishlisted);
            }}
          >
            <Heart
              size={15}
              className="transition-colors duration-200"
              style={{
                color: wishlisted ? "hsl(0 70% 55%)" : "hsl(0 0% 40%)",
                fill: wishlisted ? "hsl(0 70% 55%)" : "none",
              }}
            />
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add to cart logic here
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

          {/* Hover gradient overlay */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 z-10 rounded-b-lg transition-opacity duration-300"
            style={{
              background: "linear-gradient(to top, hsla(0,0%,0%,0.35), transparent)",
              opacity: hovered ? 1 : 0,
            }}
          />
        </div>

        {/* Product info */}
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
      </Link>
    </div>
  );
};

export default ProductCard;
