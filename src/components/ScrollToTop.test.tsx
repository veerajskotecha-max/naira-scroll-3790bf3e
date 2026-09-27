import { act, render } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ScrollToTop from "./ScrollToTop";

let go: (to: string) => void = () => {};
const Nav = () => {
  const navigate = useNavigate();
  go = (to) => navigate(to);
  return null;
};

describe("ScrollToTop", () => {
  afterEach(() => vi.restoreAllMocks());

  it("leaves the first page where the shopper has scrolled it", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={["/jewellery/prism-riviere-bracelet"]}>
        <ScrollToTop />
        <Nav />
      </MemoryRouter>,
    );
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("still starts a newly opened page at the top", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={["/jewellery"]}>
        <ScrollToTop />
        <Nav />
      </MemoryRouter>,
    );
    act(() => go("/jewellery/prism-riviere-bracelet"));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
