/*
  The price row: the price, the only medium-weight figure in the buy box;
  then the MRP it replaces, struck; the saving as plain gold words; and a
  quiet note (the tax line). The MRP and the saving show only when there is
  a saving to show.
*/
type Props = {
  /** The price as shown, e.g. "₹1,049". */
  price: string;
  /** The MRP as shown, e.g. "₹1,749". */
  compareAt?: string | null;
  /** Whole percent saved against the MRP, e.g. 40. */
  percentOff?: number | null;
  /** e.g. "incl. 3% GST". */
  note?: string;
  id?: string;
  className?: string;
};

const CleanPrice = ({ price, compareAt, percentOff, note, id, className = "" }: Props) => {
  const saving = Boolean(compareAt) && Number(percentOff) > 0;
  return (
    <div id={id} className={`nc-price ${className}`.trim()}>
      <span className="nc-price__now">{price}</span>
      {saving && (
        <>
          <del className="nc-price__was">{compareAt}</del>
          <span className="nc-price__off">{percentOff}% off</span>
        </>
      )}
      {note ? <span className="nc-price__note">{note}</span> : null}
    </div>
  );
};

export default CleanPrice;
