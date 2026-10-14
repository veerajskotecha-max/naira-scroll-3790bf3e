# Every edit made in this project, rated for Meta ads. Weights: hook 25%, product 20%, offer & brand 20%, works muted 10%,
# ad fit 25% (length, licensed audio, claims, stock, timing, what the account's own results say). Variants that differ only by
# audio share their parent's row. Drafts that were never reviewed as finals are listed without a score.
import json, sys
from decimal import Decimal, ROUND_HALF_UP
W = dict(hook=.25, product=.20, offer=.20, muted=.10, fit=.25)
def total(s): return float(Decimal(str(sum(s[k] * w for k, w in W.items()))).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP))
F = {
 'sonal_corset': "Sonal · corset take, Woven Gold Hoops",
 'sonal_kinn': "Sonal · Kinn Films shoot",
 'sonal_grwm': "Sonal · her GRWM cut",
 'pankti': "Pankti × Naira · huggies + toggle chain",
 'riya': "Halo ring + Baroque lariat · creator reel",
 'pearl': "Creator reel · Pearl Point Studs + Heartline necklace",
}
R = []
def add(id, fam, name, secs, src, s, verdict, note, **kw):
    R.append(dict(id=id, fam=fam, name=name, secs=secs, src=src, s=s, score=total(s) if s else None, verdict=verdict, note=note, **kw))
h = lambda a, b, c, d, e: dict(hook=a, product=b, offer=c, muted=d, fit=e)
# ---- Sonal, corset take
add('C2', 'sonal_corset', 'Doing all the work · ad (round 2)', 15.3, 'v13/final2/naira-ad-doing-all-the-work.mp4', h(9, 9, 10, 9, 8), 'run',
    'Giant ₹1,499 behind her and the line "these hoops are doing all the work" in frame 1, then the benefits, the bag ladder and a shop card. The proven seller, 68 in stock. The best of the three graphics ads.')
add('C1', 'sonal_corset', 'The Cover · ad (round 2)', 15.4, 'v13/final2/naira-ad-the-cover.mp4', h(8, 8, 10, 8, 8), 'yes',
    'A NAIRA magazine cover with the price and 46% off in frame 1. As strong on brand as Doing all the work, a little softer as a hook. Run it as the A/B partner once the first test has a winner.')
add('C7', 'sonal_corset', 'Hair up or down · ad (round 1)', 15.4, 'v13/final/naira-corset-ad2-hair-up-or-down.mp4', h(8, 7, 9, 8, 8), 'yes',
    'The split-screen poll as the hook, then the offer card and shop card. A question stops the scroll; the ending still sells.')
add('C3', 'sonal_corset', 'Two little moons · ad (round 2)', 14.1, 'v13/final2/naira-ad-two-little-moons.mp4', h(7, 8, 9, 7, 8), 'yes',
    'The prettiest of the three graphics ads, but frame 1 says nothing about the product or price; they arrive in bar 2. Third choice of the three.')
add('C4', 'sonal_corset', 'Mummy vs me · post', 15.3, 'v13/final2/naira-post-mummy-vs-me.mp4', h(9, 7, 5, 9, 8), 'run',
    'A Diwali chat with mummy, "not jhumkas", then HOOPS. Native and shareable, and timely now. No price on screen, so the ad text carries it. Retire after Diwali (8 Nov).')
add('C6', 'sonal_corset', 'Doing all the work · ad (round 1)', 15.3, 'v13/final/naira-corset-ad1-doing-all-the-work.mp4', h(9, 9, 10, 9, 7), 'superseded',
    'The first cut of the round-2 ad above, which fixed its details. Use the round-2 file.')
add('C5', 'sonal_corset', 'Hair up or down · post (round 2)', 15.4, 'v13/final2/naira-post-hair-up-or-down.mp4', h(8, 6, 4, 8, 5), 'organic',
    'Built for comments, with no price or shop card. For ads, the round-1 ad version (above) does the same hook and then sells.')
add('C8', 'sonal_corset', 'The cover · post (round 1)', 24.2, 'v13/final/naira-corset-post1-the-cover.mp4', h(8, 8, 9, 8, 5), 'superseded',
    '24 s version of The Cover. The 15 s ad cut replaced it.')
add('C9', 'sonal_corset', 'Two little moons · post (round 1)', 24.2, 'v13/final/naira-corset-post2-two-little-moons.mp4', h(7, 8, 6, 7, 5), 'superseded',
    '24 s version of Two little moons. The 15 s ad cut replaced it.')
add('C10', 'sonal_corset', 'Festive mode · post (round 1)', 24.2, 'v13/final/naira-corset-post3-festive-mode.mp4', h(8, 7, 7, 8, 2), 'no',
    'The giant word "18K GOLD" reads as a gold-content claim; the hoops are 18k gold-tone plated steel. Do not run as it is.')
# ---- Sonal, Kinn Films shoot
add('K7', 'sonal_kinn', 'Kisne diya? Maine.', 11.1, 'v15/deliver/naira-reel-7-kisne-diya-maine.mp4', h(9, 7, 5, 9, 7), 'yes',
    '"Beta, ye kisne diya?" then "MAINE." The self-gifting angle, 11 s, and timely for Dhanteras and Diwali. No price on screen. Also made with track C (same picture).', alts=['naira-reel-7b-kisne-diya-maine-track-c.mp4'])
add('K4', 'sonal_kinn', 'POV: you\'re her hoop', 15.4, 'v15/deliver/naira-reel-4-pov-youre-her-hoop.mp4', h(8, 8, 5, 9, 7), 'yes',
    'The hoop narrates ("ow. ow. OW.", "10/10 would hang again"). Funny and product-led the whole way. No price on screen. Also made with track A.', alts=['naira-reel-4b-pov-youre-her-hoop-track-a.mp4'])
add('K6', 'sonal_kinn', 'I asked for one photo · new DP (14 s)', 14.3, 'v15/deliver/naira-reel-6-i-asked-for-one-photo-new-dp.mp4', h(8, 7, 5, 9, 7), 'yes',
    'Hinglish chat ("naira wale hoops pehne hain, dikhne chahiye"), 27 videos, then the new DP. Relatable, names the brand inside the joke.')
add('K6c', 'sonal_kinn', 'I asked for one photo · final (26 s)', 26.3, 'v15/deliver/naira-reel-i-asked-for-one-photo-final.mp4', h(8, 7, 5, 9, 4), 'organic',
    'Longer cut that ends on a staged comment thread. Great as a post; in a paid ad the fake comments read as made-up social proof. Use the 14 s cut for ads.')
add('K6b', 'sonal_kinn', 'I asked for one photo · v3', 26.1, 'v15/deliver/naira-reel-6-i-asked-for-one-photo-v3.mp4', h(8, 7, 5, 9, 4), 'superseded', 'Replaced by the final above.')
add('K1', 'sonal_kinn', 'Diwali look loading', 21.9, 'v15/deliver/naira-reel-1-diwali-look-loading.mp4', h(8, 6, 3, 8, 5), 'organic',
    'A loading bar to 100% with ticks for each piece. Festive and fun. It ticks the ring, which isn\'t sold, and has no price. Post it.')
add('K2', 'sonal_kinn', 'Hair up or hair down', 15.4, 'v15/deliver/naira-reel-2-hair-up-or-hair-down.mp4', h(8, 6, 3, 8, 5), 'organic',
    'Poll bars and a tie-breaker. An engagement post. Also made with track A.', alts=['naira-reel-2b-hair-up-or-hair-down-track-a.mp4'])
add('K5', 'sonal_kinn', 'Choose your character', 12.9, 'v15/deliver/naira-reel-5-choose-your-character.mp4', h(7, 5, 3, 8, 3), 'organic',
    'A video-game select screen. Fun as a post; the pixel look is off-brand for a paid placement.')
add('K3', 'sonal_kinn', 'Introducing Pawan Kumar', 16.4, 'v15/deliver/naira-reel-3-introducing-pawan-kumar.mp4', h(6, 4, 3, 7, 4), 'organic',
    'The wind machine gets the credit. A joke about the shoot, not the jewellery.')
add('J3', 'sonal_kinn', 'Punjabi · hoop zoom', 15.6, 'v15/deliver/naira-punjabi-3-hoop-zoom.mp4', h(6, 8, 3, 3, 4), 'organic',
    'Every shot pushes into the hoop, cut to the song. Great product footage, but it lives on the song and says nothing muted.')
add('J2', 'sonal_kinn', 'Punjabi · Multiply (final)', 20.9, 'v15/deliver/naira-punjabi-2-multiply-grid-final.mp4', h(6, 6, 4, 5, 3), 'organic',
    'The grid splits with the song and ends on the brand tile. A music piece; the earlier no-graphics cut is the same idea.', alts=['naira-punjabi-2-multiply-grid.mp4'])
add('E1', 'sonal_kinn', 'Elegant · I asked for one photo (moon song)', 34.2, 'v15/deliver/naira-elegant-1-i-asked-for-one-photo-moon-song.mp4', h(5, 6, 3, 7, 2), 'organic',
    'Slow and beautiful, 34 s, built on the song. A post.')
add('J1', 'sonal_kinn', 'Punjabi · The drop', 13.0, 'v15/deliver/naira-punjabi-1-the-drop.mp4', h(6, 6, 2, 2, 3), 'organic', 'A mood edit on the song\'s drop. No words, no product name.')
add('E2', 'sonal_kinn', 'Elegant · the finishing touches', 21.1, 'v15/deliver/naira-elegant-2-the-finishing-touches-punjabi-no-lyrics.mp4', h(5, 6, 2, 2, 3), 'organic',
    'A mood edit on the Punjabi song (with and without lyrics).', alts=['naira-elegant-2-the-finishing-touches-punjabi.mp4'])
add('E3', 'sonal_kinn', 'Elegant · tera karaan intezaar', 18.9, 'v15/deliver/naira-elegant-3-tera-karaan-intezaar-punjabi-no-lyrics.mp4', h(5, 6, 2, 2, 3), 'organic',
    'A mood edit on the Punjabi song (with and without lyrics).', alts=['naira-elegant-3-tera-karaan-intezaar-punjabi.mp4'])
add('J4', 'sonal_kinn', 'Punjabi · flash photoshoot', 21.1, 'v15/deliver/naira-punjabi-4-flash-photoshoot.mp4', h(6, 5, 2, 2, 2), 'organic',
    'Camera flashes and black frames on the beat. Fine as a post; flashing frames are a risk in ad review.')
add('B1', 'sonal_kinn', 'Best parts · 30 s', 30.0, 'v15/deliver/naira-best-parts-30s-silent.mp4', h(4, 6, 1, 2, 4), 'footage',
    'Raw selects with no story. Source footage for future ads (silent and track-B versions).', alts=['naira-best-parts-30s-track-b.mp4'])
add('B3', 'sonal_kinn', 'Best parts · labelled (30 s and 40 s)', 39.2, 'v14/out/naira-best-parts-40s-labelled.mp4', h(3, 5, 1, 1, 1), 'internal',
    'Clip labels burned in, for picking shots. Internal only.', alts=['naira-best-parts-30s-labelled.mp4', 'naira-best-parts-30s.mp4', 'naira-best-parts-40s.mp4', 'naira-best-parts-30s-clean.mp4'])
# ---- Sonal, GRWM
add('G1', 'sonal_grwm', 'Get ready with Naira', 23.9, 'v20/out/naira-grwm-final.mp4', h(6, 6, 3, 4, 6), 'organic',
    'Her own post with the title. Best used as a partnership ad from her handle once it is live, not as a cold Naira ad. A no-music file exists.', alts=['naira-grwm-final-no-music.mp4'])
# ---- Pankti
add('P1', 'pankti', 'Pankti × Naira · v11 motion graphics', 19.6, 'pk/naira-pankti-v11.mp4', h(9, 10, 9, 9, 7), 'run',
    'The best-made ad of everything here. Huggies fill frame 1, "not all gold has to shine", swing tags with today\'s prices, end card "both for ₹2,338". Her original collab reel had the best click and add-to-cart rates of any reel; it lost money because its luxury-interest audience cost ₹944 per 1,000 views. Run this one on a broad audience. Her sound needs swapping.')
add('P2', 'pankti', 'Pankti × Naira · v10', 19.3, 'pk/naira-pankti-final.mp4', h(9, 10, 9, 8, 5), 'superseded', 'The cut before v11, with fewer graphics.')
add('P3', 'pankti', 'Pankti × Naira · v7 re-cut', 17.8, 'final/naira-pankti-v7.mp4', h(9, 9, 8, 8, 4), 'superseded', 'Earlier re-cut; its end card uses the old dark wordmark, not the sage and pink one.')
# ---- Riya
add('R1', 'riya', 'Where is this from? · final (with the original music bed)', 39.6, 'v12/naira-halo-baroque-FINAL-no-music.mp4', h(7, 7, 9, 6, 3), 'hold',
    'The "where is this from?" DM format with live prices and a pair card. But it runs 40 s, long for a cold ad, and the Baroque Pearl Lariat has 2 left. Hold, or cut a 15 s version once it is restocked.')
add('R2', 'riya', 'Where is this from? · final with music (graded)', 39.6, 'v12/naira-halo-baroque-final-with-music.mp4', h(7, 7, 9, 6, 3), 'superseded', 'Same edit on the earlier graded frames. The ad file above uses the final frames and the same cleared music bed.')
add('R3', 'riya', 'Where is this from? · v5', 39.6, 'v12/naira-halo-baroque-v5.mp4', h(7, 7, 9, 6, 3), 'superseded', 'Replaced by the final.')
add('R4', 'riya', 'Where is this from? · v4 (macro)', 39.6, 'v12/naira-halo-baroque-v4.mp4', h(5, 8, 9, 6, 2), 'no', 'The macro zoom and blur read as AI-made; you sent it back.')
# ---- Pearl creator reel
add('H1', 'pearl', 'Found my favourite jewellery · final', 28.2, 'v8/naira-pearl-heartline-final.mp4', h(5, 7, 7, 6, 3), 'hold',
    '"Not going to gatekeep" UGC with tags for both pieces. The first frames are out of focus, it runs 28 s, and the studs have 3 left and the necklace 4.')
DRAFTS = [('riya', 'Where is this from? · v1–v3', 'Earlier drafts of the final; not rated separately.'),
          ('pankti', 'Pankti × Naira · v8, v9', 'Earlier drafts of v11; not rated separately.'),
          ('pearl', 'Found my favourite jewellery · v8', 'The draft before the final; not rated separately.')]
json.dump({'families': F, 'rows': R, 'drafts': DRAFTS, 'weights': W}, open(sys.argv[1], 'w'), indent=1, ensure_ascii=False)
for r in sorted(R, key=lambda r: -(r['score'] or 0)): print(f"{r['id']:4s} {r['score']:4.1f} {r['verdict']:10s} {r['name']}")
