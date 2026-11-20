/**
 * Expands the SKU manifest into the full shot list — three frames per SKU,
 * each with its finished prompt and the plate it composites onto.
 *
 *   bunx tsx scripts/higgsfield/build-jobs.ts
 *
 * Writes scripts/higgsfield/jobs.json. Feed it to Higgsfield in batches of
 * 12 via generate_image_batch, passing medias in this order:
 *   [0] the SKU's packshot media_id  → IMAGE 1 (frozen)
 *   [1] the plate's job_id           → IMAGE 2 (the set)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ASPECT_RATIO,
  MODEL,
  RESOLUTION,
  WORN_PLATE,
  buildPrompt,
  type Category,
  type PlateId,
  type Shot,
} from "./prompt.js";

const HERE = dirname(fileURLToPath(import.meta.url));

interface SkuEntry {
  handle: string;
  name: string;
  category: Category;
  sku: string;
  number: string;
  materials: string;
  packshot: string;
}

interface Plate {
  name: string;
  job_id: string;
  url: string;
}

const skus: SkuEntry[] = JSON.parse(
  readFileSync(join(HERE, "skus.json"), "utf8"),
);
const plates: Record<string, Plate> = JSON.parse(
  readFileSync(join(HERE, "plates.json"), "utf8"),
);

const SHOTS: Shot[] = ["ecom", "worn", "angle"];

export interface Job {
  index: number;
  id: string;
  sku: string;
  handle: string;
  name: string;
  category: Category;
  shot: Shot;
  plate: PlateId;
  plate_job_id: string;
  packshot: string;
  model: string;
  aspect_ratio: string;
  resolution: string;
  prompt: string;
}

const jobs: Job[] = [];
let index = 1;

for (const sku of skus) {
  for (const shot of SHOTS) {
    const plate: PlateId = shot === "worn" ? WORN_PLATE[sku.category] : "ecom";

    jobs.push({
      index: index++,
      id: `${sku.handle}--${shot}`,
      sku: sku.sku,
      handle: sku.handle,
      name: sku.name,
      category: sku.category,
      shot,
      plate,
      plate_job_id: plates[plate].job_id,
      packshot: sku.packshot,
      model: MODEL,
      aspect_ratio: ASPECT_RATIO,
      resolution: RESOLUTION,
      prompt: buildPrompt({
        name: sku.name,
        sku: sku.sku,
        category: sku.category,
        materials: sku.materials,
        shot,
      }),
    });
  }
}

writeFileSync(join(HERE, "jobs.json"), `${JSON.stringify(jobs, null, 2)}\n`);

const byCategory = jobs.reduce<Record<string, number>>((acc, job) => {
  acc[job.category] = (acc[job.category] ?? 0) + 1;
  return acc;
}, {});

console.log(`Wrote ${jobs.length} jobs for ${skus.length} SKUs → jobs.json`);
console.log(`  ${SHOTS.length} shots each: ${SHOTS.join(", ")}`);
for (const [category, count] of Object.entries(byCategory)) {
  console.log(`  ${category.padEnd(10)} ${count} frames`);
}
