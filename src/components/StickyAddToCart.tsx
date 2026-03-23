import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface StickyAddToCartProps {
  image: string;
  title: string;
  price: string;
  selectedSize: string;
}

const StickyAddToCart = ({ image, title, price, selectedSize }: StickyAddToCartProps) => {
  const [visible, setVisible] = useState(false);
  const { addItem, setDrawerOpen } = useCart();

  const handleAdd = () => {
    addItem({
      id: "midnight-silk-drape-saree",
      name: title,
      price: 18500,
      priceLabel: price,
      image,
      size: selectedSize,
    });
    toast("Added to cart", {
      description: `1× ${title} (${selectedSize})`,
      action: { label: "View Cart", onClick: () => setDrawerOpen(true) },
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
      className="fixed bottom-0 left-0 w-full z-50 transition-all duration-300 ease-out pointer-events-none"
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
                className="w-12 h-12 rounded-md object-cover shrink-0"
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
                className="px-4 py-1.5 rounded-full text-[12px] font-medium"
                style={{
                  backgroundColor: "hsl(0 0% 96%)",
                  border: "1px solid hsl(0 0% 88%)",
                  color: "hsl(0 0% 30%)",
                }}
              >
                SIZE&nbsp;&nbsp;{selectedSize}
              </div>
              <button
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200"
                style={{
                  backgroundColor: "hsl(186 35% 28%)",
                  color: "hsl(0 0% 100%)",
                  boxShadow: "0 2px 8px hsl(186 35% 28% / 0.3)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 23%)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 28%)")}
              >
                <ShoppingBag size={15} />
                Add
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img
                src={image}
                alt={title}
                className="w-10 h-10 rounded-md object-cover shrink-0"
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
                className="px-3 py-1 rounded-full text-[11px] font-medium shrink-0"
                style={{
                  backgroundColor: "hsl(0 0% 96%)",
                  border: "1px solid hsl(0 0% 88%)",
                  color: "hsl(0 0% 30%)",
                }}
              >
                {selectedSize}
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[13px] font-medium uppercase tracking-[0.08em]"
              style={{
                backgroundColor: "hsl(186 35% 28%)",
                color: "hsl(0 0% 100%)",
              }}
            >
              <ShoppingBag size={15} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyAddToCart;
