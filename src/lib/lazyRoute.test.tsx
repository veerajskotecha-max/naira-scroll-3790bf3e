import { Suspense, useState } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { lazyRoute } from "./lazyRoute";

let mounts = 0;
const Page = () => {
  const [id] = useState(() => ++mounts);
  return <p>page, mount {id}</p>;
};
const load = () => Promise.resolve({ default: Page });

describe("lazyRoute", () => {
  it("renders the page on the first commit once preloaded — no empty fallback", async () => {
    const Route = lazyRoute(load);
    await Route.preload();
    render(
      <Suspense fallback={<p>fallback</p>}>
        <Route />
      </Suspense>,
    );
    // Synchronous: nothing awaited between render() and this assertion.
    expect(screen.getByText(/^page/)).toBeTruthy();
    expect(screen.queryByText("fallback")).toBeNull();
  });

  it("still works without a preload, through the Suspense fallback", async () => {
    const Route = lazyRoute(load);
    render(
      <Suspense fallback={<p>fallback</p>}>
        <Route />
      </Suspense>,
    );
    expect(screen.getByText("fallback")).toBeTruthy();
    expect(await screen.findByText(/^page/)).toBeTruthy();
  });

  it("never remounts the page when it re-renders after its code arrived", async () => {
    const Route = lazyRoute(load);
    let bump = () => {};
    const Parent = () => {
      const [n, setN] = useState(0);
      bump = () => setN(n + 1);
      return (
        <Suspense fallback={<p>fallback</p>}>
          <Route key="route" />
          <span>{n}</span>
        </Suspense>
      );
    };
    render(<Parent />);
    const first = (await screen.findByText(/^page/)).textContent;
    await act(async () => bump());
    expect(screen.getByText(/^page/).textContent).toBe(first);
  });

  it("lets a failed download be retried", async () => {
    let calls = 0;
    const Route = lazyRoute(() => (++calls === 1 ? Promise.reject(new Error("offline")) : load()));
    await expect(Route.preload()).rejects.toThrow("offline");
    await expect(Route.preload()).resolves.toBeUndefined();
    expect(calls).toBe(2);
  });
});
