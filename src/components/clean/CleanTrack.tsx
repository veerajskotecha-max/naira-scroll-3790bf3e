/*
  The 2px line: how far along something is. In the bag it is the offer's
  progress (promo.ts `quantityOfferProgress`), the only gold shape there.
*/
type Props = {
  /** 0 to 1: how much of the line is filled. */
  value: number;
  /** What a screen reader hears, e.g. "2 of 4 pieces". */
  label: string;
  /** The count behind the line, for aria-valuenow / aria-valuemax. */
  now: number;
  max: number;
  className?: string;
};

const CleanTrack = ({ value, label, now, max, className = "" }: Props) => {
  const width = Math.min(1, Math.max(0, value)) * 100;
  return (
    <div
      className={`nc-track ${className}`.trim()}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(Math.max(0, now), max)}
    >
      <span style={{ width: `${width}%` }} />
    </div>
  );
};

export default CleanTrack;
