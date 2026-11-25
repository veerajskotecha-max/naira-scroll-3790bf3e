import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

/* The product page's look (src/components/clean): one hairline field with its
   action inside, and the same words as plain lines. No map pin, no ticks, no
   green, amber or red. The default look above is the outfit page's, unchanged. */
describe('PincodeChecker look="clean"', () => {
  beforeEach(() => localStorage.clear());

  it("says the same words for a piece in stock, with no icons or colours of its own", () => {
    const { container } = render(<PincodeChecker look="clean" />);
    expect(screen.getByLabelText("Pincode")).toBe(screen.getByPlaceholderText("Enter pincode"));
    check("400001");
    expect(screen.getByText(/Delivery to/).textContent).toMatch(/^Delivery to 400001 in 3 working days · by /);
    expect(screen.getByText("Cash on delivery available. UPI, cards, wallets and net banking too.")).toBeTruthy();
    expect(container.querySelectorAll("svg")).toHaveLength(0);
    expect(container.innerHTML).not.toMatch(/hsl\(|style=/);
    expect(container.querySelector(".nc-field input")).toBeTruthy();
    expect(container.querySelector(".nc-field button")?.textContent).toBe("Check");
    // No "Delivery" label row: the dropdown it sits in names it.
    expect(screen.queryByText("Delivery")).toBeNull();
  });

  it("gives a reserved piece the courier's days, not a date", () => {
    render(<PincodeChecker look="clean" preorder />);
    check("400001");
    const line = screen.getByText(/Delivery to/).textContent ?? "";
    expect(line).toMatch(/400001 in 3 working days once it ships$/);
    expect(line).not.toMatch(/ by /);
  });

  it("leaves a pincode it cannot vouch for to checkout, with no date or COD", () => {
    render(<PincodeChecker look="clean" />);
    check("999999");
    expect(screen.queryByText(/Delivery to/)).toBeNull();
    expect(screen.queryByText(/Cash on Delivery available/)).toBeNull();
    expect(screen.getByText("We can't confirm delivery to 999999 here. It is checked with your full address at checkout, before you pay.")).toBeTruthy();
  });

  it("asks again for a pincode that is not six digits, as one alert", () => {
    const { container } = render(<PincodeChecker look="clean" />);
    check("12345");
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0].textContent).toBe("Enter a valid 6-digit pincode.");
    expect(container.querySelectorAll("svg")).toHaveLength(0);
  });

  it("checks on Enter, the phone keyboard's Go", () => {
    render(<PincodeChecker look="clean" />);
    const input = screen.getByPlaceholderText("Enter pincode");
    fireEvent.change(input, { target: { value: "400001" } });
    fireEvent.submit(input.closest("form")!);
    expect(screen.getByText(/Delivery to/)).toBeTruthy();
  });

  it("remembers the pincode like the default look does", () => {
    localStorage.setItem("naira-pincode", "400001");
    render(<PincodeChecker look="clean" />);
    expect((screen.getByPlaceholderText("Enter pincode") as HTMLInputElement).value).toBe("400001");
    expect(screen.getByText(/Delivery to/)).toBeTruthy();
  });

  /* Where cash on delivery is refused (Patna, 800001) the line gave the
     list's own reason, "high return rate on COD in this region": it told a
     shopper her area was a bad risk. It now says what she can do instead. */
  it("refuses cash on delivery without giving a reason, and says how one can pay", () => {
    const { container } = render(<PincodeChecker look="clean" />);
    check("800001");
    expect(screen.getByText(/Delivery to/)).toBeTruthy();
    expect(screen.getByText("Cash on delivery is not available for this pincode. You can pay by UPI, card, wallet or net banking.")).toBeTruthy();
    expect(container.textContent).not.toMatch(/return rate|region|risk|Prepaid only/i);
  });

  it("tells the page each answer: the pincode it can vouch for, or nothing", () => {
    const onChecked = vi.fn();
    render(<PincodeChecker look="clean" onChecked={onChecked} />);
    check("400001");
    expect(onChecked).toHaveBeenLastCalledWith("400001");
    check("999999");
    expect(onChecked).toHaveBeenLastCalledWith(null);
    /* A pincode that is not six digits is no answer at all. */
    onChecked.mockClear();
    check("12345");
    expect(onChecked).not.toHaveBeenCalled();
  });
});

/* The outfit page's look keeps its own words: nothing here changed for it. */
describe("PincodeChecker, the default look", () => {
  beforeEach(() => localStorage.clear());

  it("still says cash on delivery as it always has", () => {
    render(<PincodeChecker />);
    check("400001");
    expect(document.body.textContent).toMatch(/Cash on Delivery/);
  });
});
