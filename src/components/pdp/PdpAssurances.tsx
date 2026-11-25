/*
  Three quick benefits under the price (four where the listing names a stone):
  a small tick and two words each. The same values, in the same order, as the
  QUALITY row they replace; no boxes, no icon tiles.

  Three short ones share a line where a phone has the room (`data-row`).
  Otherwise they sit two to a row, the second row starting under the first:
  wrapped freely, the fourth was left alone under a row of three, right above
  the main button (the design review, 25 Nov 2026).
*/
export const Tick = ({ className = "rn-tick" }: { className?: string }) => (
  <svg viewBox="0 0 12 12" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
    <path d="M1.5 6.4 4.6 9.3 10.5 2.8" />
  </svg>
);

const PdpAssurances = ({ items }: { items: ReadonlyArray<string | false | null | undefined> }) => {
  const shown = items.filter((item): item is string => Boolean(item));
  if (!shown.length) return null;
  const oneRow = shown.length <= 3 && shown.join("").length <= 44;
  return (
    <ul className="rn-sure" data-row={oneRow ? "" : undefined} aria-label="Materials and finish">
      {shown.map((item) => (
        <li key={item}>
          <Tick />
          {item}
        </li>
      ))}
    </ul>
  );
};

export default PdpAssurances;
