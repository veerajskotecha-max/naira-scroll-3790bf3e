/*
  Cash on delivery carries a fee at checkout, and the bag says so.

  The payment page (Fastrr) adds 5% to a COD order and books it as shipping —
  verified against live orders: an ₹899 piece paid COD came to ₹943.95, a ₹1,299
  one to ₹1,363.95, while the same pieces paid online were charged list price.
  It is charged on the order total AFTER any discount: a two-piece BUY2 bag of
  ₹2,338.20 came to ₹2,455.11 on COD.

  The product page only says "COD available"; the fee is stated in the bag, as
  a rupee amount, so it is seen before the payment page rather than first met
  there — surprise extra costs are the largest abandonment cause Baymard
  records (48%).

  If the fee changes in the checkout settings, change it here too.
  `payment.test.ts` pins the literal so a one-sided edit fails the suite.
*/
export const COD_FEE_RATE = 0.05;

export const codFeeFor = (orderTotal: number) => Math.round(orderTotal * COD_FEE_RATE * 100) / 100;
