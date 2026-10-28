// Card photo, colour cards and product-page opening photo for every piece: this morning's Storefront dump vs now.
//   BEFORE=<live-nodes.json> npx vite-node cards-compare.ts   (run from the site checkout)
import { readFileSync } from "node:fs";
import { fetchShopifyProducts } from "@/lib/shopify";
import { liveCatalogue } from "@/hooks/useLiveJewellery";
import { colourCards } from "@/lib/colourCards";
import { cardCover } from "@/lib/cardCover";
const file = (u?: string) => (u ?? "").split("?")[0].split("/").pop() ?? "";
const summarise = (nodes: any[]) => {
  const pieces = liveCatalogue(nodes);
  const out = new Map<string, string>();
  for (const c of colourCards(pieces)) out.set(`card ${c.handle}${c.colour ? "~" + c.colour.value : ""}`, file(cardCover(c)));
  for (const p of pieces) {
    out.set(`opens ${p.handle}`, file(p.gallery?.[0] ?? p.image));
    out.set(`size ${p.handle}`, file(p.sizeGuide));
    out.set(`count ${p.handle}`, String(p.gallery?.length ?? 0));
  }
  return out;
};
const before = summarise(JSON.parse(readFileSync(process.env.BEFORE!, "utf8")));
const after = summarise(await fetchShopifyProducts(250));
let same = 0;
for (const k of new Set([...before.keys(), ...after.keys()])) {
  if (before.get(k) === after.get(k)) { same++; continue; }
  console.log(`${k}: ${before.get(k) ?? "(none)"} -> ${after.get(k) ?? "(none)"}`);
}
console.log("unchanged", same);
