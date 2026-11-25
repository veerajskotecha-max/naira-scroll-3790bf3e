import type { ReactNode } from "react";

/*
  A dropdown row: a 52px line with its name at the left and a thin plus at
  the right, a hairline under it, its contents folded away until asked for.
  A native <details>, as the page's fold-downs have always been: the contents
  stay in the HTML (search engines and the pre-built page read them), the
  keyboard and find-in-page work with no script, and several can be open at
  once. clean.css turns the plus to a minus and lets the contents rise in.
*/
type Props = {
  title: string;
  /** The panel's id, e.g. "pdp-panel-details". */
  id?: string;
  /** Open when the page loads. */
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
};

export const CleanDropdown = ({ title, id, defaultOpen = false, onToggle, children }: Props) => (
  <details className="nc-drop" open={defaultOpen || undefined} onToggle={onToggle ? (event) => onToggle(event.currentTarget.open) : undefined}>
    <summary>
      {title}
      <span className="nc-drop__mark" aria-hidden="true" />
    </summary>
    <div id={id} className="nc-drop__panel">
      {children}
    </div>
  </details>
);

/** The group: one hairline above the first row. */
export const CleanDropdowns = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`nc-drops ${className}`.trim()}>{children}</div>
);
