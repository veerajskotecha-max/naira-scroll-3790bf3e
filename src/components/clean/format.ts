/** "₹1,049": whole rupees, Indian grouping, as every price on the site. */
export const rupees = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;

/** 0.2 → "20%". */
export const percent = (rate: number) => `${Math.round(rate * 100)}%`;
