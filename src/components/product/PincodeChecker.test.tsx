import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import PincodeChecker from "./PincodeChecker";

/* A reserved piece got "Delivery to 400001 in 3 working days · by Wed, 4 Nov"
   under a button that said Reserve now. */
const check = (pin: string) => {
  fireEvent.change(screen.getByPlaceholderText("Enter pincode"), { target: { value: pin } });
  fireEvent.click(screen.getByRole("button", { name: "Check" }));
};

describe("PincodeChecker", () => {
  beforeEach(() => localStorage.clear());

  it("dates delivery for a piece in stock", () => {
    render(<PincodeChecker />);
    check("400001");
    expect(screen.getByText(/Delivery to/).textContent).toMatch(/400001 in 3 working days · by /);
  });

  it("gives a reserved piece the courier's days, not a date", () => {
    render(<PincodeChecker preorder />);
    check("400001");
    const line = screen.getByText(/Delivery to/).textContent ?? "";
    expect(line).toMatch(/400001 in 3 working days once it ships/);
    expect(line).not.toMatch(/ by /);
  });

  // 999999 was promised a date and Cash on Delivery.
  it("leaves a pincode it cannot vouch for to checkout, with no date or COD", () => {
    render(<PincodeChecker />);
    check("999999");
    expect(screen.queryByText(/Delivery to/)).toBeNull();
    expect(screen.queryByText(/Cash on Delivery available/)).toBeNull();
    expect(screen.getByText(/checked with your full address at checkout/)).toBeTruthy();
  });

  it("still asks again for a pincode that is not six digits", () => {
    render(<PincodeChecker />);
    check("12345");
    expect(screen.getByText("Enter a valid 6-digit pincode.")).toBeTruthy();
  });
});
