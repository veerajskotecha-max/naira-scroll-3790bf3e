import type { KeyboardEvent } from "react";

/* A row of buttons announced as role="radio" (the product page's metal, stone
   and size pickers) owes the keyboard what a radio group promises: one Tab
   stop for the group, on the chosen value, and the arrow keys to move along
   it. Each option was its own Tab stop and the arrows did nothing, while a
   screen reader said "radio 1 of 2". */

/** tabIndex for radio `index` when radio `checked` is chosen (-1: none yet, so the first). */
export const rovingTabIndex = (checked: number, index: number) => (index === Math.max(checked, 0) ? 0 : -1);

/** The radio an arrow, Home or End key moves to from `index`, or null for any other key. */
export const radioKeyTarget = (key: string, index: number, count: number): number | null => {
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (index + 1) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return (index - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
};

/** onKeyDown for the radiogroup: an arrow chooses the next value by clicking
    it, so it does exactly what a tap does, and moves focus there. */
export const onRadioGroupKeyDown = (e: KeyboardEvent<HTMLElement>) => {
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
  const index = radios.findIndex((radio) => radio.contains(e.target as Node));
  if (index < 0) return;
  const next = radioKeyTarget(e.key, index, radios.length);
  if (next === null) return;
  e.preventDefault();
  radios[next].click();
  radios[next].focus();
};
