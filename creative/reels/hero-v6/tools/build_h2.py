"""HERO V2, "Made to be asked about" (26.53 s). What V1's review panel found missing, fixed:
- the offer by 6-8.5 s, from FOOTAGE: three real Naira boxes open in turn (chain, huggies, hoops) while type and one
  voice build "any 2, 20% off" -> "any 3, 30% off" -> "all three, 2,238" (V1: a 0.7 s seed line at 11 s, the bag at 21 s);
- frame 1 is product at the lens (Pankti's huggies, from the best-CTR reel), and Riya's face only carries "under 2,500";
- the quality answer is said and readable: waterproof, tarnish-free (the listings' Care text), 3-year plating assurance;
- no drawn bag, no iris, no count-downs, no SHOP NOW; the film's voice is down from seven slogans to two reads;
- it ends on women: a calm left-aligned card with three LIVE worn tiles, Ananaya saying the CTA, Riya the last word.
Script: hero/v1/critique_summary.txt (the brief), timings re-cut to the real voice reads. Usage: python3.13 -I build_h2.py <S>"""
import sys
_S = sys.argv[1]
exec(open(f'{_S}/ads/tools/build5_head.py').read())
exec(open(f'{_S}/ads/tools/hero_kit.py').read())
sys.path.append('/root/.local/lib/python3.13/site-packages'); import soundfile as _sf

DUR = 26.533
ANCHOR = 3.867                                                          # 90 BPM, the drop on Riya's "this"
T_CARD = 20.533

shots = [
    shot('pk_full', 0.000, 0.867, off=7.23),                                     # huggies pinched at the lens
    shot('k_041FCDC6_810', 0.867, 1.700, zoom=[1, 1.03]),                        # Sonal, eyes to the lens, hoop
    shot('h_riya_talk', 1.700, 2.767, off=1.70 - 0.80),                          # Riya says the price, in sync
    shot('k_74FA1A49_2010', 2.767, 3.867),                                       # the hoop going in
    shot('k_76D95B49_430', 3.867, 4.533),                                        # "this." the hoop at the lens
    shot('pk_full', 4.533, 5.867, off=1.20),                                     # BOX 1: the lid, the drawer, the chain
    shot('pk_full', 5.867, 7.200, off=4.85),                                     # BOX 2: the huggies
    shot('riya_full', 7.200, 8.533, off=16.60),                                  # BOX 3: the hoops
    shot('riya_full', 8.533, 9.867, off=18.10),                                  # worn: her hair flip in the hoops
    shot('pk_full', 9.867, 11.533, off=9.30),                                    # a huggie goes in
    shot('pk_full', 11.533, 13.200, off=23.20),                                  # the chain worn, hands free
    shot('h_riya_brace2', 13.200, 14.400, off=0.0),                              # the bracelet (native 4K crop)
    shot('riya_full', 14.400, 16.683, off=21.667),                               # her poses: bracelet, hoops
    shot('ana', 16.683, 19.200, off=11.12),                                      # the Halo Curve over her face
    shot('k_267E722A_737', 19.200, T_CARD),                                      # the glance back: asked about
    # the card: three live worn tiles on ivory, each plays once and holds
    shot('t_041FCDC6_850', T_CARD, DUR, rect=[64, 600, 300, 360], zoom=[2.0, 2.0], ax=.426, ay=.296, fadeIn=.2, hold=True),
    shot('t_pk_945', T_CARD + .667, DUR, rect=[388, 600, 300, 360], zoom=[2.25, 2.25], ax=.149, ay=.455, fadeIn=.2, hold=True),
    shot('t_pk_2340', T_CARD + 1.333, DUR, rect=[712, 600, 300, 360], zoom=[2.0, 2.0], ax=.11, ay=.53, fadeIn=.2, hold=True),
]
bg = [{'t0': T_CARD, 't1': DUR + 1, 'color': '#FBF3EC'}]

def nyra(name, at): d = _sf.info(f'{S}/vo/{name}.48k.wav').duration; return {'src0': 0.04, 'src1': d - .04, 'at': at + .04, 'file': name}
vo = [
    {'src0': 0.00, 'src1': 4.26, 'at': 0.00, 'file': 'riya'},                   # Nobody told us demi-fine jewellery under 2500 would look like this.
    {'src0': 5.04, 'src1': 6.22, 'at': 4.60, 'file': 'riya'},                   # This is Naira,
    nyra('hv2_any2', 5.85),                                                     # Any two, twenty percent off.
    nyra('hv2_any3', 7.75),                                                     # Any three, thirty.
    nyra('hv2_nocode', 9.08),                                                   # No code.
    nyra('hv2_wt', 9.90),                                                       # Waterproof, tarnish-free,
    nyra('hv2_assur', 11.64),                                                   # with a three-year plating assurance.
    {'src0': 20.56, 'src1': 23.70, 'at': 13.52, 'file': 'riya'},               # this bracelet is the one people stop you for.
    {'src0': 0.00, 'src1': 3.06, 'at': 16.75, 'file': 'ana', 'gain_db': 4},    # Someone actually asked me where this is from twice this week.
    {'src0': 34.70, 'src1': 37.58, 'at': 20.70, 'file': 'ana', 'gain_db': 4},  # available at Naira with free delivery as well.
    {'src0': 31.02, 'src1': 32.90, 'at': 23.85, 'file': 'riya'},               # You're welcome, but keep it between us.
]
R_OFF = 13.52 - 20.56                                                           # Riya's bracelet line: ad = src + R_OFF
A_OFF = 16.75                                                                   # Ananaya's source 0

ov = []
Q, B = 'q', 'b'
# ---- the hook: her words, phrase by phrase ----
ov.append(line('Nobody', Q, 'lg', 92, 64, 1150, 0.0, 0.867, align='l', now=True))
ov.append(line('told us…', Q, 'lg', 92, 64, 1235, 0.0, 0.867, align='l', now=True))
ov.append(line('demi-fine', Q, 'dk', 84, 64, 1150, 0.867, 1.70, align='l'))
ov.append(line('jewellery', Q, 'dk', 84, 64, 1235, 0.867, 1.70, align='l'))
ov.append(line('under ₹2,500', Q, 'lt', 120, 64, 1215, 1.70, 2.767, align='l'))
ov.append(line('would look like', Q, 'dk', 84, 64, 1235, 2.767, 3.867, align='l'))
ov.append(line('this.', Q, 'dk', 160, 64, 1225, 3.867, 4.53, align='l', now=True))
# ---- the offer, built from the boxes ----
ov.append(caps('ANY 2', 'dk', 64, 300, 34, 5.867, 7.20, track=.24))
ov.append(line('20% off', B, 'dk', 120, 64, 450, 5.867, 7.20, align='l'))
ov.append(caps('ANY 3', 'lt', 64, 300, 34, 7.20, 8.533, track=.24))
ov.append(line('30% off', B, 'lt', 120, 64, 450, 7.20, 8.533, align='l'))
ov.append(line(f'all three, {RS(THREE30)}', Q, 'lt', 88, 64, 600, 7.40, 8.533, align='l'))
# ---- the quality answer ----
ov.append(line('Waterproof.', B, 'dk', 84, 64, 420, 9.93, 11.533, align='l'))
ov.append(line('Tarnish-free.', B, 'dk', 84, 64, 510, 10.45, 11.533, align='l'))
for i, w in enumerate(('3-YEAR', 'PLATING', 'ASSURANCE')):                   # stacked right of the chain, clear of it
    ov.append(f'<div class="o ta-r" style="left:{860 - 1080}px;top:{955 + 56 * i}px;width:1080px;z-index:15" data-k=\'{tk(11.60, 13.20)}\'>'
              f'<div class="jo lg" style="font-weight:500;font-size:38px;letter-spacing:.14em;line-height:1.2;white-space:nowrap;margin-right:-.14em">{w}</div></div>')
# ---- the bracelet, in her words ----
ov.append(line('this bracelet is', Q, 'lg', 76, 64, 1100, 13.52, 14.40, align='l'))
ov.append(credit2('bracelet', 'lg', 64, 1135, 13.40, 14.40, name_px=28, price_px=64))
ov.append(line('the one people', Q, 'dk', 76, 64, 380, 21.78 + R_OFF, 16.65, align='l'))
ov.append(line('stop you for.', Q, 'dk', 76, 64, 460, 22.56 + R_OFF, 16.65, align='l'))
# ---- the question, asked of her ----
ov.append(credit2('halo', 'lt', 64, 300, 16.75, 19.20, name_px=30, price_px=64))
ov.append(line('Someone actually asked me', Q, 'dk', 72, 0, 1180, A_OFF, A_OFF + 1.30))
ov.append(line('where this is from', Q, 'dk', 72, 0, 1180, A_OFF + 1.30, A_OFF + 2.00))
ov.append(line('twice this week.', Q, 'dk', 72, 0, 1180, A_OFF + 2.00, A_OFF + 3.10))
# ---- the line, which holds through the cut into the card ----
ov.append(line('Made to be', B, 'lt', 72, 64, 470, 19.85, FOREVER, align='l'))
ov.append(line('asked about.', B, 'lt', 72, 64, 550, 19.85, FOREVER, align='l'))
# ---- the card ----
st = lambda t, dy=12: K((t - .002, {'o': 0, 'y': dy}, 'lin'), (t + .2, {'o': 1, 'y': 0}, 'out'))
ov.append(f'<div class="o" style="left:64px;top:300px;width:300px;z-index:6" data-k=\'{st(T_CARD)}\'>{logo(letters="#5E8279")}</div>')
for i, (key, x) in enumerate((('hoops', 64), ('huggies', 388), ('chain', 712))):
    ov.append(line(RS(HERO[key]['pr']), B, 'lt', 48, x, 1010, T_CARD + .667 * i + .1, FOREVER, align='l'))
ov.append(el(struck(THREE, T_CARD + 2.10, cls='hb-was'), 64, 1100 - 38, st(T_CARD + 2.0), z=6))
ov.append(line(f'All three, {RS(THREE30)}', B, 'lt', 80, 224, 1100, T_CARD + 2.30, FOREVER, align='l'))
ov.append(caps('ANY 2 · 20% OFF &nbsp;·&nbsp; ANY 3 · 30% OFF', 'lt', 64, 1165 - 24, 30, T_CARD + 2.667, FOREVER, track=.12, extra='color:#50726A'))
ov.append(caps('CASH ON DELIVERY &nbsp;·&nbsp; FREE SHIPPING', 'lt', 64, 1220 - 22, 28, T_CARD + 2.667, FOREVER, track=.12, extra='color:rgba(26,22,20,.8)'))

cue('slide', 4.65, t1=5.33, v=.8, pan=.1)                                       # the only foley: Pankti's drawer

page6('hero2', DUR, shots, ov, voice='riya', vo=vo, bg=bg,
      music={'bed_lufs': -18.0, 'duck_db': 10.0,
             'score': {'bpm': 90, 'anchor': ANCHOR, 'end': T_CARD, 'hit0': True, 'harp_from': 6.533, 'strings_from': 9.2,
                       'snaps': False, 'shaker': .45,
                       'sections': [[0, 3.767, 'pad'], [3.867, 8.533, 'groove'], [8.533, 9.867, 'lift'], [9.867, 13.2, 'groove'],
                                    [13.2, 16.683, 'light'], [16.683, 19.2, 'soft'], [19.2, T_CARD, 'stop']],
                       'rswell': [[2.767, 3.767]], 'mute': [[3.767, 3.867]], 'bed_gain': [[3.867, 4.25, -12]],
                       'end_downbeats': [22.533, 25.2], 'tail_silence': 4 / 30}})
