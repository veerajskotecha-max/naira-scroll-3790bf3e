# Corset take × Woven Gold Hoops — five cuts

One 24.2 s take: she wears the brocade corset and the **Woven Gold Hoops** (₹1,499,
live and in stock on 12 Oct 2026). Three songs came with it. These scripts rebuild five
cuts from it, three posts and two ads. Each cut is 1080x1920, 30 fps and loops
seamlessly. The videos are not in git.

| Cut | Song | Length | Idea | How it loops |
| --- | --- | --- | --- | --- |
| **post1 · The Cover** | a (instrumental, 93.7 BPM) | 24.2 s | She is the cover of NAIRA No. 01, with the masthead **behind her head**. Cover lines build on the beat. The hair comes down on the lift. A loupe and a tag follow, then contact-sheet prints drop. | A shutter on the last downbeat closes onto the cover, which is also frame 1. |
| **post2 · Two Little Moons** | b (dreamy vocal, 119 BPM) | 24.2 s | A blush moon hangs behind her the whole time, and her hoops are the "two little moons". An orbit runs round the hoop, stars twinkle on the beat, and a ring bursts off the hoop at the cut. | A ring edit: it opens 16.627 s into the take and ends there. |
| **post3 · Festive Mode** | c (dance-pop, 125.3 BPM) | 24.2 s | Re-cut on every bar. Giant words slam in **behind her**, kinetic lines sit in front, and the drop flashes as her hair comes down. It adds a pinned tag, a ticker behind her, an echo triptych, a sign-off card and a stutter. | The stutter on the hair flip runs out at 20.05 s, where the first shot starts. |
| **ad1 · Doing all the work** | c from the drop (7.536 s) | 15.3 s | A giant ₹1,499 sits behind her as the hook. A single hoop from the product shoot flips in and hands over to her real one. Then come a loupe, benefit chips, the ticker, the tag, the offer and the shop card. | The shop card cuts to the hook. |
| **ad2 · Hair up or hair down?** | a from 7.369 s | 15.4 s | A split screen with giant UP and DOWN behind her. Rings draw on both hoops ("same hoops."). The halves merge ("either way, the hoops win."), the hair comes down, then the offer and the shop card. | The shop card cuts to the hook. |

The bangle she wears is not listed, so it is never tagged or priced. Posts 1 and 3 tease
it ("next issue: the bangle" and "next drop: the bangle"); the ads do not mention it.

## What makes it work

- **Untouched footage.** Frames are decoded with the BT.709 matrix to lossless PNG, and
  the colour chunks are stripped (`strip_png_color.py` from `../halo-baroque-v5`). The
  only pixels that change are under graphics. No grade, no blur, no frame blending.
- **Depth.** Every frame has a person matte (`track/mattes.py`: the MediaPipe multiclass
  selfie segmenter, then a guided filter on the frame's own edges). The engine lays a
  matte-cut copy of her over anything in `#behind`, so the masthead, the giant words,
  the moon and the ticker pass behind her head. A solid-colour backdrop swap was tried
  on post3's drop and dropped: during the hair release the hair outline read as
  machine-cut.
- **The hoop track** (`track/hoop4.py` then `track/clean4.py` → `engine/hoopL.json`).
  The first tracker keyed on G/R, which skin shares, so whenever the hoop went behind
  her hair it slid onto her jaw. v4 tells gold apart by hue (20–46°; skin is at
  15–19°), saturation and texture, and searches a face-relative window. A detection
  counts only at ear height (the choker sits at 1.1 face heights). Frames 674–687
  (fingers over the hoop) are excluded by eye. Every run was checked frame by frame.
  Runs: 1–161, 169–372, 408–459, 467–548, 559–603, 631–672, 688–726. Each frame carries
  a fade factor that goes to 0 at an occlusion, so rings and leaders leave before the
  hoop goes behind her hair. Every hoop graphic is timed inside a run.
- **The loupes** hold frame 541, the sharpest frame of the hoop (Laplacian variance),
  magnified 2.3× with a slow push. A live crop showed hair whenever she turned.
- **The brand bug** sits top left. Measured over every frame, her head covers it 13–30%
  of the time there, against 54–74% at top centre. It fades out whenever her head is
  about to pass under it, and in post2 it yields to the price card.
- **Giant type** is fitted to the frame width once the fonts load, so nothing runs off
  an edge.
- **The face audit.** `probe.mjs` checks every 0.1 s that no card or caption sits on her
  face. The only overlaps left are deliberate: post1's contact-sheet prints and ad1's
  hoop passing her cheek in flight.

## Build

`R` is this folder. Set `WORK` to the asset root (see below). Copy `engine/` to
`$WORK/v13/eng`, because the page loads frames and fonts by relative path.

```
cd $WORK/v13/work && MODEL=selfie_multiclass_256x256.tflite python3 $R/track/mattes.py 1 726
YUNET=face_detection_yunet_2023mar.onnx python3 $R/analysis/faces.py && python3 $R/analysis/beats.py
python3 $R/track/hoop4.py $WORK/v13/track/raw4.json && python3 $R/track/clean4.py   # -> eng/hoopL.json
cd $WORK/v13/eng && python3 data.py && for v in post1 post2 post3 ad1 ad2; do node render.mjs $v out_$v; done
python3 $R/audio/mix.py && for v in post1 post2 post3 ad1 ad2; do $R/encode.sh $v naira-corset-$v.mp4; done
python3 $R/qc.py post1 && python3 $R/qc.py post1 naira-corset-post1.mp4   # pass 1: frames, pass 2: the encode
node probe.mjs post1                                                     # captions vs her face, every 0.1 s
```

`beats.py` and `faces.py` reproduce the `songs.json` and `faces.json` these cuts were
timed to. Beat grids are identical; faces were spot-checked on 21 frames with 0 differences.
`render.mjs` skips frames it has already rendered. After a change, either render into a
new folder or delete the frames that changed.

## Checked (12 Oct 2026)

| Cut | Frames | Size | Loudness | PSNR vs the PNGs | Loop seam |
| --- | --- | --- | --- | --- | --- |
| post1 | 726 | 27.6 MiB | -14.0 LUFS, -2.5 dBFS | 39.7-41.8 dB | identical frames (diff 0.0) |
| post2 | 726 | 27.6 MiB | -14.1 LUFS, -3.1 dBFS | 39.2-42.0 dB | next frame of the take |
| post3 | 726 | 27.4 MiB | -14.1 LUFS, -2.6 dBFS | 39.5-42.7 dB | next frame of the take |
| ad1 | 460 | 25.7 MiB | -13.5 LUFS, -2.5 dBFS | 41.3-43.7 dB | shop card to hook |
| ad2 | 461 | 25.9 MiB | -13.4 LUFS, -2.4 dBFS | 40.7-43.6 dB | shop card to hook |

All are H.264 High, yuv420p, BT.709 limited range and tagged, with AAC at 256 kb/s and 48 kHz.
The ad soundtracks are cut to the frame count exactly. With `-shortest`, an audio track
15 ms short dropped the shop card's last frame.

## Assets beside the scripts (none are in git)

Set `WORK` to the folder that holds them. The scripts expect this layout:

- `v13/work/fr/f_0001..0726.png`: the frames, chunks stripped.
- `v13/work/matte/m_*.png`: the mattes, as alpha-only PNGs.
- `v13/work/song_{a,b,c}.wav`: the three uploads' audio at 48 kHz.
- `v13/work/prod/hoops_cut.png`: birefnet cut of `hoops_1.jpg`, the pair, used on the shop
  card.
- `v13/work/prod/hoop1_cut.png`: one hoop, cut from `hoops_2.jpg`. Crop (110, 450, 540, 990),
  2× Lanczos, then `cutout.py birefnet-general`.
- `pk/marks2.json`: the wordmark and flower paths.
- `fonts/`: Cormorant Garamond and Jost.

## Before these run

- **Prices are literals.** ₹1,499 appears on the tags, the sticker, the giant type and
  the shop cards. The offer card reads "any 2 pieces 10% off, any 3 pieces 20% off,
  applied automatically in your bag", which is the ladder in `src/lib/promo.ts`.
  "Free delivery · COD available" matches `SHIPPING_CHARGE = 0` and the product page's
  wording; the COD fee is stated in the bag. If the price, the ladder or shipping
  changes, these cuts are wrong.
- **Music in the ads.** The songs came with the take. Meta can mute commercially licensed
  music in paid placements. If it does, swap in a Sound Collection track, and leave
  Advantage+ music enhancements off.
