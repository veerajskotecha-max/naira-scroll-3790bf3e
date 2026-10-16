import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import BagGiftRow from "./BagGiftRow";

vi.mock("@/lib/clarity", () => ({ clarityEvent: vi.fn() }));
vi.mock("./BagGiftBox", () => ({ default: ({ holdOpen, autoOpen }: { holdOpen: boolean; autoOpen: boolean }) => <div data-testid="box" data-held={holdOpen} data-open={autoOpen} /> }));
afterEach(cleanup);

describe("bag gift-box preview", () => {
  it("opens from the whole labelled row and stays until Back is chosen", () => {
    render(<BagGiftRow items={[]} jewellery={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Tap to open your Naira gift box" }));
    expect(screen.getByText("Every piece comes with this box")).toBeInTheDocument();
    expect(screen.getByTestId("box")).toHaveAttribute("data-held", "true");
    expect(screen.getByRole("button", { name: "Back to your bag" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Back to your bag" }));
    expect(screen.queryByTestId("box")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tap to open your Naira gift box" })).toBeInTheDocument();
  });

  it("Escape returns to the bag rather than dismissing it", () => {
    render(<BagGiftRow items={[]} jewellery={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Tap to open your Naira gift box" }));
    fireEvent.keyDown(screen.getByRole("button", { name: "Back to your bag" }), { key: "Escape" });
    expect(screen.queryByTestId("box")).not.toBeInTheDocument();
  });

  it("keeps heavy 3D and duplicate catalogue subscriptions out of the bag preview", () => {
    const row = readFileSync(new URL("./BagGiftRow.tsx", import.meta.url), "utf8");
    const box = readFileSync(new URL("./BagGiftBox.tsx", import.meta.url), "utf8");
    expect(row).not.toMatch(/useLiveJewellery|NairaBox3D|from ["']three/);
    expect(box).toContain("waits.clear()");
    expect(box).toContain("if (holdOpen) return");
    // Reduced motion must still show the opened packaging after a shopper taps.
    expect(box).toContain("ringRaised={still && autoOpen}");
  });
});