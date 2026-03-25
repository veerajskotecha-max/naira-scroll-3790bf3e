import { useEffect, useState } from "react";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 w-full z-50"
      style={
        {
          "--announcement-h": "44px",
          "--navbar-h": "64px",
        } as React.CSSProperties
      }
    >
      <style>{`
        @media (min-width: 768px) {
          header { --announcement-h: 48px !important; --navbar-h: 72px !important; }
        }
        @media (min-width: 1024px) {
          header { --announcement-h: 40px !important; --navbar-h: 80px !important; }
        }
      `}</style>
      <AnnouncementBar />
      <Navbar scrolled={scrolled} />
    </header>
  );
};

export default Header;
