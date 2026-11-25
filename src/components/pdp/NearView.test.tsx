import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import NearView from "./NearView";

/*
  NearView holds a part back until the screen is near it, so the product
  page's lower sections do not load beside its first photograph.
*/
type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;
const observers: Array<{ callback: Callback; options?: IntersectionObserverInit; observed: Element[]; disconnected: boolean }> = [];
class FakeObserver {
  record: (typeof observers)[number];
  constructor(callback: Callback, options?: IntersectionObserverInit) {
    this.record = { callback, options, observed: [], disconnected: false };
    observers.push(this.record);
  }
  observe(el: Element) {
    this.record.observed.push(el);
  }
  disconnect() {
    this.record.disconnected = true;
  }
  unobserve() {}
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  observers.length = 0;
});

describe("NearView", () => {
  it("keeps its room and draws nothing until the screen is near", () => {
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    const { container } = render(
      <NearView minHeight={520} className="rn-reveal" slot="reviews">
        <p>Reviews</p>
      </NearView>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(screen.queryByText("Reviews")).toBeNull();
    expect(wrapper.style.minHeight).toBe("520px");
    expect(wrapper.className).toBe("rn-reveal");
    expect(wrapper.getAttribute("data-slot")).toBe("reviews");
    /* It watches its own wrapper, starting well ahead of the screen's edge. */
    expect(observers).toHaveLength(1);
    expect(observers[0].observed).toEqual([wrapper]);
    expect(observers[0].options?.rootMargin).toBe("700px 0px 700px 0px");
  });

  it("draws its children once near, gives the room back and stops watching", () => {
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    const { container } = render(
      <NearView minHeight={520}>
        <p>Reviews</p>
      </NearView>,
    );
    act(() => observers[0].callback([{ isIntersecting: false }]));
    expect(screen.queryByText("Reviews")).toBeNull();
    act(() => observers[0].callback([{ isIntersecting: true }]));
    expect(screen.getByText("Reviews")).toBeTruthy();
    expect((container.firstElementChild as HTMLElement).style.minHeight).toBe("");
    expect(observers[0].disconnected).toBe(true);
  });

  it("draws at once for the pre-built page's capture, so every word is in the HTML", () => {
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    vi.stubGlobal("navigator", { ...navigator, webdriver: true });
    render(
      <NearView minHeight={520}>
        <p>Reviews</p>
      </NearView>,
    );
    expect(screen.getByText("Reviews")).toBeTruthy();
    expect(observers).toHaveLength(0);
  });

  it("draws at once in a browser that cannot watch for it", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(
      <NearView minHeight={520}>
        <p>Reviews</p>
      </NearView>,
    );
    expect(screen.getByText("Reviews")).toBeTruthy();
  });
});
