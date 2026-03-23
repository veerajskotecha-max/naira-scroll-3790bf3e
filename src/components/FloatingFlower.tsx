import { useEffect, useState } from "react";
import floatingFlower from "@/assets/floating-flower.png";

const FloatingFlower = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setRotation(window.scrollY * 0.05);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <img
      src={floatingFlower}
      alt=""
      aria-hidden="true"
      className="absolute w-[80px] md:w-[110px] lg:w-[130px] pointer-events-none select-none"
      style={{
        top: "24px",
        left: "0px",
        opacity: 0.82,
        zIndex: 1,
        filter: "saturate(0.85) drop-shadow(0 2px 8px hsla(33, 30%, 60%, 0.25))",
        transform: `translateX(-40%) rotate(${rotation}deg)`,
        transformOrigin: "center center",
        willChange: "transform",
      }}
    />
  );
};

export default FloatingFlower;
