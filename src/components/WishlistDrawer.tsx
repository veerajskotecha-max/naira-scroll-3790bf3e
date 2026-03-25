import { Link } from "react-router-dom";
import { X, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useWishlist } from "@/contexts/WishlistContext";

const WishlistDrawer = () => {
  const { items, removeItem, isDrawerOpen, setDrawerOpen } = useWishlist();

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full sm:max-w-[420px] flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-cormorant text-[20px] font-semibold" style={{ color: "hsl(0 0% 15%)" }}>
              Your Wishlist
            </SheetTitle>
          </div>
        </SheetHeader>

        <Separator />

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div
              className="w-20 h-20 flex items-center justify-center"
              style={{ backgroundColor: "hsl(0 0% 96%)" }}
            >
              <Heart size={32} style={{ color: "hsl(0 0% 60%)" }} />
            </div>
            <p className="font-cormorant text-[18px] font-semibold" style={{ color: "hsl(0 0% 25%)" }}>
              Your wishlist is empty
            </p>
            <p className="font-cormorant text-[14px] text-center" style={{ color: "hsl(0 0% 55%)" }}>
              Save items you love
            </p>
            <Link
              to="/shop"
              onClick={() => setDrawerOpen(false)}
              className="mt-2 px-8 py-3 text-[13px] font-medium uppercase tracking-[0.1em] transition-colors duration-200"
              style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.id}`}
                onClick={() => setDrawerOpen(false)}
                className="flex gap-3 group"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-[80px] h-[100px] object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <p className="font-cormorant text-[15px] font-semibold truncate group-hover:underline" style={{ color: "hsl(0 0% 15%)" }}>
                      {item.name}
                    </p>
                    <p className="font-cormorant text-[15px] font-bold mt-1" style={{ color: "hsl(186 35% 28%)" }}>
                      {item.price}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeItem(item.id); }}
                    className="self-start p-1.5 rounded-full transition-colors hover:bg-muted"
                    aria-label="Remove from wishlist"
                  >
                    <X size={14} style={{ color: "hsl(0 0% 50%)" }} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default WishlistDrawer;
