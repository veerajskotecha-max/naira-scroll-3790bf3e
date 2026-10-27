import { readFileSync } from "node:fs";
import { liveCatalogue } from "@/hooks/useLiveJewellery";
import { completeTheLook, sharedLine, isPreorder, kindOf, matchScore } from "@/lib/pairings";
const cat = liveCatalogue(JSON.parse(readFileSync(process.env.NODES!, "utf8")));
const oneTap = (p: any) => p.availableForSale !== false && p.variantId && p.image && !isPreorder(p);
let n = 0;
for (const p of cat) {
  const look = completeTheLook(p, cat, 3);
  const setCats = new Set(look.filter((x) => sharedLine(p, x) === "set").map((x) => x.category));
  const partners = cat.filter((q) => q.handle !== p.handle && q.category !== p.category && sharedLine(p, q) === "set" && oneTap(q) && matchScore(p, q) > 0);
  const missCats = [...new Set(partners.filter((q) => !setCats.has(q.category)).map((q) => q.category))];
  if (!missCats.length) continue;
  n++;
  console.log(`${p.handle} [${kindOf(p)}] row: ${look.map((x) => `${x.handle}(${sharedLine(p, x) ?? "-"},${matchScore(p, x)})`).join("  ")}`);
  for (const c of missCats) console.log(`    missing ${c}: ${partners.filter((q) => q.category === c).map((q) => `${q.handle}(${matchScore(p, q)})`).join(", ")}`);
}
console.log("pieces with a set partner category missing:", n);
// pre-order / not-one-tap set partners (only linked in More like this or not at all)
