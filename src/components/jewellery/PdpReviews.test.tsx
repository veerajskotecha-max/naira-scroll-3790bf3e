import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PdpReviews from "./PdpReviews";

vi.mock("@/integrations/supabase/lazy", () => ({ getSupabase: vi.fn() }));

const review = (name: string, images: string[] = []) => ({ name, rating: 5, text: `${name} wrote this.`, images, date: "2 Sept 2026" });
const data = {
  reviews: [review("Khushi", ["/a.jpg", "/b.jpg"]), review("Sneha"), review("Tanvi", ["/c.jpg"])],
  rating: 5,
  count: 3,
  ownCount: 0,
  loaded: true,
};

describe("PdpReviews", () => {
  const draw = () => render(<PdpReviews productName="Prism Rivière Bracelet" data={data} whatsappHref="https://wa.me/1" />);

  /* Each card holds its own absolutely placed text. Without a positioned
     card, the stars' sr-only spans of every card past the screen hung off
     the page: the document grew to 1,589px and a phone browser zoomed the
     whole product page out to a quarter and stopped it scrolling at 525px. */
  it("keeps every card's absolutely placed text inside the card", () => {
    const { container } = draw();
    const cards = container.querySelectorAll("#customer-reviews ul > li");
    expect(cards).toHaveLength(3);
    cards.forEach((li) => expect(li.className).toMatch(/\brelative\b/));
  });

  it("leads with the reviews that have photos and says whose they are", () => {
    const { container } = draw();
    const names = [...container.querySelectorAll("#customer-reviews ul > li")].map((li) => li.textContent);
    expect(names[0]).toMatch(/Khushi/);
    expect(names[1]).toMatch(/Tanvi/);
    expect(names[2]).toMatch(/Sneha/);
    expect(screen.getByText(/From Naira customers across our pieces, in their own photos\./)).toBeTruthy();
  });

  it("gives each card's stars a value in words", () => {
    draw();
    expect(screen.getAllByText("Rated 5 out of 5").length).toBeGreaterThanOrEqual(3);
  });
});
