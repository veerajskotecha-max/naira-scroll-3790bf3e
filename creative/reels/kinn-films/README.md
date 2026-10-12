# Kinn Films shoot — seven concept reels and a 30 s best-parts cut

27 unique handheld clips from the Kinn Films shoot (10:43 in all, 720x1280 HEVC, full-range
BT.709, no audio): one look, the brocade corset, the **Woven Gold Hoops** (live), a kada and
a two-stone ring (neither is listed, so neither is ever tagged or priced). These scripts
cut seven concept posts from them, each 1080x1920 at 30 fps, plus a 30 s best-parts cut.
The videos, frames and mattes are not in git.

Every reel starts on a downbeat of its song, so beat k of a reel is at `k * beat` seconds,
and every cut lands on a frame. Each one is built round one moment in its song.

| Reel | Song (from) | Length | The idea | Built on |
| --- | --- | --- | --- | --- |
| **diwali · Diwali look loading…** | B (12.284 s) | 21.9 s | A blush bar fills one item a bar: kada, ring, hoops. It stalls at 43% on a lost earring back (a retry / cry dialog), holds at 99% while she pulls the clip, and hits 100% on the drop. Then 8 bars of the look with a transition on every hit: DIWALI behind her (person matte), pinned ✓ labels, strips, a 3×3 grid, a sticker beat. Ends "diwali look: loaded ✨" and the bar resets for the loop. | B's silence (22.20–22.45 s) and drop (23.24 s) |
| **hair · Hair up or hair down?** | C (1.758 s) | 15.4 s | Split screen with UP / DOWN stamps, a duel of whips cut on every half beat with a tug-of-war meter, a tie in the breakdown, the clip out on the drop with HAIR DOWN behind her. A speed gun on the spin (132.4 km/h), a fake-out on the one hair-up close-up, the vote. | C's drop (7.518 s) |
| **pawan · Introducing Pawan Kumar** | B (12.284 s) | 16.4 s | A letterboxed 90s heroine entry with a checklist. The look and the hair tick on the beat; on B's silence it freezes on the hand fan, the bars snap off, everything but the fan dims, and the fan gets a filmi debut card. She breaks on the drop; credits roll. | B's silence and drop |
| **cyc · Choose your character** | A (4.182 s) | 12.9 s | A fighting-game select screen of six live tiles, the cursor on every beat. Power-ups (hoops, kada, ring), the hair tornado combo, a boss HUD; the final boss (the fan) arrives in A's bass gap; K.O. on the bass return. Back to the grid: comment 1–6. | A's bass gap (14.0 s) and return (15.26 s) |
| **onephoto3 · I asked for ONE photo** (the one to post) | D at its felt 92 BPM (0.245 s) | 26.1 s | Re-cut at the owner's ask to the song's own slow groove, every cut on a kick. The ask over four posed shots (cover, hoop, side profile, profile), the Naira line landing as the bass comes in (2.9 s). The bestie's notification, then the gallery in the song's breakdown (`tools/gallery.py` with `engine/gallery3_order.json`, so thumbnail N is VIDEO N), a tap and a zoom into video 1 on the bass's return. Sixteen videos, one a beat and then two a beat as the groove fills out, under a REC counter; video 19 freezes on the fan; her laugh plays in the silence (video 27/27, "DP status: still pending"). A shutter on the drop opens on the DP, which settles into a profile circle with a sage-and-blush ring that breathes on the beat; hearts on the heavy kick (21.1 s), three comments one a beat, and her reply on the biggest bass hit (23.7 s): "@nairaflore ✨ woven gold hoops", with her new DP as its avatar. | D's bass entry, breakdown, silence (17.25–17.52 s), drop (17.849 s), kick (21.1 s) and sub hit (23.72 s) |
| onephoto2 · second cut | D (12.633 s) | 14.3 s | The DP request in chat, with the reason: "naira wale hoops pehne hain, dikhne chahiye ✨". A notification, her gallery of the 27 real clips (`tools/gallery.py`) holding on D's silence, a snare zoom into video 1, 27 cuts from D's drop under a REC counter, the fan freeze on video 19, "DP status: still pending" on her laugh. On D's bass hit a camera shutter opens on the DP she wanted (041FCDC6 8.50 s: eyes to the lens, hoop in), which settles into a profile circle with a sage-and-blush story ring that pulses on the beat, a product tag on the hoop ("Woven Gold Hoops · @nairaflore") and "profile photo updated ✓". | D's silence (17.25–17.52 s), drop (17.849 s) and bass hit (23.717 s) |
| onephoto · first cut | B (17.762 s) | 13.7 s | The same idea on B, ending on her laugh as the DP. Replaced at the owner's ask: the DP should be a photo where she looks her best. | B's silence and drop |
| **hoop · POV: you're her hoop** | C (1.758 s) | 15.4 s | The hoop narrates in speech bubbles pinned to it frame by frame (`tools/track.py`), one a bar; the kada answers back in blush. | C's drop |
| **maine · Kisne diya? Maine.** | A (11.567 s) | 11.1 s | The Diwali-party aunty asks who gave it, mummy or the in-laws; typing dots through A's bass gap; "Maine." slams on the return; khud kamaya, khud liya; a gift tag pinned to the hoop. | A's bass gap and return |
| **best30 · Best parts** | B (1.328 s) | 30.0 s | 23 shots, no text, no grade, no fan, one 1.2 s laugh to close. Cut on B's beat so the clip comes out on the silence and her hair falls on the drop (beat 64). Also delivered silent. | `sel/best30b.py` |

**Mix and match.** Three reels also come on a second track (`tools/altmix.py`, then
`tools/remux_alt.sh`, which keeps the picture as a stream copy): hair and hoop on A, slowed
3.8% to 125 BPM with rubberband (pitch kept) so A's bass return lands on the hair drop; maine
on C, sped up 4% to 130 BPM so C's drop lands on "Maine.". The script measures the bass jump
in the stretched audio and corrects the placement (rubberband added 7–15 ms). A runs out
0.28 s early under hair and hoop, so its last full bar is repeated with a 15 ms crossfade.
The B reels have no partner: nothing else is near 175 BPM.

Songs: **B** is the owner's Diwali track (175.24 BPM, beat 0.34238 s, beat 0 of the grid at
1.3277 s, drop on beat 64 at 23.240 s). **C** is the dance-pop track (125.00 BPM, beat 0 at
0.3178 s, drop at 7.518 s). **A** is the 808 instrumental (129.99 BPM on its 808s, beat 0 at
0.489 s, bass gap from 14.0 s, back at 15.26 s). The grids were re-measured on 12 Oct; the
older corset-hoops grids for A and B were off. **D** is the song from the owner's own edit of
this shoot (sent 12 Oct as `8BB38387-….mp4`, audio extracted): 184.05 BPM, beat 0.3260 s, beat 0
of the grid at 0.245 s; the gap runs 17.25–17.52 s, a snare hits at 17.54 s (beat 53), the drop
lands at 17.849 s (beat 54) and a sub hit at 23.717 s (beat 72). Measured in the final file: the
snare 8 ms and the drop 33 ms after their cuts (one frame), the shutter 5 ms after its cut.
D is felt at half that rate, 92 BPM (**D2** in `build.py`: beat 0.65201 s, kicks on these beats, the
snares and hats between them), which is how onephoto3 is cut. Measured in its final file, the bass
entry, the drop, the heavy kick and the sub hit each land 0–25 ms after their cuts.

**The DP** is the best frame in the shoot, not a guess. `tools/dp_rank.py` scores all 18,639
single-face frames from the scan: face sharpness, stillness, eyes open and to the lens (head yaw
corrected by the eye blendshapes), mouth closed or a soft smile, the face's size, a hoop showing.
The top 48 (best per 1.5 s, at most 4 per clip) went to a sheet (`tools/dp_grab.py`), ten
finalists were refined to their sharpest frame by the eye band's sharpness, and the last five were
compared as circles. 62379666 at 4.00 s (frame 120) won: fist under the chin with the ring, a
three-quarter turn, eyes to the lens, the hoop showing, and the sharpest face of the ten.

**Drafted, not rendered:** `diwali2` and `pawan2` put Diwali and Pawan Kumar on D at 184 BPM
(stopped at the owner's redirect; at D's felt 92 BPM they would need re-cutting like onephoto3).

## What makes it work

- **Untouched footage.** Each source range is pulled once as 1080x1920 JPEG
  (`tools/extract.py`): Lanczos, decoded to RGB with the clips' own BT.709 full-range
  matrix, then stored as standard JFIF. The first pass scaled yuvj420p straight to
  yuvj420p with `out_color_matrix=bt601`, which ffmpeg ignores for a YUV-to-YUV scale, so
  BT.709 values were read back as BT.601 and skin came out about 1.5% cooler (R −4.4,
  G −3.4, B +1.6 levels on 255). Caught by the colour check before delivery; every frame
  was re-extracted and every reel re-rendered. No grade, no blur, no frame blending;
  speed changes are held frames. `tools/qcfinal.py` compares an overlay-free frame of
  each encode with the source decoded straight.
- **One engine, seven scripts.** `engine/index.html` draws video layers on a canvas
  (full frame, tiles, strips, a circle crop), a `#behind` layer for type that stands behind
  her, a person-matte cutout canvas over it, the DOM for graphics, and a particle canvas.
  Each reel is a script in `engine/reels/` with `plan(t)` (which layers) and `draw(t)`
  (the graphics). Kicks (punch, shake, spin, zoom, flash, glitch) come from the edit list
  and are on the beat; a turned frame zooms enough to keep covering.
- **Depth.** MediaPipe's multiclass selfie segmenter, a guided filter on the frame's own
  edges, then a smoothstep. Only the shots that put type behind her get a matte. Two
  depth titles were moved after review: the split-screen UP / DOWN words were mostly hidden
  by her head, so they became stamps in front; DIWALI moved to a stepped-back shot where
  her hair only clips the letters.
- **Tracking.** `tools/track.py` follows a gold piece (hoop, kada, ring) by hue,
  saturation and a search window, or the pale-blue fan, then smooths over 5 frames.
  `tools/trackcrop.py` shows a zoomed crosshair on 8 frames per track; every track used
  was checked that way. The spin is untrackable, so that bubble holds and wobbles.
- **The fan freeze** is on BD3B07AF 22.60 s, the frame where the fan is biggest and above
  Instagram's caption area (22.95 s had it at the bottom edge).
- **Audio.** `tools/mix.py` cuts the song at the reel's start to the exact sample count,
  sets −14 LUFS with a straight gain, and limits only if that gain would pass −2 dBFS.
- **Safe zone.** Text stays inside y 220–1500 and clear of the right-hand buttons, except
  the Pawan Kumar fan circle, which runs off the bottom-right edge on purpose.

## Build

```
# needs $WORK/v14/dl/<clip>/<clip>.mov (the downloads), $WORK/v14/scan/*.json (face scans),
# $WORK/v14/models/selfie_multiclass_256x256.tflite, $WORK/fonts, $WORK/ffmpeg, and the songs
python3 build.py                                   # engine/data_<reel>.json + extract.json
python3 tools/extract.py $WORK 0 4 & ... 3 4        # frames (+ mattes where flagged), 4 shards
python3 tools/track.py $WORK hoop h1:v1:gold:0.10:892:730 ...   # tracks, see engine/track_*.json
python3 tools/gallery.py $WORK $WORK/v15/img/gallery.jpg
cd engine && node render.mjs <reel> ../out/frames/<reel> --jpg --q 95
python3 tools/mix.py $WORK diwali hair pawan cyc onephoto2 hoop maine best30b:<song B>:1.3277:30.0
python3 tools/altmix.py $WORK hair_trackA hair <song A> 0.46159 0.489 15.26 5.7600   # and hoop_trackA, maine_trackC
tools/remux_alt.sh
python3 tools/encode.py $WORK <reel> frames/<reel> audio/<reel>.wav     # final (<=29 MB) + web preview
python3 sel/best30b.py $WORK && selects.py best30b.json best30b_silent.mp4  # see ../../../.. v14 tools
python3 tools/qcfinal.py $WORK diwali hair pawan cyc onephoto2 hoop maine best30
```

## Checked (12 Oct 2026)

- Every reel rendered in full and reviewed as a contact sheet (one frame every 0.2–0.33 s);
  key moments test-rendered first and fixed (the split words, the heroine title, an item
  card that overshot the left edge, the DP centring, ring glints on the tracked ring).
- `tools/qcfinal.py`: exact frame counts, audio length, BT.709 TV-range tags, 1080x1920,
  30 fps, each file under 30 MB, the song's onset at the edit's drop, and the colour bias
  against the source.

## Before posting

- Pawan Kumar's credits read "Heroine: main character energy" until her name or handle is in.
- The kada and the ring are named only generically, never tagged or priced.
- All four songs came from the owner; check the rights before a business account posts them.
