# Creator ads v4: "Where is this from?" (ring) and "Found my favourite jewellery" (pearl)

Two paid-social cuts made from the creators' own videos, which the three voiceover ads (`../vo-ads`) had left out. The
videos are not in git; these scripts rebuild them.

| Ad | Length | Sells | Hook (first frame) |
| --- | --- | --- | --- |
| Ring, "Where is this from?" | 22.0 s | Halo Curve Ring, ₹1,199 (MRP ₹3,419) | Her hand, with the ring, over her face. A DM bubble reads "where is this from??" and her line "Someone actually asked me…" plays. |
| Pearl, "Found my favourite jewellery" | 24.3 s | Pearl Point Studs, ₹1,499, and Heartline Paperclip Necklace, ₹1,899: both for ₹2,718 | A native 4K crop of the pearl stud. Her face and her own title follow at 0.5 s. |

Each ad comes in three versions, all at 1080x1920, 30 fps, -14 LUFS, true peak -1.2 dBTP or lower, under 30 MB:

- **Score.** For paid placements. Her voice sits over the original v3 score, which is ours, so Meta has no song to mute.
- **Song.** For organic posting.
  - The ring uses the GRWM song, with its drop on "That's kind of the whole point."
  - The pearl uses Song D, with its drop on the payoff after "you know what the best part is?"
- **Voice only.** Her voice and the soft effects, with no music, so a song can be added from Instagram's library.

## Decisions

- **No voiceover.** Each creator tells the product story better than a read would. Her own words carry the ad, and
  the graphics carry the price, the offer and the claims.
- **The ring's hook is a J-cut.** Her first line, 0–1.1 s, plays over the ring-over-face moment from 11.45 s of her
  raw. Her hand hides her mouth there, so nothing reads as out of sync. At 1.1 s the picture returns to her talking,
  in sync.
- **The lariat is cut.** The Baroque Pearl Lariat was out of stock (0) on 2 Nov. Her lariat section (18–30 s) is gone,
  and so are her words "both the pieces are". She still wears it, but nothing names or prices it.
- **The pearl voice is lifted off the song.** The CapCut export has a song mixed about 22 dB under her voice. Demucs
  (`htdemucs_ft`, two stems) separates her voice from it (`tools/voices.sh`).
- **The pearl frames.** Her CapCut export is 50 fps: her 30 fps capture with 2 repeats in every 5 frames, plus CapCut's
  own 50 fps transitions, and from 11.4 s on, CapCut's zoom. Taking every 5/3rd frame stalls and skips.
  `tools/lv_frames.py` therefore gives each new picture of the 30 fps capture the next 1/30 s, keeps the 50 fps
  pictures on their own clock, and samples the result at 30 fps. The output has no repeats, and its clock never drifts
  from the sound.
- **Her burned-in captions and title stay.** They are hers. Every graphic in the pearl ad sits above them; her captions
  run at y 1440–1590.
- **Product clarity.** Each piece is shown four ways:
  - a card with its listing photo, where the price counts down from the MRP;
  - a "detail" inset of the listing photo, with each part named on her word, using the listing's own wording;
  - the bag (pearl only): both pieces drop in, the BUY 2 rung lights, and ₹3,398 counts down to ₹2,718;
  - the end card, which opens through the flower, as in v3.
- **Ring only:** the ring's card appears a second time, tagged "In stock", over "available at Naira with free
  delivery". A trust strip comes with it.

## Claims, and where each is true

| Shown | Source |
| --- | --- |
| natural tiger eye, champagne crystal | Halo Curve Ring listing: "natural tiger eye", "faceted pale champagne crystal" |
| Two stones that don't match / on purpose | Ring listing: "Two stones that do not match, and that is the point"; also her own words |
| Adjustable · fits US 5–9 | Ring listing: "open band adjusts to fit US 5 to 9" |
| 9 mm shell pearl, 3 cubic zirconia, twisted gold rope | Pearl Point Studs listing |
| heart-cut cubic zirconia | Heartline listing: "heart shaped clear cubic zirconia stations" |
| PVD 18K gold coating | All three listings: "PVD 18K gold coating, anti-tarnish" |
| Free delivery / Free shipping | `SHIPPING_CHARGE = 0`; she also says it |
| Cash on delivery | The PDP says "COD available"; the 5% COD fee is stated in the bag, not in ads |
| 3-year plating guarantee, "a lifetime of wear, with care" | The owner's claim. **The site still says 2 years. Fix one or the other before these run.** |
| BUY 2 20% / BUY 3 30%, both for ₹2,718 | Live discount codes on 2 Nov. The bag rounds `Math.round(3398 × 0.8)`. |

The prices are literals in `build4.py`, and its asserts fail if a percentage or the pair total drifts. Re-check the
prices against Shopify before any re-render.

## Before spending on these

- **Pearl stock.** Pearl Point Studs and the Heartline necklace each had **2 in stock** on 2 Nov. The end card's offer
  covers any pieces, so the ad survives a sell-out, but restock before you put spend behind it.
- **Ring stock.** The Halo Curve Ring had 45 in stock.
- **Ring source resolution.** The only raw on Drive is her 720p draft, upscaled. Reframes stay at 1.10 or under, so it
  does not soften further.

## Sound

- **Voice.** Her own voice, cut with the picture from the same segment list. The level is -16 LUFS, with v3's
  compressor. A 15 kHz low-pass and a 5 ms look-ahead peak limiter are added: her phone mic's plosives ran 16 dB over
  loudness and clipped into inter-sample overs at the master.
- **Bed.** The score is at -20 LUFS (v3: -18.5), ducked 8 dB under her voice. A song is 1.5 dB over that and ducks 2 dB
  more. Measured through a 280–9000 Hz phone band, the music sits 12.5–15 dB under her voice while she talks.
- **Effects.** v3's soft set: DM pops, swishes, a tap when each price lands, the bag drops, and the flower iris. No
  sparkle sounds.

## Sources

- **Ring.** Drive "NAIRA COLLABORATION REEL DRAFT", id `1kyR0sAmlb7l3ezYth2VTwhxdFq5TgRVz`, saved as
  `dl/new/ananaya_raw/raw.mp4`.
- **Pearl.** Drive `lv_0_20260929025602.mp4`, id `1XXvZefEY3r2V45BpBCe8MK1J026YKd5s`, saved as `dl/new/lv0/lv0.mp4`.
- **Not sources.** Drive's "Final-edit-reel-Ananaya" and `7085D46A…mp4` are phone re-encodes of the earlier v5 edit.
  They already carry graphics.

## Build

Work in the scratch folder `S`, which already holds v3's `ads/engine/engine2.js`, fonts, logo and songs.

- Copy `engine/base4.css` into `$S/ads/engine/`.
- Copy these tools, plus `../vo-ads/tools/render.mjs`, `encode.sh` and `master.sh`, into `$S/ads/tools/`.

```
python3.13 -I tools/prep4.py $S                 # ana frames (30 fps CFR) and every lv picture at 1080x1920
python3.13 -I tools/lv_frames.py $S             # the pearl's 30 fps sequence
python3.13 -I tools/ear_frames.py $S            # the 4K stud close-up
python3.13 -I tools/product_img.py $S           # listing-photo crops
bash tools/voices.sh $S                         # both voices (Demucs for the pearl)
cd $S/ads && python3.13 -I tools/build4.py $S   # ringv4/ and pearlv4/ pages + audio.json
node tools/render.mjs ringv4 out_ringv4; node tools/render.mjs pearlv4 out_pearlv4
for ad in ringv4 pearlv4; do for m in score song voice; do
  python3.13 -I tools/audio4.py $S $ad $m && bash tools/master.sh $ad mix_$m master_$m; done; done
bash tools/encode.sh ringv4 final4/ring.mp4 9000k ringv4/master_score.wav     # then remux the song and voice masters
bash tools/encode.sh pearlv4 final4/pearl.mp4 8500k pearlv4/master_score.wav
```

`grid.py` and `cropgrid.py` make the gridded frame sheets the positions in `build4.py`'s `TR` table were read from.
`../vo-ads/tools/master.sh` now takes `LIMIT=` for a lower limiter ceiling. The default is unchanged.
