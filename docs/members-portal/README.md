# The Inner Garden: members' portal (not shipped)

Backup copies of the members' portal commits. They are **not on main** and must not be merged without the owner's review.

- Base: `893d5be` on main ("Buy 2 takes 10% off and Buy 3 takes 20%").
- Branch in the session container: `members-portal`, at `365bd99`.
- To restore: `git checkout -b members-portal 893d5be && git am docs/members-portal/*.patch`

## Phase 1 (these patches)

| Patch | What it adds |
|---|---|
| 0001 | Route `/members/*`, the Gate, the Doors entrance, the seeded garden, tap blooms, Your stone with the live Birthstone Heart Necklace |
| 0002 | Polish: profile read before the rooms open, honest add-to-bag, listing wording for stones, a fuller entrance, Clarity masking |
| 0003 | Tap blooms keep their colour; the gate fits a 320 px phone |

## Phase 2 (patches 0004 to 0006)

| Patch | What it adds |
|---|---|
| 0004 | The drops: empty manifest, drop phases in IST, Bloom Clock, sealed bud in the garden, rub-the-petals reveal, the unboxing, piece grid with live prices, pressed flowers, New in the garden, the Vault, calendar links |
| 0005 | Polish: the unboxing waits for the shop, Buy now fires once, honest offline and 'Opening shortly' states |
| 0006 | Tests for the manifest's notes and kept drop numbers |

As shipped the manifest is empty: /members/drops says 'No drop is open right now' plus New in the garden.

Phase 2 checks on 365bd99: 159 test files and 1,177 tests pass; tsc clean; dist has no preview or fixture code. MembersRoute 26.3 KB gzip JS (budget 35), each drop room in its own chunk (DropRoom 14.3 KB JS, 2.9 KB CSS).

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
