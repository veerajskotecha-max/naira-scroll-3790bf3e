import { readFileSync, writeFileSync } from "node:fs";
import { liveCatalogue } from "@/hooks/useLiveJewellery";
import { completeTheLook, moreLikeThis, linesOf, sharedLine, kindOf } from "@/lib/pairings";
import { JEWELLERY_HANDLES } from "@/data/jewelleryHandles";
const nodes = JSON.parse(readFileSync(process.env.NODES!, "utf8"));
const cat = liveCatalogue(nodes);
const byHandle = new Map(cat.map((p) => [p.handle, p]));
const problems: string[] = [];
const rows: any[] = [];
for (const p of cat) {
  const look = completeTheLook(p, cat, 3);
  const like = moreLikeThis(p, cat, 8);
  for (const [label, row] of [["look", look], ["like", like]] as const) {
    const hs = row.map((x) => x.handle);
    if (hs.includes(p.handle)) problems.push(`${p.handle}: ${label} links to itself`);
    if (new Set(hs).size !== hs.length) problems.push(`${p.handle}: ${label} repeats a piece ${hs.join(",")}`);
    for (const h of hs) if (!byHandle.has(h)) problems.push(`${p.handle}: ${label} -> ${h} not live`);
  }
  if (!look.length) problems.push(`${p.handle}: no Complete-the-look row`);
  if (like.length < 3) problems.push(`${p.handle}: only ${like.length} in More like this`);
  // set partners in other categories that are missing from the look row
  const partners = cat.filter((q) => q.handle !== p.handle && q.category !== p.category && sharedLine(p, q) === "set" && q.availableForSale !== false);
  const missing = partners.filter((q) => !look.some((x) => x.handle === q.handle));
  if (partners.length && missing.length && look.filter((x) => sharedLine(p, x) === "set").length < Math.min(3, partners.length))
    problems.push(`${p.handle}: set partners not shown first: ${missing.map((q) => q.handle).join(",")}`);
  rows.push({ handle: p.handle, name: p.name, cat: p.category, inSnapshot: JEWELLERY_HANDLES.has(p.handle), lines: linesOf(p).map(([l, s]) => `${l}:${s}`), look: look.map((x) => `${x.handle}${sharedLine(p, x) ? "[" + sharedLine(p, x) + "]" : ""}`), like: like.map((x) => x.handle) });
}
writeFileSync(process.env.OUT!, JSON.stringify(rows, null, 1));
console.log("pieces", cat.length, "problems", problems.length);
for (const x of problems) console.log("  -", x);
const fresh = rows.filter((r) => !r.inSnapshot);
console.log("\nNOT IN FIRST-PAINT LIST:", fresh.length);
for (const r of fresh) console.log(` ${r.handle} (${r.cat}) lines=${r.lines.join(" ")}\n    look: ${r.look.join(", ")}\n    like: ${r.like.join(", ")}`);
