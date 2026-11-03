"""HERO V1, "Made to be asked about" (29.87 s). A fashion film keeps being interrupted by the women who wear Naira.
Riya's price-shock line cuts into Sonal's Kinn film on frame 1; the film speaks upright ("Made to be looked at / to stay /
to be asked about"), the women answer in italic; every piece is priced as it appears; "One is jewellery. Two is a look.
Three is a signature." turns the compliment into three pieces; the bag's empty third slot fills and 3,197 becomes 2,238,
"still under 2,500"; Riya closes the secret she opened. Script: hero/v1_script.txt. Usage: python3.13 -I build_h1.py <S>"""
import sys
_S = sys.argv[1]
exec(open(f'{_S}/ads/tools/build5_head.py').read())
exec(open(f'{_S}/ads/tools/hero_kit.py').read())

DUR = 29.867
BEAT = 60 / 90; BAR = 4 * BEAT; ANCHOR = 3.867                       # 90 BPM, anchored on Riya's "this"

# ---------- picture ----------
shots = [
    shot('k_041FCDC6_810', 0.000, 0.867, zoom=[1, 1.03]),                      # Sonal's gaze, the hoop swinging in
    shot('h_riya_talk', 0.867, 2.767, off=0.867 - 0.80),                        # the speaker revealed (native 4K, 125%), in sync
    shot('k_74FA1A49_2010', 2.767, 3.867),                                      # the hoop sliding into her ear
    shot('k_76D95B49_430', 3.867, 4.533),                                       # the drop on "this": hoop to the lens
    shot('riya_full', 4.533, 6.533, off=5.07),                                  # the blush box opens on the cushion halo
    shot('k_212E5E27_1840', 6.533, 7.733, zoom=[1, 1.03]),                      # profile into the lens
    shot('pk_full', 7.733, 9.200, off=7.23),                                    # huggies at the lens
    shot('pk_full', 9.200, 10.533, off=9.40),                                   # a huggie pressed in
    shot('pk_full', 10.533, 11.867, off=17.40),                                 # the toggle on her tee, picked up
    shot('k_267E722A_670', 11.867, 13.200),                                     # the look back, as if asked
    shot('h_riya_brace', 13.200, 14.367, off=0.10),                             # the bracelet (native 4K crop)
    shot('riya_full', 14.367, 16.533, off=21.667),                              # her poses: bracelet, ring, hoops
    shot('ana', 16.533, 17.767, off=0.00),                                      # Ananaya, in sync
    shot('ana', 17.767, 19.867, off=11.45),                                     # the ring over her face, hand over her mouth
    shot('riya_full', 19.867, 20.967, off=16.70),                               # ONE: the hoops alone in their box
    shot('pk_full', 20.967, 21.700, off=27.90),                                 # TWO: huggies + chain worn together
]
T_IRIS = 21.25; T_BAG = T_IRIS
T_BUY2, T_MORE, T_DROP, T_BUY3, T_RESOLVE = 22.0, 22.25, 22.533, 23.2, 23.867
T_END = 25.533; T_PRESS = 27.867

# ---------- voice: Riya, Ananaya, and the film's voice (Nyra) ----------
NY = {1: 'hv1_1', 2: 'hv1_2', 3: 'hv1_3', 4: 'hv1_4', 5: 'hv1_5', 6: 'hv1_6', 7: 'hv1_7'}
sys.path.append('/root/.local/lib/python3.13/site-packages'); import soundfile as _sf
def nyra(n, at): d = _sf.info(f'{S}/vo/{NY[n]}.48k.wav').duration; return {'src0': 0.04, 'src1': d - .04, 'at': at + .04, 'file': NY[n]}
vo = [
    {'src0': 0.00, 'src1': 4.26, 'at': 0.00, 'file': 'riya'},                  # Nobody told us demi-fine jewellery under 2500 would look like this.
    {'src0': 5.04, 'src1': 6.22, 'at': 4.60, 'file': 'riya'},                  # This is Naira,
    nyra(1, 6.56),                                                             # Made to be looked at.
    nyra(2, 9.25),                                                             # Made to stay.
    nyra(3, 11.93),                                                            # Made to be asked about.
    {'src0': 20.56, 'src1': 23.70, 'at': 13.26, 'file': 'riya'},               # this bracelet is the one people stop you for.
    {'src0': 0.00, 'src1': 3.06, 'at': 16.533, 'file': 'ana'},                 # Someone actually asked me where this is from twice this week.
    nyra(4, 19.88),                                                            # One is jewellery.
    nyra(5, 21.02),                                                            # Two is a look.
    nyra(6, 22.56),                                                            # Three is a signature.
    nyra(7, 23.93),                                                            # These three? Still under twenty-five hundred.
    {'src0': 31.02, 'src1': 32.90, 'at': 26.30, 'file': 'riya'},               # You're welcome, but keep it between us.
]

# ---------- type ----------
ov = []
Q, B = 'q', 'b'
ov.append(line('Nobody told us…', Q, 'dk', 96, 0, 1180, 0.0, 0.867, now=True))
ov.append(line('demi-fine jewellery', Q, 'lt', 72, 0, 1190, 0.867, 1.72))
ov.append(line('under ₹2,500', Q, 'lt', 104, 0, 1205, 1.72, 2.767))
ov.append(line('would look like this.', Q, 'dk', 72, 0, 1190, 2.767, 4.40))
ov.append(credit('cushion', 'lt', 0, 340, 5.30, 6.50))
ov.append(line('Made to be looked at.', B, 'dk', 68, 0, 1150, 6.60, 7.733))
ov.append(credit('hoops', 'dk', 0, 1215, 6.70, 7.733))
ov.append(credit('huggies', 'lg', 0, 1200, 7.80, 9.20))
ov.append(line('Made to stay.', B, 'dk', 68, 1000, 360, 9.27, 10.50, align='r'))
ov.append(el('<div class="claim dk ta-r" style="text-align:right">18K GOLD COATING · PVD<br>3-YEAR PLATING ASSURANCE</div>', 1000 - 420, 384,
             tk(9.40, 10.50), z=15, w=420))
ov.append(credit('chain', 'lg', 0, 1150, 10.60, 11.80))
ov.append(line(f'Together, {RS(TWO20)} with Buy 2', B, 'lg', 44, 0, 1222, 10.90, 11.80, extra='color:#3E5C55;font-weight:600'))
ov.append(line('Made to be asked about.', B, 'lg', 68, 0, 345, 11.95, 13.20))
ov.append(line('this bracelet is', Q, 'lt', 60, 72, 1160, 13.26, 14.45, align='l'))
ov.append(line('the one people stop you for.', Q, 'dk', 60, 72, 330, 14.45, 16.45, align='l'))
ov.append(credit('bracelet', 'dk', 72, 395, 14.45, 16.45, align='l'))
A_OFF = 16.533                                                                 # Ananaya's source 0 sits at ad 16.533
ov.append(line('Someone actually asked me', Q, 'dk', 64, 0, 1150, 16.55, A_OFF + 1.30))
ov.append(line('where this is from', Q, 'dk', 64, 0, 1150, A_OFF + 1.30, A_OFF + 2.00))
ov.append(line('twice this week.', Q, 'dk', 64, 0, 1150, A_OFF + 2.00, A_OFF + 3.10))
ov.append(credit('halo', 'dk', 0, 1215, 18.00, 19.85))
ov.append(line('One is jewellery.', B, 'lt', 68, 0, 360, 19.93, 20.95))
ov.append(line('Two is a look.', B, 'lg', 64, 64, 1190, 21.02, T_IRIS + .1, align='l'))

# ---------- the bag and the end card, through the flower opening from the toggle ----------
inner = bag_and_end(T_BAG, T_BUY2, T_MORE, T_DROP, T_BUY3, None, None, T_END, T_PRESS,
                    {'three': ('Three is a signature.', 22.58, 23.88), 'these': (f'These three. Still under ₹2,500.', 23.95, T_END)})
ov.append(iris_into('hbag', T_IRIS, 380, 792, ''.join(inner)))

# ---------- sound cues ----------
cue('slide', 4.78, t1=5.62, v=.8, pan=.1)                                     # the drawer
for t in (19.867, 20.967): cue('clack', t, v=.7)                              # "One", "Two" (the drop clack sits in the bag)
music_cue('swish', 13.2, v=.3)

page6('hero1', DUR, shots, ov, voice='riya', vo=vo,
      music={'bed_lufs': -20.0, 'duck_db': 8.0,
             'score': {'bpm': 90, 'anchor': ANCHOR, 'end': T_RESOLVE, 'hit0': True, 'harp_from': 6.533, 'strings_from': 9.2,
                       'sections': [[0, 3.767, 'pad'], [3.867, 11.867, 'groove'], [11.867, 13.2, 'stop'], [13.2, 16.533, 'groove'],
                                    [16.533, 19.867, 'thin'], [19.867, T_RESOLVE, 'lift']],
                       'rswell': [[2.767, 3.767]], 'mute': [[3.767, 3.867]], 'duck_ease': [[3.867, 4.35, .35]],
                       'end_downbeats': [25.2, 27.867], 'tail_silence': 4 / 30}})
