import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const html = readFileSync(resolve(__dirname, "../index.html"), "utf8");

/*
  Neither snippet was gated, so localhost runs and Lovable previews reported
  into the live Clarity project and the live Meta pixel — 40% of one day's
  Clarity sessions were our own machines, and the same sessions fired PageView
  and ViewContent into Meta, where they are optimised against.

  These assertions are shape checks on index.html rather than behaviour, which
  is covered by driving the built site. They exist so the gate cannot be
  deleted quietly.
*/
describe("analytics only report from the real shop", () => {
  it("decides on an explicit hostname allowlist", () => {
    expect(html).toContain('h === "nairaflore.com" || h === "www.nairaflore.com"');
    // A substring match would also accept a preview host carrying the name.
    expect(html).not.toMatch(/hostname[^\n]*(includes|indexOf)\(\s*["']nairaflore/);
  });

  it("withholds the Meta Pixel network load off the shop", () => {
    expect(html).toContain("if (!window.__nairaProd) return;");
  });

  it("withholds the Clarity tag off the shop", () => {
    expect(html).toContain("if (!c.__nairaProd) return;");
  });

  /* The stubs must survive the gate: src/lib/clarity.ts queues tags until
     window.clarity exists, and app code calls fbq() directly. Removing the
     stubs to "clean up" would break both off the shop. */
  it("keeps both stubs so app code never crashes in dev", () => {
    expect(html).toContain("c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)}");
    expect(html).toContain("if(f.fbq)return;n=f.fbq=function()");
  });
});
