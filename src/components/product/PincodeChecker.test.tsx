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
});
