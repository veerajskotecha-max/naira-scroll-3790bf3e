# Halo Curve Ring + Baroque Pearl Lariat — v5

This cut goes back to v1's look at the owner's ask, because v4's macro zoom and blur
read as AI-made. It keeps the v2/v3 fixes: graphics stay off her face, words are no
longer clipped, the price no longer rolls through wrong totals, and the lip-sync is
fixed. It also uses the new ring cut-out from v4 (`cut4/ring_cut.png`).

**Removed, so the picture stays real and quiet:**
- frame blending between source frames
- the animated punch-ins on cuts (her own jump cuts keep a static 5% reframe)
- the light sweep
- the ×2 badge
- the level line and the mismatch circles
- the glints and the swash
- the "adjusts to fit" icon
- the slider panel with its stretched chain
- the drawn, morphing pearl (the loupe shows only the real photo)
- the front petals (7 remain behind)

**The voice comes from the music-free upload.** `a48.wav` is the audio of the first
Drive file, and it has no music. Up to v5, the voice was taken from the second upload
("with music"), and that file's background track sat under her voice even in the
no-music cut. The two files are sample-aligned (lag 0, same length), so the phrase cuts
and the word timings did not change. Her pauses dropped from about -45 dB to about
-52 dB.

**Sound changes:**
- **Voice:** `afftdn` goes from nr 14 to nr 20. The gaps carry a trace of room tone
  (×0.12) instead of ×0.6, which takes the hiss in the pauses from -38 to -52 dB.
- **Sound effects:** three quiet cues remain: the first DM, the card turning, and the
  wordmark.

The build is the same as `../halo-baroque-v4`, with `audio/vo_audio.py` in place of
`vo.py`. It reuses v4's `timeline.json`, because the phrase cuts did not change.
`encode.sh` does no sharpening.

The prices are literals. The caveats in `../halo-baroque-v4/README.md` apply.
