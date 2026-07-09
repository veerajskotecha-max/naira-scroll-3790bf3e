import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import look1 from "@/assets/exhibition/look-1.webp";
import look2 from "@/assets/exhibition/look-2.webp";
import look3 from "@/assets/exhibition/look-3.webp";
import look4 from "@/assets/exhibition/look-4.webp";
import look5 from "@/assets/exhibition/look-5.webp";
import look6 from "@/assets/exhibition/look-6.webp";
import look7 from "@/assets/exhibition/look-7.webp";
import floralBg from "@/assets/floral-pattern-bg.webp";

const exhibition = [
  { img: look1, name: "Lotus drape" },
  { img: look2, name: "Indigo zardozi" },
  { img: look3, name: "Pressed garden" },
  { img: look4, name: "Patchwork story" },
  { img: look5, name: "Onyx chiffon" },
  { img: look6, name: "Marigold flare" },
  { img: look7, name: "Crimson pichwai" },
];

/* Brand palette — locked from brand deck
   Cream  #FFF8F5  paper / primary surface
   Sage   #99B4AF  secondary, holds the page
   Blush  #FFBDA8  accent only, warms
   Ink    #1A1614  type
*/
const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const vocab = [
  "atelier",
  "edit",
  "capsule",
  "hand-finished",
  "slow-made",
  "pressed",
  "salt-washed",
  "made-to-measure",
];

const HeroSection = () => {
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const marqueeViewportRef = useRef<HTMLDivElement>(null);

  // Scroll-driven marquee: translateX follows page scrollY smoothly (lerp).
  // Loops seamlessly because content is duplicated (translate by -50% = one set).
  useEffect(() => {
    const track = marqueeTrackRef.current;
    const viewport = marqueeViewportRef.current;
    if (!track || !viewport) return;

    let target = 0;
    let current = 0;
    let raf = 0;
    // pixels of marquee travel per pixel of page scroll — tuned for a gentle drift
    const SPEED = 0.6;

    const onScroll = () => {
      target = window.scrollY * SPEED;
    };

    const tick = () => {
      // smooth easing toward target
      current += (target - current) * 0.12;
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0) {
        const wrapped = ((current % halfWidth) + halfWidth) % halfWidth;
        track.style.transform = `translate3d(${-wrapped}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    onScroll();
    current = target;
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative pt-6 pb-10 px-5 lg:px-16 lg:pt-10 lg:pb-16 overflow-hidden bg-[#FFF8F5] text-[#1A1614]">
      <style>{`
        @keyframes naira-reveal-up {
          from { transform: translateY(22px); opacity: 0; filter: blur(6px); }
          to   { transform: translateY(0);    opacity: 1; filter: blur(0); }
        }
        @keyframes naira-word-up {
          from { transform: translateY(34px); opacity: 0; filter: blur(8px); }
          to   { transform: translateY(0);    opacity: 1; filter: blur(0); }
        }
        @keyframes naira-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes naira-drift-a {
          0%   { transform: translate(0, -8vh) rotate(0); opacity: 0; }
          12%  { opacity: .65; }
          100% { transform: translate(18vw, 110vh) rotate(220deg); opacity: 0; }
        }
        @keyframes naira-drift-b {
          0%   { transform: translate(0, -8vh) rotate(0); opacity: 0; }
          15%  { opacity: .5; }
          100% { transform: translate(-14vw, 110vh) rotate(-180deg); opacity: 0; }
        }
        @keyframes naira-drift-c {
          0%   { transform: translate(0, -8vh) rotate(0); opacity: 0; }
          18%  { opacity: .7; }
          100% { transform: translate(8vw, 110vh) rotate(260deg); opacity: 0; }
        }
        @keyframes naira-pattern-pan {
          0%   { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        .naira-reveal > * { opacity: 0; animation: naira-reveal-up 1.1s cubic-bezier(.16,1,.3,1) forwards; }
        .naira-reveal > *:nth-child(1){ animation-delay:.10s; }
        .naira-reveal > *:nth-child(2){ animation-delay:.25s; }
        .naira-reveal > *:nth-child(3){ animation-delay:.40s; }
        .naira-reveal > *:nth-child(4){ animation-delay:.55s; }
        .naira-reveal > *:nth-child(5){ animation-delay:.70s; }
        .naira-reveal > *:nth-child(6){ animation-delay:.85s; }
        .naira-word { display:inline-block; opacity:0; animation: naira-word-up 1.1s cubic-bezier(.16,1,.3,1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .naira-reveal > *, .naira-word { animation: none !important; opacity: 1 !important; }
          .naira-petal, .naira-pattern { animation: none !important; }
        }
      `}</style>

      {/* paper wash — pressed-flower pattern (static, no animation for perf) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-multiply"
        style={{
          backgroundImage: `url(${floralBg})`,
          backgroundSize: "160% auto",
        }}
      />
      {/* warm sun-faded gradient */}
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(120%_60%_at_50%_0%,#FFF1E6_0%,transparent_60%),radial-gradient(80%_60%_at_100%_100%,#FFBDA8_0%,transparent_55%)] opacity-90" />

      {/* drifting petals — reduced count, no blur, GPU-friendly (transform/opacity only) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block" aria-hidden>
        {[
          { l: "8%",  d: "0s",  dur: "30s", w: 110, op: .65, rot: -22, color: "#FFBDA8", a: "naira-drift-a" },
          { l: "32%", d: "6s",  dur: "34s", w: 130, op: .55, rot: -10, color: "#FFBDA8", a: "naira-drift-c" },
          { l: "56%", d: "3s",  dur: "32s", w: 90,  op: .5,  rot: -30, color: "#99B4AF", a: "naira-drift-b" },
          { l: "78%", d: "10s", dur: "36s", w: 140, op: .45, rot: -16, color: "#FFBDA8", a: "naira-drift-a" },
          { l: "90%", d: "16s", dur: "33s", w: 60,  op: .6,  rot: 20,  color: "#99B4AF", a: "naira-drift-b" },
        ].map((p, i) => (
          <svg
            key={i}
            className="naira-petal absolute top-0"
            viewBox="0 0 100 34"
            style={{
              left: p.l,
              width: p.w,
              height: p.w * 0.34,
              opacity: p.op,
              transform: `rotate(${p.rot}deg)`,
              animation: `${p.a} ${p.dur} linear ${p.d} infinite`,
              willChange: "transform, opacity",
            }}
          >
            <path d="M2,17 C18,2 70,2 98,17 C70,32 18,32 2,17 Z" fill={p.color} />
          </svg>
        ))}
      </div>

      <div className="relative max-w-[1320px] mx-auto">
        {/* meta row */}
        <div className="relative flex flex-col items-center gap-1 text-center text-[#1A1614]/70 naira-reveal">
          <span style={jost} className="text-[9px] tracking-[0.32em] uppercase font-light">
            Volume One · Spring · MMXXVI
          </span>
          <span style={jost} className="text-[9px] tracking-[0.32em] uppercase font-light">
            № 24
          </span>
        </div>

        {/* outline 06 — sage hairline */}
        <div className="relative naira-reveal">
          <span
            style={velista}
            className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-[14rem] lg:text-[22rem] xl:text-[26rem] leading-none font-light text-transparent select-none"
            aria-hidden
          >
            <span style={{ WebkitTextStroke: "1px rgba(153,180,175,0.45)", color: "transparent" }}>06</span>
          </span>
        </div>

        {/* eyebrow + headline */}
        <div className="relative mt-6 lg:mt-10 naira-reveal">
          <div className="mb-3">
            <span style={jost} className="text-[9px] lg:text-[11px] tracking-[0.32em] uppercase text-[#1A1614]/60 font-light">
              The Spring Capsule
            </span>
          </div>
          <h1 style={editorial} className="text-[3.4rem] lg:text-[6rem] xl:text-[7rem] leading-[0.94] font-normal uppercase text-[#1A1614]">
            <span className="block overflow-hidden">
              <span className="naira-word" style={{ animationDelay: ".55s" }}>Softly,</span>{" "}
              <span className="naira-word" style={{ animationDelay: ".70s" }}>slowly,</span>
            </span>
            <span style={editorial} className="block italic font-normal normal-case mt-1 overflow-hidden text-[#1A1614]/85">
              <span className="naira-word" style={{ animationDelay: ".90s" }}>worn.</span>
            </span>
          </h1>
        </div>

        {/* Floating model procession */}
        <div className="relative mt-8 lg:mt-12 naira-reveal -mx-5 lg:-mx-16">
          <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-left z-20 pointer-events-none">
            <span style={jost} className="text-[10px] tracking-[0.32em] uppercase text-[#1A1614]/55 whitespace-nowrap font-light">
              Hand-finished · India
            </span>
          </div>
          <div className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2 rotate-90 origin-right z-20 pointer-events-none">
            <span style={jost} className="text-[10px] tracking-[0.32em] uppercase text-[#1A1614]/55 whitespace-nowrap font-light">
              Slow-made to measure
            </span>
          </div>

          <div className="absolute left-6 right-6 lg:left-20 lg:right-20 bottom-6 h-px bg-[#99B4AF]/40 z-0" />

          <div
            ref={marqueeViewportRef}
            className="relative w-full overflow-hidden"
            style={{
              maskImage: "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
            }}
          >
            <div
              ref={marqueeTrackRef}
              className="flex items-end gap-3 sm:gap-4 md:gap-5 lg:gap-8 w-max will-change-transform"
            >
              {[0, 1].map((dup) => (
                <div key={dup} className="flex items-end gap-3 sm:gap-4 md:gap-5 lg:gap-8 shrink-0" aria-hidden={dup === 1}>
                  {exhibition.map((look, i) => (
                    <figure
                      key={`${dup}-${i}`}
                      className="relative shrink-0 h-[255px] sm:h-[315px] md:h-[360px] lg:h-[520px] xl:h-[600px] flex items-end"
                    >
                      <img
                        src={look.img}
                        alt={look.name}
                        loading={dup === 0 && i < 2 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={dup === 0 && i === 0 ? "high" : "auto"}
                        className="block h-full w-auto object-contain object-bottom select-none"
                      />
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* description + CTA pair */}
        <div className="relative mt-14 naira-reveal">
          <p style={editorial} className="text-[1.05rem] italic leading-[1.55] text-[#1A1614]/80 max-w-[320px]">
            Soft tailoring, pressed flowers, and the long quiet of an Indian afternoon.
          </p>

          <div className="mt-7 max-w-[320px] mx-auto">
            <Link to="/shop" className="group relative inline-block w-full">
              <span className="relative block text-center px-6 py-4 bg-[#1A1614] overflow-hidden">
                <span className="absolute inset-0 bg-[#99B4AF] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <span style={jost} className="relative text-[11px] tracking-[0.32em] uppercase text-[#FFF8F5] font-light">
                  Shop the Collection
                </span>
              </span>
            </Link>
          </div>
        </div>

        {/* vocabulary marquee */}
        <div className="relative mt-12 -mx-5 lg:-mx-16 border-y border-[#99B4AF]/40 py-3 overflow-hidden bg-[#FFF8F5]">
          <div className="flex whitespace-nowrap" style={{ animation: "naira-marquee 38s linear infinite" }}>
            {[0, 1].map((k) => (
              <div key={k} className="flex items-center shrink-0">
                {vocab.map((t, i) => (
                  <span key={i} className="flex items-center">
                    <span style={editorial} className="px-6 italic text-lg text-[#1A1614]/80">{t}</span>
                    <span className="w-1 h-1 rounded-full bg-[#99B4AF]" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
