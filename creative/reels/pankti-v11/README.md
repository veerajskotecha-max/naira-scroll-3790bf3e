# Pankti x Naira — v11

The motion-graphics cut of Pankti's reel: 19.6 s, 1080x1920, 30 fps, about 26.8 MB,
-14 LUFS. It supersedes `../pankti-v7`. The video itself is not in git; every
input and output listed below lives beside these scripts when built.

The copy is unchanged from v7, one sentence across the cuts: *not all gold /
has to shine. / satin, not mirror. / closes with a turn. / worn together, /
every day.* What changed is everything drawn over the footage, plus the exit.

## What is on screen

| Shot | Graphic |
| --- | --- |
| Hook (huggies in hand) | Words land on the first three beats; tracked glints and dust on both huggies |
| Ear | "shine." lands with an optical streak on her real earring |
| Huggies box | Swing tag, **BRUSHED GOLD HUGGIES ₹1,099**. It lands just after the cut, and its thread runs through the eyelet to a knot on the huggie |
| Ear | "satin, not mirror." on eighth notes; a blush slash strikes "mirror." on the beat |
| Toggle box | Swing tag, **TOGGLE LINK CHAIN ₹1,499**, knotted to the link above the pavé ring |
| Chain swings | Glints on the beat |
| Toggle turned | A bezel dial around the tracked toggle. A blush comet draws it in one lap, then clicks a quarter turn on each beat, flaring the tick it lands on. "turn." turns once on its axis |
| Worn together | Split screen: counter-sliding panels, a window that follows the pendant, callout circles |
| Every day | Weekday pills light up on eighth notes; the full week holds before the cut |
| Exit | The frame shrinks into a card, flips to a blush back with the flower, and grows to fill the screen. The flower flies into the I of the sage NAIRA wordmark and the letters wipe out from it. The pieces rise, the price counts down from ₹2,598 (the two bought apart) to ₹2,338, and the address follows |

It uses the brand's colours only: sage `#99B4AF`, the deep sage `#50726A` (the
footer CTA), blush `#FFBDA8` and ivory. There is no gold anywhere in the
graphics; the gold is the jewellery's.

## Rules the edit keeps (a finishing pass found each of these broken)

- **A graphic ends on the cut's frame, not on the beat.** The plate rounds each
  cut to a frame, which can be up to half a frame before the beat. `bc(k)` in
  `engine/index.html` is that frame, and every shot-bound layer keys off it.
  Keyed off `b(k)`, "every day." hung one frame over her face on the next shot.
- **Nothing that matters goes below y 1248**, which is Meta's caption zone.
  The necklace shots are cropped from the bottom (`fy=1.0`) and "every day." is
  zoomed to 1.28 for that reason. The fasten shot ends at 16.55 s in the raw,
  because after that the ring drops into the zone.
- **Hand-offs have no step.** The card's back is the end card's own ground,
  and its tint and border fade out as it grows. The flower leaves the card
  upright. The watermark and the petals behind come up only once the card has
  gone.
- **No frame shows a price that is not real.** The odometer only ever passes
  through figures between ₹2,598 and ₹2,338. Spinning up from zero, it used to
  show totals like ₹9,740.
- **Legible at phone size:** tag names have about 22 px caps, the weekday
  letters are 33 px, and no petal crosses the wordmark, the pieces or the price.

## Build

Put these beside the scripts, none of which are in git:

- `pankti_raw.mp4`, her 31.5 s cut.
- An ffmpeg with zscale/tonemap (`pip install imageio-ffmpeg`, then symlink it
  as `ffmpeg` or set `FFMPEG`).
- `fonts/CG.ttf`, `fonts/CG-Italic.ttf` and `fonts/Jost.ttf`, renamed as in v7.
- The two product cut-outs:
  - `hug.png` (373x230): the brushed gold huggies product photo through rembg's
    `birefnet-general`.
  - `tog_sharp.png` (482x624): the toggle link chain photo on velvet, cut out
    the same way, then `ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2)`.

Then run:

```
python3 plate.py                  # plate.mp4, frames/, panelL/, panelRw/ (about 4 min)
python3 sfx.py                    # sfx/*.wav, the synthesised kit (seeded, so identical every run)
cd engine && npm i playwright-core && python3 data.py && node render.mjs out && cd ..
python3 mix.py                    # mix.wav: her track from its first beat plus the SFX, -14 LUFS / -1.5 dBTP
./encode.sh                       # naira-pankti-v11.mp4, two-pass, fails above 30 MB
```

`render.mjs` needs Chromium; set `CHROME` to override its path. It relaunches
the browser every 120 frames and skips frames already rendered. After a change,
render into a new folder, or delete the stale frames first.

`plate.py` reproduces the plate the tracks were measured on, byte for byte.
Its push-in grows from the crop's top-left corner, not from the focus point:
the crop offset comes from each shot's first frame, while the scale enlarges
the frames after it. **If a shot's timing, zoom or crop changes, re-measure its
tracks**, because every tracked graphic sits on those coordinates:

```
FRAMES=frames python3 track.py spec.json out.json       # texture (NCC): huggies, earrings, the pavé ring (dr4)
FRAMES=frames python3 ringtrack.py spec.json out.json   # Hough on a gold map: the toggle ring (ring5, ring7)
```

`tracks.json` holds the smoothed, hand-checked result, with these fixes:

- dr2 holds frame 82 over 78–81.
- ring5 was re-tracked on the big ring from 201, and ring7 from 253 to 270.
- dr4 follows the pavé ring by texture; 146–147 hold 148.

## Before this runs as an ad

- The prices are literals. They are ₹1,099 and ₹1,499 in `engine/data.py`, and
  2598 and 2338 as `P_FROM`/`P_TO` in `engine/index.html`. The bag applies
  BUY2 at 10% (`src/lib/promo.ts`). If a price or the rate changes, the tags
  and the end card are wrong.
- The music is the sound Pankti posted with. Confirm it is cleared for paid use.
