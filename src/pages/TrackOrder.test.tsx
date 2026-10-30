import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/Footer", () => ({ default: () => null }));

import TrackOrder, { ORDER_LOOKUP_URL } from "./TrackOrder";

afterEach(cleanup);

const page = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <TrackOrder />
      </MemoryRouter>
    </HelmetProvider>,
  );

/* The page asked for an order number and an email, then ignored both and
   opened Shopify's sign-in, even with the form empty. Shopify offers no
   lookup by number and email, so the page now offers what works: sign in
   to see your orders, or send the number to the atelier. */
describe("Track Order", () => {
  it("asks for nothing it cannot use", () => {
    const { container } = page();
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });

  it("finds the order through Shopify's own sign-in, in a new tab", () => {
    page();
    const find = screen.getByRole("link", { name: "FIND MY ORDER" });
    expect(find).toHaveAttribute("href", ORDER_LOOKUP_URL);
    expect(ORDER_LOOKUP_URL).toBe("https://nc5eti-gp.myshopify.com/account/login");
    expect(find).toHaveAttribute("target", "_blank");
    expect(find.getAttribute("rel")).toContain("noopener");
  });

  it("puts the order number it asks for into the WhatsApp message", () => {
    page();
    fireEvent.change(screen.getByRole("textbox", { name: "ORDER NUMBER" }), { target: { value: "#1001" } });
    const href = screen.getByRole("link", { name: "MESSAGE THE ATELIER" }).getAttribute("href") ?? "";
    expect(decodeURIComponent(href)).toContain("status of my order #1001?");
  });
});
