import { useCallback, useEffect, useRef, type MouseEvent, type RefObject } from "react";

/*
  Keeps a keyboard user's place in the bag's list.

  A quantity button is disabled while Shopify answers, and a browser takes
  focus away from a control the moment it is disabled: after one press of "+"
  the next Tab started again from the close button, however far down the bag
  the line was. This hands focus back to the same control, on the same line,
  when the bag stops being busy.

  Only for a press from the keyboard (a click with no pointer behind it), only
  when focus was really dropped (it sits on the page or on the sheet itself,
  not on something the shopper has moved to since), and only if the line is
  still in the bag: after a Remove there is nothing to return to, and the
  next line's buttons are never focused in its place.
*/
export function useKeptFocus(list: RefObject<HTMLElement>, busy: boolean) {
  const kept = useRef<{ line: HTMLElement; index: number } | null>(null);

  /* On the list, in the capture phase: the press is noted before it is acted on. */
  const note = useCallback((event: MouseEvent<HTMLElement>) => {
    const button = (event.target as Element | null)?.closest?.("button") ?? null;
    const line = button?.closest<HTMLElement>("[data-line]") ?? null;
    kept.current = event.detail === 0 && button && line ? { line, index: Array.from(line.querySelectorAll("button")).indexOf(button) } : null;
  }, []);

  useEffect(() => {
    if (busy) return;
    const want = kept.current;
    kept.current = null;
    if (!want || !list.current?.contains(want.line)) return;
    const active = document.activeElement;
    const dropped = !active || active === document.body || active.getAttribute("role") === "dialog";
    if (!dropped) return;
    const button = want.line.querySelectorAll("button")[want.index];
    if (button && !button.disabled) button.focus();
  }, [busy, list]);

  return note;
}
