# The Inner Garden: members' portal (not shipped)

Backup copies of the members' portal commits. They are **not on main** and must not be merged without the owner's review.

- Base: `893d5be` on main ("Buy 2 takes 10% off and Buy 3 takes 20%").
- Branch in the session container: `members-portal`, at `1238125` (Phase 5 final; Phase 4 final is `64d992d`) (includes real merge commits, so the backup is a git bundle).
- To restore: `git fetch docs/members-portal/members-portal.bundle members-portal:members-portal`
- To read every change at once: `docs/members-portal/members-portal.diff` (against 893d5be).

## Phase 1

| Commit | What it adds |
|---|---|
| de79aad | Route `/members/*`, the Gate, the Doors entrance, the seeded garden, tap blooms, Your stone with the live Birthstone Heart Necklace |
| 67208cd | Polish: profile read before the rooms open, honest add-to-bag, listing wording for stones, a fuller entrance, Clarity masking |
| 2f278c0 | Tap blooms keep their colour; the gate fits a 320 px phone |

## Phase 2

| Commit | What it adds |
|---|---|
| e45bc66 | The drops: empty manifest, drop phases in IST, Bloom Clock, sealed bud in the garden, rub-the-petals reveal, the unboxing, piece grid with live prices, pressed flowers, New in the garden, the Vault, calendar links |
| ed07abd | Polish: the unboxing waits for the shop, Buy now fires once, honest offline and 'Opening shortly' states |
| 365bd99 | Tests for the manifest's notes and kept drop numbers |

As shipped the manifest is empty: /members/drops says 'No drop is open right now' plus New in the garden.

Phase 2 checks on 365bd99: 159 test files and 1,177 tests pass; tsc clean; dist has no preview or fixture code. MembersRoute 26.3 KB gzip JS (budget 35), each drop room in its own chunk (DropRoom 14.3 KB JS, 2.9 KB CSS).

## Phase 3: known and kept

- Her account keeps her ring size, metal, saved pieces (up to 24), pressed flowers and keepsakes in the sign-in account's own record, capped at 1.2 KB. There is no database change.
- **Your fit:** a bank-card-calibrated ring sizer on the screen, the thread method, or 'I know my size'. Rings in her size come from live stock. The page says 'A guide, not a guarantee'.
- **Jewel drawer:** the phone's hearts and her account's saved pieces, merged; 'Laid out for you' (up to 6 picks, each with its reason); 'Since you were last here'.
- **Herbarium:** drop frames plus four keepsakes (Seed, Birth Flower, Fitted, Front Row), for joy only.
- **Sign-in:** 'Forgot password' with a recovery view; ?next= can only be a same-site path; a 6-digit email code, built but switched off; name and consent kept through email confirmation.
- **Arrival repair:** a one-time 'Join the list' and an unticked consent box, below her garden.
- The /account, /innercircle and /auth wording is all in commit 13ce275, so the owner can drop it with `git revert 13ce275`.
- Built but switched off until the owner decides:
  - rebuilding hearts on a new phone (it would send Meta an AddToWishlist per piece)
  - Meta Lead/Subscribe on the arrival list join
  - the email code

Phase 3 checks on 5cba2a1:
- 180 test files and 1,448 tests pass; tsc is clean.
- index.html, index.css, CartContext, WishlistContext, promo.ts, innerCircle.ts and shopify.ts are unchanged.
- MembersRoute is 33.8 KB gzip (budget 35). Fit, RingSizer, Drawer and Herbarium are each in their own chunk. Auth grows by 3.1 KB gzip.

## Phase 4

30 commits on top of 5cba2a1, including two real merges.

| Commit | What it adds |
|---|---|
| 0c58526 to f444131 | Headroom: Your stone, the arrival card, tap blooms, the More row and the gate's welcome load on demand. A member's garden no longer downloads the list-join code. |
| b7d4f07 | Merge of the rooms. **Gift ledger** (/members/gifts): a 12-month ring of up to 8 dates, each a short name, a day and month and a budget band; 'Gift her stone' and three live pieces within the budget; a yearly reminder a week before (Google Calendar, or an .ics file). **Order Desk** (/members/orders): the existing /track-order, 'Checkouts you started' and WhatsApp. **Care** (/members/care): the wipe ritual, the PVD explainer and care lines in each listing's own words. **Ask the atelier**: a wax-seal card that opens WhatsApp with her size, metal and saved pieces, which she can change before she sends. |
| b209c9c | Merge of the garden. **Garden hours** by Indian time (dawn, day, golden hour, night with twelve fireflies on the garden's one loop). **Festival dressings** (Diwali, monsoon, Holi), with an empty table until the owner gives dates. **Atelier notes**, empty until the owner writes them. **Garden card** (/members/card): a 1080 x 1920 PNG drawn on her phone, with her name off unless she ticks it; it uses the share sheet, or 'Open the image' inside Instagram. |
| 063bef7, 82feddd | Privacy policy: the drafted members' line. Drop both commits to remove it. |
| e8dcfa4 to 9ab2dc1 | Polish after four reviews (phone and a11y, engineering, brand and honesty, data and privacy) with adversarial checks. Fixes include: no link carries her words, WhatsApp survives a broken emoji, the card is never stale, Care makes no water claim of its own, and a piece let go for room stays hearted. |
| 0006e89, 64d992d | Acceptance fixes: the Herbarium's 'Share to story' opens the garden card; her gift dates bloom as small stone flowers on the garden's arbour. |

Phase 4 checks on 64d992d (run twice: once by the screens step, once independently):
- 193 test files and 1,611 tests pass; tsc is clean.
- index.html, index.css, the contexts (cart, wishlist, auth), shopify.ts, the product page, the bag and the header are unchanged since 893d5be. The product page chunk's contents are identical to main once file hashes are masked.
- vendor and the global CSS are byte-identical to a 893d5be build. dist has no preview code or fixtures. seasons.ts and notes.ts ship empty.
- Sizes (gzip -9): MembersRoute is 29.8 KB (budget 35) and members.css is 2.9 KB (budget 4). Gifts is 9.9 KB JS and 1.7 KB CSS, Care 3.0 + 1.3, Orders 1.5 + 0.5, Card 2.3 + 1.2, and the ShareCard renderer is 4.9. Auth is still +3.1 KB on main.
- No Supabase writes, Shopify changes, Meta or Clarity requests, WhatsApp opens or shares happened in any capture.

## Phase 5

25 commits on top of 64d992d, including two real merges.

| Commit | What it adds |
|---|---|
| c792610 | shopper-performance refuses /members paths, as the browser already does. It is one word in its own commit; drop it to remove it. |
| 3f854ce to 828a0d5, merged in b538a98 | **Bloom Field:** when a drop opens, a 3D fall of the brand's flowers in the drop's colour with a gold edge, on Tier 2 phones only. It is skipped with reduced motion, Data Saver, 2g/3g, under 4 GB memory or no WebGL. It steps aside if more than 25% of its first 60 frames are slow, and it is fully disposed after about 6 s. **Drop-room motion (gsap):** the 24 petals are thrown with Physics2D and the pieces Flip from the box into the grid. Today's motion stays for every other phone and if a chunk fails. |
| 8864bb0 to c18e2e7, merged in fc888a3 | **Real orders:** `supabase/functions/order-bloom` (Shopify's orders/create webhook) is written and tested but **not deployed**. Without `ORDER_BLOOM_WEBHOOK_SECRET` it answers 401 to everything. It checks Shopify's HMAC in constant time and only sets `status` and `completed_at` on an existing row, so retries change nothing. The Order Desk says 'Order' only for a confirmed row. **Gold rose:** a gold-leaf rose for each confirmed order grows in her garden's front row, dated with its order and never counted. |
| d695ec5 to 1238125 | Polish after five reviews (phone and performance, engineering, brand and delight, data and security, journey) with adversarial checks, plus the acceptance critic. order-bloom marks only the row of the member who placed the order. The rose grows only where she can see it. The field is ready before the opening moves, and no piece unfolds unseen. Only the preview member may force a tier. |
| 73d926a | `verify_jwt = false` for order-bloom in supabase/config.toml, because Shopify sends no Supabase token and the HMAC is the real check. Drop it to remove it. |

Phase 5 checks on 1238125 (run twice: once by the screens step, once independently):
- 201 test files and 1,786 tests pass, including order-bloom's ~45 cases. tsc is clean.
- index.html, index.css, the contexts, shopify.ts, promo.ts, innerCircle.ts, the header, NairaWordmark, the product page, the bag, main.tsx, vite.config, package.json and bun.lock are unchanged since 893d5be. No new dependency was added.
- three, gsap, vendor and the global CSS are byte-identical to a 893d5be build. ProductDetail, CartDrawerNext, JewelDetailNext, Jewellery, JewelleryCategory and Index are identical to main once file hashes are masked.
- The only new static importers of three and gsap are src/lib/portal/scene.ts and unboxGsap.ts, reached only by import(). config.test.ts gains exactly one allow-list line.
- dist has no preview code or fixtures (&tier, &probe, &orders, &checkouts included).
- Sizes (gzip -9): MembersRoute 29.9 KB (budget 35), members.css 2.9 KB, DropRoom 14.1 KB JS and 1.6 KB CSS, the portal scene 3.1 KB, unboxGsap 1.7 KB, Orders 1.8 KB, GoldRose 2.0 KB. Flip (9.6 KB) and Physics2D (1.0 KB) load only in a drop room on Tier 2.
- Reduced motion and Data Saver: no three, gsap or scene requests, even with &tier=2. On /members at most two WebGL contexts are live (the header flower and the field).
- Not done: frame rates come only from software GL. The Bloom Field still needs a check on a real mid-range Android. The firm members-first window was deferred, as planned.

## Phase 1 checks on 2f278c0

- vitest: 150 files and 1,046 tests pass.
- `tsc --noEmit -p tsconfig.app.json`: clean.
- `vite build`: no `portalPreview`, `previewHost` or `example.invalid` in dist.
- Portal JS: 20.8 KB gzip (budget 35 KB). Portal CSS: 3.53 KB gzip (budget 4 KB).
- Global CSS and vendor chunk: byte-identical to main. Product page, bag and checkout chunks: unchanged.

## Waiting on the owner

- The name and address (The Inner Garden, /members).
- The Gate wording.
- The stone wording.
- The /account and /innercircle link changes.
- Meta events on /members.
- Whether to hide the header during the entrance.
- The first drop's details.
- Phase 3:
  - add `https://nairaflore.com/auth` to the sign-in redirect allow-list
  - storing ring size, metal and saved pieces on the account
  - the heart-rebuild and list-join Meta events
  - the wrong-size policy
- Phase 4:
  - gift dates on the account, and the privacy line
  - the festival list with IST dates
  - the card design
  - who answers WhatsApp and the reply hours
  - the care and PVD wording, and whether 'waterproof' is true
  - re-polish service
  - gift notes on orders
  - the Order Desk wording
  - the atelier notes
- Phase 5:
  - three.js and one WebGL scene (the Bloom Field) in drop rooms
  - gsap (with Flip and Physics2D) in the drop room
  - creating Shopify's orders/create webhook and the ORDER_BLOOM_WEBHOOK_SECRET
  - deploying order-bloom, and keeping 73d926a (verify_jwt = false)
  - redeploying shopper-performance with 'members' (c792610)
  - whether Fastrr orders carry the cart or checkout token
  - the Flip on short phones (the grid sits below the fold)
  - cancelled orders keep their rose (orders/cancelled later?)
  - Buy now does not note a checkout row
  - a later migration so the browser cannot write status='completed'
  - the firm members-first window (deferred)
