# Halo Curve Ring + Baroque Pearl Lariat — v4

The jewellery-first cut of the Halo/Baroque ad: 39.65 s, 1080x1920, 30 fps, about
27.3 MB, -14 LUFS / -1.5 dBTP. It comes in two versions, one with the original music
bed and one with voice and SFX only. The video is not in git. These scripts rebuild it.

v3 framed the model and put graphics beside her. v4 frames the pieces. Every ring
shot is a tracked macro push, and the two products get their own moments:

| Output | Picture | Graphic |
| --- | --- | --- |
| 0–1.9 | Ring by her face, 2.15→1.6, pulling out | The two DMs and ×2 |
| 1.9–4.7 | S1, the hand rising, 1.35→1.85 | Glint on "ring" |
| 4.7–6.9 | S2, 1.85→1.95 | Tiger eye (right) and champagne crystal (left) callouts, level line on "flat" |
| 6.9–8.8 | S4, 1.75→1.9 | Sage and blush circles on "match", "on purpose." |
| 8.8–10.8 | S3, ring at her chin | "on purpose." holds |
| 10.8–13.2 | **Ring hero**: the new cut-out on blush ground, opened by an iris from the ring's place in the frame before | Light sweep masked to the metal, glints on each stone as the stone is described, Halo tag |
| 13.2–15.85 | S5, 1.95→2.1 | "adjusts to fit" icon |
| 15.85–17.45 | Standing, tight on the lariat (1.75) | Lariat tag |
| 17.45–21.75 | **Pearl macro print**: `lariat_3.jpg` matted on its own blurred copy, pushing from the slider down onto the drop pearl | A blush outline round the real pearl that changes shape on each word of "no two pearls have exactly the same shape", then "one of one." |
| 21.75–26.95 | Standing, tight | Slider panel and length gauge |
| 26.95–31 | Both pieces | The pair card |
| 31–34 | Her, lip-synced | The answered DM |
| 34– | The exit | Card flip into the sage and blush NAIRA end card |

## How the camera works

- **The world transform.** It is `translate(tx, ty) scale(z)` from the origin. `tx` and
  `ty` are clamped so the frame always covers the screen. The ring is aimed at
  (540, 800); the lariat is aimed lower and the bottom edge holds.
- **The camera path.** `engine/data.py` builds it per source frame. For S2, S4 and the
  hook it follows the stone-pair track (`ring_pair.json`, from `track_pair.py`). For
  S1, S3 and S5, where that track never ran, it follows hand-placed keys. It is then
  Gaussian-smoothed (sigma 3–5 frames), so the frame follows the ring like an
  operator would rather than sticking to it.
- **Depth of field.** A blurred copy of the frame sits under a sharp copy, and the
  sharp copy is masked to a circle about 440 px across on screen. The circle is
  centred on the tracked stones, or on the camera where there is no track. It is wide
  enough to keep her hand sharp, because a blurred hand round a sharp ring read as a
  mistake. The standing shots get an ellipse along the chain.
- **Tracked graphics.** These are drawn in screen space through `toS(x, y)`, so labels
  keep their size at any zoom.
- **Sharpening.** The encode adds `cas=0.4`, which takes the softness off a 2× push
  into phone footage.

## Assets beside the scripts (none are in git)

Set `WORK` to the folder that holds them.

- **Source footage and frames.** The source is the 1080p clip from Drive. `srcf/` holds
  the graded frames, 1240 of them.
- **Voice and music.** These are `vo_*.wav`, `timeline.json` and `music_bed.wav`.
- **Product photos.** These are in `prod_dl/`.
- **Ring cut-out.** This is `cut4/ring_cut.png` (777x618). It is made from
  `prod_dl/ring_2.jpg`:
  1. Crop to (205, 305, 535, 575).
  2. Upscale 3x with Lanczos.
  3. Sharpen lightly with `UnsharpMask(2, 50, 2)`.
  4. Run `python3 cutout.py birefnet-general` on it, one image per process. A second
     image in the same process runs out of memory.

The old `cut/ring_block.png` was 258 px wide and is no longer used.

## Build

```
python3 audio/vo.py && python3 audio/music.py
cd engine && python3 data.py && node render.mjs out5 && cd ..
python3 audio/mix.py && python3 audio/mix_nomusic.py
./encode.sh                     # two-pass x264, fails above 30 MB
```

`render.mjs` skips frames it has already rendered. After a change, either render into
a new folder or delete the frames that changed.

## Sound

There are 14 soft cues, no ticks and no swishes on lines. v4 adds three to v3's set:
- a whoosh as the iris opens on the ring
- a sparkle on the tiger eye in the cut-out
- a whoosh as the pearl print lifts in

The pearl sparkle now lands as the outline starts drawing.

## Before this runs as an ad

- **Prices are literals.** They are ₹2,049 and ₹1,599 on the tags, and
  `P_FROM`/`P_TO` 3648 → 3283 in `engine/index.html`. The pair price is BUY2 at 10%
  (`src/lib/promo.ts`). If a price or the rate changes, the tags, the pair card and the
  end card are all wrong.
- **Free delivery** is what the bag charges today (`SHIPPING_CHARGE = 0`).
- **Music.** The bed is an original synth in this repo's `audio/music.py`, so it is
  cleared.
