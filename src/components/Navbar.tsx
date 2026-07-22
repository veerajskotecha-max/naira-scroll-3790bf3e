import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, User } from "lucide-react";
import MobileMenu from "./MobileMenu";
import nairaLogo from "@/assets/naira-logo.svg";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface NavbarProps {
  scrolled: boolean;
}

const leftLinks = [
  { label: "HOME", to: "/" },
  { label: "SHOP", to: "/shop" },
  { label: "ABOUT", to: "/about" },
  { label: "CUSTOMIZE", to: "/customize" },
];

const Navbar = ({ scrolled }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setDrawerOpen } = useCart();
  const { totalItems: wishlistCount, setDrawerOpen: setWishlistOpen } = useWishlist();

  const handleSearch = () => navigate("/shop");
  const handleAccount = () => navigate("/contact");

  return (
    <>
      <nav
        className="w-full transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(244,241,237,0.85)" : "#F4F1ED",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.06)" : "none",
          height: "var(--navbar-h)",
        }}
      >
        <div className="h-full max-w-[1400px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center px-5 lg:px-10">
          {/* Left: hamburger (mobile) / nav links (desktop) */}
          <div className="flex items-center">
            <button
              className="lg:hidden opacity-70 hover:opacity-100 transition-opacity duration-200"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
            <div className="hidden lg:flex items-center gap-[30px] lg:gap-[34px]">
              {leftLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`nav-link font-cormorant text-[13px] lg:text-[14px] font-medium uppercase tracking-[0.12em] whitespace-nowrap transition-opacity duration-200 hover:opacity-80 ${
                    location.pathname === link.to ? "active" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center logo */}
          <Link to="/" className="flex items-center justify-center h-full">
            <img
              src={nairaLogo}
              alt="NAIRA"
              loading="eager"
              className="object-contain block h-auto w-[80px] sm:w-[90px] md:w-[100px] lg:w-[130px] xl:w-[140px] max-h-[70%]"
            />
          </Link>

          {/* Right section */}
          <div className="flex items-center justify-end gap-[16px] lg:gap-[22px]">
            <Link
              to="/contact"
              className="hidden lg:inline nav-link font-cormorant text-[13px] lg:text-[14px] font-medium uppercase tracking-[0.12em] whitespace-nowrap transition-opacity duration-200 hover:opacity-80"
            >
              CONTACT
            </Link>
            <button onClick={handleSearch} aria-label="Search" className="flex items-center">
              <Search
                size={20}
                strokeWidth={1.5}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
              />
            </button>
            <button onClick={handleAccount} aria-label="Account" className="hidden md:flex items-center">
              <User
                size={20}
                strokeWidth={1.5}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
              />
            </button>
            {/* Wishlist icon with dot indicator */}
            <button className="relative" onClick={() => setWishlistOpen(true)} aria-label="Open wishlist">
              <Heart
                size={20}
                strokeWidth={1.5}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
              />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-[7px] h-[7px] rounded-full animate-scale-in"
                  style={{ backgroundColor: "hsl(186 35% 28%)" }}
                />
              )}
            </button>
            <button className="relative" onClick={() => setDrawerOpen(true)} aria-label="Open cart">
              <ShoppingBag
                size={20}
                strokeWidth={1.5}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
              />
              {totalItems > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold leading-none"
                  style={{ borderRadius: '50%', backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Navbar;
