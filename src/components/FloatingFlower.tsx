import { useEffect, useState } from "react";
import floatingFlower from "@/assets/floating-flower.png";

const FloatingFlower = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setRotation(window.scrollY * 0.08);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <img
      src={floatingFlower}
      alt=""
      aria-hidden="true"
      className="absolute w-[100px] md:w-[140px] lg:w-[160px] pointer-events-none select-none"
      style={{
        top: "90px",
        left: "-20px",
        opacity: 0.88,
        zIndex: 1,
        filter: "blur(0.4px)",
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
        willChange: "transform",
      }}
    />
  );
};

export default FloatingFlower;
