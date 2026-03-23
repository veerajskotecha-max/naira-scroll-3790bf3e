import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ShoppingBag, Compass } from "lucide-react";
import Footer from "@/components/Footer";

const NotFound = () => {
  useEffect(() => {
    document.title = "Page Not Found — NAIRA";
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F4F1ED" }}>
      <div className="flex-1 flex items-center justify-center px-5 pt-28 pb-20">
        <div className="text-center max-w-[480px] animate-fade-in">
          {/* Decorative element */}
          <div className="mx-auto mb-8 w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(33 30% 85%)" }}>
            <span className="font-cormorant text-[42px] font-light italic" style={{ color: "hsl(186 35% 28%)" }}>
              404
            </span>
          </div>

          <h1
            className="font-cormorant text-[32px] md:text-[40px] font-semibold italic leading-tight"
            style={{ color: "hsl(0 0% 15%)" }}
          >
            Page Not Found
          </h1>

          <p
            className="font-cormorant text-[15px] md:text-[16px] leading-relaxed mt-4 max-w-[360px] mx-auto"
            style={{ color: "hsl(0 0% 45%)" }}
          >
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 my-8">
            <span className="block w-12 h-px" style={{ backgroundColor: "hsl(0 0% 78%)" }} />
            <span className="font-cormorant text-[14px] italic" style={{ color: "hsl(0 0% 60%)" }}>✦</span>
            <span className="block w-12 h-px" style={{ backgroundColor: "hsl(0 0% 78%)" }} />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-[13px] font-medium uppercase tracking-[0.1em] transition-all duration-[250ms] ease-in-out hover:shadow-md hover:-translate-y-[1px]"
              style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
            >
              <Home size={14} />
              Back to Home
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-[13px] font-medium uppercase tracking-[0.1em] border transition-all duration-[250ms] ease-in-out hover:bg-foreground hover:text-background hover:shadow-md hover:-translate-y-[1px]"
              style={{ borderColor: "hsl(var(--foreground))", color: "hsl(var(--foreground))" }}
            >
              <ShoppingBag size={14} />
              Continue Shopping
            </Link>
          </div>

          <Link
            to="/made-for-you"
            className="inline-flex items-center gap-1.5 mt-6 font-cormorant text-[14px] underline transition-opacity duration-200 hover:opacity-70"
            style={{ color: "hsl(186 35% 28%)" }}
          >
            <Compass size={13} />
            Explore Collection
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
