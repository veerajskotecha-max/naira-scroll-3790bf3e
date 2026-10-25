/**
 * Downloads every generated frame in results.json to a local folder,
 * named <sku>--<handle>--<shot>.png so it sorts by SKU.
 *
 *   bunx tsx scripts/higgsfield/download.ts [outDir]
 *
 * Default outDir is ./gilded-hour-shots (gitignored — 66 × ~5MB).
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(process.argv[2] ?? join(HERE, "../../gilded-hour-shots"));

interface Entry {
  sku: string;
  name: string;
  category: string;
  shots: Record<string, { plate: string; url: string }>;
}

const raw: Record<string, unknown> = JSON.parse(
  await Bun.file?.(join(HERE, "results.json")).text?.() ??
    (await import("node:fs")).readFileSync(join(HERE, "results.json"), "utf8"),
);

const results = Object.entries(raw).filter(
  ([key]) => !key.startsWith("_"),
) as [string, Entry][];

mkdirSync(OUT, { recursive: true });

let done = 0;
let skipped = 0;

for (const [handle, entry] of results) {
  for (const [shot, { url }] of Object.entries(entry.shots)) {
    const file = join(OUT, `${entry.sku}--${handle}--${shot}.png`);

    if (existsSync(file)) {
      skipped++;
      continue;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  FAILED ${entry.sku} ${shot} — HTTP ${response.status}`);
      continue;
    }

    writeFileSync(file, Buffer.from(await response.arrayBuffer()));
    done++;
    console.log(`  ${entry.sku.padEnd(14)} ${shot}`);
  }
}

console.log(`\n${done} downloaded, ${skipped} already present → ${OUT}`);
