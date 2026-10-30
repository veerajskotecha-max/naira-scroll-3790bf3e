import { act, fireEvent, render, screen } from "@testing-library/react";
import { lazy, Suspense } from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
  PageView on every page the shopper is shown, once. The landing's comes from
  the inline snippet in index.html, so PixelEvents skips it. It used a
  per-mount "first render" flag for that, and the error panel unmounts the
  whole shell: the page the shopper reached from the panel was a fresh mount,
  so its PageView was skipped too, and Meta never heard of it.
*/
const mocks = vi.hoisted(() => ({ pageView: vi.fn() }));
vi.mock("@/lib/pixel", () => ({ trackPageView: mocks.pageView, trackPixel: vi.fn(), setAdMatchIdentity: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ tagClaritySession: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null, profile: null }) }));

let go: (to: string | number) => void = () => {};
const Nav = () => {
  const navigate = useNavigate();
  go = (to) => (typeof to === "number" ? navigate(to) : navigate(to));
  return null;
};
const Broken = (): JSX.Element => {
  throw new Error("page failed");
};

/* The page loads at `landing`, as the browser would have it when the app's
   code runs, then the app mounts there. */
const load = async (landing: string, routes: JSX.Element) => {
  window.history.replaceState(null, "", landing);
  vi.resetModules();
  const { default: PixelEvents } = await import("./PixelEvents");
  const { default: ChunkErrorBoundary } = await import("./ChunkErrorBoundary");
  render(
    <MemoryRouter initialEntries={[landing]}>
      <Nav />
      <ChunkErrorBoundary>
        <PixelEvents />
        <Suspense fallback={<p>Loading</p>}>
          <Routes>{routes}</Routes>
        </Suspense>
      </ChunkErrorBoundary>
    </MemoryRouter>,
  );
};

const panel = () => screen.queryByRole("heading", { name: /This page didn.t load/ });

describe("PixelEvents' PageView", () => {
  beforeEach(() => {
    mocks.pageView.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("leaves the landing to index.html's snippet, then reports each new page once", async () => {
    await load(
      "/jewellery?fbclid=abc",
      <>
        <Route path="/jewellery" element={<h1>Grid</h1>} />
        <Route path="/jewellery/ok" element={<h1>Piece</h1>} />
      </>,
    );
    expect(mocks.pageView).not.toHaveBeenCalled();
    act(() => go("/jewellery/ok"));
    expect(mocks.pageView).toHaveBeenCalledTimes(1);
    act(() => go(-1));
    expect(mocks.pageView).toHaveBeenCalledTimes(2);
  });

  it("reports the page reached from a panel the landing fell to", async () => {
    await load(
      "/jewellery/broken",
      <>
        <Route path="/jewellery" element={<h1>Grid</h1>} />
        <Route path="/jewellery/broken" element={<Broken />} />
      </>,
    );
    expect(panel()).not.toBeNull();
    expect(mocks.pageView).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: "Browse the collection" }));
    expect(screen.getByRole("heading", { name: "Grid" })).toBeTruthy();
    expect(mocks.pageView).toHaveBeenCalledTimes(1);
  });

  /* The real failure: a page's code that never arrives. The shell commits
     its loading state first (PixelEvents mounted at the landing), then the
     rejection throws to the panel and unmounts it. */
  it("reports the page reached from the panel after a page's code failed to arrive", async () => {
    let fail: (e: Error) => void = () => {};
    const Piece = lazy(() => new Promise<{ default: () => JSX.Element }>((_, reject) => (fail = reject)));
    await load(
      "/jewellery/piece",
      <>
        <Route path="/jewellery" element={<h1>Grid</h1>} />
        <Route path="/jewellery/piece" element={<Piece />} />
      </>,
    );
    expect(screen.getByText("Loading")).toBeTruthy();
    await act(async () => fail(new Error("page failed")));
    expect(panel()).not.toBeNull();
    expect(mocks.pageView).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: "Browse the collection" }));
    expect(screen.getByRole("heading", { name: "Grid" })).toBeTruthy();
    expect(mocks.pageView).toHaveBeenCalledTimes(1);
  });

  it("reports the page Back returns to from a panel reached in the app", async () => {
    await load(
      "/jewellery",
      <>
        <Route path="/jewellery" element={<h1>Grid</h1>} />
        <Route path="/jewellery/broken" element={<Broken />} />
      </>,
    );
    act(() => go("/jewellery/broken"));
    expect(panel()).not.toBeNull();
    const before = mocks.pageView.mock.calls.length;
    act(() => go(-1));
    expect(screen.getByRole("heading", { name: "Grid" })).toBeTruthy();
    expect(mocks.pageView.mock.calls.length - before).toBe(1);
  });
});
