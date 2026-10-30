import { act } from "@testing-library/react";
import { lazy, Suspense } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { FALLBACK_ATTR } from "./fallbackGuard";
import { keepPrebuiltPage, PrebuiltPage } from "./prebuiltPage";

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
const App = () => (
  <>
    <header>Live header</header>
    <Suspense fallback={<PrebuiltPage />}>
      <Pending />
    </Suspense>
  </>
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
