import { ADJUSTABLE_SIZES } from "@/data/ringFit";
import { RING_SIZE_CHART } from "@/data/ringSizing";

interface Props {
  highlightSize?: string;
  adjustable?: boolean;
  /** The US sizes an adjustable ring fits. */
  fitSizes?: string[];
}

/*
  The ring size chart and how to measure, in the clean system (it is shown
  inside "Details and size" on the product page and in the size guide sheet,
  both of which carry .nf-clean). The chart is hairline rows: caps labels for
  the column heads, the chosen size in medium ink with no fill behind it. The
  words are the same; the two measured columns lead with "across" and
  "around" in the caps label, because "CIRCUMFERENCE" in that label is wider
  than a third of a 360px phone.
*/
const rule = "border-[color:var(--nc-rule)]";

export default function RingSizeGuide({ highlightSize, adjustable = false, fitSizes = ADJUSTABLE_SIZES }: Props) {
  /* The chart's sizes outside the ring's fit: "US 8 and US 9". */
  const outside = RING_SIZE_CHART.map((size) => size.us).filter((us) => !fitSizes.includes(us)).map((us) => `US ${us}`);
  const chosen = highlightSize?.replace(/^US\s*/i, "");
  return (
    <section aria-label="Ring size guide">
      <h3 className="nc-heading nc-heading--sheet">Find your US ring size</h3>
      <p className="nc-text nc-text--muted mt-2">
        Match your measurement to the chart below. Diameter is the inside width of a ring; circumference is the distance around your finger. All measurements are in centimetres (cm).
      </p>
      <table className="mt-4 w-full table-fixed border-collapse text-left">
        <caption className="sr-only">US ring sizes 5 to 9 with approximate inner diameter and circumference in centimetres</caption>
        <thead>
          <tr className={`border-y ${rule}`}>
            <th scope="col" className="w-[22%] py-3 pr-2 align-top">
              <span className="nc-label">US size</span>
            </th>
            <th scope="col" className="px-2 py-3 align-top">
              <span className="nc-label">Across</span>
              <span className="nc-small block">Inner diameter, cm</span>
            </th>
            <th scope="col" className="py-3 pl-2 align-top">
              <span className="nc-label">Around</span>
              <span className="nc-small block">Circumference, cm</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {RING_SIZE_CHART.map((size) => {
            const cell = chosen === size.us ? "nc-text nc-text--strong" : "nc-text nc-text--muted";
            return (
              <tr key={size.us} className={`border-b ${rule}`} data-chosen={chosen === size.us ? "" : undefined}>
                <th scope="row" className={`${cell} py-3 pr-2`}>US {size.us}</th>
                <td className={`${cell} px-2 py-3 tabular-nums`}>{size.diameterCm} cm</td>
                <td className={`${cell} py-3 pl-2 tabular-nums`}>{size.circumferenceCm} cm</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="nc-small mt-2">Approximate reference measurements. Available sizes are shown in this piece’s size selector; this chart does not indicate stock.</p>
      <div className="mt-6 space-y-6">
        <div>
          <h4 className="nc-text nc-text--strong">Measure a ring you wear</h4>
          <ol className="nc-text nc-text--muted mt-2 list-decimal space-y-1 pl-5">
            <li>Choose a ring that fits the same finger on the same hand.</li>
            <li>Lay it on a ruler and measure straight across the centre, from one inside edge to the other. Do not include the metal band.</li>
            <li>Match this width to the inner diameter column. For example, 1.65 cm across is US 6.</li>
          </ol>
        </div>
        <div>
          <h4 className="nc-text nc-text--strong">Estimate your finger size at home</h4>
          <ol className="nc-text nc-text--muted mt-2 list-decimal space-y-1 pl-5">
            <li>Wrap a thin, non-stretch strip of paper around the base of your finger, snugly without squeezing.</li>
            <li>Mark where the ends meet, then lay the strip flat and measure from the start to the mark in cm.</li>
            <li>Match the length to the circumference column. For example, 5.44 cm around is US 7.</li>
          </ol>
          <p className="nc-text nc-text--muted mt-2">Paper gives an estimate only; avoid stretchy thread. A jeweller’s ring sizer is the most reliable way to confirm your fit.</p>
        </div>
        <div>
          <h4 className="nc-text nc-text--strong">Before choosing</h4>
          <p className="nc-text nc-text--muted mt-2">Measure 2–3 times with warm hands, preferably towards the end of the day. Check the ring can pass your knuckle. If between sizes or choosing a wide band, try the larger size and confirm the fit with a jeweller.</p>
          {adjustable && (
            <p className="nc-text nc-text--muted mt-2">
              {`This open-back ring adjusts to fit US ${fitSizes[0]}–${fitSizes[fitSizes.length - 1]}.`}
              {outside.length > 0 && ` ${outside.join(" and ")} ${outside.length > 1 ? "are chart references" : "is a chart reference"}, not its adjustable fit range.`}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
