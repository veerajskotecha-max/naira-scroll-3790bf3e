# Get ready with Naira — the owner's own GRWM edit, finished

The owner's 24.2 s cut of the corset shoot (1080x1920 HEVC, full-range BT.709, 30 fps, their own grade, a commercial song
underneath). The brief: only the words "get ready with Naira", in Naira branding, with an entry and an exit; check whether the
transitions need anything; make it postable on Instagram; small edits, highest quality. The video is not in git.

## What changed

Nothing about the look: no filter, no re-grade, and every frame the owner kept is the same frame, measured back against the
source (colour within 0.3 levels, PSNR 40.6–42.4 dB). The cuts stay hard cuts; four of them were off the music and moved.

| Out frames | From | Why |
| --- | --- | --- |
| 0–2 | source 3, held | Source 0–2 were a three-frame jump into the first shot. |
| 3–253 | source 3–253 | Unchanged, including the three intro cuts (2.0, 4.0, 7.367 s). |
| 254–258 | raw clip 84BD71C7, frames 1084–1088, graded | The cut into the close-up was 5 frames ahead of the drop (8.467 s vs 8.633 s). A held frame read as a stutter (the earring shot is accelerating there), so the shot runs on with its own next frames: the owner's shot is that 720p clip upscaled bilinear and graded, so `gradefit.py` checks the offset (830) and alignment (none), fits a third-order RGB polynomial on frames 221–245 and holds out 246–253 (mean error ~0, MAE 2.7 at 720p, block bias ≤ 2 levels, so no vignette); `extend.py` picks the upscaler that matches their sharpness (bilinear) and writes the frames. |
| 259–523 | source 259–523 | The close-up now starts ON the drop. It loses its last two frames so the turn lands on the snare at 17.45 s. |
| 524–616 | source 526–618 | The turn; loses its last 4 frames so the last shot lands on the hit at 20.56 s (it was 6 frames late). |
| 617–717 | source 623–723 | The last shot. Source 724–726 were black and are gone. |

The audio is the owner's track, untouched and still sample-aligned (cross-correlation lag 0), cut to the new 23.93 s end with a
0.25 s fade so the loop is clean. −14.8 LUFS, peak −0.02 dBFS.

## The title

`mkov.py` writes a page and `render.mjs` screenshots it transparent at 30 fps; `final.sh` overlays it in YUV, so the footage is
never round-tripped through RGB. An ivory label (sharp corners, a sage hairline inset 12 px, a soft shadow) at y 1180–1406,
clear of Instagram's caption and side icons and under her hands in the chest shot; *get ready with* in CG italic 500, deep
sage; the NAIRA wordmark from `kinn-films/img/logo_sage.svg` (sage letters, the blush flower as the I). Entry from 0.30 s: the
label rises in, the words track in, NAIRA, then the flower opens (−60° to 0, 55% to full). Exit from 8.00 s: the words blur
out, then the label, gone by 8.45 s, in the music's silence before the drop.

## Instagram and the song

Renaming or re-tagging a file's audio does not change what Instagram's music matching hears, so two files: the original audio,
and a silent one to post with the same song added from Instagram's own library (licensed and credited on the reel; the drop
should land on the cut at 8.6 s). Business accounts see a narrower library than creator accounts.

## Run

`final.sh <scratch>` expects `v20/dl/grwm.mp4` (the owner's file), `v20/ext/ext_0..4.png` (from `extend.py`) and
`v20/ovf/0000..0256.png` (from `render.mjs`), and writes both finals by two-pass H.264 High to fit the chat's 30 MB limit
(9.13 Mbps video, about the source's own bitrate). `qc.py` maps every output frame back to its source frame, checks the colour
and lists the frame jumps (60, 120, 221, 259, 524, 617).
