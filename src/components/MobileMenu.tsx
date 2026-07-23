import { useEffect } from "react";
import { X, Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "HOME",      to: "/" },
  { label: "JEWELLERY", to: "/shop/jewellery" },
  { label: "INDO-WESTERN", to: "/shop/indo-western" },
  { label: "ABOUT",     to: "/about" },
  { label: "CUSTOMIZE", to: "/customize" },
  { label: "CONTACT",   to: "/contact" },
];

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { totalItems, setDrawerOpen: openCart }       = useCart();
  const { totalItems: wishlistCount, setDrawerOpen: openWishlist } = useWishlist();

  /* Lock body scroll while menu is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleOpenCart = () => {
    onClose();
    // slight delay so menu slide-out doesn't fight drawer slide-in
    setTimeout(() => openCart(true), 220);
  };

  const handleOpenWishlist = () => {
    onClose();
    setTimeout(() => openWishlist(true), 220);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#F4F1ED" }}
      >
        {/* Close button */}
        <div className="flex justify-end p-5">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-10 h-10 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-200"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Main navigation" className="flex flex-col gap-6 px-8 pt-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={onClose}
              className="font-cormorant text-[20px] font-medium uppercase tracking-[0.14em] opacity-80 hover:opacity-100 transition-opacity duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom action row — Cart + Wishlist, now functional */}
        <div
          className="flex items-center gap-5 px-8 pb-12 pt-6"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          {/* Wishlist */}
          <button
            onClick={handleOpenWishlist}
            aria-label={`Open wishlist${wishlistCount > 0 ? `, ${wishlistCount} item${wishlistCount > 1 ? "s" : ""}` : ""}`}
            className="relative w-11 h-11 flex items-center justify-center"
          >
            <Heart size={22} strokeWidth={1.5} className="opacity-70" />
            {wishlistCount > 0 && (
              <span
                className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full"
                style={{ backgroundColor: "hsl(186 35% 28%)" }}
                aria-hidden="true"
              />
            )}
          </button>

          {/* Cart */}
          <button
            onClick={handleOpenCart}
            aria-label={`Open cart${totalItems > 0 ? `, ${totalItems} item${totalItems > 1 ? "s" : ""}` : ""}`}
            className="relative w-11 h-11 flex items-center justify-center"
          >
            <ShoppingBag size={22} strokeWidth={1.5} className="opacity-70" />
            {totalItems > 0 && (
              <span
                className="absolute top-0.5 right-0.5 w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold leading-none"
                style={{
                  borderRadius: "50%",
                  backgroundColor: "hsl(186 35% 28%)",
                  color: "#fff",
                }}
                aria-hidden="true"
              >
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          {/* Divider + WhatsApp quick contact */}
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto font-cormorant text-[13px] font-medium uppercase tracking-[0.1em] opacity-60 hover:opacity-100 transition-opacity duration-200"
            onClick={onClose}
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;

