/**
 * Microsoft Clarity — Data Export API pull.
 *
 * Fetches aggregate friction metrics (dead clicks, rage clicks, quick backs,
 * excessive scrolling, script errors, traffic, engagement) so they can be read
 * and acted on without opening the dashboard.
 *
 *   CLARITY_API_TOKEN=<token> npx tsx scripts/clarity-report.ts --days 3 --dimension URL
 *
 * The token comes from Clarity -> Settings -> Data export. Keep it in
 * `.env.local` (gitignored via `*.local`) or pass it inline — NEVER in `.env`,
 * which is tracked in this repo.
 *
 * What this cannot do: session recordings and heatmaps have no API. Screenshot
 * them, or have Clarity Copilot summarise them. See docs/measurement-playbook.md.
 *
 * The raw response is always written to disk before anything is interpreted, so a
 * wrong assumption about Clarity's field names costs a re-read of a file rather
 * than a wasted API call — the endpoint is rate limited to a handful of calls per
 * project per day and only looks back a few days, so a burnt call is a real cost.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENDPOINT = "https://www.clarity.ms/export-data/api/v1/project-live-insights";
const OUT_DIR = "clarity-reports";

/** Dimensions Clarity accepts. At most three per call. */
const DIMENSIONS = [
  "Browser",
  "Device",
  "Country/Region",
  "OS",
  "Source",
  "Medium",
  "Campaign",
  "Channel",
  "URL",
] as const;

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
};

const fail = (message: string): never => {
  console.error(`\n  ${message}\n`);
  process.exit(1);
};

const token = process.env.CLARITY_API_TOKEN?.trim();
if (!token) {
  fail(
    "CLARITY_API_TOKEN is not set.\n" +
      "  Generate one at Clarity -> Settings -> Data export, then:\n" +
      "    CLARITY_API_TOKEN=<token> npx tsx scripts/clarity-report.ts --days 3"
  );
}

// Clarity only serves the last few days; it rejects anything larger.
const days = Number(arg("days") ?? 3);
if (!Number.isInteger(days) || days < 1 || days > 3) {
  fail("--days must be 1, 2 or 3 (Clarity's export API does not look back further).");
}

const requested = process.argv
  .flatMap((a, i) => (a === "--dimension" ? [process.argv[i + 1]] : []))
  .filter(Boolean) as string[];

for (const d of requested) {
  if (!DIMENSIONS.includes(d as (typeof DIMENSIONS)[number])) {
    fail(`Unknown dimension "${d}".\n  Valid: ${DIMENSIONS.join(", ")}`);
  }
}
if (requested.length > 3) fail("Clarity accepts at most three dimensions per call.");

const params = new URLSearchParams({ numOfDays: String(days) });
requested.forEach((d, i) => params.set(`dimension${i + 1}`, d));

const url = `${ENDPOINT}?${params.toString()}`;
console.log(`\nClarity export — last ${days} day(s)${requested.length ? `, by ${requested.join(" / ")}` : ""}`);

const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
});

const raw = await response.text();

if (!response.ok) {
  /* Clarity answers a bad or expired token with 403 (verified against the live
     endpoint), not the 401 you would expect — so both map to the same advice.
     429 means the daily call budget is spent; retrying only burns tomorrow's, so
     say so rather than looping. */
  const hint =
    response.status === 401 || response.status === 403
      ? "The token was rejected or has expired — regenerate it at Clarity -> Settings -> Data export."
      : response.status === 429
        ? "Rate limited. Clarity allows only a few calls per project per day; try again tomorrow."
        : "Unexpected status — check Clarity's export API docs.";
  const body = raw.trim() ? `\n  ${raw.trim().slice(0, 400)}` : "";
  fail(`Clarity returned ${response.status}.\n  ${hint}${body}`);
}

mkdirSync(OUT_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const rawPath = join(OUT_DIR, `clarity-${stamp}.json`);
writeFileSync(rawPath, raw);
console.log(`raw response -> ${rawPath}`);

let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch {
  fail(`Response was not JSON. It is saved at ${rawPath}.`);
}

/*
  Clarity returns an array of { metricName, information: [...] }, but the shape of
  each `information` row varies by metric and dimension. Rather than assume field
  names, print whatever keys each row actually has — the summary stays useful even
  if Clarity changes the payload, and the raw file is there regardless.
*/
const rows = Array.isArray(parsed) ? parsed : [parsed];

// The metrics that point at something worth fixing, surfaced before the rest.
const FRICTION = /dead|rage|error|quickback|excessivescroll/i;
const score = (name: string) => (FRICTION.test(name.replace(/\s+/g, "")) ? 0 : 1);

const named = rows
  .filter((r): r is Record<string, unknown> => Boolean(r) && typeof r === "object")
  .map((r) => ({ name: String(r.metricName ?? "(unnamed)"), info: r.information }))
  .sort((a, b) => score(a.name) - score(b.name) || a.name.localeCompare(b.name));

if (!named.length) {
  console.log("\nNo metrics returned. Clarity may not have data for this window yet.");
  process.exit(0);
}

for (const { name, info } of named) {
  const entries = Array.isArray(info) ? info : [];
  const flag = FRICTION.test(name.replace(/\s+/g, "")) ? "  <-- friction" : "";
  console.log(`\n${name}${flag}`);
  if (!entries.length) {
    console.log("  (no rows)");
    continue;
  }
  for (const entry of entries.slice(0, 15)) {
    if (entry && typeof entry === "object") {
      const pairs = Object.entries(entry as Record<string, unknown>)
        .map(([k, v]) => `${k}=${v}`)
        .join("  ");
      console.log(`  ${pairs}`);
    } else {
      console.log(`  ${String(entry)}`);
    }
  }
  if (entries.length > 15) console.log(`  ... ${entries.length - 15} more rows (see the raw file)`);
}

console.log(`\nFull detail: ${rawPath}\n`);
