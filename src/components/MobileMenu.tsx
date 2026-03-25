import { X, Search, User, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = ["HOME", "SHOP", "ABOUT", "CUSTOMIZE", "CONTACT"];

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className={`fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#F4F1ED" }}
      >
        {/* Close button */}
        <div className="flex justify-end p-5">
          <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity duration-200">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-6 px-8 pt-4 flex-1">
          {navItems.map((item) => (
            <Link
              key={item}
              to={item === "HOME" ? "/" : `/${item.toLowerCase().replace(/ /g, "-")}`}
              onClick={onClose}
              className="font-cormorant text-[18px] font-medium uppercase tracking-[0.14em] opacity-80 hover:opacity-100 transition-opacity duration-200"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Bottom icons */}
        <div className="flex items-center gap-6 px-8 pb-10">
          <Search size={20} strokeWidth={1.5} className="opacity-60 hover:opacity-100 transition-opacity duration-200 cursor-pointer" />
          <User size={20} strokeWidth={1.5} className="opacity-60 hover:opacity-100 transition-opacity duration-200 cursor-pointer" />
          <ShoppingBag size={20} strokeWidth={1.5} className="opacity-60 hover:opacity-100 transition-opacity duration-200 cursor-pointer" />
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
