import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import JsonLd from "./JsonLd";

const products = (container: HTMLElement) =>
  [...container.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent || ""));

describe("JsonLd", () => {
  it("keeps exactly one block, updated in place when the price changes", () => {
    const { container, rerender } = render(<JsonLd data={{ "@type": "Product", offers: { price: 2949 } }} />);
    rerender(<JsonLd data={{ "@type": "Product", offers: { price: 1300 } }} />);
    expect(products(container)).toEqual([{ "@type": "Product", offers: { price: 1300 } }]);
  });

  it("cannot be closed early by text inside it", () => {
    const { container } = render(<JsonLd data={{ description: "</script><b>x</b>" }} />);
    expect(container.innerHTML).not.toContain("</script><b>");
    expect(products(container)[0].description).toBe("</script><b>x</b>");
  });
});
