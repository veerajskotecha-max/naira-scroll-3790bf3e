# Assemble the shortlist page: ratings + ad files + asset ids (ids.json, filled after upload) -> ads/naira-ad-shortlist.html
import json, sys, os
S = sys.argv[1]; A = f'{S}/ads'
rat = json.load(open(f'{A}/ratings.json')); man = {m['id']: m for m in json.load(open(f'{A}/out/manifest.json'))}
ids = json.load(open(f'{A}/ids.json')) if os.path.exists(f'{A}/ids.json') else {}
URL = open(f'{A}/url.txt').read().strip() if os.path.exists(f'{A}/url.txt') else 'https://claude.ai/artifact/'
aid = lambda p: ids.get(os.path.basename(p), '')
HOOPS = dict(name='Woven Gold Hoops', handle='woven-gold-hoops', price=1499, mrp=2769, stock=68)
HUG = dict(name='Brushed Gold Huggies', handle='brushed-gold-huggies', price=1099, mrp=2199, stock=15)
TOG = dict(name='Toggle Link Chain', handle='toggle-link-chain', price=1499, mrp=2900, stock=80)
HALO = dict(name='Halo Curve Ring', handle='halo-curve-ring', price=2049, mrp=3419, stock=5)
LAR = dict(name='Baroque Pearl Lariat', handle='baroque-pearl-lariat', price=1599, mrp=3829, stock=2)
link = lambda h, slug: f'https://nairaflore.com/jewellery/{h}?utm_source=meta&utm_medium=paid_social&utm_campaign=creative_test_oct&utm_content={slug}'
SILENT = "No song in the ad file (Meta can mute or reject unlicensed music). Add a track from Meta's Sound Collection, or run it silent."
C = [
 dict(id='C2', rec='run', title='Doing all the work', angle='Price-led', products=[HOOPS], slug='doing-all-the-work',
      primary='These hoops are doing all the work ✨ Woven Gold Hoops, ₹1,499 (MRP ₹2,769). 18k gold-tone plated, waterproof and tarnish-free. Free delivery, COD available.',
      headline='Woven Gold Hoops · ₹1,499'),
 dict(id='C4', rec='run', title='Mummy vs me', angle='Festive story', products=[HOOPS], slug='mummy-vs-me', until='8 Nov 2026 (Diwali)',
      primary='Mummy said heavy jhumkas. We said hoops 😌 Woven Gold Hoops, ₹1,499: waterproof, tarnish-free and Diwali-ready 🪔',
      headline='Not jhumkas. Hoops.'),
 dict(id='P1', rec='run', title='Pankti · not all gold', angle='Product-first', products=[HUG, TOG], pair=2338, slug='pankti-not-all-gold',
      primary='Not all gold has to shine. Brushed Gold Huggies ₹1,099 + Toggle Link Chain ₹1,499, worn together every day. Any 2 pieces get 10% off in the bag: both for ₹2,338.',
      headline='Satin, not mirror.'),
 dict(id='C1', rec='yes', title='The Cover', angle='Editorial', products=[HOOPS], slug='the-cover',
      primary='The ₹1,499 hoops everyone keeps asking about. Woven Gold Hoops, 46% off MRP. Waterproof, tarnish-free, free delivery and COD.',
      headline='The ₹1,499 hoops'),
 dict(id='C7', rec='yes', title='Hair up or down', angle='Question hook', products=[HOOPS], slug='hair-up-or-down',
      primary='Hair up or hair down? The hoops win either way 😌 Woven Gold Hoops, ₹1,499. Any 2 pieces 10% off, any 3 pieces 20% off, in the bag.',
      headline='Same hoops. Every look.'),
 dict(id='C3', rec='yes', title='Two little moons', angle='Mood + offer', products=[HOOPS], slug='two-little-moons',
      primary='Two little moons for your ears 🌙 Woven Gold Hoops, ₹1,499 (MRP ₹2,769). 18k gold-tone plated and waterproof.',
      headline='Woven Gold Hoops · ₹1,499'),
 dict(id='K7', rec='yes', title='Kisne diya? Maine.', angle='Self-gifting', products=[HOOPS], slug='kisne-diya-maine',
      primary='“Beta, ye kisne diya?” Maine. 👑 For the girl who buys her own jewellery. Woven Gold Hoops, ₹1,499.',
      headline='Khud kamaya. Khud liya.'),
 dict(id='K4', rec='yes', title="POV: you're her hoop", angle='Product humour', products=[HOOPS], slug='pov-youre-her-hoop',
      primary="POV: you're her hoop 😮‍💨 10/10, would hang again. Woven Gold Hoops, ₹1,499: waterproof and tarnish-free.",
      headline='The hoops have opinions'),
 dict(id='K6', rec='yes', title='One photo, new DP', angle='Relatable skit', products=[HOOPS], slug='one-photo-new-dp',
      primary='Bas ek photo… 27 videos later, new DP ✨ Woven Gold Hoops, ₹1,499.',
      headline='Worth the 27 videos'),
 dict(id='R1', rec='hold', title='Where is this from?', angle='UGC testimonial', products=[HALO, LAR], pair=3283, slug='riya-where-is-this-from',
      primary='“Where is this from?” Halo Curve Ring ₹2,049 + Baroque Pearl Lariat ₹1,599. Any 2 pieces get 10% off in the bag: both for ₹3,283.',
      headline='Both for ₹3,283'),
]
cards = []
for c in C:
    m = man[c['id']]; hero = c['products'][0]
    riya = c['id'] == 'R1'
    fname = 'naira-ad-halo-ring-pearl-lariat.mp4' if riya else m['file']
    cards.append(dict(c, url=link(hero['handle'], c['slug']), file=fname, size=m['size'], sha256=m['sha256'],
        parts=[aid(p['path']) for p in m['parts']], preview=aid(m['preview']), poster=aid(m['poster']),
        cover=dict(file=fname[:-4] + '-cover.jpg', asset=aid(f"{A}/out/cover/{m['file'][:-4]}-cover.jpg")),
        music=("Her voice and the original music bed, which is cleared for paid use." if riya else SILENT),
        musicShort=('her voice + cleared original music' if riya else 'no song'),
        capnote=("Preview and ad file: her voice and the original music bed." if riya else 'Preview plays the original song. The ad file has no song.'),
        products=[{k: v for k, v in p.items() if k != 'handle'} for p in c['products']]))
BOARD = 'https://claude.ai/artifact/DazCYqyXArfKwAy3n7rwDV'; DL = 'https://claude.ai/artifact/1WJmCGEH1kVAbQ6La9e5fF'
D = dict(url=URL, pixel='1232524215695667', asOf='14 Oct 2026', asOfShort='14 Oct 2026', families=rat['families'], rows=rat['rows'], drafts=rat['drafts'],
  sprite=dict(rat['sprite'], asset=aid(f'{A}/out/thumbs.jpg')), cards=cards,
  alerts=[
    dict(html=f'<b>The ad account has been stopped since 12 Oct for an unpaid balance</b> (your <a href="{BOARD}" target="_blank" rel="noopener">Ads Board</a>, 14 Oct, 19:10 IST). Nothing new will deliver until it is paid.'),
    dict(calm=True, html="<b>The ad files have no song.</b> Meta can mute or reject commercial music in paid ads, so each file is the edit with its song taken out. Add a track from Meta's Sound Collection in Ads Manager. The Halo ring file keeps the creator's voice and the original music bed, which is cleared."),
    dict(calm=True, html='<b>What the account already shows.</b> Pankti\'s and Riya\'s collab reels ran as ads from 30 Aug to 21 Sep: ₹28,182 and ₹17,382 spent, returning 0.79 and 0.71 per rupee against a break-even of 2.1. Pankti\'s pulled the best clicks and carts of any reel but paid ₹944 per 1,000 views in a narrow luxury-interest audience; Riya\'s cost less to show but sold less per view. The Woven Gold Hoops are selling: the last order, on 11 Oct, was the hoops.'),
    dict(calm=True, html="<b>Sonal, Pankti and the Halo ring creator are in these.</b> Get each one's OK for paid use, or run them as partnership ads from their own handles."),
  ],
  method='How the scores work: hook 25%, product 20%, offer and brand 20%, works with the sound off 10%, ad fit 25% (length, licensed sound, claims, stock, timing and what the account has already shown). Every edit was reviewed frame by frame on 14 Oct. Edits that differ only in their song share one row.',
  footer=f'<span>Prices and stock: live from Shopify, 14 Oct 2026. Past ad results and the billing stop: the <a href="{BOARD}" target="_blank" rel="noopener">Ads Board</a>.</span><span>The originals with their songs are in <a href="{DL}" target="_blank" rel="noopener">Naira Reel Downloads</a> (Kinn Films reels) and in the chat.</span>',
  rules=[
    'The ad account has been stopped for an unpaid balance since 12 Oct (Ads Board, 14 Oct, 19:10 IST). Pay it first; nothing new delivers until then.',
    "Build everything as drafts in a new ad set (or campaign) for this test. Do not edit, duplicate or add ads to the two live ad sets, 'one winner – Copy' and 'Naira · IG Top 20 · Stories + Feed'.",
    'Placements: Instagram and Facebook Reels and Stories. The files are 9:16 with text near the top; Feed crops them to 4:5 and cuts it off.',
    "Sound: the ad files carry no song, because Meta can mute or reject unlicensed music. Add a track from Meta's Sound Collection, or run silent. The Halo ring file keeps the creator's voice and a cleared original bed. Leave Advantage+ music off unless the owner chooses it.",
    'Creators: Sonal, Pankti and the Halo ring creator appear in these ads. Confirm each agreed to paid use, or run them as partnership ads from their handles.',
    'Audience: broad (Advantage+). The narrow interest audiences behind the Pankti and Riya collab reels cost ₹355–944 per 1,000 views, which is most of why they lost money.',
    'The owner decides the budget, the AI-disclosure setting (these are filmed footage with designed graphics, no generated media) and when to publish.',
    'Judge each ad against the break-even ROAS of 2.1 on the Ads Board (operating target 2.8).',
    'Mummy vs me is a Diwali joke: stop it after 8 Nov.'],
  setup=['Objective: Sales, optimised for website purchases. Pixel / dataset 1232524215695667.', 'Audience: India, Advantage+ audience. Identity: the Naira Flore Page and Instagram account.',
    'Each ad: single video, its cover image as the thumbnail, the link, primary text and headline below, button Shop now.', 'Name each ad after its file (without .mp4) so results map back to this page.'],
  howto=['Upload each video with ads_creative_upload_media, upload_source LOCAL_FILE; the owner chooses the saved file. Wait until ads_get_ad_videos reports it ready.',
    "Upload the cover image the same way, or use the video's own thumbnail.",
    "Create the creative with ads_create_creative: single video, link_url, message (primary text), headline, call_to_action_type SHOP_NOW, and Naira Flore's page_id and instagram_user_id. Ask the owner for the AI-disclosure choice; never set it for them.",
    'Create the ad with ads_create_ad under the new test ad set. It is saved as a draft: preview it with ads_get_ad_preview and let the owner publish it.'])
tpl = open(f'{A}/page.tpl.html').read()
html = tpl.replace('/*__DATA__*/null', json.dumps(D, ensure_ascii=False).replace('</', '<\\/'))
open(f'{A}/naira-ad-shortlist.html', 'w').write(html)
missing = [k for c in cards for k in (c['poster'], c['preview'], c['cover']['asset'], *c['parts']) if not k]
print('wrote', len(html), 'bytes; cards', len(cards), '; missing asset ids', len(missing), '; url', URL)
