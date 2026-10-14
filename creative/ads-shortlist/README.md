# Ad shortlist — every reel edit rated for Meta ads

The page: https://claude.ai/artifact/MQQqBJeqqQz7F2qqETDx6Z (private to the owner). It rates every edit made so far (37 rows;
variants that differ only by their song share a row), shows the ten worth an ad file as cards with a preview, scores, live
price and stock, ad text, a Run first / Shortlist / Skip pick and a note, and saves the full-quality ad file and a 1080×1920
cover. Picks live in the page's `db` (`picks/<id>`: `{pick, note, at}`; no document means Claude's suggestion stands), so
Claude can read them back with `ArtifactData list picks`. "Save brief for Claude" writes `naira-ads-brief.md`: setup rules,
each picked ad's file, link, text and button, and a JSON block with the asset ids and sha256 of every file.

The page also carries the two creator collab reels that ran as ads ("Pankti's and Riya's reels, as they ran"): the files
exactly as shared (`pankti_edit.mp4`, `riya_edit.mp4`), the text each ran with (read from Meta), and their results. Both
default to Skip. Pankti's shows old prices on screen (₹1,449 huggies, ₹3,448 the pair), and Riya's opens on the Cushion
Halo Ring, which was sold out on 14 Oct.

## How the scores work

Hook 25%, product 20%, offer and brand 20%, works muted 10%, ad fit 25%. Ad fit covers length, licensed sound, claims, stock,
timing, and what the account has already shown. Every edit was reviewed from frame sheets (`tools/sheets.py`) on 14 Oct 2026.
The numbers behind "what the account has shown" come from the owner's Ads Board artifact on that date: break-even ROAS 2.1,
and a billing stop since 12 Oct.

The Pankti and Riya collab reels that ran from 30 Aug to 21 Sep (the creators' own Instagram posts, promoted):

| | Spent | Per 1,000 views | Outbound CTR | Carts / landing views | Buys | ROAS | Saw a quarter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pankti | ₹28,182 | ₹944 | 2.73% | 70 / 768 | 8 | 0.79 | 7.0% |
| Riya | ₹17,382 | ₹355 | 1.87% | 42 / 766 | 6 | 0.71 | 4.0% |

Pankti's needed under about ₹356 per 1,000 views to break even and paid ₹800–1,240 in every week of a narrow
luxury-interest audience; its clicks and carts were the best of any reel. Riya's needed under about ₹120; its weak
opening (3–4 s of her face before any jewellery) shows in the 4% who saw a quarter of it.

Run first: Doing all the work (price-led, Woven Gold Hoops), Mummy vs me (festive story, retire after 8 Nov) and Pankti v11
(product-first, huggies + toggle chain). They are three angles on two product lines, not simply the three top scores. The
Halo ring + Baroque lariat reel ("where is this from?", a different creator from Riya) is held: it runs 40 s and the
Baroque Pearl Lariat had 2 in stock.

## The ad files

`tools/prep.py` takes each pick's final and writes:
- an ad master with the song removed: a stream copy of the video plus a silent AAC track, because Meta mutes or rejects
  unlicensed music in paid placements;
- a 540×960 preview with the original song;
- a poster and a 1080×1920 cover;
- the master split into two parts with its sha256. The artifact's asset store takes at most 20 MiB a file, and the page
  rejoins the parts and checks the hash before saving.

The Halo ring master keeps the creator's voice and the original synth bed (`halo-baroque-v4/audio/music.py`, cleared), muxed from `mix.wav`.
That file is sample-aligned with the final video (lag 0).

Covers and posters go through RGB (`in_color_matrix=bt709:in_range=tv,format=rgb24`) before JPEG. A direct
yuv→yuvj conversion keeps BT.709 coefficients that a JPEG decoder reads as BT.601.

## Facts that make the ads wrong if they change

These were checked live in Shopify on 14 Oct 2026; `build_page.py` holds them as literals.

| Product | Price | MRP | Stock |
| --- | --- | --- | --- |
| Woven Gold Hoops | ₹1,499 | ₹2,769 | 68 |
| Brushed Gold Huggies | ₹1,099 | ₹2,199 | 15 |
| Toggle Link Chain | ₹1,499 | ₹2,900 | 80 |
| Halo Curve Ring | ₹2,049 | ₹3,419 | 5 |
| Baroque Pearl Lariat | ₹1,599 | ₹3,829 | 2 |

Pair prices are the bag's BUY2 rung (10%).

The ad text claims only what the listings say: 18k gold-tone plated, waterproof, tarnish-free. The Halo Curve Ring's listing
text calls it a "solid gold band", which its own tags (18k Gold Tone Plated) contradict. Fix the listing before advertising it.

## Rebuild

```
python3 tools/ratings.py ratings.json && python3 tools/prep.py <ffmpeg> <scratch> items.json
python3 tools/build_page.py <scratch>    # needs ids.json (asset ids from the upload) and url.txt
```
