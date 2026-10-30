import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// The bundled reviews are enough; the live client never answers here.
vi.mock("@/integrations/supabase/lazy", () => ({ getSupabase: () => new Promise(() => {}) }));
vi.mock("@/components/WriteReviewModal", () => ({ default: () => null }));

import CustomerReviews from "./CustomerReviews";

afterEach(cleanup);

describe("CustomerReviews", () => {
  /* Collapsed, the panel was aria-hidden and opacity 0 but its "View more"
     button (and, on a phone, the overflowing filter row) still took Tab:
     keyboard focus vanished into content a screen reader is told is not
     there (axe aria-hidden-focus, on every product page). */
  it("keeps the collapsed reviews out of the Tab order", () => {
    const { container } = render(<CustomerReviews productName="Star Point Band" variant="jewellery" />);
    const panel = container.querySelector<HTMLElement>('[aria-hidden="true"]');
    expect(panel).not.toBeNull();
    expect(panel!.hasAttribute("inert")).toBe(true);
    const more = Array.from(panel!.querySelectorAll("button")).find((b) => b.textContent === "View more");
    expect(more?.tabIndex).toBe(-1);

    fireEvent.click(screen.getByRole("button", { name: /view more reviews/i }));
    expect(panel!.hasAttribute("inert")).toBe(false);
    expect(panel!.getAttribute("aria-hidden")).toBe("false");
    expect(more?.tabIndex).toBe(0);
  });

  /* The photo dialog had no DialogTitle: Radix logged an error on every open
     and the dialog had no accessible name. */
  it("names the customer photo dialog", () => {
    render(<CustomerReviews productName="Star Point Band" variant="jewellery" />);
    fireEvent.click(screen.getByRole("button", { name: "Open customer photo 1" }));
    const dialog = screen.getByRole("dialog", { name: "Customer photo" });
    expect(dialog.hasAttribute("aria-describedby")).toBe(false);
  });
});
