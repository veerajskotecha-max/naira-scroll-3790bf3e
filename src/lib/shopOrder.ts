/* Shop All order: the most-visited pieces lead; pieces nobody has opened yet
   (new listings) and sold-out pieces are scattered at random positions rather
   than dumped at the end. The shuffle is seeded per day so Back from a product
   returns to the same grid. */

export type VisitCounts = Record<string, number>;

const CACHE_KEY = "nf-piece-visits:v1";
const TTL = 60 * 60 * 1000;

/* Seed from 30-day product-page views (2 Nov 2026); live counts replace it. */
export const SEED_VISITS: VisitCounts = {
  "baguette-tennis-bracelet": 909, "roman-numeral-trio-ring": 833, "prism-riviere-bracelet": 544,
  "baguette-eternity-band": 429, "woven-gold-hoops": 356, "linked-trio-ring": 338,
  "prism-cluster-studs-silver": 332, "baguette-huggies": 313, "silk-mesh-cuff": 298,
  "star-point-band": 234, "toggle-link-chain": 200, "heartbead-bracelet": 182,
};

const mulberry = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const daySeed = (d = new Date()) => d.getFullYear() * 1000 + Math.floor((+d - +new Date(d.getFullYear(), 0, 0)) / 864e5);

export function orderByVisits<T extends { handle: string; availableForSale?: boolean }>(
  pieces: T[], visits: VisitCounts, seed = daySeed(),
): T[] {
  const rand = mulberry(seed);
  const ranked = pieces
    .filter((p) => p.availableForSale !== false && (visits[p.handle] ?? 0) > 0)
    .sort((a, b) => (visits[b.handle] ?? 0) - (visits[a.handle] ?? 0));
  const scattered = pieces.filter((p) => !ranked.includes(p));
  for (const p of scattered) ranked.splice(Math.floor(rand() * (ranked.length + 1)), 0, p);
  return ranked;
}

export function readCachedVisits(): VisitCounts {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
    if (c?.v && Object.keys(c.v).length) return c.v;
  } catch { /* private mode */ }
  return SEED_VISITS;
}

export async function fetchVisits(): Promise<VisitCounts | null> {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
    if (c && Date.now() - c.t < TTL) return null;
  } catch { /* ignore */ }
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopper-performance?popularity=1`;
    const r = await fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
    if (!r.ok) return null;
    const v = (await r.json()) as VisitCounts;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v }));
    return v;
  } catch { return null; }
}
