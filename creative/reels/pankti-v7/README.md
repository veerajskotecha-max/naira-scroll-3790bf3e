# Pankti x Naira — re-cut v7

A rebuild of `naira-ad-jewellery-v6.mp4` from Pankti's own footage
(Drive: "Pankti x Naira" / `5FA79CB1-….MP4`). The output video is not in git
(27 MB); it lives beside the scripts when built.

## What changed from v6, and why

| v6 | v7 |
| --- | --- |
| Pankti's cut kept as-is, white boxed cards laid on top | Re-cut from her raw: 11 shots re-ordered into one story, every cut on the track's beat (161 BPM) |
| Opens on a half-faded card over a closed box | Frame 0 is the satin huggies filling the screen, the line already set |
| 7 s of static cards at the end (~24% of runtime), cross-faded into each other | One 2.2 s end card, no dissolve |
| Prices ₹1,449 / ₹1,999 / ₹3,448 — stale | Live prices (checked 28 Sep): ₹1,099 / ₹1,499; pair ₹2,598 → ₹2,338 with the bag's automatic BUY2 10% (no code) |
| "NAIRA10 · 10% off your first order" — NAIRA10 is not first-order only | Offer is the two-piece rung, which the bag applies itself |
| Cards over the product and face | Text never on a piece; all inside Meta's Reels safe area (top 14%, bottom 35%, sides 6%) |
| Plain HDR→SDR conversion | HLG tone-mapped with Hable, which keeps the brushed gold warm; source is mirrored, so flipped (the box read "ARIAN") |

The copy runs as one sentence across cuts — *not all gold / has to shine. /
satin, not mirror. / closes with a turn. / worn together, / every day.* —
with the two product names and prices as labels on the box reveals. "Satin,
not mirror" and "closes with a turn" are the live product descriptions' own
claims; tags confirm tarnish free / waterproof / hypoallergenic.

**If a price or the BUY2 rate changes, the end card and the two labels are
wrong** — they are literals in `build.py` / `overlays.py`.

## Build

Put next to these scripts: `pankti_raw.mp4`, an ffmpeg with zscale/tonemap
(`pip install imageio-ffmpeg`, symlink it as `ffmpeg` or set `FFMPEG`), and
`fonts/CG.ttf`, `fonts/CG-Italic.ttf`, `fonts/Jost.ttf` (Cormorant Garamond
and Jost variable fonts from github.com/google/fonts — rename them: a `%5B`
in the file name stops Chromium loading them and it silently falls back to
Times). Then:

```
npx -y tsx mk_logo.ts .     # vector NAIRA wordmark + flower from src/lib/nairaFlower
python3 build.py            # -> naira-pankti-v7.mp4, 17.8 s, 1080x1920, -14 LUFS
```

Needs Python 3 and Chromium (`CHROME` env to override the path).

Before re-using the music bed in a paid ad, confirm the track is cleared for
ads — it is the sound Pankti posted with.
