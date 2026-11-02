# Three voiceover ads — 10 s, 20 s, 30 s

The brief:
- Study a reference reel, a motion-graphics ad for Shopify playing in an editor timeline.
- Write three high-CTR Naira ads with voiceover, informative, with the right prices, offers and styles.
- Make two of them from our existing clips, mixed and matched.
- Make the third freely creative, as long as it converts.
- Use Higgsfield where it helps.

The ads are 1080x1920, 30 fps, H.264 with AAC, at -14 LUFS. The videos, frames and voice files are not in git.

## The reference, and what we took from it

Its whole voiceover is 14 words: "Shopify. T-shirts, shoes, jackets. Somewhere, someone found you. Sell what you make."

- **Words on pictures.** Each word lands on its own picture: an order card shrinks to a dot that becomes the logo, then a product list pulls focus row by row, then a live map.
- **One idea per beat.** There is one accent light (its green glow), and focus pulls steer the eye. Whips carry motion blur, and a kinetic tagline closes it.

We kept three things from it:
- word-on-picture voice timing;
- one warm light on ink for the graphic scenes;
- the product list with focus pulls.

## The data the scripts stand on (checked live, 2 Nov 2026)

| Piece | Price | MRP | Stock | Footage |
| --- | --- | --- | --- | --- |
| Woven Gold Hoops | ₹1,199 | ₹2,769 | 57 | GRWM, Sonal's corset clip, Riya's box |
| Brushed Gold Huggies | ₹799 | ₹1,799 | 33 | Pankti |
| Toggle Link Chain | ₹1,199 | ₹2,900 | 79 | Pankti |
| Cushion Halo Ring | ₹1,099 | ₹2,200 | 58 | Riya (rhodium, so never called gold) |

- **Bestseller claim.** Woven Gold Hoops is the #1 seller by units over the last 60 days (24 units), which is what "our number-one bestseller" rests on.
- **Offers.** BUY2 is 20% and BUY3 is 30%, both applied by the bag. The bag rounds `Math.round(subtotal × (1 − rate))`:
  - three pieces at ₹3,197 come to ₹2,238;
  - two at ₹1,998 come to ₹1,598.
- **Shipping and returns.** From the site's own copy: free insured shipping, 3–5 working days, COD, and a 7-day exchange and returns.
- **Product claims.** Only the listing tags: waterproof, tarnish-free, hypoallergenic, and 18K gold tone for the gold pieces.
- **What past ads taught us:**
  - Pankti's reel opened on the box and the pieces and had the best click rate (2.73%).
  - Riya's opened on 3–4 s of her face, and only 4% watched a quarter of it.
  - So every ad here opens on jewellery or the question, never on a face.
- **Left out on purpose:**
  - the Halo creator's reel, whose Drive files carry old prices and the now sold-out lariat burned into the picture;
  - NAIRA10, which the owner took off the header.

## The scripts

**10 s · "Our #1 bestseller"** (existing clips)

> Our number-one bestseller. Now just ₹1,199. Waterproof. Tarnish-free. Buy two, take 20% off. Shop Naira.

1. The hoop held up to the lens (GRWM).
2. Riya's Naira box of hoops, with the name.
3. The price card over Sonal.
4. Riya's hair whip and the chips.
5. The fist-under-chin close-up with "Buy 2 · 20% / Buy 3 · 30%".
6. An end card with the AI hoops clip, price and Shop Now.

**20 s · "Your whole stack, in one box"** (existing clips)

> Your whole stack, in one box. Huggies, ₹799. The toggle chain, ₹1,199. A halo ring, ₹1,099. Plus our bestselling hoops. Pick any two, take 20% off. Pick three, 30%. Free shipping across India. Shop Naira.

1. Pankti's box opening.
2. Each piece named on its own shot with its price card: huggies, chain, ring (Riya's box and macro), then hoops.
3. The bag fills over blurred footage: 2 pieces is ₹1,598, 3 pieces is ₹2,238.
4. Shipping, COD and exchange chips.
5. An end card with all four pieces.

**30 s · "Where is it from?"** (creative)

> Somewhere, someone just asked… where is it from? Naira. Hoops. Huggies. Chains. Rings. Demi-fine jewellery, made in limited batches. Waterproof, tarnish-free, hypoallergenic — and all four, under ₹1,200 each. Pick any three, and your bag takes 30% off. Free insured shipping across India, with cash on delivery. So the next time they ask where it's from… say Naira.

1. A DM is on screen from frame 1: "omg your hoops 😍", then "wait where is it from??".
2. The DMs collapse into a glint, which blooms into the flower and the NAIRA wordmark.
3. A product list pulls focus row by row on "Hoops. Huggies. Chains. Rings."
4. Two AI studio clips ("demi-fine.").
5. Real footage with the claim chips.
6. Four tiles with an "all under ₹1,200" stamp.
7. The bag ladder on ink.
8. Riya's box with the shipping chips.
9. The DM again, answered "@nairaflore ✨" on "say Naira".
10. The end card.

## How it is made

- **`tools/shots.py` and `tools/extract.py`.** The 20 shots, decoded with each source's own matrix and no grade.
  - Pankti's raw is HLG and mirrored. It gets a plain Hable tone-map and a flip, nothing else.
- **`tools/assets.py`.** Product photos from Shopify's CDN, the repo's sage logo, and the AI clips' backdrop colours.
- **`tools/build.py`.** Writes one page per ad:
  - the footage as a canvas layer;
  - every graphic as a DOM element posed from keyframes;
  - captions lit word by word from the voice's own timings.
- **`engine/engine.js`.** Poses any frame from `t` alone, so frames render in any order. It also handles:
  - whips, punches and flashes;
  - the modal blur behind the bag;
  - the AI clips over a blurred copy of themselves, so no seam shows.
- **Voice.** ElevenLabs v4 through Higgsfield, preset voice "Maya" (`b0f766b7-8703-4bd1-b973-f857c36837b6`), with "Nyra" spelled out so the name is said as "Nai-ra".
  - Each read is cut at its pauses (`tools/asr_words.py` gives the word timings) and placed phrase by phrase on its picture.
  - The 20 s read was regenerated shorter: the first ran 24.8 s.
- **AI clips.** Kling 3.0 std, 5 s, 1:1, started from the Shopify product photos of the hoops and the huggies. Pro mode needs a higher Higgsfield plan.
  - Prompt: same piece unchanged, slow push-in, warm light sweep, no hands, no text.
  - They cost 7.5 credits each, and the voices cost under 2 credits.
- **`tools/audio.py`.** Synthesises an original bed (120 BPM, Cmaj9 – Am9 – Fmaj9 – G6/9), so it is ours to run in paid placements where Meta mutes licensed songs.
  - Whooshes, impacts, glints and DM pops sit on the cuts.
  - The bed ducks about 9 dB under the voice.
  - Each mix is gained to -14 LUFS through a limiter with a true peak of -1.4 dB or lower.
- **`tools/render.mjs` and `tools/encode.sh`.** Render and encode.
  - Frames are JPEG q95, converted from BT.601 full range to BT.709 TV range.
  - The 10 s and 20 s ads are CRF 16; the 30 s ad is two-pass at 6.9 Mbps so it fits the chat's 30 MB limit.

## Run

The scratch layout:
- `S/src/` holds `grwm.mp4`, `pankti_raw.mp4` and `riya_F67FB13D.mp4` from Drive.
- `S/v14/dl/8BB38387-…/` holds Sonal's 39 s corset clip.
- `S/ai/` holds the two Kling clips.
- `S/vo/vo10|vo20b|vo30.48k.wav` are the voices.
- `S/fonts/` holds `CG.ttf`, `CG-Italic.ttf` and `Jost.ttf` from google/fonts.

```
python3.13 -I tools/extract.py <S> && python3.13 -I tools/assets.py <S> <repo>
python3.13 -I tools/build.py <S>
cd <S>/ads && node tools/render.mjs ad10 out_ad10        # likewise ad20, ad30
python3.13 -I tools/audio.py <S> ad10                   # then gain to -14 LUFS (see above) into ad10/master.wav
./tools/encode.sh ad10 final/naira-ad-10s-bestseller-hoops.mp4 16
```

If a price, MRP or offer changes, change `P` and the bag totals in `build.py`, the voice lines, and the captions together. The voice says the prices aloud.

## v2: graphics and sound redone

The owner asked for better sound effects and graphics on all three ads. The scripts, voice, cut and timings did not change.

### Graphics

The graphics are in `tools/build2.py`, `engine/engine2.js` and `engine/base2.css`.

- **Prices.** Each price card opens on the MRP and counts down to the price as the voice says it. Then the MRP is struck through, and a % OFF stamp lands on the card's corner, clear of the name.
- **Callouts.** A line runs from the card to the piece and follows it through the shot. The positions were read off grid sheets and checked in crops (`TR` in `build2.py`).
- **Sparkles.** They sit on the metal, and each one ends inside its own shot.
- **Light leaks.** Warm leaks mark the section changes.
- **Captions.** Each word rises in as it is said. Prices, percentages and "#1" are set larger, in Cormorant blush.
- **The bag.** Pieces drop in and the ladder lights each rung.
  - The total counts to what the bag really charges: ₹1,598 for two, ₹2,238 for three.
  - A YOU SAVE chip lands on the bag's lower edge, clear of the total.
- **The 30 s ad.**
  - The DM opens as a reply to a story about the hoops, with a typing indicator.
  - The product tags are kept off faces.
  - The "all under ₹1,200" stamp sits above the grid so it hides no names.
- **End cards.** Every end card opens through the brand flower: it pops, then the camera dives into its widest petal. The build found that petal with a distance transform.
  - The hole is a `clip-path: path()` recomputed each frame, so it stays sharp at any size.
  - A blush rim is drawn on the canvas just outside the hole.
  - The last shot runs on, slowed, under the dive, so no black shows before the card fills the frame.

### Sound

The sound is in `tools/audio2.py` and `tools/master.sh`.

- **The groove.** An original deep-house track: Rhodes, a supersaw pad, sidechained bass and swung hats.
  - It runs at 120 BPM. The 30 s ad runs at 124.675 BPM, so that both "Naira" (4.10 s) and the end card (27.20 s) land on downbeats.
  - It is arranged to the cut: an intro, the groove, a lift under the offer, a break and a stop before each end card, then a resolving Cmaj9.
- **Effects.** They play from a cue list that `build2.py` writes from the same times as the graphics:
  - counter ticks that follow the numbers;
  - a ding on the price and a pen scratch on the strike;
  - a stamp, sparkle bells and callout zips;
  - DM pops and typing;
  - bag drops on rising notes, chimes on each rung, and a success arpeggio;
  - the flower bloom and the dive.
- **Levels.**
  - The voice is set to -16 LUFS. Each kind of effect sits a fixed number of dB under the voice's loud syllables (`OFF`).
  - The bed is mixed for phones. Its sub is cut and its mids lifted.
  - Through a phone-speaker filter, the bed sits about 12–14 dB under the voice, and the effects 7–9 dB under.
- **Master.** `master.sh` takes each mix to -14 LUFS, with a true peak of -1.2 dBTP or lower.
- **QC aids.**
  - `tools/levels.py` gives the loudness of each stem over time.
  - `tools/sheet.py` makes contact sheets.

### Run v2

Run this after the v1 steps (frames, assets and voice). `encode.sh` takes a CRF, or a bitrate for two passes.

```
python3.13 -I tools/build2.py <S>
cd <S>/ads && node tools/render.mjs ad10v2 out_ad10v2              # likewise ad20v2, ad30v2
python3.13 -I tools/audio2.py <S> ad10v2 && ./tools/master.sh ad10v2
./tools/encode.sh ad10v2 final/naira-ad-10s-bestseller-hoops-v2.mp4 16
./tools/encode.sh ad30v2 final/naira-ad-30s-where-is-it-from-v2.mp4 6900k
```

## v3: the owner's claims, softer sound, and their earlier songs

The owner gave three notes on v2:
- tone down the "ting tings";
- try the trending songs used before;
- put the PVD coating, the 18K gold coating, the zircon stones and the 3-year plating guarantee ("lifetime, if you use it carefully") in all three ads, and make them elegant.

### The claims, and where each one is true

The listings (checked live, 2 Nov) say:
- the hoops, huggies and chain have a "PVD 18K gold coating" over surgical stainless steel;
- the ring has a "PVD rhodium coating", and its stones are "cubic zirconia";
- the hoops and huggies say "Stones: None".

So each claim appears only on the pieces it is true of:
- **"18K gold coating"** is never shortened to "18K gold" on screen, so it cannot read as gold content.
- **The stones** appear on the ring alone, in the listing's own words, "cubic zirconia". The hoops-only 10 s ad mentions no stones.
- **The guarantee** is the owner's 3 years. **The site still says "2-year plating assurance"** (`Footer.tsx`, `ProductDetails.tsx` on main). Change one of them before these run, so the ad and the shop agree.

The new voice lines are read by the same voice (Maya on ElevenLabs v4), each inside its neighbouring sentences so the delivery flows. They are cut in phrase by phrase:

| Ad | Out | In | Where it shows |
| --- | --- | --- | --- |
| 10 s | "Waterproof. Tarnish-free." | "Eighteen-K gold, P.V.D. coated." (`vo10c`, sped up 6% as `vo10c_fast` to fit) | Chips "18K gold coating" and "PVD · anti-tarnish", the card's "PVD 18K gold coating" tag, and the guarantee on the end card |
| 20 s | "Free shipping across India." | "Three-year plating guarantee." (`vo20c`) | A guarantee chip first, then shipping and COD, with "PVD coated · a lifetime of wear, with care" under them. Card tags: "PVD 18K gold coating" on the gold pieces, "Cubic zirconia" on the ring |
| 30 s | "Waterproof, tarnish-free, hypoallergenic, and all four under ₹1,200 each" | "P.V.D. coated in eighteen-K gold, with a three-year plating guarantee" (`vo30c`) | Three chips and the care line. The ₹1,200 stamp now lands in the music after the line. A "Cubic zirconia" tag on the ring in its box |

Every end card's trust row now leads with the 3-year plating guarantee, with the care line under it. The 10 s re-times from the price on, to make room for the line. Its end card still opens on a downbeat of the score.

### Calmer, by the owner's ask

The v3 pictures are built by `build3.py` on v2's engine. The changes:
- The % OFF tags and the offer values wipe or fade on; nothing slams or squashes.
- The bag's saving chip wipes on.
- There are no sparkle bursts. Each ad keeps two or three sparkles, and only one makes a sound.
- Callouts are thinner, with a smaller dot.
- The button gets one tap.
- The cue list names only soft sounds: whooshes, card swishes, paper taps, bag thunks, the DM pops, and the flower's bloom and dive.
  - Every bell, ding, chime, tick and arpeggio is gone.
  - The effects stem measures about 6–8 dB quieter than v2's.

### Music: an elegant original, and the owner's songs

`audio3.py <S> <ad> score|song` builds both versions over the same picture.
- **score** is an original track, so it is ours to run in paid placements.
  - It runs at 93.5 BPM in D major (Dmaj9, Bm9, Gmaj9, A6/9).
  - The instruments are harp arpeggios, Rhodes, strings, a half-time kick, finger snaps and soft bass.
  - In the 30 s ad, "Naira" (4.10 s) and the end card (27.20 s) sit exactly nine bars apart.
- **song** cuts one of the owner's earlier songs so that its silence and drop land on the ad's big moment:
  - **The GRWM song** (the audio of the owner's GRWM edit) goes on the 10 s. Its drop, 8.63 s into the song, lands on the end card, so "take 20% off" falls in its hush.
  - **Song D**, the Punjabi "tera karaan intezaar", goes on the 20 s and the 30 s. It comes from the owner's corset edit (`8BB38387….mp4`).
    - In the 20 s, its 17.849 s drop lands on the end card.
    - In the 30 s, the drop lands on "Naira". The song then starts again from its first line under the closing DM, so its bass comes in on the end card.
  - Pankti's song was left out: its English lyrics run under the whole voiceover.
  - The song bed is levelled, then ducked 9 dB with a further dip at 1–4 kHz, so its vocals step aside for the voice.
  - A commercial song can be muted or rejected by Meta in a paid ad. The song versions are for comparison, and for an organic post with the same song added from Instagram's own library.

Measured through a phone-speaker filter while the voice speaks, the music sits a median 10–15 dB under the voice. Every master is -14 LUFS, true peak -1.2 dBTP or lower.

### Run v3

Run this after the v1 and v2 steps:

```
ffmpeg -i <S>/src/grwm.mp4 -vn -ac 2 -ar 48000 <S>/songs/grwm.wav             # likewise d_owner.wav from 8BB38387….mp4
ffmpeg -i <S>/vo/vo10c.48k.wav -af atempo=1.06 <S>/vo/vo10c_fast.48k.wav
python3.13 -I tools/build3.py <S>
cd <S>/ads && node tools/render.mjs ad10v3 out_ad10v3                        # likewise ad20v3, ad30v3
python3.13 -I tools/audio3.py <S> ad10v3 score && ./tools/master.sh ad10v3 mix_score master_score   # and song
./tools/encode.sh ad10v3 final/naira-ad-10s-final-v3.mp4 16 ad10v3/master_score.wav
ffmpeg -i final/naira-ad-10s-final-v3.mp4 -i ad10v3/master_song.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest final/naira-ad-10s-v3-grwm-song.mp4
```
