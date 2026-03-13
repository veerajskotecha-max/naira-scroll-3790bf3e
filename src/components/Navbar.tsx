import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import MobileMenu from "./MobileMenu";

interface NavbarProps {
  scrolled: boolean;
}

const leftLinks = [
  { label: "HOME", to: "/" },
  { label: "SHOP", to: "/shop" },
  { label: "ABOUT", to: "/about" },
  { label: "MADE FOR YOU", to: "/made-for-you" },
];

const Navbar = ({ scrolled }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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
        <div className="h-full max-w-[1400px] mx-auto flex items-center justify-between px-5 lg:px-10">
          {/* Mobile: hamburger */}
          <button
            className="md:hidden opacity-70 hover:opacity-100 transition-opacity duration-200"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Left nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-[30px] lg:gap-[34px] flex-1">
            {leftLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`nav-link font-cormorant text-[13px] lg:text-[14px] font-medium uppercase tracking-[0.12em] transition-opacity duration-200 hover:opacity-80 ${
                  location.pathname === link.to ? "active" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center logo */}
          <Link to="/" className="flex items-center justify-center flex-shrink-0">
            <img
              src="/logo.webp"
              alt="NAIRA"
              className="w-auto object-contain"
              style={{ height: "clamp(26px, 3.2vw, 38px)" }}
            />
          </Link>

          {/* Right section — hidden on mobile (except cart) */}
          <div className="hidden md:flex items-center justify-end gap-[22px] flex-1">
            <Link
              to="/contact"
              className="nav-link font-cormorant text-[13px] lg:text-[14px] font-medium uppercase tracking-[0.12em] transition-opacity duration-200 hover:opacity-80"
            >
              CONTACT
            </Link>
            <Search
              size={20}
              strokeWidth={1.5}
              className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
            />
            <User
              size={20}
              strokeWidth={1.5}
              className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
            />
            <div className="relative">
              <ShoppingBag
                size={20}
                strokeWidth={1.5}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
              />
              {/* Future badge: <span className="absolute -top-1 -right-1 ...">0</span> */}
            </div>
          </div>

          {/* Mobile: cart icon only */}
          <div className="md:hidden relative">
            <ShoppingBag
              size={20}
              strokeWidth={1.5}
              className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
            />
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Navbar;
