# The Inner Garden: members' portal (not shipped)

Backup copies of the members' portal commits. They are **not on main** and must not be merged without the owner's review.

- Base: `893d5be` on main ("Buy 2 takes 10% off and Buy 3 takes 20%").
- Branch in the session container: `members-portal`, at `fc54f58` (Phase 6 interim: visual fixes in review, on top of f6a6a88, which was Phase 6 final after the acceptance critic's fixes; Phase 5 final is `1238125`, Phase 4 final is `64d992d`) (includes real merge commits, so the backup is a git bundle).
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

## Phase 6: Play

36 commits on top of 1238125, including two real merges. Everything here is joy only: no counts, prizes, discounts or urgency, and nothing is lost if she ignores it.

| Commit | What it adds |
|---|---|
| 8d6ebb7 to a6b80a5, merged in 69cf555 | **Gathered:** the Naira flower's four petals and its stem are tucked, one each, at a heading's end in Drops, the Drawer, Your fit, Gifts and Care. A tap (or Enter or Space) takes it home in a short flight to the Garden tab, and a faint gold print stays where it lay. At the arbour's crown each piece found stands in its own place in the flower's shape; the small crown flower gives way at the first find, and no empty slot or count is ever drawn. When all five are home, a gold-leaf edge draws once per phone and at most 24 petals fall. The Herbarium keeps a fifth keepsake, 'Gathered' (for joy, not points, never redeemable); until then its frame lists the rooms still holding a piece as links, the path that needs no gesture. **Written in your sky:** after dark, 'Look up' opens a sheet where she joins her month's flower star by star ('Join the next star', 'Draw it for me'); it then rests in her night sky and the Herbarium keeps it. Her account keeps both in one integer, `naira.p`, 1 to 63 (`,"p":63` is 7 bytes; worst case 1,184 B of the 1,200 B cap; a play write never trims a saved piece). |
| d683fe7 to 1532497, merged in bab9f3a | **Stone Light** ('Hold it to the light') on Your stone: the heart drawn in the month's colour, cut into facets on an ink panel. The light moves only on her drag, the arrow keys or the Turn buttons, or her phone's tilt after she taps 'Tilt your phone' (the iPhone permission is asked then; drag and still fallbacks). **The Vanity** (/members/vanity): up to three necklaces laid on a drawn neckline strictly by each listing's own Length line (a length marked '(to confirm)' or missing is not drawn), chips to toggle, 'Take off', and 'Add the look to your bag' through the bag's own add. The Buy 2 / Buy 3 line is read from promo.ts, so it is always the bag's own rates. |
| 04f2435 to 03ce4e9 | Integration and polish after five reviews (phone and performance, engineering, brand and delight, data and privacy, journey) with adversarial checks. |
| 9fddb81 to 65760a8 | Acceptance-critic fixes. `naira.p` is read only from 1 to 63 again (64 and up are dropped, as planned). The crown's pieces stand in their own places from the first find (the polish had laid petals on the arch until the stem came home). forgetDevice.ts and its test are back to 1238125, so the Account chunk is Phase 5's again. The owner wording and Stone Light's Tier 2 were each lifted out whole so they could be laid back as single droppable commits. |
| 7625aa2 | **Stone Light's Tier 2 (droppable, owner question 3):** on a Tier 2 phone only, once the panel is nearly in view and then on idle, a faceted 3D heart in three.js (`lib/portal/gem/scene.ts`, its own scene chunk) turns in unseen as the 60-frame probe and then crossfades over the drawing. It is disposed with forceContextLoss if it is slow or lost. It shares one WebGL slot (claimGl) with the Bloom Field, so there are at most two contexts with the header flower. It pauses off screen, when the tab is hidden, after 20 s idle and under the open bag. `git revert 7625aa2` drops all of it, and Stone Light stays complete at Tier 1. |
| f6a6a88 | **Owner wording (droppable):** 'Written in your sky' for the keepsake, the night line, 'gathered from', rooms in lower case mid-sentence, the Vanity's instruction line, and the 'come apart in the breeze' line in What's growing. `git revert f6a6a88` drops it. |

Preview switches (development only, absent from dist): `&hunt=0..5`, `&stars=1`, `&look=1`, `&tilt=sweep`, with Phase 5's `&tier=2&probe=0` and `&hour=night`.

Phase 6 checks on f6a6a88:
- 215 test files and 2,030 tests pass. tsc is clean (app and node), and eslint is clean on every file changed since 1238125.
- `git revert 7625aa2`, `git revert f6a6a88`, and both in either order each apply cleanly on f6a6a88. With Tier 2 dropped, 214 files and 1,998 tests pass and tsc is clean, and the build has Phase 5's three scene chunks and no gem code. With the wording dropped, 215 files and 2,029 tests pass and tsc is clean. With both dropped, 214 files and 1,997 tests pass.
- Since 893d5be, nothing changed in index.html, src/index.css, main.tsx, vite.config.ts, package.json, bun.lock, promo.ts, shopify.ts, CartContext, WishlistContext, the header, the product page, the bag or checkout. Since 1238125 the only file changed outside the portal is src/lib/nairaBox/config.test.ts, with exactly one added line, and that line is inside 7625aa2.
- vendor, three, gsap, RoomEnvironment and the global CSS are byte-identical to a 893d5be build.
- Compared with the 1238125 build once hashes are masked: ProductDetail, CartDrawerNext, JewelDetailNext, Index, Jewellery, JewelleryCategory, Account and Auth are identical; the entry chunk is identical apart from renamed minified locals, with the same export aliases.
- dist has no preview code or fixtures (the Phase 5 pattern plus hunt=, stars=, look=, tilt= and the fixtures' names).
- Sizes (gzip -9):
  - MembersRoute 31.0 KB (budget 35; Phase 5 29.9); members.css 2.9 KB (budget 4).
  - PetalSpot 2.1 KB + 0.4 KB CSS; PetalCrown 1.9 KB; crownArt 0.5 KB; StarSheet 3.7 KB + 0.5 KB CSS; SkyWritten 0.5 KB.
  - Stone 6.2 KB + 1.4 KB CSS; StoneLight 4.9 KB + 0.7 KB CSS; Vanity 7.6 KB + 1.1 KB CSS.
  - One new scene chunk, the gem, at 4.0 KB (budget 12). No new gsap or *Gsap chunk.
- Browser, headless Chromium with SwiftShader (software GL: no timings here are phone numbers):
  - &hunt=0 fetches no PetalCrown chunk, and the small crown flower stands.
  - &hunt=1, 2, 3 and 5 draw exactly the pieces found, each at the crown's place in the flower's shape, with no small flower and no empty slot. The layer is pointer-events none.
  - What's growing names the rooms in words, with no digit.
  - Taps on the bed outside the crown, and on the crown itself, open tap blooms.
Independent check by the lead on f6a6a88 (a separate detached worktree):
- 215 files and 2,030 tests pass; tsc is clean (app and node); eslint is clean on the 65 changed files; the build succeeds and leaves the tree clean.
- The protected files are unchanged since 893d5be; since 1238125 the only file changed outside the portal is config.test.ts, with the one gem line.
- vendor, three, gsap, RoomEnvironment and the global CSS are byte-identical to 893d5be; Flip and Physics2D to Phase 5.
- ProductDetail, CartDrawerNext, JewelDetailNext, Jewellery, JewelleryCategory and Index match 893d5be once hashes are masked; Account and Auth match Phase 5. The entry chunk is the same length with the same 117 exports and differs only in short minified names; so does unboxGsap (its source is unchanged).
- The dist grep is clean, switches and fixtures included. `META_CAP_BYTES` is still 1200, `naira.p` is read only from 1 to 63, and the worst case test pins 1,184 B.
- `git revert 7625aa2`, `git revert f6a6a88`, both together, and `git revert 38e854f` each apply cleanly with tsc clean. With Tier 2 dropped, 214 files and 1,998 tests pass.

- Not done (needs a real device or a real member):
  - the 60-frame probe, compile time and crossfade on a mid-range Android or an iPhone (SwiftShader's crossfade at about 6 s is not a phone number);
  - the iPhone Safari motion-permission prompt and real DeviceOrientation readings (tested only with a stubbed requestPermission and synthetic events);
  - a real member's 'Add the look to your bag' against the live Shopify cart, with the bag drawer over the room (covered by mocked tests only: real adds were not allowed here).

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
- Phase 6:
  - her account keeping one small play number, `naira.p` (7 bytes at most)
  - showing the brand's own flower 'come apart in the breeze', as four petals and a stem tucked about the rooms, and gathered again at the arbour's crown. Before the stem is home, a petal stands alone above the arch in its place; a brand review wanted petals resting on the arch instead, which the plan's spec does not allow
  - Stone Light's Tier 2, a second three.js scene (drop it with `git revert 7625aa2`)
  - the iPhone motion-permission prompt after 'Tilt your phone' (nothing from the sensor is kept or sent)
  - the Vanity's caption: 'Drawn to each listing's own length, one against another. Where a chain sits on you depends on you.'
  - necklace lengths in Shopify: 9 live listings say '(to confirm)', 13 have no Length line, and the Birthstone Heart Necklace says 'plus extender' without a number. Until then those are left out of the Vanity or drawn without a tail
  - showing the shop's public Buy 2 / Buy 3 line inside the portal (read from promo.ts)
  - 'Add the look to your bag' sends one Meta AddToCart per piece, as each Add to bag does today
  - the names 'Gathered', 'Written in your sky' or 'Written in the stars', 'Hold it to the light' and 'The Vanity'
  - the owner-wording commit f6a6a88 (droppable): 'Written in your sky', the night line, 'gathered from', lower-case rooms, the Vanity's instruction line, and the 'come apart in the breeze' line
  - later, optional: a one-time Bloom Field over the garden when the flower is whole (it needs the same Tier 2 approval)
- Phase 6, for the lead (the acceptance critic's four lines, now held to the plan):
  - signing out on a phone does not forget the Vanity's look ('naira-vanity') or her gold-leaf mark (naira-portal.crown). Both are tagged with her id, so another member never sees them. Making sign-out forget them means editing the shop's Account chunk (src/lib/auth/forgetDevice.ts and its test). `git revert 38e854f` puts that change back, and it also clears naira-portal.grown, the Phase 5 roses
  - a later version that wants a seventh play bit must ship a reader that keeps it before any writer sets it, because today's reader drops any number above 63
