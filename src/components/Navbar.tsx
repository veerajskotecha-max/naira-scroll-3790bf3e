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
        <div className="h-full max-w-[1400px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center px-5 lg:px-10">
          {/* Left: hamburger (mobile) / nav links (desktop) */}
          <div className="flex items-center">
            <button
              className="md:hidden opacity-70 hover:opacity-100 transition-opacity duration-200"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
            <div className="hidden md:flex items-center gap-[30px] lg:gap-[34px]">
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
          </div>

          {/* Center logo */}
          <Link to="/" className="flex items-center justify-center flex-shrink-0">
            <img
              src="/logo.webp"
              alt="NAIRA"
              className="w-auto object-contain"
              style={{ height: "clamp(32px, 3.5vw, 48px)" }}
            />
          </Link>

          {/* Right section */}
          <div className="flex items-center justify-end gap-[22px]">
            <Link
              to="/contact"
              className="hidden md:inline nav-link font-cormorant text-[13px] lg:text-[14px] font-medium uppercase tracking-[0.12em] transition-opacity duration-200 hover:opacity-80"
            >
              CONTACT
            </Link>
            <Search
              size={20}
              strokeWidth={1.5}
              className="hidden md:block cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
            />
            <User
              size={20}
              strokeWidth={1.5}
              className="hidden md:block cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
            />
            <div className="relative">
              <ShoppingBag
                size={20}
                strokeWidth={1.5}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
              />
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Navbar;
