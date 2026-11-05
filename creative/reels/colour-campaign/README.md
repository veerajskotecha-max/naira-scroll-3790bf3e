# Colour campaign: AI studio reels with a colour effect, one per in-stock piece (4–5 Nov 2026)

The owner sent an AI studio film of the Cushion Halo Ring and asked for:
- the same quality for the high-stock pieces;
- each ad with a "crazy", smooth colour effect built into the shots;
- elegant, and not always on black;
- finished with overlays, graphics and features;
- in 4K, one at a time, each analysed before the next;
- two Toggle Link Chain films, using the owner's own clasp photo so the clasp is exact.

## The films

Every ad comes in two shapes, both in 4K:
- **9:16** (2160×3840) for Reels and Stories. Every line of type sits in y 270–1250, which both UIs leave clear.
- **4:5** (2160×2700) for Feed. This is our own crop of the same render, so Meta never crops the hook or the price.

| # | Piece | Length | Colour effect | What is AI, what is real | Rating |
| --- | --- | --- | --- | --- | --- |
| 0 | Cushion Halo Ring | 12.5 s | Pastel CZ "fire" bursts off the stone into the end card; blush light bars | The owner's own AI film, a REAL listing photo of the open back, and one element plate | 8.5 |
| 1 | Prism Rivière Bracelet | 10.6 s | A pastel rangoli draws itself round the bracelet in its own three stone colours | Two Kling shots from frames built on the real photos (the standing shot was cut at the owner's word) | 9 |
| 2 | Verdant Circlet Studs | 12.5 s | Emerald gulal and gold dust pour through a warm beam; green mist off velvet | Three Kling shots | 9 |
| 3 | Baguette Tennis Necklace | 14.4 s | Waves of powder in each colour turn the real necklace crystal → emerald → ruby | PRACTICAL: one AI on-neck shot, then the REAL listing photos with element plates composited over them | 9 |
| 4 | Woven Gold Hoops | 10.0 s | Marigold petals rain onto a brass thali; a haldi on-ear moment | Two Kling shots | 8.5 |
| 5 | Halo Curve Ring | 10.6 s | A desert wind blows amber sand off the ring; sand streams past the hand | Two Kling shots (the reveal is pinned at both ends) | 8.5 |
| T1 | Toggle Link Chain, "Gold rush" | 11.9 s | Gold dust erupts off a jade plate; gold-ivory and jade powder waves | PRACTICAL: one AI clasp macro, the REAL on-model and cube photos | 8.5 |
| T2 | Toggle Link Chain, "Jade & gold" | 11.25 s | A gold-ivory powder cloud sweeps the worn still into the clasp macro | One AI still (pushed in), one AI clasp macro, one plate | 8 |

The ratings are mine. Ad 0 was rated by panels: v1 5.5 / 7.5, and v2 7 / 7.5 / 7 (`notes/ad0-critiques.md`). That run
was cut short, and v3 applies its fixes.

Every ad follows the same template, from the Ad 0 critiques:
- the wordmark, the line and the price (MRP struck) are on frame 1;
- the live offer shows quietly from about 1 s;
- a proof or measurement beat: jeweller's dimension rules at radius 0, or real photos;
- an end card with name, price, offer, free shipping, COD and SHOP NOW;
- a soft cleared score (harp, strings, felt kick) with no tings, mastered to -14 LUFS / -1.5 dBTP.


## Deliverables (sent in chat, 5 Nov; not committed: the video files are 15–26 MB each)

| Ad | 9:16 Reels and Stories (2160×3840) | 4:5 Feed (2160×2700) |
| --- | --- | --- |
| 0 Cushion Halo Ring | `naira-c0-cushion-halo-4k.mp4` (26.0 MB) | `naira-c0-cushion-halo-4x5-feed.mp4` (19.9 MB) |
| 1 Prism Rivière Bracelet | `naira-p1-prism-riviere-4k.mp4` (22.3 MB) | `naira-p1-prism-riviere-4x5-feed.mp4` (17.2 MB) |
| 2 Verdant Circlet Studs | `naira-p2-verdant-studs-4k.mp4` (24.1 MB) | `naira-p2-verdant-studs-4x5-feed.mp4` (18.7 MB) |
| 3 Baguette Tennis Necklace | `naira-p3-baguette-necklace-4k.mp4` (26.4 MB) | `naira-p3-baguette-necklace-4x5-feed.mp4` (21.2 MB) |
| 4 Woven Gold Hoops | `naira-p4-woven-gold-hoops-4k.mp4` (19.8 MB) | `naira-p4-woven-gold-hoops-4x5-feed.mp4` (15.6 MB) |
| 5 Halo Curve Ring | `naira-p5-halo-curve-ring-4k.mp4` (20.9 MB) | `naira-p5-halo-curve-ring-4x5-feed.mp4` (16.2 MB) |
| T1 Toggle Link Chain, Gold rush | `naira-t1-toggle-chain-gold-rush-4k.mp4` (22.8 MB) | `naira-t1-toggle-chain-gold-rush-4x5-feed.mp4` (17.6 MB) |
| T2 Toggle Link Chain, Jade & gold | `naira-t2-toggle-chain-jade-gold-4k.mp4` (22.5 MB) | `naira-t2-toggle-chain-jade-gold-4x5-feed.mp4` (17.4 MB) |

All are H.264 High 5.1, 24 fps, AAC 256k, -14 LUFS integrated / -1.5 dBTP. To rebuild any of them:
`bash tools/finish_all.sh <scratchpad>`. The build scripts read frames from `<scratchpad>/ads/frames`, which come
from the Higgsfield jobs in `notes/shots-and-prompts.md`.

## How it is made
1. **Start frames.** nano_banana_2_1 at 2K, built on the real listing photos. Each frame is checked against the photo
   (stone colour, cut, count pattern, claws, clasp) before any motion credit is spent.
2. **Motion.** Kling 4.0, 5 s, 1080p. Where the piece transforms (the rangoli, the colourway change, the sand reveal),
   BOTH the start and the end frames are pinned to the real piece.
3. **Element plates.** veo3_1_lite powder plates shot alone on black. `tools/plate.py` turns each into RGBA (coverage
   from luminance, colour un-premultiplied, a mask for stray flares). The engine composites them as real, occluding
   powder over real photos, so the AI never repaints the jewellery.
4. **4K.** A Topaz 2160p upscale of each clip, then the engine renders type and graphics natively at DPR 2.
   - The Halo Curve hand shot and the Toggle clasp macro are 1080, upscaled in the render: the account ran out of
     credits before their Topaz pass.
5. **Engine.** v4 (`engine/engine4.js`) adds:
   - per-shot blend and alpha;
   - RGBA plates (png or webp);
   - keyed clips with no background;
   - gradient and image worlds;
   - per-shot colour grades (`g_neutral` takes the AI film's warm cast off rhodium).

   The offer is one editable slot (`tools/col_kit.py`: OFFER2, OFFER3).
6. **Finishing.** `tools/finish_all.sh` mixes, masters, renders 4K and encodes both shapes (`encode2.sh` for 9:16,
   `encode45.sh` for 4:5, at H.264 High 5.1).

Every AI job id and prompt is in `notes/shots-and-prompts.md`. The Toggle clasp reference, the owner's photo cleaned of
its measurement line, is in `refs/`.

## Claims
Every claim comes from the listings:
- "PVD 18K gold coating", never bare "18K gold"; "PVD rhodium";
- CZ named as CZ ("emerald-green CZ", never emerald);
- "waterproof, tarnish free" (listing care text) and "3-year plating assurance";
- measurements: 8 mm / 12 mm, 16.8 mm, 6 mm / 36 cm, 50 cm / 4 mm / ~15 mm clasp, about 25 mm.

**The offer is the live ladder, BUY2 10% and BUY3 20%.** It was re-checked in Shopify on 4 Nov: the owner moved it back
from 20/30 on 3–4 Nov. Re-check it on launch morning and change `col_kit.py` if it moves.

**Warning: the hero-v6 films quote the OLD 20%/30% ladder** in their voice and cards. Do not run them until they are
updated.

## Open for the owner
- **4K for two shots.** The Halo Curve hand shot and the Toggle clasp macro have no 4K pass yet. That needs about 20
  Higgsfield credits.
- **The Toggle 2 neck still.** It is a still with a push-in. A Kling pass of the gold-dust swirl (16 credits) would make
  it move.
- **Ad 0's open back.** Its AI film shows a closed band. The real-photo beat ("NO RING SIZE NEEDED / Open back") is the
  answer, and its turn is framed tight on the head so the closed back stays out of shot.
