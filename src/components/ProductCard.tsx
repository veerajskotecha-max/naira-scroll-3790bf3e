import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { formatShopifyPrice, type ShopifyProductNode, type ShopifyProductVariant } from "@/lib/shopify";
import { shopifyImage, shopifySrcSet } from "@/lib/shopifyImage";

export interface Product {
  id?: string;
  handle?: string;
  image: string;
  hoverImage: string;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  sizes: string[];
  availability: "In Stock" | "Sold Out";
  tag?: string;
  variantId?: string;
  variantTitle?: string;
  currencyCode?: string;
  selectedOptions?: Array<{ name: string; value: string }>;
  shopifyProduct?: ShopifyProductNode;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  visible?: boolean;
}

const toSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const productFromShopify = (product: ShopifyProductNode): Product => {
  const images = product.images.edges.map((edge) => edge.node.url);
  const firstAvailableVariant = product.variants.edges.find((edge) => edge.node.availableForSale)?.node;
  const firstVariant = firstAvailableVariant ?? product.variants.edges[0]?.node;
  const price = firstVariant?.price ?? product.priceRange.minVariantPrice;
  const sizes = product.options.find((option) => option.name.toLowerCase() === "size")?.values ??
    firstVariant?.selectedOptions.map((option) => option.value) ??
    [];

  return {
    id: product.handle,
    handle: product.handle,
    image: images[0] ?? "/placeholder.svg",
    hoverImage: images[1] ?? images[0] ?? "/placeholder.svg",
    name: product.title,
    category: product.productType || "Naira Flore",
    price: formatShopifyPrice(price),
    numericPrice: Number(price.amount),
    sizes,
    /* This is stock state, not a pre-order programme — there is no pre-order
       concept in the data. Calling a sold-out piece "Pre-Order" put an orange
       invitation next to a disabled button, and made the Pre-Order filter
       return nothing but unbuyable tiles. */
    availability: firstVariant?.availableForSale ? "In Stock" : "Sold Out",
    tag: product.tags[0] || "New",
    variantId: firstVariant?.id,
    variantTitle: firstVariant?.title,
    currencyCode: price.currencyCode,
    selectedOptions: firstVariant?.selectedOptions ?? [],
    shopifyProduct: product,
  };
};

const ProductCard = ({ product, index = 0, visible = true }: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [heartPopped, setHeartPopped] = useState(false);
  const addedTimer = useRef<number>();
  const { toggleItem, isWishlisted } = useWishlist();
  const { addItem, setDrawerOpen, isLoading } = useCart();
  const slug = product.handle || product.id || toSlug(product.name);
  const wishlisted = isWishlisted(slug);

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  const handleAddToCart = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!product.variantId) {
      toast.error("This product is currently unavailable.");
      return;
    }

    setAdding(true);
    const added = await addItem({
      id: slug,
      variantId: product.variantId,
      name: product.name,
      price: product.numericPrice,
      priceLabel: product.price,
      currencyCode: product.currencyCode ?? "INR",
      image: product.image,
      size: product.selectedOptions?.find((option) => option.name.toLowerCase() === "size")?.value,
      variantTitle: product.variantTitle,
      selectedOptions: product.selectedOptions,
    });
    setAdding(false);
    /* addItem returns null on every failure path. Showing the tick and the
       "View Cart" toast regardless sent shoppers to an empty cart. */
    if (!added) return;
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 1500);
    toast("Added to cart", {
      description: product.name,
      action: { label: "View Cart", onClick: () => setDrawerOpen(true) },
    });
  };

  const disabled = adding || isLoading || !product.variantId || product.availability !== "In Stock";

  return (
    <div
      data-product-card
      className={`group transition-[opacity,transform] ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{
        transitionDelay: visible ? `${index * 0.06 + 0.1}s` : "0s",
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
          <img
            src={shopifyImage(product.image, 600)}
            srcSet={shopifySrcSet(product.image)}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            alt={`${product.name} · ${product.category} by Naira Flore`}
            className="absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out"
            style={{
              opacity: hovered ? 0 : 1,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            loading="lazy"
            decoding="async"
            width={400}
            height={533}
          />
          <img
            src={shopifyImage(product.hoverImage, 600)}
            srcSet={shopifySrcSet(product.hoverImage)}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            alt={`${product.name} alternate view`}
            className="absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            loading="lazy"
            decoding="async"
            width={400}
            height={533}
          />

          {/* Shopify's internal tags (YS, YF…) are merchandising codes, not
              shopper-facing copy — no badge is rendered from them. */}


          {/* The CTA below already reads "Sold Out"; a second badge saying the
              same thing is noise, and the orange "Pre-Order" pill it replaced
              was inviting shoppers to reserve stock that does not exist. */}

          <button
            className="press-scale absolute top-3 right-3 z-20 w-10 h-10 flex items-center justify-center"
            style={{ borderRadius: "50%", backgroundColor: "hsla(0,0%,100%,0.85)" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!wishlisted) setHeartPopped(true);
              toggleItem({ id: slug, name: product.name, price: product.price, image: product.image });
            }}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          >
            <Heart
              size={15}
              className={`transition-colors duration-200 ${heartPopped ? "heart-pop" : ""}`}
              onAnimationEnd={() => setHeartPopped(false)}
              style={{
                color: wishlisted ? "hsl(0 70% 55%)" : "hsl(0 0% 40%)",
                fill: wishlisted ? "hsl(0 70% 55%)" : "none",
              }}
            />
          </button>

          <div
            className="absolute inset-x-0 bottom-0 z-20 hidden md:flex items-end justify-center pb-4 transition-[opacity,transform] duration-200 ease-out"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <button
              className="press-scale flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 disabled:opacity-70"
              style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
              onClick={handleAddToCart}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 23%)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 28%)")}
              disabled={disabled}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <span className="check-pop flex items-center gap-2">
                  <Check size={14} /> Added
                </span>
              ) : (
                <>
                  {adding ? <Loader2 size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
                  {product.availability === "In Stock" ? "Add to Cart" : "Sold Out"}
                </>
              )}
            </button>
          </div>

          <div
            className="absolute inset-x-0 bottom-0 h-1/3 z-10 transition-opacity duration-300"
            style={{
              background: "linear-gradient(to top, hsla(0,0%,0%,0.35), transparent)",
              opacity: hovered ? 1 : 0,
            }}
          />
        </div>

        <div className="pt-3 px-1 flex flex-col">
          <h3
            className="font-cormorant text-[16px] lg:text-[18px] font-medium leading-snug min-h-[44px] lg:min-h-[50px]"
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

          <button
            className="press-scale md:hidden w-full mt-3 py-3 flex items-center justify-center gap-2 text-[12px] font-medium uppercase tracking-[0.1em] transition-colors duration-200 min-h-[44px] disabled:opacity-70"
            style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
            onClick={handleAddToCart}
            disabled={disabled}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <span className="check-pop flex items-center gap-2">
                <Check size={13} /> Added
              </span>
            ) : (
              <>
                {adding ? <Loader2 size={13} className="animate-spin" /> : <ShoppingBag size={13} />}
                {product.availability === "In Stock" ? "Add to Cart" : "Sold Out"}
              </>
            )}
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
