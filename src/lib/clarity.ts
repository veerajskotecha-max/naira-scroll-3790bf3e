/**
 * Microsoft Clarity custom tags.
 *
 * Clarity and the Meta pixel never exchange data — they are separate systems
 * with no integration between them. What this module does is stamp the Clarity
 * session with the SAME identifiers the Meta events already carry, so a session
 * recording can be looked up by hand from an ad-side number:
 *
 *   Ads Manager shows a bad campaign -> filter Clarity on `fbclid` or
 *   `utm_campaign` -> watch what those shoppers actually did.
 *
 * Without the tags, Clarity shows anonymous sessions that cannot be tied back
 * to a campaign. Nothing here sends anything to Meta.
 *
 * The base Clarity snippet is installed separately (in index.html). Until it
 * exists this module is inert: tags are held and flushed the moment
 * `window.clarity` appears, so load order never matters.
 */

import { getFbClickId, getVisitorId } from "@/lib/visitorId";

type ClarityFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

/** Clarity rejects oversized values; keep every tag comfortably short. */
const MAX_TAG_LENGTH = 200;

/*
  Tags asked for before the Clarity snippet has loaded.

  Clarity's own snippet installs a queueing stub synchronously, so in the normal
  case window.clarity already exists. It may not when the snippet is deferred
  (as the Meta pixel is here) or simply has not been added yet — so requests are
  parked and replayed rather than dropped.
*/
const pending = new Map<string, string>();
let waiting = false;

const flush = () => {
  const clarity = typeof window !== "undefined" ? window.clarity : undefined;
  if (!clarity) return false;
  for (const [key, value] of pending) {
    try {
      clarity("set", key, value);
    } catch {
      /* measurement must never break the shop */
    }
  }
  pending.clear();
  return true;
};

const waitForClarity = () => {
  if (waiting || typeof window === "undefined") return;
  waiting = true;
  // Bounded: ~20s at 500ms. If Clarity is not installed we simply stop looking.
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (flush() || attempts >= 40) {
      window.clearInterval(timer);
      waiting = false;
    }
  }, 500);
};

/** Attaches one key/value to the current Clarity session. Safe if not loaded. */
export const setClarityTag = (key: string, value?: string | null) => {
  if (typeof window === "undefined") return;
  const clean = value?.toString().trim().slice(0, MAX_TAG_LENGTH);
  if (!key || !clean) return;
  pending.set(key, clean);
  if (!flush()) waitForClarity();
};

/**
 * Pulls the raw click id out of Meta's `_fbc` cookie.
 * Stored form is `fb.<subdomainIndex>.<creationTime>.<fbclid>`; the click id
 * itself can contain dots, so everything past the third segment is kept.
 */
export const parseFbclid = (fbc?: string | null): string | undefined => {
  if (!fbc) return undefined;
  const parts = fbc.split(".");
  if (parts.length < 4) return undefined;
  return parts.slice(3).join(".") || undefined;
};

/** The campaign tags worth slicing Clarity's charts by, read from a query string. */
export const campaignTags = (search?: string): Record<string, string> => {
  const out: Record<string, string> = {};
  if (!search) return out;
  const params = new URLSearchParams(search);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = params.get(key)?.trim();
    if (value) out[key] = value;
  }
  return out;
};

/*
  The landing query string, captured once.

  Client-side navigation rewrites the URL within a few hundred milliseconds of
  the first render, so reading it later would attribute the session to whatever
  page the shopper happened to be on rather than the ad that brought them in.
*/
let landingSearch: string | undefined;

/**
 * Stamps the session with the identifiers shared with Meta plus the campaign
 * that brought the shopper in. Safe to call repeatedly.
 */
export const tagClaritySession = (options?: { signedIn?: boolean }) => {
  if (typeof window === "undefined") return;
  if (landingSearch === undefined) landingSearch = window.location.search;

  // Same value as the Meta `external_id` — the join key between the two tools.
  setClarityTag("meta_vid", getVisitorId());
  setClarityTag("fbclid", parseFbclid(getFbClickId()));
  for (const [key, value] of Object.entries(campaignTags(landingSearch))) {
    setClarityTag(key, value);
  }
  if (options?.signedIn !== undefined) {
    setClarityTag("signed_in", options.signedIn ? "yes" : "no");
  }
};

/** Test seam: forgets the captured landing query and any unflushed tags. */
export const resetClarityForTest = () => {
  landingSearch = undefined;
  pending.clear();
};
