import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChunkErrorBoundary from "./ChunkErrorBoundary";

/*
  The panel's "Browse the collection" link, and Back, changed the URL but left
  the panel on screen: the boundary never cleared its failure, so the shopper
  had no way onward but a full reload.
*/
let back: () => void = () => {};
const Nav = () => {
  const navigate = useNavigate();
  back = () => navigate(-1);
  return null;
};

const Broken = (): JSX.Element => {
  throw new Error("page failed");
};
let gridFails = false;
const FlakyGrid = () => {
  if (gridFails) throw new Error("page failed");
  return <h1>Grid</h1>;
};

const mount = (entries: string[], grid = <h1>Grid</h1>) =>
  render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <Nav />
      <ChunkErrorBoundary>
        <Routes>
          <Route path="/jewellery" element={grid} />
          <Route path="/jewellery/ok" element={<h1>Piece</h1>} />
          <Route path="/jewellery/broken" element={<Broken />} />
        </Routes>
      </ChunkErrorBoundary>
    </MemoryRouter>,
  );

const panel = () => screen.queryByRole("heading", { name: /This page didn.t load/ });

describe("ChunkErrorBoundary", () => {
  beforeEach(() => {
    gridFails = false;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("lets the panel's own link open the collection", () => {
    mount(["/jewellery/broken"]);
    expect(panel()).not.toBeNull();
    fireEvent.click(screen.getByRole("link", { name: "Browse the collection" }));
    expect(panel()).toBeNull();
    expect(screen.getByRole("heading", { name: "Grid" })).toBeTruthy();
  });

  it("lets Back leave the panel", () => {
    mount(["/jewellery/ok", "/jewellery/broken"]);
    expect(panel()).not.toBeNull();
    act(() => back());
    expect(screen.getByRole("heading", { name: "Piece" })).toBeTruthy();
  });

  it("works from a panel already on the collection", () => {
    gridFails = true;
    mount(["/jewellery"], <FlakyGrid />);
    expect(panel()).not.toBeNull();
    gridFails = false;
    fireEvent.click(screen.getByRole("link", { name: "Browse the collection" }));
    expect(screen.getByRole("heading", { name: "Grid" })).toBeTruthy();
  });

  it("keeps the panel, without looping, while the page keeps failing", () => {
    mount(["/jewellery/broken"]);
    expect(panel()).not.toBeNull();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
});
