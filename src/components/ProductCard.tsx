import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";

export interface Product {
  id?: string;
  image: string;
  hoverImage: string;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  sizes: string[];
  availability: "In Stock" | "Pre-Order";
  tag?: string;
  rating?: number;
  reviewCount?: number;
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
  const { toggleItem, isWishlisted } = useWishlist();
  const slug = product.id || toSlug(product.name);
  const wishlisted = isWishlisted(slug);

  // Default rating for demo — in production this comes from reviews data
  const rating = product.rating ?? 4.8;
  const reviewCount = product.reviewCount ?? 24;

  return (
    <div
      data-product-card
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
          className="relative overflow-hidden transition-all duration-300"
          style={{ aspectRatio: "3/4" }}
        >
          {/* Primary image */}
          <img
            src={product.image}
            alt={`${product.name} — ${product.category} by Naira Flore`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out"
            style={{
              opacity: hovered ? 0 : 1,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            loading="lazy"
            width={400}
            height={533}
          />
          {/* Hover image */}
          <img
            src={product.hoverImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            loading="lazy"
            width={400}
            height={533}
          />

          {/* Tag */}
          <span
            className="absolute top-2.5 left-2.5 md:top-3 md:left-3 z-20 text-[8px] md:text-[9px] font-normal uppercase tracking-[0.14em] px-2 py-[3px] md:px-2.5 md:py-1 transition-opacity duration-300"
            style={{
              backgroundColor: "hsla(0, 0%, 100%, 0.55)",
              color: "hsl(0 0% 32%)",
              backdropFilter: "blur(6px)",
              opacity: hovered ? 0.4 : 0.85,
            }}
          >
            {product.tag || "New"}
          </span>

          {/* Stock badge */}
          {product.availability === "Pre-Order" && (
            <span
              className="absolute top-2.5 right-10 z-20 text-[8px] font-medium uppercase tracking-[0.1em] px-2 py-[3px]"
              style={{ backgroundColor: "hsl(35 90% 55%)", color: "#fff" }}
            >
              Pre-Order
            </span>
          )}

          {/* Wishlist icon */}
          <button
            className="absolute top-3 right-3 z-20 w-10 h-10 flex items-center justify-center transition-all duration-200"
            style={{ borderRadius: "50%", backgroundColor: "hsla(0,0%,100%,0.85)" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem({ id: slug, name: product.name, price: product.price, image: product.image });
            }}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
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

          {/* Desktop: Add to Cart hover overlay */}
          <div
            className="absolute inset-x-0 bottom-0 z-20 hidden md:flex items-end justify-center pb-4 transition-all duration-300 ease-out"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <button
              className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200"
              style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 23%)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 28%)")}
            >
              <ShoppingBag size={14} />
              Add to Cart
            </button>
          </div>

          {/* Hover gradient */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 z-10 transition-opacity duration-300"
            style={{
              background: "linear-gradient(to top, hsla(0,0%,0%,0.35), transparent)",
              opacity: hovered ? 1 : 0,
            }}
          />
        </div>

        {/* Product info */}
        <div className="pt-3 px-1">
          {/* Star rating */}
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={10}
                  style={{
                    color: star <= Math.floor(rating) ? "hsl(38 90% 50%)" : "hsl(0 0% 82%)",
                    fill: star <= Math.floor(rating) ? "hsl(38 90% 50%)" : "none",
                  }}
                />
              ))}
            </div>
            <span className="text-[11px]" style={{ color: "hsl(0 0% 55%)" }}>
              {rating} ({reviewCount})
            </span>
          </div>

          <h3
            className="font-cormorant text-[16px] lg:text-[18px] font-medium leading-snug"
            style={{ color: "hsl(0 0% 18%)" }}
          >
            {product.name}
          </h3>
          <p className="font-cormorant text-[13px] lg:text-[14px] mt-0.5" style={{ color: "hsl(0 0% 48%)" }}>
            {product.category}
          </p>
          <p className="font-cormorant text-[15px] lg:text-[16px] font-semibold mt-1.5" style={{ color: "hsl(186 35% 28%)" }}>
            FROM <span className="font-bold">{product.price}</span>
          </p>

          {/* Mobile: always-visible ATC button */}
          <button
            className="md:hidden w-full mt-3 py-3 flex items-center justify-center gap-2 text-[12px] font-medium uppercase tracking-[0.1em] transition-colors duration-200 min-h-[44px]"
            style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={13} />
            Add to Cart
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
