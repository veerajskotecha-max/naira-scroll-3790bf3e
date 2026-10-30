import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useLiveJewellery", () => ({ useLiveJewellery: () => ({ jewellery: [] }) }));
vi.mock("@/lib/pixel", () => ({ trackPixel: () => {} }));

import SearchOverlay from "./SearchOverlay";

afterEach(cleanup);

const Harness = ({ onClose }: { onClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <MemoryRouter>
      <button onClick={() => setOpen(true)}>Search</button>
      <SearchOverlay open={open} onClose={() => { onClose?.(); setOpen(false); }} />
    </MemoryRouter>
  );
};

/* The overlay declared aria-modal but Tab left it after six stops for the
   page behind the dim backdrop, and closing left focus on <body>. */
describe("SearchOverlay as a dialog", () => {
  it("keeps Tab inside, both ways, and closes on Escape back to the Search button", async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const opener = screen.getByRole("button", { name: "Search" });
    opener.focus();
    fireEvent.click(opener);
    act(() => void vi.advanceTimersByTime(100));
    vi.useRealTimers();

    const input = screen.getByRole("searchbox", { name: "Search products" });
    expect(document.activeElement).toBe(input);
    // The last control is the last Popular chip; Tab from it comes back round.
    const chips = screen.getAllByRole("button").filter((b) => /^[A-Z0-9 ]+$/.test(b.textContent ?? ""));
    chips[chips.length - 1].focus();
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(document.activeElement!, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(chips[chips.length - 1]);

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(opener);
  });
});
