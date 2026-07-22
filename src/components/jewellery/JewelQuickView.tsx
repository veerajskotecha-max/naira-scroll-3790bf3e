import { useEffect, useState } from "react";
import type { JewelPiece } from "@/data/jewellery";
import { jewelleryEnquiryUrl } from "@/data/jewellery";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

/* Shared jewellery quick-view (PDP-lite): a two-up modal with an angle
   thumbnail switcher, materials, price, and a made-to-order WhatsApp
   enquiry. Used by both the collection cards and the home Herbarium. */
const JewelQuickView = ({
  piece,
  open,
  onOpenChange,
}: {
  piece: JewelPiece | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) => {
  const [activeImg, setActiveImg] = useState(0);
  useEffect(() => { if (open) setActiveImg(0); }, [open, piece?.handle]);
  if (!piece) return null;
  const gallery = piece.gallery && piece.gallery.length > 0 ? piece.gallery : [piece.image];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden border-none bg-[#FBF3EC] p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative bg-[#F4EBE2]">
            <img key={activeImg} src={gallery[activeImg]} alt={`${piece.name} — view ${activeImg + 1}`} className="aspect-square w-full animate-in fade-in duration-300 object-cover" />
            {piece.tag && (
              <span className="absolute left-4 top-4 border border-[#C99A4C]/50 bg-[#FBF3EC] px-3 py-1 text-[9px] tracking-[0.3em] text-[#9A7634]" style={jost}>{piece.tag}</span>
            )}
            {gallery.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                {gallery.map((g, gi) => (
                  <button
                    key={gi}
                    type="button"
                    onClick={() => setActiveImg(gi)}
                    aria-label={`View ${gi + 1}`}
                    className={`h-12 w-12 overflow-hidden border-2 bg-[#F4EBE2] transition-colors ${activeImg === gi ? "border-[#1A1614]" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={g} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center p-8 text-left lg:p-10">
            <p className="text-[10px] tracking-[0.34em] text-[#B0843A]" style={jost}>{piece.category.toUpperCase()} · DEMI-GOLD</p>
            <DialogTitle className="mt-3 text-[34px] leading-tight text-[#1A1614]" style={velista}>{piece.name}</DialogTitle>
            <p className="mt-4 text-[16px] leading-relaxed text-[#1A1614]/70" style={editorial}>{piece.blurb}</p>
            <div className="mt-6 border-t border-[#1A1614]/12 pt-5">
              <p className="text-[11px] tracking-[0.3em] text-[#B0843A]" style={jost}>MATERIALS</p>
              <p className="mt-2 text-[14px] italic text-[#1A1614]/60" style={editorial}>{piece.materials}</p>
            </div>
            <p className="mt-6 text-[20px] tracking-wide text-[#1A1614]" style={jost}>{piece.priceLabel}</p>
            <a
              href={jewelleryEnquiryUrl(piece.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative mt-6 inline-flex items-center justify-center gap-2 overflow-hidden border border-[#1A1614] px-8 py-4 text-[12px] tracking-[0.3em] text-[#1A1614] transition-colors duration-500 hover:text-[#FBF3EC]"
              style={jost}
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-[#1A1614] transition-transform duration-500 ease-out group-hover/btn:scale-x-100" />
              <span className="relative">ENQUIRE TO ORDER</span>
              <span className="relative transition-transform duration-500 group-hover/btn:translate-x-1">→</span>
            </a>
            <p className="mt-3 text-[12px] text-[#1A1614]/45" style={editorial}>Made to order · plated &amp; finished in 2–3 weeks · free sizing</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JewelQuickView;
