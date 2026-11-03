import { describe, expect, it } from "vitest";
import { getServiceability, isCourierZone, isValidPincode } from "./serviceability";

/* 999999 got "Delivery in 5 working days · Cash on Delivery available": a
   pincode in the Army Postal Service's zone, which no courier route reaches. */
describe("pincode serviceability", () => {
  it("reads six digits that do not start with 0 as a pincode", () => {
    expect(isValidPincode("400001")).toBe(true);
    expect(isValidPincode("12345")).toBe(false);
    expect(isValidPincode("000000")).toBe(false);
  });

  it("promises nothing for an Army Postal Service pincode", () => {
    expect(isCourierZone("999999")).toBe(false);
    expect(isCourierZone("900001")).toBe(false);
    expect(getServiceability("999999")).toBeNull();
  });

  it("keeps the delivery days and COD rules for the civil zones", () => {
    expect(getServiceability("400001")).toMatchObject({ days: 3, cod: "available", isMaharashtra: true });
    expect(getServiceability("560001")).toMatchObject({ days: 5, cod: "available" });
    expect(getServiceability("845401")?.cod).toBe("blocked");
    expect(getServiceability("781001")?.cod).toBe("blocked");
  });
});
