import { useEffect, useRef, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface StickyAddToCartProps {
  image: string;
  title: string;
  price: string;
  selectedSize: string;
  productHandle?: string;
  variantId?: string;
  numericPrice?: number;
  currencyCode?: string;
  /** False when the shown variant is sold out — keeps the bar honest with the PDP. */
  inStock?: boolean;
}

const StickyAddToCart = ({ image, title, price, selectedSize, productHandle = "", variantId, numericPrice = 0, currencyCode = "INR", inStock = true }: StickyAddToCartProps) => {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number>();
  const { addItem, buyNow, setDrawerOpen } = useCart();

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  const handleAdd = async () => {
    if (!variantId) {
      toast.error("This product is currently unavailable.");
      return;
    }
    if (!inStock) {
      toast.error(`${title} is sold out${selectedSize ? ` in size ${selectedSize}` : ""}.`);
      return;
    }

    await addItem({
      id: productHandle,
      variantId,
      name: title,
      price: numericPrice,
      priceLabel: price,
      currencyCode,
      image,
      size: selectedSize,
    });
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 1500);
    toast("Added to cart", {
      description: `1× ${title} (${selectedSize})`,
      action: { label: "View Cart", onClick: () => setDrawerOpen(true) },
    });
  };

  const handleBuyNow = async () => {
    if (!variantId) {
      toast.error("This product is currently unavailable.");
      return;
    }
    await buyNow({
      id: productHandle,
      variantId,
      name: title,
      price: numericPrice,
      priceLabel: price,
      currencyCode,
      image,
      size: selectedSize,
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const trigger = document.getElementById("product-actions");
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setVisible(rect.bottom < 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 w-full z-50 transition-[opacity,transform] duration-300 ease-out pointer-events-none"
      style={{
        transform: visible ? "translateY(0)" : "translateY(100%)",
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="pointer-events-auto"
        style={{
          backgroundColor: "hsl(0 0% 100%)",
          borderTop: "1px solid hsl(0 0% 90%)",
          boxShadow: "0 -4px 20px hsl(0 0% 0% / 0.06)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 py-3 md:py-3.5">
          {/* Desktop */}
          <div className="hidden md:flex items-center justify-between gap-6">
            {/* Left — info */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={image}
                alt={title}
                className="w-12 h-12 object-cover shrink-0"
              />
              <div className="min-w-0">
                <p
                  className="font-cormorant text-[15px] font-semibold truncate"
                  style={{ color: "hsl(0 0% 15%)" }}
                >
                  {title}
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className="font-cormorant text-[15px] font-bold"
                    style={{ color: "hsl(186 35% 28%)" }}
                  >
                    {price}
                  </span>
                  <span className="text-[12px]" style={{ color: "hsl(0 0% 55%)" }}>
                    Size: {selectedSize}
                  </span>
                </div>
              </div>
            </div>

            {/* Right — controls */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                className="px-4 py-1.5 text-[12px] font-medium"
                style={{
                  backgroundColor: "hsl(0 0% 96%)",
                  border: "1px solid hsl(0 0% 88%)",
                  color: "hsl(0 0% 30%)",
                }}
              >
                SIZE&nbsp;&nbsp;{selectedSize}
              </div>
              <button
                onClick={handleAdd}
                className="press-scale flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200"
                style={{
                  backgroundColor: "hsl(186 35% 28%)",
                  color: "hsl(0 0% 100%)",
                  boxShadow: "0 2px 8px hsl(186 35% 28% / 0.3)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 23%)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 28%)")}
              >
                {added ? (
                  <span className="check-pop flex items-center gap-2">
                    <Check size={15} /> Added
                  </span>
                ) : (
                  <>
                    <ShoppingBag size={15} />
                    Add
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img
                src={image}
                alt={title}
                className="w-10 h-10 object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p
                  className="font-cormorant text-[14px] font-semibold truncate"
                  style={{ color: "hsl(0 0% 15%)" }}
                >
                  {title}
                </p>
                <span
                  className="font-cormorant text-[14px] font-bold"
                  style={{ color: "hsl(186 35% 28%)" }}
                >
                  {price}
                </span>
              </div>
              <div
                className="px-3 py-1 text-[11px] font-medium shrink-0"
                style={{
                  backgroundColor: "hsl(0 0% 96%)",
                  border: "1px solid hsl(0 0% 88%)",
                  color: "hsl(0 0% 30%)",
                }}
              >
                {selectedSize}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAdd}
                className="press-scale flex items-center justify-center gap-1.5 py-3 text-[11px] font-medium uppercase tracking-[0.1em] border"
                style={{
                  borderColor: "hsl(0 0% 20%)",
                  color: "hsl(0 0% 20%)",
                  backgroundColor: "transparent",
                }}
              >
                {added ? (
                  <span className="check-pop flex items-center gap-1.5">
                    <Check size={13} /> Added
                  </span>
                ) : (
                  <>
                    <ShoppingBag size={13} />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                className="press-scale flex items-center justify-center py-3 text-[11px] font-medium uppercase tracking-[0.1em]"
                style={{
                  backgroundColor: "hsl(0 0% 12%)",
                  color: "hsl(0 0% 100%)",
                }}
              >
                Buy It Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyAddToCart;
