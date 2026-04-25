import { useState } from "react";
import { X } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const measurements = [
  { size: "XS", bust: "32\"", waist: "26\"", hip: "35\"", length: "52\"" },
  { size: "S",  bust: "34\"", waist: "28\"", hip: "37\"", length: "52\"" },
  { size: "M",  bust: "36\"", waist: "30\"", hip: "39\"", length: "53\"" },
  { size: "L",  bust: "38\"", waist: "32\"", hip: "41\"", length: "53\"" },
  { size: "XL", bust: "40\"", waist: "34\"", hip: "43\"", length: "54\"" },
];

const SizeGuideModal = ({ isOpen, onClose }: SizeGuideModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className="fixed inset-x-4 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[61] w-auto md:w-[520px] max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#FDFAF7", borderRadius: "4px 4px 0 0" }}
        role="dialog"
        aria-modal="true"
        aria-label="Size Guide"
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "hsl(0 0% 82%)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
          <h2 className="font-cormorant text-[20px] font-semibold" style={{ color: "hsl(0 0% 12%)" }}>
            Size Guide
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-muted"
            aria-label="Close size guide"
          >
            <X size={18} style={{ color: "hsl(0 0% 45%)" }} />
          </button>
        </div>

        {/* Tip */}
        <div className="px-5 pt-4 pb-3">
          <p className="text-[12px] leading-[1.7]" style={{ color: "hsl(0 0% 50%)" }}>
            All measurements are in inches. We recommend measuring over light undergarments. 
            If you're between sizes, size up for comfort. For custom fit, select{" "}
            <strong className="font-medium" style={{ color: "hsl(186 35% 28%)" }}>Customise</strong>.
          </p>
        </div>

        {/* Table — horizontal scroll on mobile */}
        <div className="overflow-x-auto px-5 pb-6">
          <table className="w-full min-w-[360px] text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(0 0% 88%)" }}>
                {["Size", "Bust", "Waist", "Hip", "Length"].map((h) => (
                  <th
                    key={h}
                    className="py-2.5 pr-6 text-[11px] uppercase tracking-[0.12em] font-medium"
                    style={{ color: "hsl(0 0% 35%)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {measurements.map((row) => (
                <tr
                  key={row.size}
                  style={{ borderBottom: "1px solid hsl(0 0% 94%)" }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 pr-6 font-cormorant text-[15px] font-semibold" style={{ color: "hsl(0 0% 18%)" }}>
                    {row.size}
                  </td>
                  <td className="py-3 pr-6 text-[13px]" style={{ color: "hsl(0 0% 45%)" }}>{row.bust}</td>
                  <td className="py-3 pr-6 text-[13px]" style={{ color: "hsl(0 0% 45%)" }}>{row.waist}</td>
                  <td className="py-3 pr-6 text-[13px]" style={{ color: "hsl(0 0% 45%)" }}>{row.hip}</td>
                  <td className="py-3 text-[13px]" style={{ color: "hsl(0 0% 45%)" }}>{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* WhatsApp help */}
        <div className="px-5 pb-6">
          <a
            href="https://wa.me/919561557935"
            target="_blank"
            rel="noreferrer"
            className="block text-center py-3 text-[12px] uppercase tracking-[0.1em] font-medium transition-colors"
            style={{ backgroundColor: "hsl(142 70% 40%)", color: "#fff", borderRadius: "2px" }}
          >
            Need help? Chat on WhatsApp
          </a>
        </div>
      </div>
    </>
  );
};

export default SizeGuideModal;
