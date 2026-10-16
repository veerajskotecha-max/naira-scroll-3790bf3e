import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CartItem } from "@/contexts/CartContext";
import { type JewelPiece } from "@/data/jewellery";
import { familyOf } from "@/lib/pairings";
import { clarityEvent } from "@/lib/clarity";
import ringGold from "@/assets/naira-box-ring-sm.webp";
import ringSilver from "@/assets/naira-box-ring-sm-silver.webp";
import printSm from "@/assets/naira-box-print-sm.webp";
import NairaBoxCSS from "./NairaBoxCSS";
import BagGiftBox from "./BagGiftBox";

const BagGiftRow = ({ items, jewellery }: { items: CartItem[]; jewellery: JewelPiece[] }) => {
  const [expanded, setExpanded] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const latest = jewellery.find((piece) => piece.handle === items[items.length - 1]?.id);
  const ring = latest && familyOf(latest) === "silver" ? ringSilver : ringGold;
  const close = () => {
    setExpanded(false);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  };

  useEffect(() => {
    if (expanded) back.current?.focus({ preventScroll: true });
  }, [expanded]);

  return (
    <div data-gift-row className="px-4 py-1 sm:px-5">
      {!expanded ? (
        <Button
          ref={trigger}
          variant="ghost"
          className="min-h-11 h-auto w-full justify-start gap-3 whitespace-normal px-0 text-left text-[11.5px] font-normal text-nf-ink/80 hover:bg-transparent hover:text-nf-ink"
          aria-expanded={false}
          onClick={() => {
            setExpanded(true);
            clarityEvent("bag_gift_opened");
          }}
        >
          <span className="pointer-events-none flex h-9 w-9 shrink-0 items-center justify-center">
            <NairaBoxCSS size={24} print={printSm} shadow={false} />
          </span>
          Tap to open your Naira gift box
        </Button>
      ) : (
        <div
          data-gift-lifted
          className="relative flex flex-col items-center border-y border-nf-gold/20 bg-nf-ivory-deep pb-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.stopPropagation();
            close();
          }}
        >
          <Button ref={back} variant="ghost" size="sm" onClick={close} aria-label="Back to your bag" className="absolute left-0 top-0 z-10 h-11 px-2 text-[11px] text-nf-ink/80 hover:bg-transparent hover:text-nf-ink">
            <ChevronLeft aria-hidden="true" />
            Back
          </Button>
          <div className="pointer-events-none pt-4" aria-hidden="true">
            <BagGiftBox size={86} ring={ring} autoOpen holdOpen decorative />
          </div>
          <p className="mt-1 text-center text-[11.5px] text-nf-ink/80">Every piece comes with this box</p>
        </div>
      )}
    </div>
  );
};

export default BagGiftRow;