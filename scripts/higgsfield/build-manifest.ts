/**
 * Builds scripts/higgsfield/skus.json — the SKU manifest the Higgsfield
 * product-in-background pipeline runs against.
 *
 * Reads src/data/jewellery.ts and resolves every packshot back to its
 * public CDN url via the *.asset.json pointers, so each SKU carries a
 * plain https URL that Higgsfield's media_import_url can ingest.
 *
 *   bunx tsx scripts/higgsfield/build-manifest.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");

/** Public origin the Lovable asset store is served from. */
export const ASSET_ORIGIN = "https://nairaflore.com";

const SOURCE = join(ROOT, "src/data/jewellery.ts");

export interface SkuEntry {
  handle: string;
  name: string;
  category: string;
  sku: string;
  number: string;
  materials: string;
  /** Public https url of the primary packshot — the fidelity source. */
  packshot: string;
  /** Every angle we hold for this piece, primary first. */
  gallery: string[];
}

/** varName -> public https url, resolved through the .asset.json pointer. */
function readImportMap(src: string): Map<string, string> {
  const map = new Map<string, string>();
  const importRe = /import\s+(\w+)\s+from\s+"@\/(.+?\.asset\.json)"/g;

  for (const [, varName, relPath] of src.matchAll(importRe)) {
    const pointerPath = join(ROOT, "src", relPath);
    const pointer = JSON.parse(readFileSync(pointerPath, "utf8")) as {
      url: string;
    };
    map.set(varName, `${ASSET_ORIGIN}${pointer.url}`);
  }

  return map;
}

function field(block: string, key: string): string {
  const match = block.match(new RegExp(`\\b${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return match ? match[1] : "";
}

function buildManifest(): SkuEntry[] {
  const src = readFileSync(SOURCE, "utf8");
  const imports = readImportMap(src);

  const resolveVar = (varName: string): string => {
    const url = imports.get(varName);
    if (!url) throw new Error(`No asset import found for "${varName}"`);
    return url;
  };

  const entries: SkuEntry[] = [];

  // Each product literal runs from its `handle:` line to the next one.
  const blocks = src
    .slice(src.indexOf("export const jewellery"))
    .split(/\n\s*\{\s*\n/)
    .filter((block) => block.includes("handle:"));

  for (const block of blocks) {
    const imageVar = block.match(/\bimage:\s*(\w+)\.url/)?.[1];
    if (!imageVar) continue;

    const galleryVars = [
      ...(block.match(/\bgallery:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(
        /(\w+)\.url/g,
      ),
    ].map(([, varName]) => varName);

    const gallery = [imageVar, ...galleryVars]
      .map(resolveVar)
      .filter((url, i, all) => all.indexOf(url) === i);

    entries.push({
      handle: field(block, "handle"),
      name: field(block, "name"),
      category: field(block, "category"),
      sku: field(block, "sku"),
      number: field(block, "number"),
      materials: field(block, "materials"),
      packshot: resolveVar(imageVar),
      gallery,
    });
  }

  return entries;
}

const manifest = buildManifest();

if (manifest.length === 0) {
  throw new Error("Parsed 0 SKUs from src/data/jewellery.ts — check the parser");
}

const outPath = join(HERE, "skus.json");
mkdirSync(HERE, { recursive: true });
writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Wrote ${manifest.length} SKUs → ${outPath}`);
for (const entry of manifest) {
  console.log(`  ${entry.sku.padEnd(14)} ${entry.category.padEnd(10)} ${entry.name}`);
}
