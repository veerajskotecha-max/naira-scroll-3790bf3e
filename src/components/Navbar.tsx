import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, User } from "lucide-react";
import MobileMenu from "./MobileMenu";
import MegaMenu from "./nav/MegaMenu";
import SearchOverlay from "./nav/SearchOverlay";
import nairaLogo from "@/assets/naira-logo.svg";
import NairaFlower3D from "./NairaFlower3D";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  scrolled: boolean;
}

const leftLinks: { label: string; to: string; mega?: boolean }[] = [
  { label: "HOME", to: "/" },
  { label: "SHOP", to: "/jewellery", mega: true },
  { label: "GIFTING", to: "/gifting" },
  { label: "ABOUT", to: "/about" },
  { label: "CUSTOMISE", to: "/customize" },
];

const Navbar = ({ scrolled }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setDrawerOpen } = useCart();
  const { totalItems: wishlistCount, setDrawerOpen: setWishlistOpen } = useWishlist();

  const { user } = useAuth();
  const handleAccount = () => navigate(user ? "/account" : "/auth");


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
            {/* Icon buttons carry a 44px hit area through padding and pull it
                back with a negative margin, so the thumb target grows without
                moving anything on screen. */}
            <button
              className="lg:hidden -m-3 p-3 opacity-70 hover:opacity-100 transition-opacity duration-200"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>

            <div className="hidden lg:flex items-center gap-[30px] lg:gap-[34px]">
              {leftLinks.map((link) =>
                link.mega ? (
                  <div key={link.label} className="relative group">
                    <Link
                      to={link.to}
                      className={`nav-link font-cormorant text-[13px] lg:text-[14px] font-medium uppercase tracking-[0.12em] whitespace-nowrap transition-opacity duration-200 hover:opacity-80 ${
                        location.pathname.startsWith("/jewellery") || location.pathname.startsWith("/shop") ? "active" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                    {/* Mega panel is anchored to the viewport, not the trigger,
                        so the four-column grid stays centred on every width. */}
                    <div
                      className="fixed left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50"
                      style={{ top: "calc(var(--announcement-h) + var(--navbar-h))" }}
                    >
                      <MegaMenu />
                    </div>
                  </div>

                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`nav-link font-cormorant text-[13px] lg:text-[14px] font-medium uppercase tracking-[0.12em] whitespace-nowrap transition-opacity duration-200 hover:opacity-80 ${
                      location.pathname === link.to ? "active" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Center logo. The flower is positioned off the wordmark rather than
              beside it in the flow, so the wordmark stays centred and neither
              side column gives up room. It takes whichever side is empty: the
              left on phones (the icon row fills the right at 360px), the right
              from lg up (the nav links run right up to the wordmark at 1024). */}
          <Link to="/" className="relative flex items-center justify-center h-full">
            <NairaFlower3D className="absolute top-1/2 -translate-y-1/2 right-full mr-1 lg:right-auto lg:left-full lg:mr-0 lg:ml-2 h-[38px] md:h-[44px] lg:h-[54px]" />
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
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="-m-3 p-3 flex items-center">
              <Search
                size={20}
                strokeWidth={1.5}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
              />
            </button>
            <button onClick={handleAccount} aria-label={user ? "My account" : "Sign in"} className="-m-3 p-3 flex items-center">
              <User
                size={20}
                strokeWidth={1.5}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
              />
            </button>
            {/* Wishlist icon with dot indicator */}
            <button className="press-scale relative -m-3 p-3" onClick={() => setWishlistOpen(true)} aria-label="Open wishlist">
              <Heart
                size={20}
                strokeWidth={1.5}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
              />
              {wishlistCount > 0 && (
                <span
                  className="absolute top-[10px] right-[10px] w-[7px] h-[7px] rounded-full animate-scale-in"
                  style={{ backgroundColor: "hsl(186 35% 28%)" }}
                />
              )}
            </button>
            <button className="press-scale relative -m-3 p-3" onClick={() => setDrawerOpen(true)} aria-label="Open cart">
              <ShoppingBag
                size={20}
                strokeWidth={1.5}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
              />
              {totalItems > 0 && (
                <span
                  className="absolute top-[4px] right-[4px] w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold leading-none"
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
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

    </>
  );
};

export default Navbar;
