import type { ReactNode } from "react";
import UpiBadges from "@/components/checkout/UpiBadges";
import { MastercardMark, VisaMark } from "@/components/cart/PayMarks";

/*
  The ways to pay, as their own marks: the three UPI apps, Visa and
  Mastercard. The marks are decoration; one sentence says the same to a
  screen reader.

  In the bag (`tight`) each mark keeps its word and cash on delivery is the
  third: nothing else in the bag's foot says how one can pay. On the product
  page the marks stand alone, at the left edge the page reads from: the
  reassurance right above them already says "Cash on delivery", and the
  words beside the marks said UPI and cards a second time (the design and
  copy reviews, 25 Nov 2026).

  The page's row has room at its right end for one more thing (`children`):
  the way to ask a question, which was only inside the Delivery dropdown.
*/
const PayRow = ({ tight = false, children }: { tight?: boolean; children?: ReactNode }) => (
  <p data-pay-line className={`rn-pay ${tight ? "rn-pay--tight" : "rn-pay--marks"}`}>
    <span className="nc-sr">{tight ? "Pay by UPI, Visa, Mastercard or cash on delivery." : "Pay by UPI, Visa or Mastercard."}</span>
    <span aria-hidden="true">
      <UpiBadges size={20} />
      {tight && "UPI"}
    </span>
    <span aria-hidden="true">
      <VisaMark height={10} />
      <MastercardMark height={15} />
      {tight && "Cards"}
    </span>
    {tight && <span aria-hidden="true">Cash on delivery</span>}
    {children}
  </p>
);

export default PayRow;
