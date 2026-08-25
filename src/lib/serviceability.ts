/**
 * Pincode serviceability rules for Naira Flore.
 *
 * Delivery promise:
 *  - Maharashtra pincodes  -> 3 working days
 *  - Rest of India         -> 5 working days
 *
 * COD is disabled for pincode ranges with historically high fake / RTO
 * (return-to-origin) rates for fashion & jewellery courier deliveries, plus
 * genuinely non-serviceable-for-COD zones (J&K/Ladakh, remote NE, island
 * territories). These are the ranges most Indian D2C brands and 3PLs
 * (Shiprocket / Delhivery / Bluedart risk lists) keep on prepaid-only.
 */

/**
 * Flat domestic shipping, mirroring Shopify's General profile → Domestic →
 * Standard rate. There is no free-shipping threshold configured in Shopify, so
 * nothing on the site may promise one.
 */
export const SHIPPING_CHARGE = 150;

export type CodStatus = "available" | "blocked";

export interface Serviceability {
  pincode: string;
  state: string;
  isMaharashtra: boolean;
  days: number;
  cod: CodStatus;
  codReason?: string;
}

export const isValidPincode = (value: string) => /^[1-9]\d{5}$/.test(value);

/** Maharashtra = first two digits 40–44, minus the 403xxx block (Goa). */
export const isMaharashtraPincode = (pin: string) => {
  const two = Number(pin.slice(0, 2));
  const three = pin.slice(0, 3);
  if (three === "403") return false; // Goa
  return two >= 40 && two <= 44;
};

/** Coarse state label, only used for the on-screen note. */
const stateFor = (pin: string): string => {
  if (isMaharashtraPincode(pin)) return "Maharashtra";
  const three = Number(pin.slice(0, 3));
  if (three === 403) return "Goa";
  if (three >= 110 && three <= 140) return "Delhi NCR";
  if (three >= 180 && three <= 194) return "Jammu, Kashmir & Ladakh";
  if (three >= 800 && three <= 855) return "Bihar";
  if (three >= 814 && three <= 835) return "Jharkhand";
  if (three >= 781 && three <= 799) return "North East";
  return "India";
};

/**
 * Prefix ranges (first 3 digits, inclusive) kept prepaid-only.
 * Sourced from widely published courier RTO-risk / COD-restricted zone lists.
 */
const COD_BLOCKED_RANGES: Array<{ from: number; to: number; reason: string }> = [
  // Jammu, Kashmir & Ladakh — COD restricted by most couriers
  { from: 180, to: 194, reason: "COD is not serviceable in this region" },
  // Bihar — highest RTO band for fashion/jewellery COD
  { from: 800, to: 855, reason: "high return rate on COD in this region" },
  // Jharkhand
  { from: 814, to: 835, reason: "high return rate on COD in this region" },
  // North East (Assam, Nagaland, Manipur, Mizoram, Tripura, Arunachal, Meghalaya)
  { from: 781, to: 799, reason: "COD is not serviceable in this region" },
  // Andaman & Nicobar
  { from: 744, to: 744, reason: "COD is not serviceable on island routes" },
  // Lakshadweep
  { from: 682, to: 682, reason: "COD is not serviceable on island routes" },
  // Eastern UP high-RTO belt (Gorakhpur / Deoria / Basti / Azamgarh / Ballia)
  { from: 273, to: 277, reason: "high return rate on COD in this region" },
  // Western UP high-RTO belt (Aligarh / Hathras / Mathura / Firozabad)
  { from: 202, to: 205, reason: "high return rate on COD in this region" },
  // Mewat / Palwal / Nuh belt, Haryana
  { from: 121, to: 122, reason: "high return rate on COD in this region" },
];

/** Specific individual pincodes flagged for fraudulent COD orders. */
const COD_BLOCKED_PINCODES = new Set<string>([
  "122103", // Nuh
  "122107", // Punhana
  "121102", // Hathin
  "247001", // Saharanpur belt
  "854105", // Katihar
  "845401", // Bettiah
]);

export const getServiceability = (pincode: string): Serviceability | null => {
  if (!isValidPincode(pincode)) return null;

  const isMh = isMaharashtraPincode(pincode);
  const three = Number(pincode.slice(0, 3));

  let cod: CodStatus = "available";
  let codReason: string | undefined;

  const hit = COD_BLOCKED_RANGES.find((r) => three >= r.from && three <= r.to);
  if (hit) {
    cod = "blocked";
    codReason = hit.reason;
  }
  if (COD_BLOCKED_PINCODES.has(pincode)) {
    cod = "blocked";
    codReason = codReason ?? "high return rate on COD in this region";
  }

  return {
    pincode,
    state: stateFor(pincode),
    isMaharashtra: isMh,
    days: isMh ? 3 : 5,
    cod,
    codReason,
  };
};

/** Adds working days (skips Sat/Sun) to a date. */
export const addWorkingDays = (start: Date, days: number) => {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
};

export const formatDeliveryDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
