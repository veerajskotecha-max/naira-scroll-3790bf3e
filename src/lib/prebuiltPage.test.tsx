import { act } from "@testing-library/react";
import { Component, lazy, Suspense, useLayoutEffect, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { readFileSync } from "fs";
import { resolve } from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_ATTR } from "./fallbackGuard";
import { lazyRoute } from "./lazyRoute";
import { dropPrebuiltPage, keepPrebuiltPage, PrebuiltPage } from "./prebuiltPage";

/*
  When the app starts on its 8 s limit before the landing page's code has
  arrived, createRoot emptied #root and the route suspended to nothing: a
  product page readable for 8 s turned into the header over a blank body until
  its code landed. The pre-built page now stays until then.
*/
const Pending = lazy(() => new Promise<never>(() => {}));
const prebuilt = () => {
  document.body.innerHTML =
    '<div id="root"><div>toasts</div><header>Pre-built header</header>' +
    '<div class="page"><h1>Prism Rivière Bracelet</h1><img src="prism.jpg" alt=""></div></div>';
  return document.getElementById("root")!;
};
/* As App.tsx: the routes' fallback deep inside, and the drop in the outermost
   component, outside the error boundary, after the first commit. */
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError = () => ({ failed: true });
  render = () => (this.state.failed ? <h1>This page didn’t load</h1> : this.props.children);
}
const Outer = ({ children }: { children: ReactNode }) => {
  useLayoutEffect(dropPrebuiltPage, []);
  return <Boundary>{children}</Boundary>;
};
const App = () => (
  <Outer>
    <header>Live header</header>
    <Suspense fallback={<PrebuiltPage />}>
      <Pending />
    </Suspense>
  </Outer>
);

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.documentElement.removeAttribute(FALLBACK_ATTR);
});

describe("the pre-built page while its code is still on the way", () => {
  it("stays on screen, the same nodes, under the live header", () => {
    const container = prebuilt();
    const photo = container.querySelector("img");
    keepPrebuiltPage(container);
    act(() => {
      root = createRoot(container);
      root.render(<App />);
    });
    expect(container.querySelector("h1")?.textContent).toBe("Prism Rivière Bracelet");
    expect(container.querySelector("img")).toBe(photo);
    expect([...container.querySelectorAll("header")].map((h) => h.textContent)).toEqual(["Live header"]);
  });

  it("is used once: a later wait shows nothing, as before", () => {
    const container = prebuilt();
    keepPrebuiltPage(container);
    act(() => {
      root = createRoot(container);
      root.render(<App />);
    });
    const other = document.createElement("div");
    const second = createRoot(other);
    act(() => second.render(<App />));
    expect(other.querySelector("h1")).toBeNull();
    act(() => second.unmount());
  });

  it("never keeps the homepage standing in for another address", () => {
    const container = prebuilt();
    document.documentElement.setAttribute(FALLBACK_ATTR, "piece");
    keepPrebuiltPage(container);
    act(() => {
      root = createRoot(container);
      root.render(<App />);
    });
    expect(container.querySelector("h1")).toBeNull();
  });
});

/*
  main.tsx keeps the page when its 8 s start wins, but render() only schedules
  React's first render. When the page's code landed in between, lazyRoute drew
  the page at once and the fallback never mounted; when that render failed, the
  panel showed instead. Either way the page stayed kept, and the NEXT route that
  waited for its code showed the old pre-built product page under the live
  header (reproduced by review).
*/
describe("the pre-built page after a first commit that did not use it", () => {
  it("is not shown later under another page when the page's code beat the first render", async () => {
    const container = prebuilt();
    let resolvePdp!: (m: { default: () => JSX.Element }) => void;
    const Pdp = lazyRoute(() => new Promise((r) => { resolvePdp = r; }));
    const Grid = lazyRoute(() => new Promise<never>(() => {}));
    void Pdp.preload();
    keepPrebuiltPage(container); // the 8 s start won: the code was still on its way

    let go: (path: string) => void = () => {};
    const Routes = () => {
      const [path, setPath] = useState("/pdp");
      go = setPath;
      return path === "/pdp" ? <Pdp key="pdp" /> : <Grid key="grid" />;
    };
    root = createRoot(container);
    resolvePdp({ default: () => <h1>Live PDP</h1> }); // landed before React rendered
    await act(async () => { await Promise.resolve(); });
    await act(async () => {
      root!.render(
        <Outer>
          <header>Live header</header>
          <Suspense fallback={<PrebuiltPage />}><Routes /></Suspense>
        </Outer>,
      );
    });
    expect(container.querySelector("h1")?.textContent).toBe("Live PDP");

    // "Shop all": the grid's code is still downloading.
    await act(async () => go("/jewellery"));
    const headings = [...container.querySelectorAll("h1")].map((h) => h.textContent);
    expect(headings).not.toContain("Prism Rivière Bracelet");
  });

  it("is not shown after the first render failed to the error panel", () => {
    const container = prebuilt();
    keepPrebuiltPage(container);
    const Broken = () => { throw new Error("boom"); };
    vi.spyOn(console, "error").mockImplementation(() => {}); // React reports the caught render error
    act(() => {
      root = createRoot(container);
      root.render(<Outer><Broken /></Outer>);
    });
    expect(container.querySelector("h1")?.textContent).toBe("This page didn’t load");
    vi.restoreAllMocks();

    // Any later wait for a page's code, here in a fresh tree, shows nothing.
    const other = document.createElement("div");
    const second = createRoot(other);
    act(() => second.render(<App />));
    expect(other.querySelector("h1")).toBeNull();
    act(() => second.unmount());
  });

  it("is dropped by App.tsx's outermost component, outside the error boundary", () => {
    const app = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");
    const outer = app.slice(app.indexOf("const App = () =>"));
    expect(outer).toMatch(/useLayoutEffect\(dropPrebuiltPage, \[\]\)[\s\S]*<ChunkErrorBoundary>/);
  });
});
