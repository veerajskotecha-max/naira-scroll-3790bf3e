"""Original bed for the Halo / Baroque ad — every sample synthesised here, so it is ours to run in paid ads.
Warm neo-soul in D, 94.1 BPM: a bar line lands where the pearl section starts (15.85 s) and seven bars later
on the logo (33.70 s). Rhodes-style FM keys, a soft pad, sub bass, brushed kit, synthetic room."""
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
import json
X_ = json.load(open('' + __import__('os').environ.get('WORK', '.') + '/v12/eng/data.json'))
SR = 48000; DUR = X_['dur']; N = int(DUR * SR)
RESOLVE = X_['exit']['shrink']                                   # the card leaves on the resolve
BAR = (RESOLVE - 15.85) / 7; BEAT = BAR / 4; T0 = 15.85 - 6 * BAR          # bar 0 at ~0.55 s
bar_t = lambda k: T0 + k * BAR
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N); rvb = np.zeros((N, 2))
def put(sig, t, gl=1.0, gr=1.0, send=0.0):
    i = int(t * SR)
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i); L[i:i+n] += sig[:n] * gl; R[i:i+n] += sig[:n] * gr
    if send: rvb[i:i+n, 0] += sig[:n] * gl * send; rvb[i:i+n, 1] += sig[:n] * gr * send
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
lp = lambda x, f, o=2: sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
hp = lambda x, f, o=2: sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def ep(m, dur=2.4, vel=1.0):                                  # Rhodes-ish: FM tine with a decaying index
    t = np.arange(int(dur * SR)) / SR; f = hz(m)
    idx = 1.8 * np.exp(-t / .22) + .25
    y = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    y += .12 * np.sin(2 * np.pi * f * 14 * t) * np.exp(-t / .035)        # the tine's ping
    env = (1 - np.exp(-t / .004)) * np.exp(-t / (1.4 if m < 60 else 1.0))
    y = y * env * vel; y[-2000:] *= np.linspace(1, 0, 2000); return lp(y, 5200)
def pad(ms, dur):
    t = np.arange(int(dur * SR)) / SR; y = np.zeros_like(t)
    for m in ms:
        for d in (-.07, 0, .06):
            ph = rng.random(); f = hz(m) * 2 ** (d / 12); y += 2 * ((f * t + ph) % 1) - 1
    y = lp(y / (len(ms) * 3), 1100, 4)
    env = np.minimum(1, t / .9) * np.minimum(1, (dur - t) / .9); return y * np.clip(env, 0, 1)
def kick(v=1.0):
    t = np.arange(int(.45 * SR)) / SR; f = 46 + 70 * np.exp(-t / .035)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .16); y[:200] += rng.normal(0, .3, 200) * np.linspace(1, 0, 200)
    return lp(y, 2500) * v
def rim(v=1.0):
    t = np.arange(int(.25 * SR)) / SR
    y = bp(rng.normal(0, 1, len(t)), 1400, 5200) * np.exp(-t / .045) + .5 * np.sin(2 * np.pi * 830 * t) * np.exp(-t / .02)
    return y * v
def shaker(v=1.0):
    t = np.arange(int(.09 * SR)) / SR; y = hp(rng.normal(0, 1, len(t)), 6500, 4)
    return y * np.minimum(1, t / .012) * np.exp(-t / .03) * v
def bass(m, dur, v=1.0):
    t = np.arange(int(dur * SR)) / SR; f = hz(m)
    y = np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t)
    return lp(y * np.minimum(1, t / .01) * np.exp(-t / .9) * v, 380)
def pluck(m, v=1.0):
    t = np.arange(int(1.2 * SR)) / SR; f = hz(m)
    y = (np.sin(2 * np.pi * f * t) + .3 * np.sin(6 * np.pi * f * t) * np.exp(-t / .08)) * np.exp(-t / .35)
    return y * np.minimum(1, t / .003) * v
# D major: | Dmaj9 | Bm11 | Gmaj9 | A13sus |  (voicings around middle C)
CH = [([50], [62, 66, 69, 73, 76]), ([47], [62, 66, 69, 71, 76]), ([43], [62, 66, 67, 71, 74]), ([45], [62, 64, 67, 69, 71])]
END = ([50], [61, 64, 66, 69, 73, 76])
nbars = 13                                                      # bars 0..12, then the resolve at bar 13 (the logo)
# intro swell under the hook's first words
put(pad(CH[0][1], T0 + .6), 0, .22, .22, .4)
for k in range(nbars):
    t = bar_t(k); root, voic = CH[k % 4]; sec = 0 if k < 6 else (1 if k < 10 else 2)
    last = k == 12                                              # the line that pays off the hook: strip back
    # keys: chord on 1, a softer re-strike on the and of 3, top note answer on 4
    for j, m in enumerate(voic):
        pan = .5 + .35 * np.sin(j * 1.3); put(ep(m, 2.6, .16), t + j * .008, 1 - pan * .4, .6 + pan * .4, .35)
        if not last: put(ep(m, 1.6, .08), t + 2.5 * BEAT + j * .006, .9, 1, .35)
    put(ep(voic[-1] + 2 if k % 2 else voic[-2] + 12, 1.2, .07), t + 3.5 * BEAT, .7, 1, .5)
    put(hp(pad(voic[:4], BAR + .4), 500), t, .06, .06, .5)        # thin: the voice lives at 200-700 Hz
    if not last:
        # bass: root on 1 and the and of 2, an approach on 4-and
        put(bass(root[0] - 12, BEAT * 1.4, .4 if sec else .3), t); put(bass(root[0] - 12, BEAT, .26), t + 1.5 * BEAT)
        put(bass(root[0] - 5 if k % 2 else root[0] - 14, BEAT * .5, .18), t + 3.5 * BEAT)
        # kit: kick 1, (2&), 3; rim on 2 and 4; 16th shaker, swung, accents on the offbeats
        kv = .5 if sec == 0 else .62
        for b in (0, 1.5, 2) if sec else (0, 2):
            put(kick(kv), t + b * BEAT)
        for b in (1, 3): put(rim(.16), t + b * BEAT + .006, .95, 1, .55)
        for s in range(16):
            sw = .58 if s % 2 else .5
            put(shaker((.05 if s % 4 == 2 else .03) * (1.2 if sec == 2 else 1)), t + (s // 2 + (sw if s % 2 else 0)) * BEAT, .7 + .3 * (s % 2), 1 - .3 * (s % 2))
    if sec >= 1 and not last and k % 2 == 0:                    # a pearl-bright pluck motif from the lariat section on
        for i, (b, m) in enumerate([(0.5, 81), (1.0, 78), (1.75, 76), (3.0, 74)]):
            put(pluck(m, .06), t + b * BEAT, .6 + .2 * i, 1, .7)
# a reverse swell into the pearl section and into the logo
def swell(t_end, length=1.2, v=.18):
    t = np.arange(int(length * SR)) / SR; y = hp(rng.normal(0, 1, len(t)), 1800, 2) * (t / length) ** 3 * v
    put(y, t_end - length, .9, 1, .4)
swell(bar_t(6)); swell(bar_t(13), 1.6, .2)
# the resolve on the logo: full chord, low octave, one kick, long tail
t = bar_t(13); root, voic = END
for j, m in enumerate(voic): put(ep(m, 3.6, .17), t + j * .02, 1 - .1 * j, .5 + .1 * j, .45)
put(pad(voic, DUR - t), t, .12, .12, .6); put(bass(root[0] - 12, 3.0, .38), t); put(kick(.55), t)
# room: decorrelated stereo noise tail, ~1.9 s
it = np.arange(int(1.9 * SR)) / SR
ir = np.stack([lp(rng.normal(0, 1, len(it)), 6000) * np.exp(-it / .42) for _ in range(2)], 1); ir[:int(.012 * SR)] = 0
wet = np.stack([fftconvolve(rvb[:, c], ir[:, c])[:N] for c in range(2)], 1) * .045
mix = np.stack([L, R], 1) + wet
mix = np.tanh(mix * 1.6) / 1.6                                  # a little warmth
mix[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))[:, None] ** 2
mix /= np.abs(mix).max() / .7
sf.write('' + __import__('os').environ.get('WORK', '.') + '/v12/music_bed.wav', mix.astype(np.float32), SR, subtype='FLOAT')
print('bar', round(BAR, 4), 'beat', round(BEAT, 4), 'bpm', round(240 / BAR, 2), 'bar0', round(T0, 3), 'bars', [round(bar_t(k), 2) for k in range(13)])
