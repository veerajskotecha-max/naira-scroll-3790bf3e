# Kinn Films shoot — the Punjabi song four ways, an elegant set, seven concept reels and a 30 s best-parts cut

27 unique handheld clips from the Kinn Films shoot (10:43 in all, 720x1280 HEVC, full-range
BT.709, no audio): one look, the brocade corset, the **Woven Gold Hoops** (live), a kada and
a two-stone ring (neither is listed, so neither is ever tagged or priced). These scripts
cut seven concept posts from them, each 1080x1920 at 30 fps, plus a 30 s best-parts cut.
The videos, frames and mattes are not in git.

Every reel starts on a downbeat of its song, so beat k of a reel is at `k * beat` seconds,
and every cut lands on a frame. Each one is built round one moment in its song.

## The Punjabi song, four ways (latest)

The owner's note on the elegant set: the lyrics did not look good on screen. So four new edits on track D carry no words at
all (two carry one small credit), each built round a different trick, every effect on a hit of D. `tools/hits.py` lists the
kick, snare and hat hits by band with their place on D's felt-beat grid (D2: beat 0.65201 s from 0.245 s); the cues it gave:
the bass back at 8.069 s, the drums at 10.677 s, the silence 17.25–17.52 s, a clap at 17.541 s, the drop at 17.849 s, the drum
roll's hits at 18.679, 18.841, 19.495, 19.657 and 20.147 s, the heavy kick at 21.109 s, the hook from 22.36 s.

| Reel | Song (from) | Length | The trick |
| --- | --- | --- | --- |
| **pj_drop · The drop** | D (8.069 s) | 13.0 s | Hair-up looks, two a bar, one a beat, then two a beat; a beat of her profile; then one take of her taking the clip out (E2552016), held with her hands at the clip through the silence, moving again on the clap, the hair falling on the drop with a flash; a cut on every hit of the roll; a close side profile to end. Uses `elegant.js` with no lines and no credit. |
| **pj_grid · Multiply** (final, with graphics) | D (10.677 s) | 20.9 s | The frame splits with the song (`pj_grid.js`, layouts in the cues): one shot ending on her hand over the lens, then 2, 4 and 9 tiles; all nine freeze in the silence; the centre tile bursts to full screen on the drop with the hair whip, over the frozen grid. The roll flickers between 1, 4 and 9 tiles on its hits; on the heavy kick one spin ripples across nine tiles 70 ms apart; the hook is one calm close-up; the last bar builds the grid back round the edge to the brand tile in the centre. At the owner's ask it then got minimal graphics and branding: the nine-tile grids carry an index per tile (01–09, Jost, 252 px down each tile so row 1 clears Instagram's top bar and row 3 its caption), the clap draws a blush frame round 05 before the drop bursts it, and the closing grid counts its tiles in 01–08 clockwise on the sixteenths and lands the brand tile last: ivory, the NAIRA wordmark in sage with the blush flower (`img/logo_sage.svg`, made by `tools/mk_logo_sage.ts` from the site header's own vectors in `src/lib/nairaFlower`), *woven gold hoops*, @NAIRAFLORE. The wordmark is drawn on the fx canvas from the preloaded image, so no frame catches it loading. Two tiles were re-picked so no index sits on her face. |
| **pj_zoom · Hoop zoom** | D (15.893 s) | 15.6 s | Every shot is framed on the hoop, tracked frame by frame: `tools/hoopseed.py` finds the gold blob beside the face box to seed `tools/track.py`, and every track was checked on a `trackcrop.py` sheet. A slow push on her face holds in the silence and snaps into the hoop on the clap; the hair whip on the drop; the roll snaps into the hoop on its hits; the hoop in macro on the heavy kick; slow pushes through the hook (one ends on her hand over the lens, the ring filling the frame); snaps on the off-beats; a push into the cover close-up's hoop and the credit. |
| **pj_flash · Flash** | D (0.0 s) | 21.1 s | A photoshoot (`pj_flash.js`): every flash is a new pose that freezes for a fraction of a beat, then plays on; one a bar in the slow intro, one a beat, then two a beat (white only on the beat); black in the silence; the clap's photo shows her hands at the clip; the drop is a burst of eight stills, an eighth of a beat each; the roll flashes on its hits. At most two white flashes in any second (beat 31's was dropped for that; three is the photosensitivity limit). |

`golden_clean` and `intezaar_clean` are the two elegant Punjabi reels again with no lyrics (a deep copy of each with
`lines: []`), the credit kept.

Checked in the final files: exact frame counts (391, 626, 469, 633), 1080x1920, 30 fps, BT.709 TV range, 27.4–27.8 MB.
`tools/qcsync.py`: every picture cut sits on its edit frame (the grid's one exception is the ripple shot, which starts
0.56 s early on purpose so its tiles can lag), and the drop's bass rise peaks 10–40 ms before each drop cut's frame
boundary. A frame with no effects on it matches the camera original to −1.1 / −0.5 / −1.0 levels (R, G, B).

Review sheets come from the rendered frames or a plain `fps=` pass over the encode. An ffmpeg `select` followed by `fps`
fills the dropped stretches with copies of the last frame, which reads as a frozen video; it caught two good encodes as bad.

## The elegant set

Re-made at the owner's ask ("too much graphic… make it elegant… less tacky"): no stickers,
chat bubbles, emoji, sparkles, shakes, glitches or zoom kicks. One line of type at a time
(Cormorant Garamond italic in ivory, a soft shadow, a 0.3 s fade), straight cuts on the song's
felt beat, sage and ivory only, and the hoops credited once, on the last frame ("woven gold
hoops · @nairaflore"). The kada and the ring are shown and never named.

| Reel | Song (from) | Length | The idea |
| --- | --- | --- | --- |
| **onephoto5 · I asked for one photo** | B, the moon song (0.0 s) | 34.2 s | The DP story told quietly. "i asked for one photo." / "just one. for my new dp." over two posed shots; "she sent twenty-seven videos." and all 27, one a beat, then two a beat as the song builds, under a small `video 01 / 27` counter. The 27th is the DP clip itself (62379666 from 1.60 s): it plays into the breakdown ("not one photo.") and freezes on the song's silence at 22.20 s on frame 120, the best frame in the shoot ("so i paused one."). The drop (23.24 s) is a screenshot flash. The photo becomes a print on sage, eight more stills from the DP ranking land on it one a beat ("(and eight more.)"), the stack lifts away, and the DP rounds into a profile circle: "new dp." It ends before beat 48 (34.196 s), after the beat where the song's bass drops out, so the loop breathes. |
| **golden · The finishing touches** | D (0.0 s) | 21.1 s | A get-ready, bar by bar: a still close-up (her hand at the choker, the cuff) and the hoop being fastened under the song's first line; the hoop going in, in macro, as the bass enters; the cuff sliding on in the breakdown; her hand to the lens so the ring fills the frame, a wipe into the hair coming down on the drums (the fall on beat 18); over-the-shoulder looks in the full groove; her eyes to the lens through the silence; the spin on the drop (17.85 s); the cover close-up and the credit. The first two lines are subtitled in English. |
| **intezaar · Tera karaan intezaar** | D (17.849 s, the drop hit) | 18.9 s | Portraits a bar each from the drop, two a bar in the middle, inside a 2 px ivory hairline frame: the turn that shows the laced back, the over-the-shoulder look with her hair up, the hoop close-up, hair cascading, the hair swish, the cuff at her collar. The hook is subtitled where it is sung ("i wait for you.", 22.36 s), and the credit closes it. |

The songs, identified with whisper (`tools/lang.py`, `tools/lyrics.py`): **B** is in English,
"Take me to the moon where we both fell in love", and is cut here at its felt pace, 87.6 BPM
(**B2** in `build.py`: beat 0.68476 s from 1.3277 s). Read with `tools/bands.py`: the bass
leaves at 19.8 s, the silence is 22.20–22.45 s, the drop 23.240 s, and the bass drops out for
one beat at 33.5 s. **D** is Punjabi (pa 0.97): "puraane same vaangu aaja kariye pyaar" (come,
let's love like the old days, 0–2.4 s), "tere naam diyaan chitthiyaan main likhiyaan hazaar"
(I've written a thousand letters in your name, 2.4–5.5 s) and the hook "tera karaan intezaar"
(I wait for you, 22.36 s). The subtitles are those translations; someone who knows the song
should read them before posting.

A reel's data can name a shared script: golden and intezaar set `script: 'elegant'`, and
`engine/reels/elegant.js` cuts one shot at a time and draws the lines and the credit from the
reel's cues. In `onephoto5.js` the DP is one shape the whole way, a full frame, then a print
(rotated 1.2°, an ivory border, a soft shadow), then the circle: a rounded rectangle whose
corner radius grows to half its side while the image eases from the whole frame to the face,
fist and hoop, so the photo never cuts. The stack is composited off screen before it fades,
so the prints do not ghost through one another.

Every in-point was checked on `tools/shotsheet.py` sheets before rendering (a blurred hand on
golden's first frame and a camera jump 0.3 s in were cut out that way), and every reel was
reviewed at 3 frames a second after encoding. Measured in the final files: exact frame counts
(1026, 633, 567), 1080x1920, 30 fps, BT.709 TV range, 27.3–27.6 MB. Every picture cut sits on
its edit frame (`tools/qcsync.py`). The moon song's bass jumps 42 dB across the drop cut, its
steepest rise at 0 ms, and the screenshot flash peaks on that frame. Each of intezaar's cuts
sits 10–40 ms before the kick's energy peak, which is the analysis window's lag. The frozen DP
frame matches the camera original to −1.1 / −0.5 / −1.1 levels (R, G, B), mean |diff| 1.9 of 255.

| Reel | Song (from) | Length | The idea | Built on |
| --- | --- | --- | --- | --- |
| **diwali · Diwali look loading…** | B (12.284 s) | 21.9 s | A blush bar fills one item a bar: kada, ring, hoops. It stalls at 43% on a lost earring back (a retry / cry dialog), holds at 99% while she pulls the clip, and hits 100% on the drop. Then 8 bars of the look with a transition on every hit: DIWALI behind her (person matte), pinned ✓ labels, strips, a 3×3 grid, a sticker beat. Ends "diwali look: loaded ✨" and the bar resets for the loop. | B's silence (22.20–22.45 s) and drop (23.24 s) |
| **hair · Hair up or hair down?** | C (1.758 s) | 15.4 s | Split screen with UP / DOWN stamps, a duel of whips cut on every half beat with a tug-of-war meter, a tie in the breakdown, the clip out on the drop with HAIR DOWN behind her. A speed gun on the spin (132.4 km/h), a fake-out on the one hair-up close-up, the vote. | C's drop (7.518 s) |
| **pawan · Introducing Pawan Kumar** | B (12.284 s) | 16.4 s | A letterboxed 90s heroine entry with a checklist. The look and the hair tick on the beat; on B's silence it freezes on the hand fan, the bars snap off, everything but the fan dims, and the fan gets a filmi debut card. She breaks on the drop; credits roll. | B's silence and drop |
| **cyc · Choose your character** | A (4.182 s) | 12.9 s | A fighting-game select screen of six live tiles, the cursor on every beat. Power-ups (hoops, kada, ring), the hair tornado combo, a boss HUD; the final boss (the fan) arrives in A's bass gap; K.O. on the bass return. Back to the grid: comment 1–6. | A's bass gap (14.0 s) and return (15.26 s) |
| onephoto4 · I asked for ONE photo (the graphic-heavy final, replaced by onephoto5) | D from its first note (`off=0.245`: beat 0 is 0.245 s in) | 26.3 s | onephoto3 tightened to the song bar by bar (bars of 2.608 s from 0.245 s): the audio now starts on the song's first note, the twelve best videos play one a beat (no two-a-beat stretch), the fan freezes on bar 6's beat-2 hit (16.56 s), camera focus brackets snap onto her face on the clap in the silence (17.54 s), the DP holds through bar 7's drum roll with a sparkle on the hoop or kada on each roll hit, and settles into the profile on the roll's last beat. Measured in the final file, every graphic sits within 32 ms of its hit (the clap 8 ms, the reply 4 ms). | Every cut on a kick, every pop on a hit |
| onephoto3 · third cut | D at its felt 92 BPM (0.245 s) | 26.1 s | Re-cut at the owner's ask to the song's own slow groove, every cut on a kick. The ask over four posed shots (cover, hoop, side profile, profile), the Naira line landing as the bass comes in (2.9 s). The bestie's notification, then the gallery in the song's breakdown (`tools/gallery.py` with `engine/gallery3_order.json`, so thumbnail N is VIDEO N), a tap and a zoom into video 1 on the bass's return. Sixteen videos, one a beat and then two a beat as the groove fills out, under a REC counter; video 19 freezes on the fan; her laugh plays in the silence (video 27/27, "DP status: still pending"). A shutter on the drop opens on the DP, which settles into a profile circle with a sage-and-blush ring that breathes on the beat; hearts on the heavy kick (21.1 s), three comments one a beat, and her reply on the biggest bass hit (23.7 s): "@nairaflore ✨ woven gold hoops", with her new DP as its avatar. | D's bass entry, breakdown, silence (17.25–17.52 s), drop (17.849 s), kick (21.1 s) and sub hit (23.72 s) |
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
# the elegant set
python3 tools/lang.py <whisper dir> <song.wav> ...                 # which language each song is sung in
python3 tools/lyrics.py <whisper dir> <song.wav> [lang]           # word timings of the lyrics
python3 tools/bands.py $WORK/ffmpeg <song.wav> <beat 0> <beat>     # sub / mid / air energy per beat: the sections
python3 tools/shotsheet.py $WORK <reel> sheet.jpg                  # first, middle and last frame of every shot
python3 tools/mix.py $WORK onephoto5 golden intezaar
python3 tools/qcfinal.py $WORK onephoto5 golden intezaar && python3 tools/qcsync.py $WORK onephoto5 golden intezaar
# the Punjabi set
python3 tools/hits.py $WORK/ffmpeg <song D> 0.245 0.65201 0 39.2 [hits.json]   # kick / snare / hat hits on the felt grid
python3 tools/strip.py $WORK strip.jpg <clip>:<t0>:<t1>:<fps> ...              # source moments, for picking in-points
python3 tools/hoopseed.py $WORK pj_zoom <shot>:<t> ...                           # hoop seeds for track.py (+ a check sheet)
npx vite-node tools/mk_logo_sage.ts img/logo_sage.svg                           # the sage-and-blush NAIRA wordmark, from src/lib/nairaFlower
python3 tools/track.py $WORK pj_zoom <seed specs> && python3 tools/trackcrop.py $WORK pj_zoom check.jpg <ids>
python3 tools/mix.py $WORK pj_drop pj_grid pj_zoom pj_flash
python3 tools/qcfinal.py $WORK pj_drop pj_grid pj_zoom pj_flash && python3 tools/qcsync.py $WORK pj_drop pj_grid pj_zoom pj_flash
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
