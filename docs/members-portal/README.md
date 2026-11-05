# The Inner Garden: members' portal (not shipped)

Backup copies of the members' portal commits. They are **not on main** and must not be merged without the owner's review.

- Base: `893d5be` on main ("Buy 2 takes 10% off and Buy 3 takes 20%").
- Branch in the session container: `members-portal`, at `5cba2a1` (includes a real merge commit, so the backup is a git bundle).
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
