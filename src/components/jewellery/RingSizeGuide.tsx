import { Circle, Ruler } from "lucide-react";
import { RING_SIZE_CHART } from "@/data/ringSizing";

interface Props {
  highlightSize?: string;
  adjustable?: boolean;
  /** An adjustable ring's own US sizes, when not the open-back US 6–8. */
  fitSizes?: string[];
}

export default function RingSizeGuide({ highlightSize, adjustable = false, fitSizes }: Props) {
  const fit = fitSizes ?? ["6", "7", "8"];
  /* The chart's sizes outside the ring's fit: "US 5 and US 9". */
  const outside = RING_SIZE_CHART.map((size) => size.us).filter((us) => !fit.includes(us)).map((us) => `US ${us}`);
  return (
    <section aria-label="Ring size guide" className="mt-5 border-t border-nf-gold/20 pt-5 text-nf-ink">
      <h3 className="font-cormorant text-[22px]">Find your US ring size</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-nf-ink/75">
        Match your measurement to the chart below. Diameter is the inside width of a ring; circumference is the distance around your finger. All measurements are in centimetres (cm).
      </p>
      <table className="mt-4 w-full table-fixed border-collapse text-left text-[12px]">
        <caption className="sr-only">US ring sizes 5 to 9 with approximate inner diameter and circumference in centimetres</caption>
        <thead>
          <tr className="border-y border-nf-gold/25">
            <th scope="col" className="w-1/5 py-3 pr-2 font-medium">US size</th>
            <th scope="col" className="px-2 py-3 font-medium">Inner diameter<br /><span className="font-normal text-nf-ink/65">cm · across</span></th>
            <th scope="col" className="py-3 pl-2 font-medium">Circumference<br /><span className="font-normal text-nf-ink/65">cm · around</span></th>
          </tr>
        </thead>
        <tbody>
          {RING_SIZE_CHART.map((size) => (
            <tr key={size.us} className={`border-b border-nf-gold/15 ${highlightSize?.replace(/^US\s*/i, "") === size.us ? "bg-nf-gold/10 text-nf-gold-text" : "text-nf-ink/85"}`}>
              <th scope="row" className="py-3 pr-2 font-medium">US {size.us}</th>
              <td className="px-2 py-3 tabular-nums">{size.diameterCm} cm</td>
              <td className="py-3 pl-2 tabular-nums">{size.circumferenceCm} cm</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] leading-relaxed text-nf-ink/65">Approximate reference measurements. Available sizes are shown in this piece’s size selector; this chart does not indicate stock.</p>
      <div className="mt-5 space-y-5 text-[12px] leading-relaxed">
        <div>
          <h4 className="flex items-center gap-2 font-medium"><Circle size={16} className="shrink-0 text-nf-gold-text" aria-hidden="true" /> Measure a ring you wear</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-nf-ink/75">
            <li>Choose a ring that fits the same finger on the same hand.</li>
            <li>Lay it on a ruler and measure straight across the centre, from one inside edge to the other. Do not include the metal band.</li>
            <li>Match this width to the inner diameter column. For example, 1.65 cm across is US 6.</li>
          </ol>
        </div>
        <div>
          <h4 className="flex items-center gap-2 font-medium"><Ruler size={16} className="shrink-0 text-nf-gold-text" aria-hidden="true" /> Estimate your finger size at home</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-nf-ink/75">
            <li>Wrap a thin, non-stretch strip of paper around the base of your finger, snugly without squeezing.</li>
            <li>Mark where the ends meet, then lay the strip flat and measure from the start to the mark in cm.</li>
            <li>Match the length to the circumference column. For example, 5.44 cm around is US 7.</li>
          </ol>
          <p className="mt-2 text-nf-ink/65">Paper gives an estimate only; avoid stretchy thread. A jeweller’s ring sizer is the most reliable way to confirm your fit.</p>
        </div>
        <div className="border-l border-nf-gold/40 pl-3 text-nf-ink/75">
          <h4 className="font-medium text-nf-ink">Before choosing</h4>
          <p className="mt-1">Measure 2–3 times with warm hands, preferably towards the end of the day. Check the ring can pass your knuckle. If between sizes or choosing a wide band, try the larger size and confirm the fit with a jeweller.</p>
          {adjustable && (
            <p className="mt-2">
              {`This ${fitSizes ? "" : "open-back "}ring adjusts to fit US ${fit[0]}–${fit[fit.length - 1]}.`}
              {outside.length > 0 && ` ${outside.join(" and ")} ${outside.length > 1 ? "are chart references" : "is a chart reference"}, not its adjustable fit range.`}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}