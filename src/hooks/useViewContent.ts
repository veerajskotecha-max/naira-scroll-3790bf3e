import { useEffect, useRef } from "react";
import type { JewelPiece } from "@/data/jewellery";
import { trackPixel } from "@/lib/pixel";
import { viewContentParams } from "@/lib/viewContent";

/** The longest a product view waits for Shopify's own colours and sizes. */
export const VIEW_WAIT_MS = 3000;

/**
 * The product page's ViewContent, once per piece, naming the variant the page
 * opens on (viewContentParams).
 *
 * The page draws first from the copy of the piece bundled with the site, and
 * Star Point Band's has no colours or sizes. Its Silver catalogue ad
 * (?variant=50652105605282) and Silver card link (?colour=silver) opened on
 * Silver / US 6 once Shopify answered, and the Add to cart carried Silver,
 * but the view had already gone out naming Gold / US 6 (47501788774562).
 *
 * So when the piece as drawn cannot place the colour or variant its link names
 * (`placed`, see linkPlaced), the view waits until Shopify has answered
 * (`settled`), at most VIEW_WAIT_MS, and goes out at once if the shopper leaves
 * the page, hides it or moves to another piece first. Every other link sends
 * it at first paint, as before.
 *
 * Its server copy names the page the view was drawn on. It read the address
 * bar at send time, so a shopper who tapped through to another page of the
 * shop during the wait had Star Point Band's view reported on Woven Gold
 * Hoops' page (checker, built site, Shopify held).
 */
export const useViewContent = (
  piece: JewelPiece | null | undefined,
  colourParam: string | null,
  placed: boolean,
  settled: boolean,
) => {
  const ready = placed || settled;
  const now = useRef({ piece, colourParam, ready });
  now.current = { piece, colourParam, ready };
  const sent = useRef<string | null>(null);
  /* The address the piece was first drawn at; Shopify answering re-runs the
     effect below, and must not move it. */
  const drawnAt = useRef<{ handle: string; pageUrl: string } | null>(null);
  const handle = piece?.handle;

  useEffect(() => {
    if (!handle || sent.current === handle) return;
    const drawn = now.current;
    if (drawnAt.current?.handle !== handle) drawnAt.current = { handle, pageUrl: window.location.href };
    const { pageUrl } = drawnAt.current;
    const send = () => {
      if (sent.current === handle) return;
      sent.current = handle;
      const latest = now.current.piece?.handle === handle ? now.current : drawn;
      if (latest.piece) trackPixel("ViewContent", viewContentParams(latest.piece, latest.colourParam), { pageUrl });
    };
    if (ready) {
      send();
      return;
    }
    const timer = window.setTimeout(send, VIEW_WAIT_MS);
    const onHidden = () => {
      if (document.visibilityState === "hidden") send();
    };
    window.addEventListener("pagehide", send);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", send);
      document.removeEventListener("visibilitychange", onHidden);
      /* Shopify answering re-runs this for the same piece, which then sends.
         Leaving for another piece or page before that still counts the view. */
      if (!(now.current.piece?.handle === handle && now.current.ready)) send();
    };
  }, [handle, ready]);
};
