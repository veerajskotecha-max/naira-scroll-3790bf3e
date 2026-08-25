import { X } from "lucide-react";

/* Ring size chart for the jewellery PDP.
   Figures are the international standard for US ring sizes —
   inner diameter and inner circumference of the band. */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  highlightSize?: string;
}

const ringSizes = [
  { us: "5", diaMm: "15.7", diaCm: "1.57", circMm: "49.3", circCm: "4.93" },
  { us: "6", diaMm: "16.5", diaCm: "1.65", circMm: "51.9", circCm: "5.19" },
  { us: "7", diaMm: "17.3", diaCm: "1.73", circMm: "54.4", circCm: "5.44" },
  { us: "8", diaMm: "18.1", diaCm: "1.81", circMm: "56.9", circCm: "5.69" },
];

const steps = [
  {
    title: "Measure with a strip of paper or thread",
    body: "Wrap a thin strip of paper (or a piece of thread) snugly around the base of the finger. Mark where it overlaps, lay it flat against a ruler and read the length in cm — that is your circumference. Match it to the chart: 5.19 cm is a US 6.",
  },
  {
    title: "Or measure a ring you already wear",
    body: "Place a well-fitting ring on a ruler and measure the inside edge-to-edge width in mm — that is the inner diameter. 16.5 mm (1.65 cm) is a US 6.",
  },
  {
    title: "Measure at the right moment",
    body: "Fingers are smallest in the morning and in cold weather. Measure at the end of the day with warm hands for the truest fit.",
  },
  {
    title: "Check it slides over the knuckle",
    body: "The band should sit snug at the base but pass the knuckle with a gentle twist. If your knuckle is larger, go up one size.",
  },
  {
    title: "Between sizes or a wide band?",
    body: "Always round up. Wider bands sit tighter, so size up if the band is broad.",
  },
];

const RingSizeGuideModal = ({ isOpen, onClose, highlightSize }: Props) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[61] w-auto md:w-[560px] max-h-[88vh] overflow-y-auto"
        style={{ backgroundColor: "#FDFAF7" }}
        role="dialog"
        aria-modal="true"
        aria-label="Ring size chart"
      >
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "hsl(0 0% 82%)" }} />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
          <h2 className="font-cormorant text-[21px] font-semibold" style={{ color: "hsl(0 0% 12%)" }}>
            Ring Size Chart
          </h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-muted" aria-label="Close ring size chart">
            <X size={18} style={{ color: "hsl(0 0% 45%)" }} />
          </button>
        </div>

        {/* Chart */}
        <div className="px-5 pt-4">
          <p className="text-[12px] leading-[1.7]" style={{ color: "hsl(0 0% 50%)" }}>
            US sizes with the inner diameter and inner circumference of the band, in mm and cm.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[330px] text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(0 0% 88%)" }}>
                  {["US Size", "Inner diameter", "Inner circumference"].map((h) => (
                    <th key={h} className="py-2.5 pr-4 text-[10px] uppercase tracking-[0.12em] font-medium" style={{ color: "hsl(0 0% 35%)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ringSizes.map((r) => {
                  const active = highlightSize === r.us;
                  return (
                    <tr
                      key={r.us}
                      style={{
                        borderBottom: "1px solid hsl(0 0% 93%)",
                        backgroundColor: active ? "rgba(176,132,58,0.10)" : "transparent",
                      }}
                    >
                      <td className="py-2.5 pr-4 text-[13px] font-medium" style={{ color: active ? "#8A6526" : "hsl(0 0% 18%)" }}>
                        US {r.us}
                      </td>
                      <td className="py-2.5 pr-4 text-[13px]" style={{ color: "hsl(0 0% 35%)" }}>{r.diaCm} cm <span style={{ color: "hsl(0 0% 55%)" }}>({r.diaMm} mm)</span></td>
                      <td className="py-2.5 pr-4 text-[13px]" style={{ color: "hsl(0 0% 35%)" }}>{r.circCm} cm <span style={{ color: "hsl(0 0% 55%)" }}>({r.circMm} mm)</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2.5 text-[11.5px] leading-[1.7]" style={{ color: "hsl(0 0% 50%)" }}>
            Our most-loved size is <strong className="font-medium" style={{ color: "hsl(0 0% 25%)" }}>US 6 — 1.65 cm across, 5.19 cm around</strong>. Adjustable styles are made on a US 6 and open to fit US 6–8.
          </p>
        </div>

        {/* How to measure */}
        <div className="px-5 pt-5 pb-6">
          <p className="text-[11px] uppercase tracking-[0.14em] font-medium" style={{ color: "hsl(0 0% 25%)" }}>
            How to find your size at home
          </p>
          <ol className="mt-3 space-y-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span
                  className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-medium"
                  style={{ border: "1px solid rgba(176,132,58,0.5)", color: "#8A6526" }}
                >
                  {i + 1}
                </span>
                <span className="block">
                  <span className="block text-[12.5px] font-medium" style={{ color: "hsl(0 0% 20%)" }}>{s.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-[1.7]" style={{ color: "hsl(0 0% 45%)" }}>{s.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[11.5px] leading-[1.7]" style={{ color: "hsl(0 0% 50%)" }}>
            Still unsure? Message us on WhatsApp with your measurement and we will confirm the size for you.
          </p>
        </div>
      </div>
    </>
  );
};

export default RingSizeGuideModal;
