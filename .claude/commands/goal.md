---
description: Build the Naira jewellery store end to end on the Savor theme — jewellery only, minimal, brand-correct. One pass per invocation.
---

# /goal — Naira, jewellery only, minimal, on Savor

Finish the Naira store end to end on the **Savor** theme. Jewellery only. No apparel.
Very plain, very minimal — the photography carries the page and nothing else competes
with it. Every invocation is **one full pass**: pick the next unfinished thing, build it,
verify it in a browser at 390px and 1440px, commit, push, and say what is left.

---

## The one hard rule

**Jewellery only.** The catalogue splits cleanly by vendor:

| Vendor | What it is | Count | In this build |
|---|---|---|---|
| `Naira Petite` | Jewellery | 71 | Yes — all of it |
| `Naira Flore` | Apparel, co-ord sets, lehengas | 19 | **No — never** |

Filter on `product.vendor == 'Naira Petite'` (or the four jewellery product types:
Necklace, Earrings, Bracelet, Ring). Never on handle guesses. If a section, menu item,
page or collection would surface an apparel piece, it does not ship.

Drop with the apparel: About Naira, Made for You, Naira Wedding Edit, Concepts, Gifting.
Keep only what a jewellery shopper needs — shop, the four categories, a product page,
contact, and the policies.

---

## Where things are

- **Theme:** Savor, `gid://shopify/OnlineStoreTheme/151142826146`, unpublished — this is
  the build target and it is writable. Never write to MAIN (`150497591458`); the API
  blocks it by design.
- **Store:** `nc5eti-gp.myshopify.com`
- **Collections that already exist:** `shop-all` (71, already jewellery-only), `necklaces`
  (15), `earrings` (20), `bracelets` (16), `rings` (19), `sets` (1). `frontpage` and
  `dusk` are apparel — leave them alone, do not link them.
- **Menus:** `main-menu` and `footer` both still point at apparel pages. They need
  rewriting, and menus are live store data — **ask before changing them.**
- **Pages to keep:** contact, faqs, privacy-policy, terms, exchange-return-policy.

### Read this before promising the client anything

`nairaflore.com` is served by Cloudflare/Lovable, not Shopify. The Shopify domain 301s
to `www.nairaflore.com`. **Editing this theme changes nothing for a real shopper** until
the domain is pointed at Shopify. Say so plainly rather than reporting the build as live.

---

## The look

Reference: `projectshades.in` — white ground, generous whitespace, image-first product
cards, no borders or framing, sans-serif functional type, selective uppercase for
headers only, no decoration anywhere.

Naira's own tokens, and nothing outside this list:

| Role | Value |
|---|---|
| Ground | `#FBF3EC` ivory, or `#FFF8F5` warm white |
| Ink | `#1A1614` |
| Gold | `#B0843A` — accents and rules only, never a fill |
| Deep gold | `#8A6A2F` — small caps labels |
| Sage | `#99B4AF` — one use per page at most |
| Display | Cormorant Garamond, 400, tight leading |
| Utility | Jost, 300/400, `0.28em` tracking on uppercase labels |

**Delete, do not restyle:** sprigs, petals, film grain, arches, marquees, hover
animations, gradient washes, badge stacks, review carousels. If a thing is decoration,
it goes. Minimal means fewer elements, not smaller ones.

**Product page** — plainest thing on the site: image column, then name, price, size or
length, one Add to bag, one collapsible detail block, nothing else. Mobile is the design
target; desktop is the same page with room around it.

---

## One pass

1. **Pick.** Read `docs/goal-progress.md` (create it on the first run) and take the next
   unfinished item. Do not restart finished work.
2. **Build.** Smallest change that finishes the item. Reuse the existing `nf-*` sections
   where they already match this brief rather than writing new ones.
3. **Verify in a browser, not by reading.** The harness is in `shopify/harness/`:
   - `bash up.sh` — start the render servers (use `setsid`, they get reaped otherwise)
   - `bash difall.sh <width>` — computed-style diff
   - `node portal.mjs` / `contrast.mjs` — overflow, tap targets, contrast
   A pass is not done until 390px and 1440px both show no horizontal scroll, no JS
   errors, and no tap target under 44px.
4. **Upload.** `themeFilesUpsert` with `body.type = BASE64` — it returns the real record.
   `URL` returns an empty array whether it worked or not.
5. **Record.** Append what shipped and what is left to `docs/goal-progress.md`.
6. **Commit and push** to `claude/install-mem-skill-jsd971`. Never to `main`. No PR.
7. **Report** in three lines: what shipped, what it measured, what is next.

Run it repeatedly with `/loop /goal`.

---

## Liquid traps that have each cost hours

- Never put a Liquid tag inside `{% comment %}` — Shopify's parser still reads it.
- `assign x = a contains b` is invalid. Use `{% if %}` and a boolean.
- `nil != blank` is **true**. Never use `blank` as a sentinel; use a real boolean.
- Schema `label` and `name` cap at **50 characters**.
- Templates must declare their own blocks — `{% schema %}` presets are never a fallback.
- The theme root font-size is `62.5%`, so `1rem` is 10px, not 16px.

## Needs the user's word first

Store data — collections, menus, pages, products, discounts — and publishing any theme.
Build it, then ask.
