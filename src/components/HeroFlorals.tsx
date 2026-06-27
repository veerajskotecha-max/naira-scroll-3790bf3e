import marigold from "@/assets/hero/marigold-cluster.png";
import jasmine from "@/assets/hero/jasmine-garland.png";
import gulmohar from "@/assets/hero/gulmohar-bloom.png";
import goldCorner from "@/assets/hero/gold-corner.png";
import petalScatter from "@/assets/hero/petal-scatter.png";
import lotus from "@/assets/hero/lotus-ghost.png";

/**
 * Elegant, gently-bouncing botanical overlay layer for the homepage hero.
 * Purely decorative — no scroll/business logic.
 */
const HeroFlorals = () => {
  return (
    <div
      className="pointer-events-none absolute inset-0 select-none"
      aria-hidden="true"
    >
      {/* Background ghost lotus — bottom left, very faded */}
      <img
        src={lotus}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute -bottom-16 -left-20 w-[260px] md:w-[340px] lg:w-[420px] opacity-[0.12] mix-blend-multiply motion-safe:animate-hero-bloom-in"
        style={{ zIndex: 2, animationDelay: "1000ms" }}
      />

      {/* Right-edge jasmine garland — drapes over the model edge */}
      <img
        src={jasmine}
        alt=""
        loading="eager"
        decoding="async"
        className="absolute top-[60px] right-[-30px] md:right-[-10px] lg:right-[2%] w-[110px] md:w-[150px] lg:w-[190px] origin-top motion-safe:animate-garland-sway opacity-90 drop-shadow-[0_12px_20px_rgba(61,43,31,0.18)]"
        style={{ zIndex: 6 }}
      />

      {/* Top-left marigold + jasmine cluster — the showstopper */}
      <div
        className="absolute -top-10 -left-10 md:-top-14 md:-left-14 lg:-top-20 lg:-left-16 motion-safe:animate-hero-bloom-in"
        style={{ zIndex: 7, animationDelay: "450ms" }}
      >
        <img
          src={marigold}
          alt=""
          loading="eager"
          decoding="async"
          className="block w-[200px] md:w-[280px] lg:w-[360px] motion-safe:animate-bloom-bounce drop-shadow-[0_18px_30px_rgba(61,43,31,0.22)]"
          style={{ animationDelay: "300ms" }}
        />
      </div>

      {/* Bottom-left gulmohar bloom — anchors the CTA corner */}
      <div
        className="absolute -bottom-10 -left-8 md:-bottom-12 md:-left-6 lg:-bottom-16 lg:left-[4%] motion-safe:animate-hero-bloom-in"
        style={{ zIndex: 8, animationDelay: "700ms" }}
      >
        <img
          src={gulmohar}
          alt=""
          loading="lazy"
          decoding="async"
          className="block w-[140px] md:w-[180px] lg:w-[220px] motion-safe:animate-bloom-bounce-rev drop-shadow-[0_14px_24px_rgba(61,43,31,0.25)]"
          style={{ animationDelay: "600ms" }}
        />
      </div>

      {/* Scattered petals — float around the CTA area */}
      <img
        src={petalScatter}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute bottom-[8%] right-[10%] w-[160px] md:w-[200px] lg:w-[260px] opacity-90 motion-safe:animate-petal-drift"
        style={{ zIndex: 8, animationDelay: "1200ms" }}
      />

      {/* Gold corner ornaments — refined editorial frame */}
      <img
        src={goldCorner}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute top-3 left-3 w-[70px] md:w-[90px] lg:w-[110px] opacity-70 motion-safe:animate-hero-bloom-in"
        style={{ zIndex: 9, animationDelay: "900ms" }}
      />
      <img
        src={goldCorner}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute top-3 right-3 w-[70px] md:w-[90px] lg:w-[110px] opacity-70 motion-safe:animate-hero-bloom-in"
        style={{ zIndex: 9, animationDelay: "950ms", transform: "scaleX(-1)" }}
      />
      <img
        src={goldCorner}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute bottom-3 left-3 w-[70px] md:w-[90px] lg:w-[110px] opacity-70 motion-safe:animate-hero-bloom-in"
        style={{ zIndex: 9, animationDelay: "1000ms", transform: "scaleY(-1)" }}
      />
      <img
        src={goldCorner}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute bottom-3 right-3 w-[70px] md:w-[90px] lg:w-[110px] opacity-70 motion-safe:animate-hero-bloom-in"
        style={{ zIndex: 9, animationDelay: "1050ms", transform: "scale(-1, -1)" }}
      />
    </div>
  );
};

export default HeroFlorals;
