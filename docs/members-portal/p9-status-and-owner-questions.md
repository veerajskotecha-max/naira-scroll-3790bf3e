# The World of Naira (Phase 9): where it stopped, and the owner's questions

Stopped on 19 Nov 2026 at the owner's request. Nothing here is live: nothing is on main, no server function is deployed, no database migration is applied, and nothing was written to Shopify, Supabase or Meta.

Preview (self-contained demo, version 9): https://claude.ai/artifact/FYJa4ErmfDD7gtoyeHYB7X

## What is on members-portal-p9 (merged, walked on a phone, tested)

- Phases 1-8 and the Phase 9 tracks: the signed-out trailer and ticket, the opening, Today, the seven worlds, the viewer and keeps, Your edit, sets, drops, the card, the garden, the tied hint.
- Wow rounds 1-3: titles through the letters, the tied hint, turning the world with your thumb, the card you can hold.
- Member orders end to end (built, NOT deployed): past orders, the order page with tracking first, Today's parcel card; server functions, webhooks, the daily sync and the database table are written and tested but switched off. Owner runbook: docs/orders/RUNBOOK.md.
- Finishing direction, round 1: the photograph cut and the five campaigns in their worlds (F1C), the per-world colour grade (F1D), tones/type/motion tokens (F1A), first frame and first touch (F1B).
- The navigation repair: one scroll manager, one rule for overlays and sheets, 40 confirmed breaks fixed, each with a reproduction script.
- Checks at members-portal-p9 5825c148: tsc clean; 3,848 tests pass, 1 fails (src/hooks/useReels.test.ts, failing before this work); the demo build passes its 8 checks (505 files, no outside requests).

## Finished but NOT merged (each reviewed by an art director)

- finish-F2A: Today shorter (about 3.5 screens), in its world, with its ending.
- finish-F2B: the world pages (graded gallery first, Marigold after dark, piece cards, the door).
- finish-F2C: the quiet rooms (Sets, a set's page, the card, the garden, Orders) without the shop footer.

## Started and stopped part-way (work in progress, untested, not for merge as is)

- finish-F2D: the five-door dock (Today, Worlds, the seal, Orders, Your edit) and the regrouped house.
- finish-F3D: the worlds in motion (colour-turn landing, the wash, Marigold petals, jaali by the hour).
- finish-F4B: tearing the ticket, entrance polish.
- finish-F4C: her birthday opening and Today's birthday card.

## Not started

F3A (between rooms, the Worlds page), F3B (the colours room), F3C (the viewer, sheets and keep), F4A (drops: lights down to the kolam), F4D (the tray and the bag), F5A-F5D (season and diyas, dust you can touch, walk the light both ways, the last sweep), and a final full navigation sweep on the merged tree.

## Owner questions

### Files only the owner may change
1. index.html: a 299-byte head script for /members (ink background and the shop header off from frame 0, fonts asked for early). The exact script is in docs/world-of-naira/TRACK-F1B.md. In production the prerender guard already paints ink; the bare preview link is white for about 100 ms to 3 s without it.
2. The floral background preload on /members (47 KB at high priority): move floral-pattern-bg.webp to public/ and preload it only off /members, or accept it.
3. vite.config.ts: build.assetsInlineLimit returning false for src/assets/world/campaigns/, so the Sage, Soft Matter and Lilac Hour chunks drop under 4 KB.

### Photographs and colour
4. Lilac's poster: L5 (the Lilac Hour campaign's own lead frame) instead of L3. Recommended: L5.
5. Night's midnight-blue stones photograph (hf-51ace112): keep (Night stays at its floor of 12) or cut.
6. The grade: accept the "protected" grade (neutrals move as approved; gold, stones and skin keep their colour). Recommended: accept.
7. Media budget 14 -> 16 MB (the graded folder is 13.78 MB); and whether to spend about 1.2 MB on 540 w graded copies for 3x phones.
8. Ivory's paper colour #F4EDE3 reads cooler than Ivory's photographs; #F4EADB closes about half the gap.
9. Graphite still awaiting approval; M2 studs not in the shop.

### Orders (docs/orders/RUNBOOK.md)
10. Supabase "Confirm email" must be ON before the orders server is turned on; the server refuses to match orders while sign-ups auto-confirm.
11. Owner steps: the Shopify app client id/secret and read_orders scope, the four webhooks, pg_cron/pg_net/Vault, applying migration 0007, the one-time members backfill.

### Small items left for whoever picks this up
12. TodayParcel's h3 should be an h2 inside Today (axe heading order); the order page's "2:14 pm" can wrap between the time and "pm" (needs a no-break space).
13. The Vanity's offer line beside "Add the look to your bag" (no package owns it).
14. Drops: "New in the garden" sits on ivory under a Night page (F4A's).
