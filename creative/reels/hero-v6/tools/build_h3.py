"""HERO V3 (final), "Made to be asked about" (25.9 s). V2's structure, with what its review panel found missing fixed:
- the offer is complete and readable ON MUTE by 9.2 s: the condition at headline size ("Any 3 pieces / 30% off"), 3,197
  struck beside "All three, 2,238", then NO CODE . COD AVAILABLE (V2: "ANY 2" in 34 px caps, no anchor, COD only at 23 s);
- every cut sits on a phrase end and every super comes on HARD on its frame or word (V2 faded them in 0.2 s late);
- the voices get air: "No code." is type now, the hair flip and the breath before the card are music only;
- the worn bracelet is visible (Riya's wrist-to-cheek pose, her fist over the ceiling fan) and its credit is on clean wood;
- the card is complete by 21.27 s, its tiles are the three real boxes, each named and priced, it sells only the top rung,
  and it words COD honestly (never "free" next to COD); the web address comes back from V1.
Brief: hero/v2/critique_summary.txt. Usage: python3.13 -I build_h3.py <S> [cut15]"""
import sys
_S = sys.argv[1]; CUT15 = len(sys.argv) > 2 and sys.argv[2] == 'cut15'
exec(open(f'{_S}/ads/tools/build5_head.py').read())
exec(open(f'{_S}/ads/tools/hero_kit.py').read())
sys.path.append('/root/.local/lib/python3.13/site-packages'); import soundfile as _sf

ANCHOR = 3.867
T_CARD = 9.867 if CUT15 else 20.533
DUR = 14.433 if CUT15 else 25.900

shots = [
    shot('pk_full', 0.000, 0.867, off=7.23),                                     # huggies pinched at the lens
    shot('k_041FCDC6_810', 0.867, 1.700, zoom=[1, 1.03]),                        # Sonal, eyes to the lens, hoop
    shot('h_riya_talk2', 1.700, 2.767, off=0.0),                                 # Riya says the price, in sync (4K, 140%)
    shot('k_74FA1A49_2010', 2.767, 3.867),                                       # the hoop going in
    shot('k_76D95B49_430', 3.867, 4.533),                                        # "this." the hoop at the lens
    shot('pk_full', 4.533, 5.867, off=1.20),                                     # BOX 1: the lid, the drawer, the chain
    shot('pk_full', 5.867, 7.800, off=4.85),                                     # BOX 2: the huggies
    shot('riya_full', 7.800, 9.200, off=16.60),                                  # BOX 3: the hoops
    shot('riya_full', 9.200, 9.867, off=18.767),                                 # worn: hands in her hair, then the whip
]
if not CUT15:
    shots += [
        shot('pk_full', 9.867, 11.867, off=9.30),                                # match cut on the whip: a huggie goes in
        shot('pk_full', 11.867, 13.200, off=24.30),                              # the chain worn, hands free (centred: the left stays clear)
        shot('riya_full', 13.200, 14.533, off=20.30),                            # the bracelet on her wrist, full frame
        shot('h_riya_r1', 14.533, 14.933, off=0.0),                              # worn: the bracelet and her fist (4K, 1.15x)
        shot('riya_full', 14.933, 16.367, off=25.367),                           # wrist to cheek, the fan hidden
        shot('ana', 16.367, 19.500, off=11.12),                                  # the Halo Curve over her face
        shot('k_267E722A_737', 19.500, T_CARD, off=0.30),                        # the glance back, mouth closed (1.03 s; her voice runs on)
    ]
# the card: the three real boxes, live, in the order they opened; each plays once and holds
TILE = dict(fadeIn=.2, hold=True)
shots += [
    shot('tc_chain', T_CARD, DUR, rect=[64, 600, 300, 330], zoom=[1.521, 1.521], ax=.676, ay=.439, **TILE),
    shot('tc_hug', T_CARD, DUR, rect=[388, 600, 300, 330], zoom=[1.521, 1.521], ax=.649, ay=.545, **TILE),
    shot('tc_hoops', T_CARD, DUR, rect=[712, 600, 300, 330], zoom=[1.188, 1.188], ax=1.0, ay=.78, **TILE),
]
bg = [{'t0': T_CARD, 't1': DUR + 1, 'color': '#FBF3EC'}]

def nyra(name, at): d = _sf.info(f'{S}/vo/{name}.48k.wav').duration; return {'src0': 0.0, 'src1': d, 'at': at, 'file': name}   # file t lands at at + t
vo = [
    {'src0': 0.00, 'src1': 4.26, 'at': 0.00, 'file': 'riya'},                   # Nobody told us demi-fine jewellery under 2500 would look like this.
    {'src0': 5.04, 'src1': 6.22, 'at': 4.60, 'file': 'riya'},                   # This is Naira,
    nyra('hv2_any2', 5.92),                                                     # Any two (5.95), twenty percent off (6.76-7.74).
    nyra('hv2_any3', 7.82),                                                     # Any three (7.85), thirty (8.63-9.09).
]
if CUT15:
    vo += [{'src0': 34.70, 'src1': 37.58, 'at': 10.00, 'file': 'ana', 'gain_db': 4}]   # available at Naira with free delivery as well.
else:
    vo += [
        nyra('hv2_wt', 9.91),                                                   # Waterproof (9.94), tarnish-free (10.85-11.63),
        nyra('hv3_assur', 11.69),                                               # Three-year plating assurance. (11.72-13.20)
        {'src0': 20.56, 'src1': 23.70, 'at': 13.27, 'file': 'riya'},           # this bracelet is the one people stop you for.
        {'src0': 0.00, 'src1': 3.06, 'at': 16.70, 'file': 'ana', 'gain_db': 4},    # Someone actually asked me where this is from twice this week.
        {'src0': 34.70, 'src1': 37.58, 'at': 20.60, 'file': 'ana', 'gain_db': 4},  # available at Naira with free delivery as well.
        {'src0': 31.02, 'src1': 32.90, 'at': 23.70, 'file': 'riya'},           # You're welcome, but keep it between us.
    ]

ov = []
Q, B = 'q', 'b'
H = dict(align='l', now=True)                                                   # every caption comes on hard
# ---- the hook ----
ov.append(line('Nobody', Q, 'lg', 92, 48, 1150, 0.0, 0.867, **H))           # on her tee, left of her hair
ov.append(line('told us…', Q, 'lg', 92, 48, 1235, 0.0, 0.867, **H))
ov.append(line('demi-fine', Q, 'dk', 84, 64, 1150, 0.867, 1.70, **H))
ov.append(line('jewellery', Q, 'dk', 84, 64, 1235, 0.867, 1.70, **H))
ov.append(line('under', Q, 'lg', 84, 420, 1120, 1.70, 2.767, **H))          # on her neck and halter, off her hair
ov.append(line('₹2,500', Q, 'lg', 128, 420, 1238, 1.70, 2.767, **H))
ov.append(line('would look like', Q, 'dk', 84, 64, 1235, 2.767, 3.867, **H))
ov.append(line('this.', Q, 'dk', 160, 64, 1225, 3.867, 4.533, **H))
# ---- the offer, on the boxes ----
ov.append(line('Any 2 pieces', B, 'dk', 72, 64, 372, 5.95, 7.80, **H))
ov.append(line('20% off', B, 'dk', 120, 64, 500, 5.95, 7.80, **H))
ov.append(line('Any 3 pieces', B, 'lt', 72, 64, 372, 7.80, 9.20, **H))
ov.append(line('30% off', B, 'lt', 120, 64, 500, 7.80, 9.20, **H))
fade4 = lambda t0, t1: K((t0 - .002, {'o': 0}, 'lin'), (t0 + .133, {'o': 1}, 'out'), (t1 - .002, {'o': 1}, 'lin'), (t1, {'o': 0}, 'lin'))
strike = lambda t: f'<span class="o strike" style="background:rgba(26,22,20,.7);height:3px" data-k=\'{K((t, {"w": 0}, "lin"), (t + .2, {"w": 108}, "out"))}\'></span>'
ov.append(el(f'<div style="display:flex;align-items:baseline;gap:22px;white-space:nowrap">'
             f'<span class="b" style="position:relative;display:inline-block;font-size:60px;color:rgba(26,22,20,.62)">{RS(THREE)}{strike(8.05)}</span>'
             f'<span class="b lt" style="font-size:92px">All three, {RS(THREE30)}</span></div>', 64, 632 - 74, fade4(8.00, 9.20), z=15))
ov.append(caps('NO CODE &nbsp;·&nbsp; COD AVAILABLE', 'lt', 64, 726 - 29, 38, 8.25, 9.20, track=.14, extra='color:rgba(26,22,20,.85)'))
if not CUT15:
    # ---- the quality answer ----
    ov.append(caps('18K GOLD COATING', 'dk', 64, 310, 30, 9.95, 11.867, track=.14, now=True))
    ov.append(line('Waterproof.', B, 'dk', 84, 64, 440, 9.95, 11.867, **H))
    ov.append(line('Tarnish-free.', B, 'dk', 84, 64, 530, 10.85, 11.867, **H))
    ov.append(line('3-year', B, 'lg', 96, 64, 1000, 11.867, 13.20, align='l', now=True))
    for i, w in enumerate(('PLATING', 'ASSURANCE')):
        ov.append(caps(w, 'lg', 66, 1050 - 24 + 46 * i, 32, 11.867, 13.20, track=.14, now=True))
    # ---- the bracelet ----
    ov.append(caps('PRISM RIVIÈRE BRACELET', 'lt', 64, 312, 30, 13.20, 14.533, track=.14, now=True))
    ov.append(line(RS(HERO['bracelet']['pr']), B, 'lt', 64, 64, 432, 13.20, 14.533, **H))
    ov.append(line('this bracelet is', Q, 'lt', 64, 64, 525, 13.27, 14.533, **H))              # her words, on the wood under the credit
    ov.append(line('the one people', Q, 'dk', 64, 52, 1160, 14.933, 16.367, extra='font-weight:600', **H))   # on her forearm, left of the bracelet
    ov.append(line('stop you for.', Q, 'dk', 64, 52, 1236, 15.27, 16.367, extra='font-weight:600', **H))
    # ---- the question, asked of her ----
    ov.append(caps('HALO CURVE RING · ADJUSTABLE', 'lt', 64, 300, 30, 16.367, 19.50, track=.14, now=True))
    ov.append(line(RS(HERO['halo']['pr']), B, 'lt', 64, 64, 420, 16.367, 19.50, **H))
    ov.append(line('Someone actually asked me', Q, 'dk', 72, 0, 1180, 16.70, 18.00, align='c', now=True))
    ov.append(line('where this is from', Q, 'dk', 72, 0, 1180, 18.00, 18.70, align='c', now=True))
    ov.append(line('twice this week.', Q, 'dk', 72, 0, 1180, 18.70, 19.50, align='c', now=True))   # ends on the cut, never on Sonal
    # ---- the line, which holds through the cut into the card ----
    LK = K((19.80 - .002, {'o': 0}, 'lin'), (19.80 + .133, {'o': 1}, 'out'))
else:
    LK = K((T_CARD - .002, {'o': 0}, 'lin'), (T_CARD, {'o': 1}, 'step'))
for txt, base in (('Made to be', 470), ('asked about.', 550)):
    ov.append(f'<div class="o" style="left:64px;top:{base - 58}px;z-index:16" data-k=\'{LK}\'><div class="b lt" style="font-size:72px">{txt}</div></div>')
# ---- the card ----
c6 = lambda t: K((t - .002, {'o': 0, 'y': 12}, 'lin'), (t + .2, {'o': 1, 'y': 0}, 'out'))
ov.append(f'<div class="o" style="left:64px;top:300px;width:260px;z-index:6" data-k=\'{c6(T_CARD)}\'>{logo(letters="#5E8279")}</div>')
ov.append(f'<div class="o ta-r" style="left:{1016 - 1080}px;top:{350 - 26}px;width:1080px;z-index:6" data-k=\'{c6(T_CARD)}\'>'
          f'<div class="jo" style="font-weight:500;font-size:28px;letter-spacing:.14em;color:rgba(26,22,20,.6);margin-right:-.14em">NAIRAFLORE.COM</div></div>')
for (nm, key), x in zip((('CHAIN', 'chain'), ('HUGGIES', 'huggies'), ('HOOPS', 'hoops')), (64, 388, 712)):
    ov.append(el(f'<div style="display:flex;align-items:baseline;gap:14px;white-space:nowrap"><span class="jo lt" style="font-weight:500;font-size:28px;letter-spacing:.14em">{nm}</span>'
                 f'<span class="b lt" style="font-size:44px">{RS(HERO[key]["pr"])}</span></div>', x, 985 - 36, c6(T_CARD), z=6))
t_row, t_off = T_CARD + .267, T_CARD + .533
ov.append(el(f'<div style="display:flex;align-items:baseline;gap:22px;white-space:nowrap">'
             f'<span class="b" style="position:relative;display:inline-block;font-size:48px;color:rgba(26,22,20,.5)">{RS(THREE)}{strike(t_row + .05)}</span>'
             f'<span class="b lt" style="font-size:80px">All three, {RS(THREE30)}</span></div>', 64, 1090 - 64, c6(t_row), z=6))
ov.append(caps('PICK ANY 3 &nbsp;·&nbsp; 30% OFF &nbsp;·&nbsp; NO CODE', 'lt', 64, 1160 - 24, 32, t_off, FOREVER, track=.12, extra='color:#50726A'))
ov.append(caps('FREE SHIPPING &nbsp;·&nbsp; COD AVAILABLE', 'lt', 64, 1222 - 23, 30, t_off, FOREVER, track=.12, extra='color:rgba(26,22,20,.8)'))

cue('slide', 4.65, t1=5.33, v=.8, pan=.1)                                       # the only foley: Pankti's drawer

if CUT15:
    secs = [[0, 3.767, 'pad'], [3.867, 9.2, 'groove'], [9.2, T_CARD, 'lift']]
    ends = [11.867, 14.0][:1]
else:
    secs = [[0, 3.767, 'pad'], [3.867, 9.2, 'groove'], [9.2, 9.867, 'lift'], [9.867, 13.2, 'groove'],
            [13.2, 16.367, 'light'], [16.367, 19.76, 'soft'], [19.76, T_CARD, 'stop']]
    ends = [22.533, 25.2]
page6('hero3_15' if CUT15 else 'hero3', DUR, shots, ov, voice='riya', vo=vo, bg=bg,
      music={'bed_lufs': -18.0, 'duck_db': 12.0,
             'score': {'bpm': 90, 'anchor': ANCHOR, 'end': T_CARD, 'hit0': True, 'harp_from': 6.533, 'strings_from': 9.2,
                       'snaps': False, 'shaker': .45, 'sections': secs,
                       'rswell': [[2.767, 3.767]], 'mute': [[3.767, 3.867]], 'bed_gain': [[3.867, 4.55, -5], [4.55, 5.80, -9], [T_CARD + .067, T_CARD + 1.667, -4]],
                       'harp_v': .72,
                       'end_downbeats': ends, 'tail_silence': 4 / 30}})
