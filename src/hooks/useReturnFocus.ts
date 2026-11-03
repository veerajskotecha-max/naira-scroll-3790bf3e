import { useRef } from "react";

/*
  Gives focus back to whatever had it when a Radix dialog opened.

  Radix's modal Dialog returns focus to its Dialog.Trigger on close, and none
  of the site's overlays has one: the bag, the wishlist, the photo viewer and
  the ring size chart are opened by plain buttons through state. So focus fell
  to <body>, and a keyboard or screen-reader user closing the bag or a photo
  was thrown back to the top of the page, far from the Add button or gallery
  they came from.

  Spread the result onto the dialog's Content. An opener that has gone (the
  dialog closed by leaving the page) is left alone.
*/
type AutoFocusHandler = (event: Event) => void;

export function useReturnFocus({
  onOpenAutoFocus,
  onCloseAutoFocus,
}: { onOpenAutoFocus?: AutoFocusHandler; onCloseAutoFocus?: AutoFocusHandler } = {}) {
  const opener = useRef<HTMLElement | null>(null);
  return {
    // Radix fires this as the dialog mounts, while the opener still has focus.
    onOpenAutoFocus: (event: Event) => {
      const active = document.activeElement;
      opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
      onOpenAutoFocus?.(event);
    },
    onCloseAutoFocus: (event: Event) => {
      onCloseAutoFocus?.(event);
      const el = opener.current;
      opener.current = null;
      if (event.defaultPrevented || !el?.isConnected) return;
      // Preventing it skips Radix's own return to a trigger that is not there.
      event.preventDefault();
      el.focus({ preventScroll: true });
    },
  };
}
