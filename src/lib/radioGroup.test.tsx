import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { onRadioGroupKeyDown, radioKeyTarget, rovingTabIndex } from "./radioGroup";

afterEach(cleanup);

/* The product page's metal picker, as JewelDetailNext renders it. */
const Picker = ({ initial }: { initial?: string }) => {
  const values = ["Gold", "Silver", "Rose"];
  const [chosen, setChosen] = useState(initial);
  return (
    <div role="radiogroup" aria-label="Metal" onKeyDown={onRadioGroupKeyDown}>
      {values.map((value, i) => (
        <button key={value} type="button" role="radio" aria-checked={chosen === value}
          tabIndex={rovingTabIndex(values.indexOf(chosen ?? ""), i)} onClick={() => setChosen(value)}>
          {value}
        </button>
      ))}
    </div>
  );
};
const radio = (name: string) => screen.getByRole("radio", { name });
const tabStops = () => screen.getAllByRole("radio").filter((r) => r.tabIndex === 0).map((r) => r.textContent);

/* Every metal and size was its own Tab stop and the arrows did nothing,
   though each was announced "radio 1 of 2". */
describe("variant radio groups", () => {
  it("are one Tab stop, on the chosen value (or the first before a choice)", () => {
    render(<Picker initial="Silver" />);
    expect(tabStops()).toEqual(["Silver"]);
    cleanup();
    render(<Picker />);
    expect(tabStops()).toEqual(["Gold"]);
  });

  it("choose and focus the next value with the arrows, wrapping, as a tap would", () => {
    render(<Picker initial="Gold" />);
    radio("Gold").focus();
    fireEvent.keyDown(radio("Gold"), { key: "ArrowRight" });
    expect(radio("Silver")).toHaveAttribute("aria-checked", "true");
    expect(document.activeElement).toBe(radio("Silver"));
    expect(tabStops()).toEqual(["Silver"]);
    fireEvent.keyDown(radio("Silver"), { key: "ArrowLeft" });
    fireEvent.keyDown(radio("Gold"), { key: "ArrowLeft" });
    expect(radio("Rose")).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(radio("Rose"), { key: "Home" });
    expect(document.activeElement).toBe(radio("Gold"));
  });

  it("leave other keys alone", () => {
    expect(radioKeyTarget("Tab", 0, 3)).toBeNull();
    expect(radioKeyTarget("ArrowDown", 2, 3)).toBe(0);
    expect(radioKeyTarget("End", 0, 3)).toBe(2);
  });
});
