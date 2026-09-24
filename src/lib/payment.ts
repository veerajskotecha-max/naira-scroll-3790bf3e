/*
  Cash on delivery carries a fee at checkout, and the product page says so.

  The payment page (Fastrr) adds 5% to a COD order and books it as shipping —
  verified against live orders: an ₹899 piece paid COD came to ₹943.95, a ₹1,299
  one to ₹1,363.95, while the same pieces paid online were charged list price.
  The product page promises free shipping, so a COD line that only said
  "available" would put an unannounced 5% in front of the shopper at the last
  step — the single largest abandonment cause Baymard records (48% leave over
  extra costs they were not shown).

  If the fee changes in the checkout settings, change it here too.
  `payment.test.ts` pins the literal so a one-sided edit fails the suite.
*/
export const COD_FEE_RATE = 0.05;

export const codFeeLabel = () => `+${Math.round(COD_FEE_RATE * 100)}%`;
