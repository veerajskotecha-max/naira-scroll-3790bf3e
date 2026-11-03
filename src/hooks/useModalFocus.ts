import { useEffect, useRef, type RefObject } from "react";

/*
  Dialog keyboard behaviour for an overlay built by hand rather than on Radix
  (the phone menu slides on a CSS transition and stays mounted; search mounts
  on demand): while `open`, focus moves inside, Tab and Shift+Tab go round
  inside it, Escape calls `onClose`, and closing gives focus back to whatever
  had it when the overlay opened.

  Both used to declare aria-modal and do none of it: focus stayed on the
  button behind the menu, Tab walked out into the page (9 of 15 stops behind
  the search), Escape left the menu open, and closing dropped focus on <body>.
*/
const CANDIDATES = "a[href], button, input, select, textarea, [tabindex]";

const focusables = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(CANDIDATES)).filter(
    (el) => el.tabIndex >= 0 && !el.hasAttribute("disabled") && !el.closest("[inert]"),
  );

export function useModalFocus(
  ref: RefObject<HTMLElement>,
  open: boolean,
  onClose: () => void,
  /** false when the overlay focuses its own field (search does, after it paints). */
  { moveFocus = true }: { moveFocus?: boolean } = {},
) {
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    const opener = active instanceof HTMLElement && active !== document.body ? active : null;
    /* A panel that slides in is still visibility: hidden on the first frame
       of its transition, and a hidden element refuses focus: try again on the
       next frames until it takes. */
    let frame = 0;
    const focusIn = (tries: number) => {
      const root = ref.current;
      if (!root || root.contains(document.activeElement)) return;
      focusables(root)[0]?.focus({ preventScroll: true });
      if (!root.contains(document.activeElement) && tries > 0) frame = requestAnimationFrame(() => focusIn(tries - 1));
    };
    if (moveFocus) focusIn(10);

    const onKey = (e: KeyboardEvent) => {
      const panel = ref.current;
      if (!panel) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables(panel);
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (!panel.contains(current)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, ref, moveFocus]);
}
