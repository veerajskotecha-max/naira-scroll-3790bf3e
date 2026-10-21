import { describe, expect, it } from "vitest";
import { RING_SIZE_CHART } from "./ringSizing";

describe("US ring measurement reference", () => {
  // Adding US 9 to guidance must not remove any of the requested smaller sizes.
  it.each([
    ["5", "1.57", "4.93"],
    ["6", "1.65", "5.19"],
    ["7", "1.73", "5.44"],
    ["8", "1.81", "5.69"],
    ["9", "1.90", "5.97"],
  ])("keeps US %s measurements in centimetres", (us, diameterCm, circumferenceCm) => {
    expect(RING_SIZE_CHART.find((size) => size.us === us)).toEqual({ us, diameterCm, circumferenceCm });
  });
});