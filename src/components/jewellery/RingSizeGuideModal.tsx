import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { CleanStyles } from "@/components/clean";
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
   closing still goes through onClose, the PDP's history step.

   A bottom sheet on a phone, a centred dialog from 768px, drawn in the clean
   system: the sheet carries .nf-clean itself (it is rendered outside the
   page) and writes the stylesheet, so it looks the same wherever it opens. */
const RingSizeGuideModal = ({ isOpen, onClose, highlightSize, adjustable, fitSizes }: Props) => {
  const returnFocus = useReturnFocus();

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-nf-ink/40" />
        <DialogPrimitive.Content
          {...returnFocus}
          aria-describedby={undefined}
          className="nf-clean fixed inset-x-0 bottom-0 z-[61] max-h-[88dvh] overflow-y-auto outline-none md:inset-auto md:left-1/2 md:top-1/2 md:w-[560px] md:-translate-x-1/2 md:-translate-y-1/2"
        >
          <CleanStyles />
          <div className="sticky top-0 flex items-center justify-between border-b border-[color:var(--nc-rule)] bg-[var(--nc-ivory)] py-1.5 pl-4 pr-1">
            <DialogPrimitive.Title className="nc-heading nc-heading--sheet">Ring Size Chart</DialogPrimitive.Title>
            <button type="button" onClick={onClose} aria-label="Close ring size chart" className="nc-iconbtn">
              <X size={18} strokeWidth={1.25} aria-hidden="true" />
            </button>
          </div>
          <div className="px-4 pb-6 pt-5">
            <RingSizeGuide highlightSize={highlightSize} adjustable={adjustable} fitSizes={fitSizes} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default RingSizeGuideModal;
