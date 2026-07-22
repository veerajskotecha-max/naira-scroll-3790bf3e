import { useEffect, useRef, useState } from "react";

/* ───────────────────────────────────────────────────────────────
   SCROLL BLOOM
   A slim vertical rail pinned to the right edge. As the page scrolls
   a sage line fills upward and a five-petal flower at the top blooms
   from bud → full bloom, its petals scaling and a blush core opening.
   Reads page progress; hidden on small screens to stay out of the way.
   ─────────────────────────────────────────────────────────────── */

const ScrollBloom = () => {
  const [p, setP] = useState(0); // 0..1
  const raf = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setP(h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const bloom = 0.35 + p * 0.65; // petal scale
  const petals = [0, 72, 144, 216, 288];

  return (
    <div aria-hidden className="pointer-events-none fixed right-5 top-1/2 z-[8000] hidden h-[42vh] -translate-y-1/2 lg:flex flex-col items-center">
      {/* flower */}
      <svg width="34" height="34" viewBox="0 0 40 40" className="mb-2" style={{ transition: "transform .25s ease" }}>
        <g style={{ transformOrigin: "20px 20px", transform: `rotate(${p * 90}deg)` }}>
          {petals.map((a) => {
            const rad = (a * Math.PI) / 180;
            const px = 20 + Math.cos(rad) * 9 * bloom;
            const py = 20 + Math.sin(rad) * 9 * bloom;
            return (
              <ellipse key={a} cx={px} cy={py} rx={6 * bloom} ry={3.4 * bloom}
                fill="#99B4AF" transform={`rotate(${a} ${px} ${py})`} opacity={0.5 + p * 0.5} />
            );
          })}
          <circle cx="20" cy="20" r={3 + p * 2.5} fill="#FFBDA8" />
        </g>
      </svg>
      {/* rail */}
      <div className="relative w-px flex-1 bg-[#1A1614]/12">
        <div className="absolute bottom-0 left-0 w-px bg-[#99B4AF]" style={{ height: `${p * 100}%` }} />
        <span className="absolute -left-[3px] h-1.5 w-1.5 rounded-full bg-[#1A1614]"
          style={{ top: `${(1 - p) * 100}%`, transform: "translateY(-50%)" }} />
      </div>
      {/* percent */}
      <span className="mt-3 text-[9px] tracking-[0.3em] text-[#1A1614]/45" style={{ fontFamily: "'Jost', sans-serif" }}>
        {String(Math.round(p * 100)).padStart(2, "0")}
      </span>
    </div>
  );
};

export default ScrollBloom;
