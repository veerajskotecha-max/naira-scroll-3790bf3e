import { fetchShopifyProducts } from "@/lib/shopify";
import { liveCatalogue } from "@/hooks/useLiveJewellery";
import { colourCards, colourOption } from "@/lib/colourCards";
import { cardCover } from "@/lib/cardCover";
const nodes = await fetchShopifyProducts(250);
const pieces = liveCatalogue(nodes);
const cards = colourCards(pieces);
const file = (u: string) => u.split("?")[0].split("/").pop();
console.log("storefront nodes", nodes.length, "catalogue", pieces.length, "cards", cards.length);
const seen = new Map<string, string[]>();
for (const c of cards) {
  const img = file(cardCover(c))!;
  seen.set(img, [...(seen.get(img) ?? []), `${c.handle}${c.colour ? "~" + c.colour.value : ""}`]);
}
for (const [img, labels] of seen) if (labels.length > 1) console.log("DUP", img, "=>", labels.join(" | "));
// per colour: which photo the card shows, and the variant images of that colour
for (const p of pieces) {
  const o = colourOption(p);
  if (!o || !p.variants?.length) continue;
  const row = o.values.map((v: string) => {
    const imgs = [...new Set(p.variants!.filter((w) => w.options[o.name] === v).map((w) => file(w.image ?? "") || "-"))];
    return `${v}: ${imgs.join(",")}`;
  });
  console.log("COLOUR", p.handle, "|", row.join("  ||  "));
}
require("fs").writeFileSync(process.env.OUT!, JSON.stringify(nodes));
