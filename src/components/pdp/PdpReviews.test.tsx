import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/*
  The product page's reviews list only what the code can vouch for: the
  photographed customer reviews (reviewWall `realReviews`) and the reviews
  customers submitted for this product and the shop approved. The bundled
  notes dealt to every product by a hash of its name, and the two bundled
  lists that used to sit on every jewellery page, are not shown; nor is an
  average worked out from them. The head carries the shop's own figures.
*/
const db = vi.hoisted(() => ({
  rows: [] as { name: string; rating: number; text: string; images: string[] | null; created_at: string }[],
  filters: [] as [string, unknown][],
  inserted: [] as unknown[],
}));
vi.mock("@/integrations/supabase/lazy", () => {
  const query = () => {
    const q = {
      select: () => q,
      eq: (column: string, value: unknown) => {
        db.filters.push([column, value]);
        return q;
      },
      order: () => q,
      limit: () => Promise.resolve({ data: db.rows }),
      insert: (row: unknown) => {
        db.inserted.push(row);
        return Promise.resolve({ error: null });
      },
    };
    return q;
  };
  const channel = { on: () => channel, subscribe: () => channel };
  return { getSupabase: () => Promise.resolve({ from: query, channel: () => channel, removeChannel: () => {} }) };
});
const modal = vi.hoisted(() => ({ submit: null as null | ((review: { name: string; rating: number; text: string; images: string[] }) => void) }));
vi.mock("@/components/WriteReviewModal", () => ({
  default: ({ open, onSubmit }: { open: boolean; onSubmit: (typeof modal)["submit"] }) => {
    modal.submit = onSubmit;
    return open ? <div role="dialog" aria-label="Write a review" /> : null;
  },
}));

import PdpReviews from "./PdpReviews";
import { jewelleryOneLiners, jewelleryReviews, orderedRealReviews, realReviews } from "@/data/reviewWall";
import { getProductReviews } from "@/data/productReviews";

beforeEach(() => {
  db.rows = [];
  db.filters = [];
  db.inserted = [];
});
afterEach(cleanup);

const names = () => [...document.querySelectorAll("[data-review-name]")].map((el) => el.textContent);
/* Render, then let the (mocked) client and its first answer arrive. */
const show = async (productName = "Woven Gold Hoops") => {
  render(<PdpReviews productName={productName} />);
  for (let i = 0; i < 4; i++) await act(async () => void (await Promise.resolve()));
};

describe("PdpReviews: the product page's reviews", () => {
  it("heads the list with the shop's own rating and client count, not an average of bundled reviews", async () => {
    await show();
    expect(screen.getByRole("heading", { level: 2, name: "Reviews" })).toBeTruthy();
    const head = screen.getByRole("heading", { level: 2 }).parentElement as HTMLElement;
    expect(head.textContent).toBe("Reviews★ 4.5/5 · Trusted by 5,000+ clients");
    expect(head.querySelector(".nc-star")?.getAttribute("aria-hidden")).toBe("true");
    expect(document.body.textContent).not.toMatch(/4\.9|\b\d+ reviews\b/);
  });

  it("shows three photographed customer reviews on a phone and a fourth on a laptop, this piece's first", async () => {
    await show();
    const expected = orderedRealReviews("Woven Gold Hoops");
    /* Three in a phone's single column. A laptop's two columns left the
       second row half empty, so a fourth is in the page for it, hidden below
       1024px by CSS (never by code: the pre-built page must match). */
    expect(names()).toEqual(expected.slice(0, 4).map((r) => r.name));
    const rows = [...document.querySelectorAll("[data-review]")];
    expect(rows.slice(0, 3).every((row) => !row.classList.contains("hidden"))).toBe(true);
    expect(rows[3].classList.contains("hidden")).toBe(true);
    expect(rows[3].classList.contains("lg:block")).toBe(true);
    // The review that names hoops leads on a hoops page.
    expect(document.querySelector("[data-review]")?.textContent).toMatch(/hoops/i);
  });

  it("shows the rest in place from View all, and never a review from the dealt bank or the bundled lists", async () => {
    await show();
    fireEvent.click(screen.getByRole("button", { name: "View all" }));
    expect(names()).toHaveLength(realReviews.length);
    expect(new Set(names())).toEqual(new Set(realReviews.map((r) => r.name)));
    const shown = document.getElementById("customer-reviews")!.textContent ?? "";
    for (const invented of [...getProductReviews("Woven Gold Hoops"), ...jewelleryReviews, ...jewelleryOneLiners]) {
      expect(shown).not.toContain(invented.text);
    }
    expect(screen.getByRole("button", { name: "Show fewer" }).getAttribute("aria-expanded")).toBe("true");
  });

  it("draws each review as a plain row: its own stars as glyphs, verified only where the data says so, the words upright", async () => {
    await show();
    const first = document.querySelector("[data-review]") as HTMLElement;
    const review = orderedRealReviews("Woven Gold Hoops")[0];
    const stars = within(first).getByRole("img", { name: `${review.rating} out of 5` });
    expect(stars.textContent).toBe("★".repeat(review.rating));
    expect(first.textContent).toContain("· Verified buyer");
    expect(first.textContent).toContain(review.text);
    expect(first.textContent).not.toMatch(/[“”"]/);
    expect(first.querySelectorAll("svg")).toHaveLength(0);
    // Her photographs, as squares that open.
    expect(within(first).getAllByRole("button", { name: /^Open customer photo \d+$/ })).toHaveLength(review.images.length);
  });

  it("opens a customer's photograph in a named dialog", async () => {
    await show();
    fireEvent.click(screen.getAllByRole("button", { name: "Open customer photo 1" })[0]);
    const dialog = screen.getByRole("dialog", { name: "Customer photo" });
    expect(dialog.hasAttribute("aria-describedby")).toBe(false);
    expect(within(dialog).getByAltText("Customer photo")).toBeTruthy();
  });

  it("puts the approved reviews customers submitted for this product first, asked for by its name", async () => {
    db.rows = [{ name: "Reviewer One", rating: 4, text: "Sits well, light on the ear.", images: null, created_at: "2026-11-01T10:00:00Z" }];
    await show();
    expect(names()[0]).toBe("Reviewer One");
    expect(db.filters).toEqual([
      ["approved", true],
      ["product_name", "Woven Gold Hoops"],
    ]);
    const first = document.querySelector("[data-review]") as HTMLElement;
    expect(within(first).getByRole("img", { name: "4 out of 5" }).textContent).toBe("★★★★");
    /* Four rows in the page: three for a phone, the fourth for a laptop's second column. */
    expect(names().slice(1)).toEqual(orderedRealReviews("Woven Gold Hoops").slice(0, 3).map((r) => r.name));
  });

  it("shows a review written here at once, unverified, and saves it for moderation", async () => {
    await show();
    fireEvent.click(screen.getByRole("button", { name: "Write a review" }));
    expect(screen.getByRole("dialog", { name: "Write a review" })).toBeTruthy();
    await act(async () => void (await modal.submit!({ name: "Reviewer Two", rating: 5, text: "Lovely.", images: [] })));
    expect(names()[0]).toBe("Reviewer Two");
    expect(document.querySelector("[data-review]")?.textContent).not.toContain("Verified buyer");
    expect(db.inserted).toEqual([{ product_name: "Woven Gold Hoops", variant: "jewellery", name: "Reviewer Two", rating: 5, text: "Lovely.", images: [] }]);
  });

  it("takes its type and colour from the clean system and reads no invented list", () => {
    const src = readFileSync(resolve(__dirname, "PdpReviews.tsx"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(src).not.toMatch(/getProductReviews|jewelleryReviews|jewelleryOneLiners|reviewSummary|reviewsData/);
    expect(src).not.toMatch(/font-cormorant|font-nf-|text-nf-|bg-nf-|border-nf-|\btracking-|\btext-\[\d|\brounded|\bshadow-|\bitalic\b|text-yellow|Avatar/);
  });
});
