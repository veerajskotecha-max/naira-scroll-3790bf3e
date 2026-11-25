import UpiBadges from "@/components/checkout/UpiBadges";
import { MastercardMark, VisaMark } from "@/components/cart/PayMarks";

/*
  The ways to pay, as their own marks: the three UPI apps, Visa and
  Mastercard, and cash on delivery in words. One line under the product
  page's reassurances and above the bag's Checkout, so the two agree.
  The marks are decoration; one sentence says the same to a screen reader.
*/
const PayRow = ({ tight = false }: { tight?: boolean }) => (
  <p data-pay-line className={`rn-pay ${tight ? "rn-pay--tight" : ""}`.trim()}>
    <span className="nc-sr">Pay by UPI, Visa, Mastercard or cash on delivery.</span>
    <span aria-hidden="true">
      <UpiBadges size={20} />
      UPI
    </span>
    <span aria-hidden="true">
      <VisaMark height={10} />
      <MastercardMark height={15} />
      Cards
    </span>
    <span aria-hidden="true">Cash on delivery</span>
  </p>
);

export default PayRow;
