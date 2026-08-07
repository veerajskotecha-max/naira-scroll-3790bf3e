import { useEffect, useState } from "react";
import { X, Heart, ShoppingBag, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { menuCategories, menuEdits, menuOccasions, menuApparel } from "@/data/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

type Section = { label: string; to?: string; links?: { label: string; to: string }[] };

const sections: Section[] = [
  { label: "HOME", to: "/" },
  { label: "JEWELLERY", links: menuCategories.map((c) => ({ label: c.label, to: c.to })) },
  { label: "THE EDITS", links: menuEdits },
  { label: "OCCASION", links: menuOccasions },
  { label: "APPAREL", links: menuApparel },
  { label: "GIFTING", to: "/gifting" },
  { label: "ABOUT", to: "/about" },
  { label: "CUSTOMISE", to: "/customize" },
  { label: "TRACK ORDER", to: "/track-order" },
  { label: "CONTACT", to: "/contact" },
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
        className={`fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm flex flex-col transition-transform ${
          isOpen
            ? "translate-x-0 duration-300 ease-drawer"
            : "-translate-x-full duration-250 ease-exit-in"
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

        {/* Nav — flat links plus accordions for the shopping axes */}
        <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 overflow-y-auto px-8 pb-6 pt-2">
          {sections.map((item) =>
            item.links ? (
              <div key={item.label} className="border-b border-black/5 last:border-0">
                <button
                  onClick={() => setOpenSection(openSection === item.label ? null : item.label)}
                  aria-expanded={openSection === item.label}
                  className="flex min-h-[52px] w-full items-center justify-between font-cormorant text-[19px] font-medium uppercase tracking-[0.14em] opacity-80"
                >
                  {item.label}
                  <ChevronDown
                    size={17}
                    strokeWidth={1.5}
                    className={`transition-transform duration-200 ${openSection === item.label ? "rotate-180" : ""}`}
                  />
                </button>
                {openSection === item.label && (
                  <ul className="animate-fade-in pb-4 pl-1">
                    {item.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          to={l.to}
                          onClick={onClose}
                          className="block min-h-[42px] py-2 font-cormorant text-[15px] uppercase tracking-[0.1em] opacity-60"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.to!}
                onClick={onClose}
                className="flex min-h-[52px] items-center border-b border-black/5 font-cormorant text-[19px] font-medium uppercase tracking-[0.14em] opacity-80 transition-opacity duration-200 hover:opacity-100 last:border-0"
              >
                {item.label}
              </Link>
            )
          )}
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
            href="https://wa.me/919561557935"
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

