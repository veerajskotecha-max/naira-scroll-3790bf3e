import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/*
  robots.txt opened with "User-agent: Googlebot / Allow: /" and the same for
  Bingbot and Twitterbot. A crawler obeys only the most specific group naming
  it (RFC 9309, and Google's own spec), so those three skipped every Disallow
  in the "*" group: the cart and checkout token paths the rules were written
  for stayed open to exactly the crawlers that matter.

  This evaluates the file the way they do: pick the group, longest match wins,
  Allow wins a tie.
*/
const robots = readFileSync(resolve(__dirname, "../../public/robots.txt"), "utf8");

type Group = { agents: string[]; rules: { allow: boolean; path: string }[] };

const groups: Group[] = [];
let open: Group | null = null;
for (const raw of robots.split("\n")) {
  const line = raw.replace(/#.*/, "").trim();
  const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
  if (!m) continue;
  const [, key, value] = m;
  if (/^user-agent$/i.test(key)) {
    if (!open || open.rules.length) groups.push((open = { agents: [], rules: [] }));
    open.agents.push(value.toLowerCase());
  } else if (open && /^(allow|disallow)$/i.test(key) && value) {
    open.rules.push({ allow: /^allow$/i.test(key), path: value });
  }
}

const groupFor = (bot: string) =>
  groups.find((g) => g.agents.includes(bot.toLowerCase())) ?? groups.find((g) => g.agents.includes("*"));

const allowed = (bot: string, path: string) => {
  const rules = groupFor(bot)?.rules.filter((r) => path.startsWith(r.path)) ?? [];
  const best = rules.sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow))[0];
  return best ? best.allow : true;
};

const PRIVATE = [
  "/account",
  "/auth",
  "/cart/c/abc123?key=1",
  "/checkouts/cn/abc123",
  "/.lovable/oauth/consent",
  "/admin/reels",
];
const PUBLIC = ["/", "/jewellery", "/jewellery/prism-riviere-bracelet", "/products/blush-of-dawn", "/journal"];

describe("robots.txt", () => {
  it.each(["Googlebot", "Bingbot", "Twitterbot", "DuckDuckBot"])("keeps %s off the private routes", (bot) => {
    expect(PRIVATE.filter((p) => allowed(bot, p))).toEqual([]);
    expect(PUBLIC.filter((p) => !allowed(bot, p))).toEqual([]);
  });

  /* Ad and link previews depend on this crawler reaching any page. */
  it("leaves facebookexternalhit its own allow-all group", () => {
    expect(groupFor("facebookexternalhit")).toEqual({ agents: ["facebookexternalhit"], rules: [{ allow: true, path: "/" }] });
  });

  /* A first-match parser (Python's, for one) ends a group at a blank line, and
     an "Allow: /" ahead of the Disallows would win for it outright. */
  it("keeps each group unbroken and leads with no blanket Allow", () => {
    const star = robots.slice(robots.indexOf("User-agent: *"));
    expect(star.slice(0, star.indexOf("\nSitemap:")).trim()).not.toMatch(/\n\s*\n/);
    expect(groupFor("Googlebot")?.rules.some((r) => r.allow)).toBe(false);
  });

  it("blocks nothing the sitemap lists", () => {
    const sitemap = readFileSync(resolve(__dirname, "../../public/sitemap.xml"), "utf8");
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(paths.length).toBeGreaterThan(100);
    expect(paths.filter((p) => !allowed("Googlebot", p))).toEqual([]);
  });
});
