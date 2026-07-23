import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { JewelPiece } from "@/data/jewellery";

import JewelQuickView from "@/components/jewellery/JewelQuickView";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;

const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

/* A demi-gold jewellery product card: photoreal packshot with a 3D
   cursor-tilt + glass sheen, a tag, price, a made-to-order WhatsApp
   enquiry, and a click-to-open quick-view (PDP-lite) modal. */
const JewelCard = ({ piece, index = 0 }: { piece: JewelPiece; index?: number }) => {
  const tiltRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const altImg = piece.gallery && piece.gallery.length > 1 ? piece.gallery[1] : null;
  const zircone = piece.handle.startsWith("zircone");

  useEffect(() => {
    const el = tiltRef.current;
    const sheen = sheenRef.current;
    if (!el || !sheen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) scale(1.03)`;
      sheen.style.opacity = "1";
      sheen.style.background = `radial-gradient(380px circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(255,255,255,0.5), rgba(255,255,255,0) 55%)`;
    };
    const reset = () => {
      el.style.transform = "perspective(900px) rotateY(0) rotateX(0) scale(1)";
      sheen.style.opacity = "0";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", reset); };
  }, []);

  // Mobile "greet turn": no hover on touch — the piece flashes its 3/4 angle
  // once as the card scrolls into view, so the second angle is never hidden.
  useEffect(() => {
    if (!altImg) return;
    if (window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = tiltRef.current;
    const back = root?.querySelector<HTMLElement>(".jc-back");
    const front = root?.querySelector<HTMLElement>(".jc-front");
    if (!root || !back || !front) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setTimeout(() => {
        back.style.opacity = "1"; front.style.opacity = "0";
        setTimeout(() => { back.style.opacity = "0"; front.style.opacity = "1"; }, 1100);
      }, 420);
    }, { threshold: 0.65 });
    io.observe(root);
    return () => io.disconnect();
  }, [altImg]);

  return (
    <article className="jewel-shop-card group flex flex-col" style={{ ["--i" as string]: index }}>
      <Link
        to={`/jewellery/${piece.handle}`}
        aria-label={`View ${piece.name}`}
        className="block w-full text-left transition-transform duration-200 active:scale-[0.97]"
      >
        <div
          ref={tiltRef}
          className="relative overflow-hidden bg-[#F4EBE2] shadow-[0_16px_38px_-20px_rgba(122,90,40,0.5)] transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: "perspective(900px)" }}
        >
          <img src={piece.image} alt={piece.name} loading="lazy" className="jc-front aspect-square w-full object-cover transition-opacity duration-500 group-hover:opacity-0" style={{ transitionProperty: "opacity, transform" }} />
          {altImg && (
            <img src={altImg} alt="" aria-hidden loading="lazy" className="jc-back absolute inset-0 aspect-square w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          )}
          {zircone && (
            <span aria-hidden className="pointer-events-none absolute inset-0">
              <svg className="jc-tw absolute left-[20%] top-[22%]" width="15" height="15" viewBox="0 0 20 20"><path d="M10 0 Q11 8.5 20 10 Q11 11.5 10 20 Q9 11.5 0 10 Q9 8.5 10 0 Z" fill="#C99A4C" /></svg>
              <svg className="jc-tw absolute right-[24%] top-[40%]" width="10" height="10" viewBox="0 0 20 20" style={{ animationDelay: "1.2s" }}><path d="M10 0 Q11 8.5 20 10 Q11 11.5 10 20 Q9 11.5 0 10 Q9 8.5 10 0 Z" fill="#C99A4C" /></svg>
              <svg className="jc-tw absolute bottom-[26%] left-[34%]" width="12" height="12" viewBox="0 0 20 20" style={{ animationDelay: "2s" }}><path d="M10 0 Q11 8.5 20 10 Q11 11.5 10 20 Q9 11.5 0 10 Q9 8.5 10 0 Z" fill="#C99A4C" /></svg>
              <style>{`
                @keyframes jc-twinkle { 0%,100% { opacity:.12; transform:scale(.5) rotate(0deg);} 50% { opacity:.95; transform:scale(1) rotate(28deg);} }
                .jc-tw { animation: jc-twinkle 2.9s ease-in-out infinite; }
                @media (prefers-reduced-motion: reduce) { .jc-tw { animation: none; opacity:.4; } }
              `}</style>
            </span>
          )}
          <div ref={sheenRef} aria-hidden className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300" />
          {piece.tag && (
            <span className="absolute left-4 top-4 border border-[#C99A4C]/50 bg-[#FBF3EC] px-3 py-1 text-[9px] tracking-[0.3em] text-[#9A7634]" style={jost}>
              {piece.tag}
            </span>
          )}
          <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-2 bg-[#FBF3EC]/90 px-5 py-2 text-[10px] tracking-[0.3em] text-[#1A1614] opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100" style={jost}>
            VIEW DETAILS
          </span>
          <span className="pointer-events-none absolute inset-0 border border-[#C99A4C]/0 transition-colors duration-500 group-hover:border-[#C99A4C]/60" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col items-center px-1 pt-4 text-center sm:pt-5">
        <p className="text-[9px] tracking-[0.32em] text-[#B0843A] sm:text-[10px] sm:tracking-[0.34em]" style={jost}>{piece.category.toUpperCase()}</p>
        <h3 className="mt-1.5 text-[18px] leading-tight text-[#1A1614] sm:mt-2 sm:text-[24px] md:text-[26px]" style={velista}>
          <Link to={`/jewellery/${piece.handle}`} className="hover:underline underline-offset-4">{piece.name}</Link>
        </h3>
        <p className="mt-2 text-[13px] tracking-wide text-[#1A1614]/90 sm:mt-3 sm:text-[15px]" style={jost}>{piece.priceLabel}</p>
        <Link
          to={`/jewellery/${piece.handle}`}
          className="group/btn relative mt-3 inline-flex items-center gap-2 overflow-hidden border border-[#1A1614]/35 px-4 py-2 text-[9.5px] tracking-[0.25em] text-[#1A1614] transition-colors duration-500 hover:text-[#FBF3EC] sm:mt-4 sm:px-6 sm:py-2.5 sm:text-[10.5px] sm:tracking-[0.3em]"
          style={jost}
        >
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#1A1614] transition-transform duration-500 ease-out group-hover/btn:scale-x-100" />
          <span className="relative">VIEW</span>
          <span className="relative transition-transform duration-500 group-hover/btn:translate-x-1">→</span>
        </Link>
      </div>


      <JewelQuickView piece={piece} open={open} onOpenChange={setOpen} />
    </article>
  );
};

export default JewelCard;
