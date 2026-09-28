import { describe, it, expect } from "vitest";
import { addWorkingDays, formatDeliveryDate, formatDeliveryRange, deliveryRangeFromNow } from "./serviceability";

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

  it("formats the window as a range, keeping both months across a month boundary", () => {
    // Fri 25 Sep 2026: +3 working days = Tue 29 Sep, +5 = Thu 1 Oct.
    const from = new Date("2026-09-25T09:00:00+05:30");
    expect(formatDeliveryRange(addWorkingDays(from, 3), addWorkingDays(from, 5))).toBe("29 Sep – 1 Oct");
  });

  it("drops the repeated month when both ends share it", () => {
    const from = new Date("2026-10-05T09:00:00+05:30");
    expect(formatDeliveryRange(addWorkingDays(from, 3), addWorkingDays(from, 5))).toBe("8–12 Oct");
  });

  it("always quotes a 3-to-5-working-day window from today, with no weekday name", () => {
    const range = deliveryRangeFromNow();
    expect(range).toContain("–");
    expect(range).not.toMatch(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
  });
});
