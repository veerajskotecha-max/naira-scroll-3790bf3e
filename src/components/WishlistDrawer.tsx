import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useWishlist } from "@/contexts/WishlistContext";
import { jewellery, PREORDER_LABEL } from "@/data/jewellery";
import { useSwipeDismiss } from "@/hooks/useSwipeDismiss";
import { followOut, useBackToClose } from "@/hooks/useBackToClose";

/* Jewellery is wishlisted by handle; route those to the jewellery PDP. */
const jewelHandles = new Set(jewellery.map((j) => j.handle));

const WishlistDrawer = () => {
  const { items, removeItem, isDrawerOpen, setDrawerOpen } = useWishlist();
  const contentRef = useRef<HTMLDivElement>(null);
  // The phone's back button closes the wishlist — see useBackToClose.
  const { requestClose, closeThen } = useBackToClose("nfWishlist", isDrawerOpen, setDrawerOpen);
  useSwipeDismiss(contentRef, isDrawerOpen, requestClose);
  const leave = followOut(closeThen, useNavigate());

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(next) => (next ? setDrawerOpen(true) : requestClose())}>
      {/* Same as the bag: a back arrow on phones, the corner cross on desktop. */}
      <SheetContent ref={contentRef} closeClassName="hidden sm:flex" className="w-full sm:max-w-[420px] flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center">
            <button
              type="button"
              onClick={requestClose}
              aria-label="Back to shopping"
              /* Full 44px tap area; the negative margins keep it from making
                 the header taller or pushing the title away. */
              className="-my-1.5 -ml-3 -mr-1 flex h-11 w-11 shrink-0 items-center justify-center text-[var(--nf-text)] transition-opacity duration-150 active:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nf-accent)] sm:hidden"
            >
              <ChevronLeft size={22} strokeWidth={1.4} aria-hidden="true" />
            </button>
            <SheetTitle className="font-cormorant text-[20px] font-semibold" style={{ color: "hsl(0 0% 15%)" }}>
              Your Wishlist
            </SheetTitle>
          </div>
        </SheetHeader>

        <Separator />

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div
              className="w-16 h-16 flex items-center justify-center border"
              style={{ borderColor: "hsl(36 47% 46% / 0.35)", backgroundColor: "hsl(33 41% 95%)" }}
            >
              <Heart size={24} strokeWidth={1.3} style={{ color: "hsl(36 47% 46%)" }} />
            </div>
            <p className="mt-5 font-cormorant text-[22px] font-semibold" style={{ color: "hsl(0 0% 18%)" }}>
              Your wishlist is empty
            </p>
            <p className="mt-2 font-cormorant text-[15px] leading-[1.7] max-w-[240px]" style={{ color: "hsl(0 0% 50%)" }}>
              Tap the heart on a piece you love and it will wait for you here.
            </p>
            <Link
              to="/jewellery"
              onClick={leave}
              className="mt-7 px-9 min-h-[48px] text-[12px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 inline-flex items-center"
              style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
            >
              View Jewellery
            </Link>
            <Link
              to="/jewellery"
              onClick={leave}
              className="mt-4 inline-flex items-center min-h-[44px] px-2 font-cormorant text-[14px] underline underline-offset-4 transition-colors duration-200"
              style={{ color: "hsl(0 0% 45%)" }}
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {items.map((item) => (
              <Link
                key={item.id}
                to={jewelHandles.has(item.id) ? `/jewellery/${item.id}` : `/product/${item.id}`}
                onClick={leave}
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
                    {item.price === PREORDER_LABEL ? (
                      <p className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ color: "#9A7634", fontFamily: "'Jost', 'Inter', sans-serif" }}>
                        <span aria-hidden className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: "#C99A4C" }} />
                        {item.price}
                      </p>
                    ) : (
                      <p className="font-cormorant text-[15px] font-bold mt-1" style={{ color: "hsl(186 35% 28%)" }}>
                        {item.price}
                      </p>
                    )}
                  </div>
                  {/* A word, not a cross — as in the bag, where the only cross
                      left on a phone would otherwise be this one. */}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeItem(item.id); }}
                    className="self-start inline-flex min-h-[44px] items-center px-1 text-[11px] tracking-[var(--nf-track-4)] text-[color:rgb(var(--nf-ink-rgb)/0.55)] underline decoration-[color:rgb(var(--nf-ink-rgb)/0.25)] underline-offset-4 transition-colors duration-150 hover:text-[var(--nf-text)]"
                    aria-label={`Remove ${item.name} from wishlist`}
                  >
                    Remove
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
