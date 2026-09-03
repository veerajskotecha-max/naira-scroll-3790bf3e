/* Runnable check for the gate's pure logic — no framework, no browser, no
   Supabase. Everything here is a fact the gate depends on.

     npx tsx src/components/members/portal/__checks__/gate.check.ts
*/

import assert from "node:assert/strict";
import {
  COOLDOWN_MS,
  JOIN_NOTICE,
  LINK_NOTICE,
  SIGNIN_NOTICE,
  cooldownRemaining,
  noticeFor,
  parseEmail,
  parseName,
  type Attempt,
} from "../gateLogic";

let n = 0;
const check = (label: string, fn: () => void) => {
  fn();
  n += 1;
  console.log(`  ✓ ${label}`);
};

/* ── email validation ── */

check("accepts a good address and trims it", () => {
  const r = parseEmail("  Ada@nairaflore.com \n");
  assert.deepEqual(r, { ok: true, value: "Ada@nairaflore.com" });
});

check("rejects the usual rubbish", () => {
  for (const bad of ["", "   ", "ada", "ada@", "@nairaflore.com", "ada @nairaflore.com", "ada@flore"]) {
    const r = parseEmail(bad);
    assert.equal(r.ok, false, `expected ${JSON.stringify(bad)} to be rejected`);
  }
});

check("rejects an over-long address", () => {
  const r = parseEmail(`${"a".repeat(250)}@nairaflore.com`);
  assert.equal(r.ok, false);
});

check("a rejection never echoes what was typed back at the member", () => {
  const r = parseEmail("<script>alert(1)</script>@x");
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(!r.message.includes("script"), r.message);
});

check("names are trimmed and capped", () => {
  assert.deepEqual(parseName("  Ada  "), { ok: true, value: "Ada" });
  assert.deepEqual(parseName(""), { ok: true, value: "" });
  assert.equal(parseName("x".repeat(81)).ok, false);
});

/* ── cooldown ── */

check("a fresh cooldown is the full window, in whole seconds", () => {
  const now = 1_700_000_000_000;
  assert.equal(cooldownRemaining(now + COOLDOWN_MS, now), COOLDOWN_MS / 1000);
});

check("counts down and rounds up so it never shows 0 while still locked", () => {
  const now = 1_700_000_000_000;
  assert.equal(cooldownRemaining(now + 1500, now), 2);
  assert.equal(cooldownRemaining(now + 1, now), 1);
});

check("is 0 the moment it expires and stays 0", () => {
  const now = 1_700_000_000_000;
  assert.equal(cooldownRemaining(now, now), 0);
  assert.equal(cooldownRemaining(now - 1, now), 0);
  assert.equal(cooldownRemaining(0, now), 0);
});

check("a never-started cooldown is not a lock", () => {
  assert.equal(cooldownRemaining(0, Date.now()), 0);
});

/* ── the same words whether or not the account exists ── */

const failures: unknown[] = [
  undefined,
  null,
  new Error("User not found"),
  new Error("Signups not allowed for otp"),
  { status: 400, message: "Invalid login credentials", code: "invalid_credentials" },
  { status: 429, message: "over_email_send_rate_limit" },
];

check("a link request answers identically for a member and a stranger", () => {
  const said = new Set(failures.map((f) => noticeFor("magiclink", f)));
  assert.equal(said.size, 1);
  assert.equal([...said][0], LINK_NOTICE);
});

check("a password reset answers with that same sentence", () => {
  const said = new Set(failures.map((f) => noticeFor("reset", f)));
  assert.deepEqual([...said], [LINK_NOTICE]);
});

check("a failed sign-in gives one fixed reply, never the server's", () => {
  const said = new Set(failures.map((f) => noticeFor("signin", f)));
  assert.deepEqual([...said], [SIGNIN_NOTICE]);
});

check("joining reads the same for a new address and one already on the list", () => {
  assert.equal(noticeFor("join"), JOIN_NOTICE);
  assert.equal(noticeFor("join", new Error("duplicate key value")), JOIN_NOTICE);
});

check("no reply ever leaks the address, the error or the account's existence", () => {
  const kinds: Attempt[] = ["signin", "magiclink", "reset", "join"];
  const leaks = /nairaflore\.com|not found|invalid|rate.?limit|no such|already|registered|exists/i;
  for (const kind of kinds) {
    for (const f of [...failures, new Error("ada@nairaflore.com is not registered")]) {
      const said = noticeFor(kind, f);
      assert.ok(!leaks.test(said), `${kind} leaked: ${said}`);
    }
  }
});

console.log(`\ngate.check — ${n} checks passed\n`);
