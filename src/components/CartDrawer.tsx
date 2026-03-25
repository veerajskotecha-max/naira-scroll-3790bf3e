import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";

const CartDrawer = () => {
  const { items, totalItems, subtotal, updateQuantity, removeItem, isDrawerOpen, setDrawerOpen } = useCart();

  const formatPrice = (n: number) =>
    `₹${n.toLocaleString("en-IN")}`;

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full sm:max-w-[420px] flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-cormorant text-[20px] font-semibold" style={{ color: "hsl(0 0% 15%)" }}>
              Your Cart ({totalItems})
            </SheetTitle>
          </div>
        </SheetHeader>

        <Separator />

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div
              className="w-20 h-20 flex items-center justify-center"
              style={{ backgroundColor: "hsl(0 0% 96%)" }}
            >
              <ShoppingBag size={32} style={{ color: "hsl(0 0% 60%)" }} />
            </div>
            <p className="font-cormorant text-[18px] font-semibold" style={{ color: "hsl(0 0% 25%)" }}>
              Your cart is empty
            </p>
            <p className="font-cormorant text-[14px] text-center" style={{ color: "hsl(0 0% 55%)" }}>
              Start adding items to your cart
            </p>
            <Link
              to="/shop"
              onClick={() => setDrawerOpen(false)}
              className="mt-2 px-8 py-3 rounded-md text-[13px] font-medium uppercase tracking-[0.1em] transition-colors duration-200"
              style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-[80px] h-[100px] rounded-md object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <p className="font-cormorant text-[15px] font-semibold truncate" style={{ color: "hsl(0 0% 15%)" }}>
                        {item.name}
                      </p>
                      {item.size && (
                        <p className="text-[12px] mt-0.5" style={{ color: "hsl(0 0% 55%)" }}>
                          Size: {item.size}
                        </p>
                      )}
                      <p className="font-cormorant text-[15px] font-bold mt-1" style={{ color: "hsl(186 35% 28%)" }}>
                        {item.priceLabel}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center border rounded-md" style={{ borderColor: "hsl(0 0% 82%)" }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-muted"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-[13px] font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-muted"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="p-1.5 rounded-full transition-colors hover:bg-muted"
                      >
                        <X size={14} style={{ color: "hsl(0 0% 50%)" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t px-5 py-4 space-y-4" style={{ borderColor: "hsl(0 0% 90%)" }}>
              <div className="flex items-center justify-between">
                <span className="font-cormorant text-[16px] font-semibold" style={{ color: "hsl(0 0% 25%)" }}>
                  Subtotal
                </span>
                <span className="font-cormorant text-[18px] font-bold" style={{ color: "hsl(186 35% 28%)" }}>
                  {formatPrice(subtotal)}
                </span>
              </div>
              <button
                className="w-full py-3.5 rounded-md text-[13px] font-medium uppercase tracking-[0.1em] transition-colors duration-200"
                style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 23%)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 28%)")}
              >
                Checkout
              </button>
              <Link
                to="/shop"
                onClick={() => setDrawerOpen(false)}
                className="block text-center font-cormorant text-[14px] underline transition-colors"
                style={{ color: "hsl(0 0% 45%)" }}
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
