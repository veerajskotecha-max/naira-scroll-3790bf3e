# Hero film v6: "Made to be asked about" (three versions)

One hero ad made from the whole library:
- Riya's 4K reel, Pankti's box reel, Ananaya's ring take and the Kinn Films shoot of Sonal;
- the blush Naira boxes;
- a new voice for the film.

It was built in three rounds. Each round was critiqued by a four-lens panel (performance, creative director, editor,
customer), and the panel's brief became the next version. V3 is the one to run.

| Version | Length | Panel score (perf / creative / editor / customer) | In one line |
| --- | --- | --- | --- |
| V1 | 29.9 s | 6 / 6 / 6.5 / 6.5 | A fashion film interrupted by real women. Upright type is the film's voice, italic is theirs. A drawn bag at the end. |
| V2 | 26.5 s | 7.5 / 7 / 7.5 / 7.5 | The offer moves to 6–8.5 s, built from three real boxes opening. Product at the lens on frame 1. The claims are spoken. A calm card. |
| V3 | 25.9 s | 7.5 / 7.5 / 7.6 / 7.6 | V2, with the whole deal readable on mute by 9.2 s, every cut on a phrase end, and the card complete by 21.3 s. |

V3 also comes as a 15 s cut-down (14.4 s): V3 to 9.9 s, a hard cut to the same card, then Ananaya's CTA.

**Final rating.** One panel rated all three side by side (`notes/final-rating.txt`) and scored V1 5.5–5.8, V2 6.8–7 and V3
7.5–7.6. All four lenses said run V3. The claims audit checked every claim, price and offer against the live store: 21 of 21
passed, with no blockers.

That panel's cheap fixes were then applied to V3 as a polish pass:
- Riya's bracelet line is captioned again: on the wood under the credit, then in ivory on her forearm.
- The drop lands: the bed is held 5 dB down under "this.", then 9 dB down under "This is Naira,". It was 12 dB down throughout.
- Sonal's glance runs 1.03 s, up from 0.73. Ananaya's caption ends on the cut while her voice carries on.
- The box-3 price anchor is larger and darker.
- The card tiles are cropped to the boxes, clear of Pankti's face.

Two of that panel's points did not hold:
- "Move the frame-1 caption to x 480." Pankti's hair is centred in that frame, so x 480 would put the caption on it. The
  caption sits at x 48 on her tee, in ink with an ivory glow.
- "The codes may still be 10/20." The live Shopify codes are BUY2 20% and BUY3 30%, and the live site's bundle carries the
  same rates. Only this working branch's copy of `promo.ts` is behind main.

**Still open, for the owner to decide:**
- **Nyra's voice.** It reads the offer and the claims, about 6.6 s at 1.1x. The creative lens hears it as the main
  "AI" tell. A 1.0x regeneration, or the offer as type over the score, are the options.
- **One hook only.** Frame 1 is the biggest lever. The brief proposed two alternates, the bracelet macro and the GRWM hoop to
  the lens, and they are not rendered.
- **A pair reads as "2 pieces".** "Any 2 pieces" sits over one pair of huggies, so a muted viewer may read it as two pieces.

## How it was made

1. **Concepts.** Four directors each wrote a full script from a different angle (`workflows/concepts.js`):
   - "the question", everyone asks where it is from;
   - "nobody told us", the price shock;
   - "one box", the box as the device;
   - "editorial", the Kinn film interrupted.

   Three judges scored them (`notes/concept-judging.txt`). They picked three different winners, so one lead merged them into
   the V1 script (`notes/v1-script.txt`).
2. **V1** (`tools/build_h1.py`).
3. **Critique.** The panel reviewed V1's frames, timeline and audio report (`workflows/critique.js`). What they found, and
   the V2 brief: `notes/v1-critique-and-v2-brief.txt`.
4. **V2** (`tools/build_h2.py`), then the same critique again: `notes/v2-critique-and-v3-brief.txt`.
5. **V3** (`tools/build_h3.py`, with `cut15` for the cut-down), then the final rating and a claims audit against the live
   store (`workflows/final-rating.js`).

Every footage in-point was checked frame by frame. Where a brief's timing or position did not survive the real footage or
the real voice reads, the build says so in a comment.

## What each round found missing

**V1 → V2:**
- The offer first appeared at 11 s, as a 0.7 s line, and properly only at 21 s; past reels lose ~93% of viewers by 7.5 s.
- Frame 1 was a moody portrait with the hoop at about 3% of the frame.
- The last 8.6 s was graphics on ivory, set at 15–20 px.
- Seven synthetic-voice slogans ran two tagline systems at once.
- The quality claim was 20 px for under a second.

**V2 → V3:**
- "ANY 2" in 34 px caps over a 120 px "20% off" read as a sitewide sale.
- ₹2,238 had nothing on screen to be cut from.
- NO CODE and COD did not appear before 23 s.
- After 5.9 s picture and voice drifted apart.
- The voices ran wall to wall.
- The worn bracelet sat under the Reels UI.
- The card took 2.9 s to build, and its tiles missed the pieces.

## V3 (final), 25.9 s

| Time (s) | Picture | Sound | Type |
| --- | --- | --- | --- |
| 0–0.87 | Pankti's Brushed Gold Huggies pinched at the lens | Riya: "Nobody told us…" | *Nobody / told us…* |
| 0.87–1.70 | Sonal (Kinn 041FCDC6 8.10), eyes to the lens, hoop in | "…demi-fine jewellery…" | *demi-fine / jewellery* |
| 1.70–2.77 | Riya, in sync (4K, 140%) | "…under 2500…" | *under / ₹2,500* |
| 2.77–3.87 | The braided hoop going in (Kinn 74FA1A49) | "…would look like…", a reversed swell, 3 frames of silence | *would look like* |
| 3.87–4.53 | The hoop at the lens (Kinn 76D95B49), the drop | "…this." | *this.* |
| 4.53–5.87 | Box 1: the NAIRA lid, the drawer opens on the Toggle Link Chain | Riya: "This is Naira," and the drawer slide (the only foley) | none; the lid is the logo |
| 5.87–7.80 | Box 2: the huggies | "Any two, twenty percent off." | Any 2 pieces / **20% off** |
| 7.80–9.20 | Box 3: the Woven Gold Hoops, mehendi hands | "Any three, thirty." | Any 3 pieces / **30% off** / ~~₹3,197~~ All three, ₹2,238 / NO CODE · COD AVAILABLE |
| 9.20–9.87 | Riya's hair whip in the hoops | music only | none |
| 9.87–11.87 | Match cut into Pankti's hair: a huggie goes in | "Waterproof, tarnish-free," | 18K GOLD COATING / Waterproof. / Tarnish-free. |
| 11.87–13.20 | The chain worn, hands free | "Three-year plating assurance." | 3-year / PLATING / ASSURANCE |
| 13.20–14.53 | The Prism Rivière Bracelet on her wrist | Riya: "this bracelet is the one people stop you for." | PRISM RIVIÈRE BRACELET ₹2,399 / *this bracelet is* |
| 14.53–16.37 | Worn: wrist to cheek, her fist hiding the fan | (her line continues) | *the one people / stop you for.* (from 14.93) |
| 16.37–19.50 | Ananaya, the Halo Curve Ring over her face | "Someone actually asked me where this is from twice this week." | HALO CURVE RING · ADJUSTABLE ₹1,199; her words in italic |
| 19.50–20.53 | Sonal glances back (Kinn 267E722A), mouth closed | "…week." runs on, then music only: the breath | *Made to be / asked about.* (holds through the cut) |
| 20.53–25.90 | The card: the three real boxes as live tiles | Ananaya: "available at Naira with free delivery as well."; Riya: "You're welcome, but keep it between us." | logo, NAIRAFLORE.COM, CHAIN ₹1,199 · HUGGIES ₹799 · HOOPS ₹1,199, ~~₹3,197~~ All three, ₹2,238, PICK ANY 3 · 30% OFF · NO CODE, FREE SHIPPING · COD AVAILABLE |

Sound is our own score:
- 90 BPM, anchored on Riya's "this"; B minor resolving to D major add9 on the card;
- harp, Rhodes, strings and a felt kick, with no snaps, bells or UI ticks;
- through a phone band the voice sits 17 dB over the bed (12.7 dB at the 10th percentile);
- master at -14 LUFS and -1.5 dBTP, with the last 4 frames silent so the loop is clean.

## Claims, checked live on 2–3 Nov

- **Prices and stock:** hoops ₹1,199 (57), huggies ₹799 (33), chain ₹1,199 (79), Prism Rivière ₹2,399 (63), Halo Curve ₹1,199 (45).
- **Offer:** BUY2 20% (2+) and BUY3 30% (3+) are active in Shopify. The live nairaflore.com bundle carries the same rates, so
  main is published. 799 + 1,199 + 1,199 = 3,197, less 30% = 2,237.90, which the bag shows as ₹2,238. By COD, Fastrr adds 5%
  (₹2,349.90), which is still under ₹2,500, so COD is never called free.
- **Listing wording:** the huggies, chain and hoops listings say "Plating: PVD 18K gold coating" and "Waterproof and tarnish
  free". The Halo Curve listing says "Open, adjusts to fit US 5 to 9".
- **Plating:** the site says "3-year plating assurance", so the ad says assurance, not guarantee. Riya's "Two years plating
  guarantee" is never used.
- **Never named or priced:** the kada, the two-stone ring and the sold-out lariat.
- **Never used:** NAIRA10.

## Before spend

- Put the huggies, chain and hoops in the live bag and confirm Fastrr charges ₹2,238 prepaid.
- The owner approves "Waterproof" and "18K gold coating" in ads (both are listing wording).

## Build

Start from the earlier setups: the footage library and frames from `../creator-ads-v4` and `../hook-ads-v5`, the fonts, and
the voices (`$S/vo/riya.48k.wav`, `ana.48k.wav`). Then:

```
cp engine/* $S/ads/engine/ && cp tools/* $S/ads/tools/
cd $S && python3.13 -I ads/tools/xshot.py $S <shots/v3.json>           # and v1.json / v2.json for those versions
cd $S/ads && python3.13 -I tools/build_h3.py $S                         # hero3/ ; add "cut15" for hero3_15/
node tools/render.mjs hero3 out_hero3
python3.13 -I tools/audio6.py $S hero3 score && bash tools/master.sh hero3 mix_score master_score
bash tools/encode.sh hero3 final6/naira-hero-v3.mp4 7000k hero3/master_score.wav
python3.13 -I tools/areport.py $S hero3 score                           # the audio report
node tools/timeline.mjs hero3 timeline.md "title"                       # the timeline as built, for reviewers
```

The film's voice (Nyra) is ElevenLabs v4 through Higgsfield, preset `b0f766b7-8703-4bd1-b973-f857c36837b6`, spelled
"Nyra" so it is pronounced right. The reads are cut per phrase and run at 1.1x (the assurance at 1.18x). `render.mjs`,
`master.sh` and `encode.sh` are the ones in `../vo-ads/tools`. Engine v3 adds two things: a shot with a `rect` plays as a
tile, and speed 0 freezes the frame.
