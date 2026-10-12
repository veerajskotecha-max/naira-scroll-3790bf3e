# Corset take × Woven Gold Hoops — three ads, two posts

One 24.2 s take: she wears the brocade corset and the **Woven Gold Hoops** (₹1,499, MRP
₹2,769, live and in stock on 12 Oct 2026). Three songs came with it. These scripts
rebuild five cuts from it. Each cut is 1080x1920, 30 fps, 14–15.4 s, and loops. The
videos are not in git.

The **ads** carry the brand and the price from the first seconds and end on a shop card.
The **posts** are built to travel. Each opens on a joke or a question in frame 1, uses
captions styled like Instagram's own text, and carries no logo and no price. The one
`@nairaflore` in each is a punchline or a credit. The missing price is what people
will comment to ask for. The first round (three posts and two ads, the posts at 24.2 s)
is in git history at c8c4928.

| Cut | Song | Length | Idea | Loop |
| --- | --- | --- | --- | --- |
| **ad_cover · The Cover** | a from 7.369 s, 6 bars | 15.4 s | She is the cover of NAIRA's festive issue. The masthead sits **behind her head**, the headline reads "the ₹1,499 hoops.", and a 46%-off sticker is there in frame 1. The loupe holds the braid. The benefits land on the beats. Her hair falls on the song's lift. Then the tag, and a shutter onto the back cover (the shop card). | shop card → cover |
| **ad_work · Doing all the work** | c from the drop (7.536 s), 8 bars | 15.3 s | A giant ₹1,499 sits behind her, with a 46%-off sticker. A single hoop from the product shoot flips in and hands over to her real one. Then the loupe, benefit chips, the ticker behind her and the tag, the offer, and the shop card. | shop card → hook |
| **ad_moons · Two little moons** | b from 4.55 s, 7 bars | 14.1 s | A blush moon hangs behind her head, and an orbit runs round the hoop. The name and price arrive in bar 2. A ring bursts off her hoop at the cut. Then the tag, the offer, and a shop card where the hoops sit on the moon. | shop card → hook |
| **post_mummy · Mummy vs me** | c from 1.792 s, 8 bars | 15.3 s | "every diwali with mummy 🪔". Mummy, in a chat bubble: "wear the heavy jhumkas for diwali 🙏". Me: "mummy trust me 💅". Then "wait for it." Her hair comes down on the drop, with HOOPS behind her: "not jhumkas. 😌". Then "gold-ish ✨ / waterproof · tarnish-free". Mummy, 2 seconds later: "beta where are these from?? 😍😍". Me: "@nairaflore 😌". Then "send this to your mummy 😭". | cut on the downbeat |
| **post_poll · Hair up or hair down?** | a from 4.808 s, 6 bars | 15.4 s | A split screen in frame 1, with giant UP / DOWN behind her heads and "hair up or hair down?". Rings draw on both hoops ("same hoops."), then "comment UP or DOWN 👇". The halves merge: "wait— tie-breaker 👀", "watch this.". Her hair falls on the lift: "okay hair down hits different (the hoops win either way)". Then "your turn: UP or DOWN? 👇". | cut on the downbeat, back to the split |

The bangle she wears is not listed, so no cut mentions it.

## What makes it work

- **Untouched footage.** Frames are decoded with the BT.709 matrix to lossless PNG, and
  the colour chunks are stripped (`strip_png_color.py` from `../halo-baroque-v5`). The
  only pixels that change are under graphics. No grade, no blur, no frame blending.
- **Depth.** Every frame has a person matte (`track/mattes.py`: the MediaPipe multiclass
  selfie segmenter, then a guided filter on the frame's own edges). The engine lays a
  matte-cut copy of her over anything in `#behind`. That is how the masthead, the giant
  price and words, the moon and the ticker pass behind her head. A solid-colour backdrop
  swap was tried and dropped: during the hair release, the hair outline read as
  machine-cut.
- **The hoop track** (`track/hoop4.py` then `track/clean4.py` → `engine/hoopL.json`).
  - **Why it was rebuilt.** The first tracker keyed on G/R, which skin shares, so
    whenever the hoop went behind her hair it slid onto her jaw.
  - **How v4 finds the hoop.** It tells gold apart by hue (20–46°; skin is at 15–19°),
    saturation and texture, and searches a face-relative window. A detection counts
    only at ear height; the choker sits at 1.1 face heights.
  - **Checking.** Frames 674–687 (fingers over the hoop) are excluded by eye. Every run
    was checked frame by frame. The runs are 1–161, 169–372, 408–459, 467–548, 559–603,
    631–672 and 688–726.
  - **Fading.** Each frame carries a fade factor that goes to 0 at an occlusion, so
    rings and leaders leave before the hoop goes behind her hair. Every hoop graphic is
    timed inside a run.
- **Faces.** `analysis/faces.py` interpolates any detection that jumps more than 0.35
  face-widths from its neighbours. Frame 702 had found a box at y 967–1822. The moon
  follows the averaged face, so that one frame would have dipped it 43 px for half a
  second.
- **The loupes** hold frame 541, the sharpest frame of the hoop (Laplacian variance),
  magnified 2.3× with a slow push. A live crop showed hair whenever she turned.
- **Prices** are drawn as the product page draws them (`JewelPriceTag`): ₹1,499, ₹2,769
  struck through, then 46% OFF, rounded the same way. They appear on the tags, the
  sticker and the shop cards. The shop card adds the bag's ladder (any 2 · 10% off,
  any 3 · 20% off) and free delivery · COD.
- **The ads' brand bug** sits top left. Measured over every frame, her head covers it
  13–30% of the time there, against 54–74% at top centre. It fades whenever her head is
  about to pass under it, and it yields to cards that take its corner. The cover ad's
  masthead is its logo from frame 1.
- **The posts** use Instagram's own "background" text look (one box per line) in the
  brand's ivory and blush, plus chat bubbles. Every caption sits under her chin. Post
  text keeps to x < 940 below y 1100, clear of Instagram's like and comment buttons.
- **Giant type** is fitted to the frame width once the fonts load, so nothing runs off
  an edge.
- **Sound.** Each cut takes its song from the downbeat its edit starts on, for a whole
  number of bars. It is levelled to -14 LUFS on that section's own loudness (a
  BS.1770 meter in `audio/mix.py`, matching ffmpeg's `ebur128` to 0.1 LU). The ads fade
  under the shop card; the posts cut on the downbeat.
- **The face audit.** `probe.mjs` checks every 0.1 s that no card or caption sits on her
  face. The only overlap left is deliberate: in ad_work, the flying hoop passes her
  cheek.

## Build

`R` is this folder. Set `WORK` to the asset root (see below). Copy `engine/` to
`$WORK/v13/eng`, because the page loads frames and fonts by relative path.

```
V="ad_cover ad_work ad_moons post_mummy post_poll"
cd $WORK/v13/work && MODEL=selfie_multiclass_256x256.tflite python3 $R/track/mattes.py 1 726
YUNET=face_detection_yunet_2023mar.onnx python3 $R/analysis/faces.py && python3 $R/analysis/beats.py
python3 $R/track/hoop4.py $WORK/v13/track/raw4.json && python3 $R/track/clean4.py   # -> eng/hoopL.json
cd $WORK/v13/eng && python3 data.py && for v in $V; do node render.mjs $v out_$v; done
python3 $R/audio/mix.py && for v in $V; do $R/encode.sh $v naira-corset-$v.mp4; done
for v in $V; do python3 $R/qc.py $v && python3 $R/qc.py $v naira-corset-$v.mp4; done   # pass 1 frames, pass 2 encode
for v in $V; do node probe.mjs $v; done                                   # captions vs her face, every 0.1 s
```

`beats.py` and `faces.py` reproduce the `songs.json` and `faces.json` these cuts were
timed to. The beat grids are identical. The face detections were spot-checked on 21
frames with 0 differences, and the clean-up reproduces the file exactly. `render.mjs`
skips frames it has already rendered, so after a change either render into a new folder
or delete the frames that changed.

## Checked (12 Oct 2026)

| Cut | Frames | Size | Loudness | PSNR vs the PNGs | Loop |
| --- | --- | --- | --- | --- | --- |
| ad_cover | 461 | 25.8 MiB | -14.1 LUFS, -3.6 dBFS | 41.1-43.3 dB | shop card → cover |
| ad_work | 460 | 25.7 MiB | -14.1 LUFS, -3.1 dBFS | 41.2-43.5 dB | shop card → hook |
| ad_moons | 423 | 23.9 MiB | -14.1 LUFS, -5.0 dBFS | 41.4-43.3 dB | shop card → hook |
| post_mummy | 460 | 26.0 MiB | -14.0 LUFS, -2.4 dBFS | 39.9-42.7 dB | cut on the downbeat |
| post_poll | 461 | 25.9 MiB | -14.1 LUFS, -2.6 dBFS | 40.6-42.3 dB | cut on the downbeat, to the split |

All are H.264 High, yuv420p, BT.709 limited range and tagged, with AAC at 256 kb/s and 48 kHz.
Each soundtrack is cut to the frame count exactly; with `-shortest`, a track 15 ms short
drops the last frame.

Each 15 s cut is about 700 MB of PNG. When the disk filled, Chromium crashed ("Target crashed",
"Unable to capture screenshot", images in the broken state), and one render hung on the same
frame twice. `render.mjs` now retries a failing frame in a fresh browser, up to three times.
Delete frame folders once their encode has passed QC.

## Assets beside the scripts (none are in git)

Set `WORK` to the folder that holds them. The scripts expect this layout:

- `v13/work/fr/f_0001..0726.png`: the frames, chunks stripped.
- `v13/work/matte/m_*.png`: the mattes, as alpha-only PNGs.
- `v13/work/song_{a,b,c}.wav`: the three uploads' audio at 48 kHz.
- `v13/work/prod/hoops_cut.png`: birefnet cut of `hoops_1.jpg`, the pair, used on the shop
  cards.
- `v13/work/prod/hoop1_cut.png`: one hoop, cut from `hoops_2.jpg`. Crop (110, 450, 540, 990),
  2× Lanczos, then `cutout.py birefnet-general`.
- `pk/marks2.json`: the wordmark and flower paths.
- `fonts/`: Cormorant Garamond and Jost. Emoji come from the system's Noto Color Emoji.

## Before these run

- **Prices are literals.** ₹1,499, ₹2,769 and 46% are in `engine/data.py`. The ladder
  (any 2 · 10%, any 3 · 20%, applied in the bag) is `src/lib/promo.ts`. "Free delivery ·
  COD available" matches `SHIPPING_CHARGE = 0` and the product page's wording; the COD
  fee is stated in the bag. If the price, the compare-at price, the ladder or shipping
  changes, the ads are wrong.
- **post_mummy is a Diwali joke.** After Diwali (8 Nov 2026), change "for diwali" and
  "every diwali" to the wedding season before reposting.
- **post_poll** works best with Instagram's own Poll sticker (UP / DOWN) added in the
  app over bars 1–2. The space between the question and "comment UP or DOWN" is left
  clear for it.
- **Music in the ads.** The songs came with the take. Meta can mute commercially licensed
  music in paid placements. If it does, swap in a Sound Collection track, and leave
  Advantage+ music enhancements off.
