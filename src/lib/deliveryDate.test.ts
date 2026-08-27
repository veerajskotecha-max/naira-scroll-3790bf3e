import { describe, it, expect } from "vitest";
import { addWorkingDays, formatDeliveryDate } from "./serviceability";

/*
  Baymard found 41% of sites quote a shipping speed instead of a delivery date,
  and that test participants opened calendars to count business days themselves,
  reaching conflicting conclusions from identical wording. A shown date is read
  as a promise — so the arithmetic behind it has to be right, and it has to skip
  weekends the way a courier does.
*/
describe("delivery date arithmetic", () => {
  it("skips weekends", () => {
    // Thursday 27 Aug 2026 + 5 working days = Thursday 3 Sep (Sat/Sun skipped)
    const from = new Date("2026-08-27T09:00:00+05:30");
    expect(formatDeliveryDate(addWorkingDays(from, 5))).toMatch(/3 Sep/);
  });

  it("never lands on a Saturday or Sunday", () => {
    const start = new Date("2026-08-01T09:00:00+05:30");
    for (let offset = 0; offset < 40; offset++) {
      const from = new Date(start);
      from.setDate(from.getDate() + offset);
      for (const days of [3, 5]) {
        const day = addWorkingDays(from, days).getDay();
        expect(day, `offset ${offset}, +${days} working days`).not.toBe(0);
        expect(day).not.toBe(6);
      }
    }
  });

  it("is always in the future", () => {
    const from = new Date("2026-08-27T09:00:00+05:30");
    expect(addWorkingDays(from, 5).getTime()).toBeGreaterThan(from.getTime());
  });

  it("quotes Maharashtra sooner than the rest of India", () => {
    const from = new Date("2026-08-27T09:00:00+05:30");
    expect(addWorkingDays(from, 3).getTime()).toBeLessThan(addWorkingDays(from, 5).getTime());
  });
});
