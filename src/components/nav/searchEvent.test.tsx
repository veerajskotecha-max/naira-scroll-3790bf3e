import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { track } = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@/lib/pixel", () => ({ trackPixel: track }));
vi.mock("@/hooks/useLiveJewellery", async () => {
  const { jewellerySnapshot } = await import("@/data/jewellerySnapshot");
  return { useLiveJewellery: () => ({ jewellery: jewellerySnapshot }) };
});

import SearchOverlay, { SEARCH_SETTLE_MS } from "./SearchOverlay";

/*
  Search reached Meta only when a result or "See all" was tapped. Live: "zzqx"
  + Enter ("Nothing matches") sent nothing, and "rings" typed then closed sent
  nothing; only "hoops" + Enter (which follows the best match) sent one.
*/
const Harness = () => {
  const [open, setOpen] = useState(false);
  return (
    <MemoryRouter>
      <button onClick={() => setOpen(true)}>Search</button>
      <SearchOverlay open={open} onClose={() => setOpen(false)} />
    </MemoryRouter>
  );
};
const searches = () => track.mock.calls.filter(([event]) => event === "Search").map(([, params]) => params.search_string);
const openSearch = () => {
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  act(() => void vi.advanceTimersByTime(100));
  return screen.getByRole("searchbox", { name: "Search products" });
};
/* Typed a letter at a time, faster than the settle time. */
const type = (box: HTMLElement, text: string) => {
  for (let i = 1; i <= text.length; i++) {
    fireEvent.change(box, { target: { value: text.slice(0, i) } });
    act(() => void vi.advanceTimersByTime(150));
  }
};
const settle = () => act(() => void vi.advanceTimersByTime(SEARCH_SETTLE_MS));
const enter = (box: HTMLElement) => fireEvent.submit(box.closest("form")!);

beforeEach(() => {
  vi.useFakeTimers();
  track.mockClear();
  render(<Harness />);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("one Search per settled query", () => {
  it("counts a search that finds nothing, once, Enter or not", () => {
    const box = openSearch();
    type(box, "zzqx");
    expect(searches()).toEqual([]);
    settle();
    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument();
    expect(searches()).toEqual(["zzqx"]);
    enter(box);
    settle();
    expect(searches()).toEqual(["zzqx"]);
  });

  it("counts Enter on a search that finds nothing at once", () => {
    const box = openSearch();
    type(box, "zzqx");
    enter(box);
    expect(searches()).toEqual(["zzqx"]);
    settle();
    expect(searches()).toEqual(["zzqx"]);
  });

  it("counts a search typed and closed before it settled", () => {
    const box = openSearch();
    type(box, "rings");
    fireEvent.keyDown(box, { key: "Escape" });
    expect(searches()).toEqual(["rings"]);
    settle();
    expect(searches()).toEqual(["rings"]);
  });

  it("does not count the letters on the way to a word", () => {
    const box = openSearch();
    type(box, "hoops");
    settle();
    expect(searches()).toEqual(["hoops"]);
  });

  it("does not count a followed search twice", () => {
    const box = openSearch();
    type(box, "hoops");
    settle();
    enter(box); // follows the best match, as a tap on it would
    expect(searches()).toEqual(["hoops"]);
  });

  it("counts a followed search that had not settled, once", () => {
    const box = openSearch();
    type(box, "hoops");
    enter(box);
    settle();
    expect(searches()).toEqual(["hoops"]);
  });

  it("counts each settled query, and the same one again on a later visit", () => {
    let box = openSearch();
    type(box, "pearl");
    settle();
    fireEvent.change(box, { target: { value: "" } });
    type(box, "hoops");
    settle();
    fireEvent.keyDown(box, { key: "Escape" });
    box = openSearch();
    type(box, "hoops");
    settle();
    expect(searches()).toEqual(["pearl", "hoops", "hoops"]);
  });

  it("never counts a single letter", () => {
    const box = openSearch();
    type(box, "h");
    settle();
    fireEvent.keyDown(box, { key: "Escape" });
    expect(searches()).toEqual([]);
  });
});
