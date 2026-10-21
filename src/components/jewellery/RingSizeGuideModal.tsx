import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import RingSizeGuide from "./RingSizeGuide";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  highlightSize?: string;
  adjustable?: boolean;
}

const RingSizeGuideModal = ({ isOpen, onClose, highlightSize, adjustable }: Props) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-nf-ink/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed inset-x-0 bottom-0 z-[61] max-h-[88dvh] overflow-y-auto bg-nf-ivory md:inset-auto md:left-1/2 md:top-1/2 md:w-[560px] md:-translate-x-1/2 md:-translate-y-1/2"
        role="dialog"
        aria-modal="true"
        aria-label="Ring size chart"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-nf-gold/20 bg-nf-ivory px-5 py-3">
          <h2 className="font-cormorant text-[21px] text-nf-ink">Ring Size Chart</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close ring size chart" className="text-nf-ink/70">
            <X size={18} />
          </Button>
        </div>
        <div className="px-5 pb-6">
          <RingSizeGuide highlightSize={highlightSize} adjustable={adjustable} />
        </div>
      </div>
    </>
  );
};

export default RingSizeGuideModal;
