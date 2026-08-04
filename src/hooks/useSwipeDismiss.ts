import { useEffect, type RefObject } from "react";

/**
 * Dismiss a right-anchored drawer with a rightward swipe on touch devices.
 * Horizontal intent must clearly beat vertical drift so list scrolling
 * inside the drawer is never hijacked.
 */
export function useSwipeDismiss(
  ref: RefObject<HTMLElement>,
  enabled: boolean,
  onDismiss: () => void,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (dx > 72 && Math.abs(dx) > Math.abs(dy) * 1.4) onDismiss();
    };

    const onTouchCancel = () => {
      tracking = false;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [ref, enabled, onDismiss]);
}
