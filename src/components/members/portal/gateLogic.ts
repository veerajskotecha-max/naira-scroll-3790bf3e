/* ───────────────────────────────────────────────────────────────
   CONSERVATORY GATE — pure logic
   Everything here is browser-free and Supabase-free so it can be
   checked with `npx tsx src/components/members/portal/__checks__/gate.check.ts`.
   ─────────────────────────────────────────────────────────────── */

import { z } from "zod";

/** Petal rush-in + bloom, in ms. The gate waits this long before it hands over. */
export const BLOOM_MS = 900;

/** Quiet client-side throttle between outbound emails. Supabase enforces the
    real limit server-side; this only stops the form being hammered. */
export const COOLDOWN_MS = 45_000;

/* Same rules as @/lib/innerCircle — repeated here (not imported) so this
   module stays free of the Supabase client and can run under plain tsx. */
const emailSchema = z
  .string()
  .trim()
  .email({ message: "Please enter a valid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

const nameSchema = z
  .string()
  .trim()
  .max(80, { message: "Name must be less than 80 characters" });

export type Parsed = { ok: true; value: string } | { ok: false; message: string };

const run = (schema: z.ZodType<string>, raw: string): Parsed => {
  const r = schema.safeParse(raw);
  return r.success ? { ok: true, value: r.data } : { ok: false, message: r.error.issues[0].message };
};

export const parseEmail = (raw: string): Parsed => run(emailSchema, raw);
export const parseName = (raw: string): Parsed => run(nameSchema, raw);

/** Whole seconds left before another email may be sent. 0 once free. */
export const cooldownRemaining = (until: number, now: number): number =>
  Math.max(0, Math.ceil((until - now) / 1000));

export type Attempt = "signin" | "magiclink" | "reset" | "join";

export const LINK_NOTICE = "If that address is with us, a link is on its way.";
export const JOIN_NOTICE = "You're on the list. Watch your inbox for the door.";
export const SIGNIN_NOTICE = "Those details don't match. Try “Email me a link” instead.";

/**
 * What the member is told after a credential attempt.
 *
 * It deliberately takes the failure and then ignores it: the reply is a
 * function of the *kind* of attempt only, never of whether the address is on
 * file, so the gate cannot be used to discover who is a member. Keeping the
 * error out of the return value is the whole point — do not "improve" this by
 * passing the Supabase message through.
 */
export const noticeFor = (kind: Attempt, _failure?: unknown): string => {
  switch (kind) {
    case "signin":
      return SIGNIN_NOTICE;
    case "join":
      return JOIN_NOTICE;
    default:
      return LINK_NOTICE;
  }
};
