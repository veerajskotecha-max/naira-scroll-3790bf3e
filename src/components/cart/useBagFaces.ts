import { useEffect } from "react";

/*
  Asks for the bag's three weights of Jost as soon as the bag's code arrives,
  which is after the page's own and long before a first tap.

  The bag's heading is Jost 300, and a listing page draws nothing in that
  weight, so the browser fetched it only when the bag first opened: the
  heading began in the stand-in face and changed under the shopper's eye
  (156ms on a fast line, as long as the font takes on a slow one). Asked for
  ahead, all three are there when the sheet slides in.

  The faces are the ones index.html already lists; nothing new is loaded,
  only sooner. That stylesheet is switched on by main.tsx once the page's
  code is in: if it is not applied yet, the request is made again when it is.
*/
const WEIGHTS = [300, 400, 500];

export function useBagFaces() {
  useEffect(() => {
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    if (!fonts || typeof fonts.load !== "function") return;
    const ask = () => {
      for (const weight of WEIGHTS) {
        try {
          void fonts.load(`${weight} 14px "Jost"`).catch(() => undefined);
        } catch {
          /* a face that cannot be asked for is drawn in the stand-in, as before */
        }
      }
    };
    ask();
    const sheet = document.getElementById("nf-fonts");
    sheet?.addEventListener("load", ask);
    return () => sheet?.removeEventListener("load", ask);
  }, []);
}
