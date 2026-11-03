import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReturnFocus } from "@/hooks/useReturnFocus";
import RingSizeGuide from "./RingSizeGuide";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  highlightSize?: string;
  adjustable?: boolean;
  fitSizes?: string[];
}

/* On Radix's Dialog, like the bag and the photo viewer: it was a plain div
   that declared aria-modal but left focus on "Size guide", let Tab walk out
   into the page behind (24 of 25 stops), and ignored Escape. Every way of
   closing still goes through onClose, the PDP's history step. */
const RingSizeGuideModal = ({ isOpen, onClose, highlightSize, adjustable, fitSizes }: Props) => {
  const returnFocus = useReturnFocus();

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-nf-ink/40 backdrop-blur-sm" />
        <DialogPrimitive.Content
          {...returnFocus}
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-[61] max-h-[88dvh] overflow-y-auto bg-nf-ivory outline-none md:inset-auto md:left-1/2 md:top-1/2 md:w-[560px] md:-translate-x-1/2 md:-translate-y-1/2"
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-nf-gold/20 bg-nf-ivory px-5 py-3">
            <DialogPrimitive.Title className="font-cormorant text-[21px] text-nf-ink">Ring Size Chart</DialogPrimitive.Title>
            {/* 44px to tap, pulled back by its margins so the bar keeps its height. */}
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close ring size chart" className="-my-0.5 -mr-0.5 h-11 w-11 text-nf-ink/70">
              <X size={18} />
            </Button>
          </div>
          <div className="px-5 pb-6">
            <RingSizeGuide highlightSize={highlightSize} adjustable={adjustable} fitSizes={fitSizes} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default RingSizeGuideModal;
