import { act, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toaster, toast } from "./sonner";

/* On a phone a toast sat 16px from the bottom, over the product page's buy
   bar (65px tall), for four seconds: "Only 1 left, all in your bag" covered
   Add to cart, Buy Now and the heart, and a tap on it held it there. */
describe("Toaster", () => {
  it("stands phone toasts clear of the buy bar", async () => {
    render(<Toaster />);
    await act(async () => {
      toast.error("Only 1 of Birthstone Heart Necklace left, all in your bag.");
    });
    await waitFor(() =>
      expect(document.querySelector("[data-sonner-toaster]")?.getAttribute("style")).toContain(
        "--mobile-offset-bottom: calc(var(--pdp-sticky-bar-h) + env(safe-area-inset-bottom, 0px) + 12px)",
      ),
    );
  });
});
