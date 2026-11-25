import type { ReactNode } from "react";

/*
  Facts as a quiet table: a caps label at the left, its values at the right,
  one hairline between rows. It replaces the bordered badges: the qualities
  are one row, the offer the next, and inside "Details and size" the same
  table lists the piece's specifications.
*/
export const CleanFacts = ({ children, bare = false, className = "", label }: { children: ReactNode; bare?: boolean; className?: string; label?: string }) => (
  <dl className={`nc-facts ${bare ? "nc-facts--bare" : ""} ${className}`.trim()} aria-label={label}>
    {children}
  </dl>
);

export const CleanFact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="nc-facts__row">
    <dt className="nc-facts__label">{label}</dt>
    <dd className="nc-facts__value">{children}</dd>
  </div>
);

/** Short values on one line, a middle dot between them; a value that wraps starts its line without one. */
export const CleanDots = ({ items }: { items: ReadonlyArray<ReactNode | false | null | undefined> }) => {
  const shown = items.filter((item) => item !== false && item !== null && item !== undefined && item !== "");
  return (
    <span className="nc-dots">
      <span>
        {shown.map((item, index) => (
          <span key={index}>{item}</span>
        ))}
      </span>
    </span>
  );
};
