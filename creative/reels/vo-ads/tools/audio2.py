"""v2 sound for the three ads. Every sample is synthesised here, so the track is ours to run in paid placements.
- An original deep-house groove (Rhodes, supersaw pad, sidechained sub bass, swung hats). It runs at 120 BPM, or
  124.7 BPM for the 30 s ad so that both of its big moments land on a downbeat. It is arranged to the picture:
  intro, groove, lift, a break and a stop before each end card, then a chord that resolves home.
- A designed effects pass, driven by the cue list build2.py writes from the same times as the graphics.
  Effects include counter ticks, a ding on the price, a pen scratch on the MRP, a stamp, sparkles on the metal,
  callout zips, DM pops, bag drops, chimes on each rung, and a zoom-through into the end card.
- The voice is placed phrase by phrase, cleaned up and lightly compressed, with the bed ducked under it.
Levels are set by loudness (BS.1770). The voice is -16 LUFS. The bed is -18.5, ducked 6.5 dB under the voice, so through a
phone speaker it sits about 12 dB below it. Each kind of effect sits a set number of dB under the voice's loud syllables (OFF).
master.sh then takes the mix to -14.
Usage: python3.13 -I audio2.py <S> <ad>     writes ads/<ad>/mix.wav plus stems (bed, fx, voice), 48 kHz float"""
import json, math, sys
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve, lfilter, stft, istft
S, AD = sys.argv[1], sys.argv[2]
P = json.load(open(f'{S}/ads/{AD}/audio.json')); M = P['music']
SR = 48000; DUR = P['dur']; N = int(round(DUR * SR))
rng = np.random.default_rng(20261102)

# ---------- dsp ----------
def _sos(kind, f, o): return butter(o, f, kind, fs=SR, output='sos')
def lp(x, f, o=2): return sosfilt(_sos('low', min(f, SR / 2 - 200), o), x, axis=0)
def hp(x, f, o=2): return sosfilt(_sos('high', f, o), x, axis=0)
def bp(x, f1, f2, o=2): return sosfilt(_sos('band', [f1, min(f2, SR / 2 - 200)], o), x, axis=0)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
T = lambda n: np.arange(n) / SR
def st(x, p=0.0, w=0.0):
    """mono to stereo: constant-power pan, and optional width from a short decorrelating delay"""
    th = (max(-1, min(1, p)) + 1) * math.pi / 4; L = x * math.cos(th) * math.sqrt(2); R = x * math.sin(th) * math.sqrt(2)
    if w:
        d = int(.011 * SR); R = (1 - w) * R + w * np.concatenate([np.zeros(d), R[:-d]]); L = (1 - w) * L + w * np.concatenate([np.zeros(d // 2), L[:-(d // 2)]])
    return np.stack([L, R], 1)
def bus(): return np.zeros((N, 2))
def put(b, sig, t, g=1.0):
    if sig.ndim == 1: sig = st(sig)
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i); b[i:i + n] += sig[:n] * g
def shaped_noise(n, fc, bw=1.0, seed=None):
    """noise whose band follows fc(t): a whoosh's sweep, a riser's climb"""
    r = np.random.default_rng(seed) if seed is not None else rng
    x = r.standard_normal(n + 4096)
    f, tt, Z = stft(x, SR, nperseg=1024, noverlap=896)
    for j in range(Z.shape[1]):
        c = fc(min(max(tt[j], 0), n / SR)); Z[:, j] *= np.exp(-.5 * (np.log2(np.maximum(f, 20) / c) / (bw / 2)) ** 2)
    _, y = istft(Z, SR, nperseg=1024, noverlap=896); y = y[:n]
    return y / (np.std(y) + 1e-9)
def ir(rt, dur, pre=.012, damp=5500, seed=1):
    r = np.random.default_rng(seed); n = int(dur * SR); t = T(n)
    x = r.standard_normal((n, 2)) * (10 ** (-3 * t / rt))[:, None]
    w = np.clip(t / (rt * .6), 0, 1)[:, None]; x = x * (1 - w) + lp(x, damp, 1) * w          # the tail darkens as it decays
    k = int(.004 * SR); x[:k] *= np.linspace(0, 1, k)[:, None]
    x = np.concatenate([np.zeros((int(pre * SR), 2)), x]); return x / np.sqrt(np.sum(x ** 2) / 2)
ROOM, HALL = ir(.5, .8, pre=.006, damp=7500, seed=3), ir(2.4, 3.2, pre=.024, damp=4200, seed=5)
def reverb(x, h): return np.stack([fftconvolve(x[:, 0], h[:, 0])[:N], fftconvolve(x[:, 1], h[:, 1])[:N]], 1)
def lufs(x):
    """integrated loudness, ITU-R BS.1770-4 (K-weighting, 400 ms blocks, absolute and relative gates)"""
    if x.ndim == 1: x = np.stack([x, x], 1)
    y = lfilter([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621],
                lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585], x, axis=0), axis=0)
    blk, hop = int(.4 * SR), int(.1 * SR); c = np.cumsum(np.concatenate([np.zeros((1, 2)), y ** 2]), 0)
    ms = np.array([((c[i + blk] - c[i]) / blk).sum() for i in range(0, len(y) - blk + 1, hop)])
    L = -.691 + 10 * np.log10(ms + 1e-15); g = ms[L > -70]
    if not len(g): return -99.0
    rel = -.691 + 10 * np.log10(g.mean()) - 10
    return float(-.691 + 10 * np.log10(ms[(L > -70) & (L > rel)].mean()))
def to_lufs(x, target): return x * 10 ** ((target - lufs(x)) / 20)

# ---------- instruments ----------
def kick(v=1.0, d=.13):
    n = int(.5 * SR); t = T(n); f = 52 + 120 * np.exp(-t / .028) + 300 * np.exp(-t / .004)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / d) + hp(rng.standard_normal(n), 3000) * np.exp(-t / .002) * .45
    y += bp(rng.standard_normal(n), 1800, 5000) * np.exp(-t / .004) * .25          # the beater: what a phone speaker plays
    return np.tanh(2.2 * y) / np.tanh(2.2) * v
def clap(v=1.0):
    n = int(.35 * SR); t = T(n); x = rng.standard_normal(n); y = np.zeros(n)
    for o in (0, .011, .021, .029): k = int(o * SR); y[k:] += x[:n - k] * np.exp(-T(n - k) / .006)
    return bp(y + x * np.exp(-t / .07) * .55, 900, 5200) * v * .9
HATF = [205.3, 304.4, 369.6, 522.7, 540, 800]
def hat(v=1.0, d=.035):
    n = int((d * 6 + .02) * SR); t = T(n)
    sq = sum(np.sign(np.sin(2 * np.pi * f * 1.9 * t + i)) for i, f in enumerate(HATF))
    return (hp(bp(sq, 6500, 15000), 7000) + hp(rng.standard_normal(n), 9000) * .5) * np.exp(-t / d) * v * .18
def shaker(v=1.0):
    n = int(.09 * SR); t = T(n)
    return bp(rng.standard_normal(n), 5000, 11000) * np.minimum(1, t / .012) * np.exp(-t / .03) * v * .22
def crash(v=1.0, d=1.6):
    n = int(d * SR); t = T(n); sq = sum(np.sign(np.sin(2 * np.pi * f * 3.1 * t + i)) for i, f in enumerate(HATF))
    return (hp(sq, 5000) * .25 + hp(rng.standard_normal(n), 4000)) * np.exp(-t / (d * .3)) * v * .2
def bass(m, dur, v=1.0):
    n = int(dur * SR); t = T(n); f = hz(m); k = np.exp(-t / .06)
    saw = 2 * ((2 * f * t) % 1) - 1                                  # an octave up, so phones hear the line
    y = np.sin(2 * np.pi * f * t) * .5 + (lp(saw, 1400) * k + lp(saw, 480) * (1 - k)) * .6
    e = np.minimum(1, t / .004) * np.clip((dur - t) / .02, 0, 1)
    return np.tanh(2.0 * y * e) / np.tanh(2.0) * v
def ep_note(m, dur, v=1.0):                                          # FM electric piano with a tine
    n = int((dur + .6) * SR); t = T(n); f = hz(m); I = 1.6 * np.exp(-t / .25) + .35
    y = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * t)) * np.exp(-t / 1.4) * np.minimum(1, t / .003)
    y += np.sin(2 * np.pi * f * 14.1 * t) * np.exp(-t / .035) * .08
    return y * np.clip((dur + .25 - t) / .25, 0, 1) * v
def ep_chord(ms, dur, v=1.0):
    n = int((dur + .6) * SR); out = np.zeros((n, 2))
    for i, m in enumerate(ms):
        d = int(i * .004 * SR); x = ep_note(m, dur, 1 / len(ms)); out[d:] += st(x[:n - d], (i / max(1, len(ms) - 1) - .5) * .6)
    trem = 1 + .12 * np.sin(2 * np.pi * 4.6 * T(n)); out[:, 0] *= trem; out[:, 1] *= 2 - trem
    return out * v * 1.4
def pad(ms, dur, v=1.0, cut=1500):                                   # supersaw, wide
    n = int(dur * SR); t = T(n); L = np.zeros(n); R = np.zeros(n)
    for m in ms:
        for j, dt in enumerate((-.11, -.04, .03, .09)):
            saw = 2 * ((hz(m) * 2 ** (dt / 12) * t + rng.random()) % 1) - 1
            if j % 2: L += saw
            else: R += saw
    y = lp(np.stack([L, R], 1) / (len(ms) * 2), cut, 4)
    return y * (np.clip(np.minimum(t / .5, (dur - t) / .6), 0, 1) ** 1.5)[:, None] * v
def pluck(m, v=1.0):
    n = int(.7 * SR); t = T(n); f = hz(m)
    y = np.sin(2 * np.pi * f * t) * .8 + (2 * np.abs(2 * ((f * t) % 1) - 1) - 1) * .3
    return lp(y * np.exp(-t / .18) * np.minimum(1, t / .002), 5000) * v
def pingpong(x, d, fb=.4, mix=.32, taps=6):
    y = x.copy(); k = int(d * SR)
    for i in range(1, taps + 1):
        if k * i >= len(x): break
        g = mix * fb ** (i - 1); sh = np.zeros_like(x); src = x[:-k * i]
        if i % 2: sh[k * i:, 0] = src[:, 1] * g; sh[k * i:, 1] = src[:, 0] * g
        else: sh[k * i:] = src * g
        y += lp(sh, 3800, 1)
    return y

# ---------- the groove, arranged to the picture ----------
PROG = [(29, [57, 60, 64, 67]), (31, [59, 62, 64, 69]), (28, [55, 59, 62, 69]), (33, [60, 64, 67, 71])]   # Fmaj9 G6/9 Em7(11) Am9
HOME = (36, [52, 55, 59, 62, 64, 67])                                                                         # Cmaj9: the end card resolves
HOOK = {0: 76, 3: 79, 6: 81, 8: 79, 10: 76, 14: 74, 16: 72, 19: 74, 22: 76, 24: 79, 27: 84, 30: 81}            # C pentatonic, two bars
BEAT = 60 / M['bpm']; BAR = 4 * BEAT; SX = BEAT / 4; SWING = .14 * SX
ANCHOR, END = M['anchor'], M['end']
def sec_at(t):
    for a, b, k in M['sections']:
        if a <= t < b: return k
    return None
DR, BS, KEYS, PADB, PLK, FX, ROOMS, HALLS = (bus() for _ in range(8))
kicks = []
for kb in range(math.floor(-ANCHOR / BAR) - 1, math.ceil((END - ANCHOR) / BAR)):
    tb = ANCHOR + kb * BAR
    if tb >= END - 1e-6: break
    root, ch = PROG[kb % 4]
    for i in range(16):
        t = tb + i * SX + (SWING if i % 2 else 0); sec = sec_at(t)
        if t < 0 or sec is None or t >= END: continue
        groove = sec in ('full', 'lift')
        if groove and i % 4 == 0: put(DR, kick(.95 if i in (0, 8) else .85), t); kicks.append(t)
        if groove and i in (4, 12): put(DR, clap(.5), t, 1); put(ROOMS, st(clap(.5)), t, .5)
        if groove and i % 4 == 2: put(DR, st(hat(.9, .09 if sec == 'lift' else .04), .25), t)
        if groove and i % 2 == 1: put(DR, st(hat(.38, .025), -.3), t)
        if sec in ('full', 'lift', 'break', 'intro_perc'): put(DR, st(shaker(1.0 if i % 4 == 2 else .55), .45), t, .8 if sec == 'break' else 1)
        if groove and i in (0, 2, 6, 10, 14): put(BS, bass(root + (12 if i == 6 else 0), SX * (.9 if i == 0 else 1.7), .5), t)
        if sec == 'lift' and (kb % 2 * 16 + i) in HOOK:
            put(PLK, st(pluck(HOOK[kb % 2 * 16 + i], .22), (.3 if i % 4 else -.3)), t)
    if tb + BAR < .5: continue
    sec = sec_at(max(tb, 0))
    if sec in ('full', 'lift'):
        for st_, ln, g in ((0, 6, .48), (6, 2, .3), (10, 4, .4)): put(KEYS, ep_chord(ch, ln * SX, g), tb + st_ * SX + (SWING if st_ % 2 else 0))
    elif sec in ('intro', 'intro_perc', 'break', 'stop'):
        put(KEYS, ep_chord(ch, BAR * .95, .36 if sec != 'intro' else .3), tb)
    if sec:
        cut = {'intro': 900, 'intro_perc': 1100, 'break': 1400, 'stop': 1600}.get(sec, 2200)
        put(PADB, pad([m + 12 for m in ch[:3]], BAR + .35, .26 if sec in ('full', 'lift') else .34, cut), tb)
# the end card: one hit, the home chord left to ring
root, ch = HOME
put(DR, kick(1.0, .3), END); kicks.append(END); put(DR, st(crash(1.0), 0, .6), END); put(HALLS, st(crash(1.0)), END, .3)
put(BS, bass(root, 1.3, .55), END)
put(KEYS, ep_chord(ch, 2.2, .42), END + .01)
put(PADB, pad([m + 12 for m in ch[:4]], DUR - END + .4, .3, 1700), END)
for i in range(16):
    t = END + i * SX + (SWING if i % 2 else 0)
    if i % 4 == 2: put(DR, st(hat(.5, .05), .25), t)
    if i % 2 == 1: put(DR, st(shaker(.6), .4), t)
# sidechain from the kick: the pad and bass breathe with the groove
sc = np.zeros(N)
for tk in kicks:
    i = int(tk * SR)
    if 0 <= i < N: k = min(N - i, int(.5 * SR)); sc[i:i + k] = np.maximum(sc[i:i + k], np.exp(-T(k) / .13))
a = int(.004 * SR); sc = np.convolve(sc, np.ones(a) / a, 'same')
PLK = pingpong(PLK, BEAT * .75)
bed = (DR + BS * (1 - .5 * sc)[:, None] + KEYS * (1 - .22 * sc)[:, None] + PADB * (1 - .6 * sc)[:, None] + PLK
       + reverb(ROOMS + KEYS * .25, ROOM) * .35 + reverb(HALLS + PADB * .35 + PLK * .5, HALL) * .3)
bed = hp(bed, 38); bed = bed - .45 * lp(bed, 90) + .4 * bp(bed, 300, 2500)   # about -5 dB below 90 Hz, +3 dB where phones play
f = int(.5 * SR); bed[-f:] *= np.linspace(1, 0, f)[:, None] ** 1.6

# ---------- effects ----------
def bell(f, d=1.2, v=1.0, ratio=3.5, idx=2.0):
    n = int(d * SR); t = T(n); I = idx * np.exp(-t / .15)
    y = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t)) * np.exp(-t / (d * .35))
    return (y + .3 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / (d * .2))) * np.minimum(1, t / .001) * v
def whoosh(d=.5, dir=1, v=1.0):
    n = int(d * SR); t = T(n); u = t / d
    fc = lambda tt: 300 + 4200 * math.sin(math.pi * min(1, tt / d / .72) / 2) ** 2 if tt / d < .72 else 4500 - 3000 * (tt / d - .72) / .28
    y = shaped_noise(n, fc, 1.2) * np.where(u < .72, (u / .72) ** 2.2, np.exp(-(u - .72) / .09))
    body = np.sin(2 * np.pi * np.cumsum(70 + 90 * u) / SR) * np.where(u < .72, u / .72, np.exp(-(u - .72) / .06)) * .35
    out = np.zeros((n, 2))
    for j in range(0, n, 480):                                       # pan travels across with the whip
        p = -dir * .85 + dir * 1.7 * min(1, j / n / .8); out[j:j + 480] = st(y[j:j + 480] + body[j:j + 480], p)
    return out * v
def swish(d=.24, v=1.0, p=0):
    n = int(d * SR); u = T(n) / d
    y = shaped_noise(n, lambda tt: 1500 + 6000 * (tt / d) ** 1.4, .9) * np.sin(np.pi * np.minimum(1, u * 1.1)) ** 1.4
    return st(y * v * .5, p, .4)
def tick(f=4200, v=1.0):
    n = int(.03 * SR); t = T(n)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / .004) + hp(rng.standard_normal(n), 6000) * np.exp(-t / .0015) * .3 * v
def ding(note=88, v=1.0):
    y = bell(hz(note), 1.3, .5 * v); o = bell(hz(note + 12), .8, .18 * v, 2.0, 1.0); y[:len(o)] += o; return y
def scratch(d=.2, v=1.0):
    n = int(d * SR); t = T(n); u = t / d
    grain = (1 + .8 * np.sign(np.sin(2 * np.pi * 70 * t + 3 * np.sin(2 * np.pi * 13 * t)))) / 2
    return bp(rng.standard_normal(n), 1800, 6500) * grain * np.sin(np.pi * u) ** .7 * v * .35
def stamp(v=1.0):
    n = int(.5 * SR); t = T(n); f = 55 + 90 * np.exp(-t / .02)
    y = (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .09) + bp(rng.standard_normal(n), 1200, 4500) * np.exp(-t / .012) * .7
         + lp(rng.standard_normal(n), 900) * np.exp(-t / .04) * .5)
    out = np.tanh(1.5 * y) * .8; s = bell(3100, .4, .06, 2.0, .6); k = int(.05 * SR); out[k:k + len(s)] += s[:n - k]
    return out * v
PENTA = [84, 86, 88, 91, 93, 96, 98, 100, 103]
def shimmer(v=1.0, seed=0):
    r = np.random.default_rng(seed); n = int(1.6 * SR); y = np.zeros(n)
    for i, m in enumerate(sorted(r.choice(PENTA, 4, replace=False))):
        d = int(i * .035 * SR); b = bell(hz(m), 1.2, .25, 2.76 + r.random() * .5, .8); y[d:d + len(b)] += b[:n - d]
    return (y + hp(r.standard_normal(n), 9000) * np.exp(-T(n) / .05) * .08) * v
def zip_(v=1.0):
    d = .26; n = int(d * SR); u = T(n) / d; f = 700 + 2400 * u ** 1.5
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * .3 + bp(rng.standard_normal(n), 2000, 8000) * .15) * np.sin(np.pi * u) * v
def pop(note=88, v=1.0):
    n = int(.12 * SR); t = T(n); f = hz(note) * (1 + .9 * np.exp(-t / .012))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .03) * np.minimum(1, t / .0008) * v * .5
def dm(kind='in', v=1.0):
    if kind == 'in':
        n = int(.3 * SR); y = np.zeros(n)
        for o, f, d in ((0, 784, .06), (.07, 1175, .12)):
            k = int(o * SR); m = n - k; t = T(m); y[k:] += np.sin(2 * np.pi * f * t) * np.exp(-t / d) * np.minimum(1, t / .002)
        return y * v * .5
    d = .2; n = int(d * SR); u = T(n) / d
    y = shaped_noise(n, lambda tt: 2000 + 6000 * tt / d, .8) * np.sin(np.pi * u) * .25
    p = pop(96, 1.0); k = int(.16 * SR); y = np.concatenate([y, np.zeros(len(p))]); y[k:k + len(p)] += p
    return y * v
def typing(d, v=1.0):
    n = int(d * SR); y = np.zeros(n); t = 0.0
    while t < d - .02:
        k = int(t * SR); m = int(.012 * SR); tt = T(m)
        y[k:k + m] += (bp(rng.standard_normal(m), 1500, 5000) * np.exp(-tt / .003) + np.sin(2 * np.pi * 180 * tt) * np.exp(-tt / .006) * .3)[:n - k]
        t += .075 + rng.random() * .08
    return y * v * .35
def drop(note=84, v=1.0):
    n = int(.6 * SR); t = T(n); f = 190 * (1 - .5 * np.minimum(1, t / .09))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .05) * .6 + lp(rng.standard_normal(n), 600) * np.exp(-t / .02) * .3
    fm = hz(note); y += (np.sin(2 * np.pi * fm * t) + .25 * np.sin(2 * np.pi * 4 * fm * t) * np.exp(-t / .05)) * np.exp(-t / .3) * .45
    return y * v
def chime(notes=(79, 84), v=1.0):
    n = int(1.4 * SR); y = np.zeros(n)
    for i, m in enumerate(notes): k = int(i * .07 * SR); b = bell(hz(m), 1.1, .4, 2.0, .9); y[k:k + len(b)] += b[:n - k]
    return y * v
def success(v=1.0):
    n = int(1.8 * SR); y = np.zeros(n)
    for i, m in enumerate((84, 88, 91, 96)): k = int(i * .045 * SR); b = bell(hz(m), 1.3, .32, 2.0, 1.1); y[k:k + len(b)] += b[:n - k]
    s = shimmer(.5, 7); k = int(.12 * SR); y[k:k + len(s)] += s[:n - k]
    return y * v
def tap(v=1.0):
    n = int(.1 * SR); t = T(n)
    return (lp(rng.standard_normal(n), 3000) * np.exp(-t / .004) * .6 + np.sin(2 * np.pi * 140 * t) * np.exp(-t / .02)) * v
def burst(v=1.0, seed=3):
    r = np.random.default_rng(seed); n = int(1.2 * SR); out = np.zeros((n, 2))
    for i in range(9):
        k = int(r.random() * .3 * SR); b = bell(hz(r.choice(PENTA) + 12), .5, .12, 2.0, .7); out[k:k + len(b)] += st(b[:n - k], r.uniform(-.8, .8))
    return out * v
def bloom(v=1.0):
    d = .26; n = int(d * SR); u = T(n) / d
    swell = shaped_noise(n, lambda tt: 800 + 5000 * (tt / d) ** 2, 1.4) * u ** 2.5 * .25
    m = int(2.0 * SR); y = np.zeros(n + m); y[:n] += swell
    for i, mm in enumerate((84, 91, 100)): b = bell(hz(mm), 1.8, .25, 2.0, .9); y[n + int(i * .02 * SR):][:len(b)] += b[:len(y) - n - int(i * .02 * SR)]
    return y * v
def dive(d, v=1.0):
    n = int(d * SR); u = T(n) / d
    y = shaped_noise(n, lambda tt: 400 * (6000 / 400) ** (tt / d), 1.3) * u ** 1.8 * .5
    y += np.sin(2 * np.pi * np.cumsum(200 + 400 * u ** 2) / SR) * u ** 2 * .12
    th = np.sin(2 * np.pi * 80 * T(int(.3 * SR))) * np.exp(-T(int(.3 * SR)) / .07) * .6
    return np.concatenate([y, th]) * v
def suck(d, v=1.0):
    n = int(d * SR); u = T(n) / d
    y = shaped_noise(n, lambda tt: 6000 * (800 / 6000) ** (tt / d), 1.2) * u ** 2 * .45
    return y * v
def boom(v=1.0):
    n = int(2.0 * SR); t = T(n); f = 38 + 30 * np.exp(-t / .25); f2 = 75 + 70 * np.exp(-t / .06)
    y = (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .5) * .6 + np.sin(2 * np.pi * np.cumsum(f2) / SR) * np.exp(-t / .18) * .7
         + lp(rng.standard_normal(n), 600) * np.exp(-t / .05) * .6)
    return np.tanh(1.6 * y) * v
def riser(d, v=1.0):
    n = int(d * SR); u = T(n) / d
    y = shaped_noise(n, lambda tt: 300 * (9000 / 300) ** (tt / d), 1.0) * u ** 2.2 * .55
    vib = 1 + .006 * np.sin(2 * np.pi * 6 * T(n))
    y += np.sin(2 * np.pi * np.cumsum((150 * (900 / 150) ** u) * vib) / SR) * u ** 2 * .1
    return y * v
def revcym(d, v=1.0):
    c = crash(1.0, max(d, .4) * 1.4)[::-1]; c = c[-int(d * SR):]; return c * np.linspace(0, 1, len(c)) ** 1.5 * v * 2.2
def hit(v=1.0):
    n = int(1.2 * SR); y = boom(.45)[:n].copy(); sh = shimmer(.5, 99)[:n]; y[:len(sh)] += sh; return y * v
def cut(v=1.0):
    n = int(.08 * SR); t = T(n); return (np.sin(2 * np.pi * 110 * t) * np.exp(-t / .02) + hp(rng.standard_normal(n), 4000) * np.exp(-t / .002) * .3) * v
def punch(v=1.0):
    n = int(.3 * SR); t = T(n); return np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t / .02)) / SR) * np.exp(-t / .08) * v
def pen(d, v=1.0):
    n = int(d * SR); t = T(n); u = t / d
    return bp(rng.standard_normal(n), 1000, 3200) * (1 + .5 * np.sin(2 * np.pi * 24 * t)) * np.sin(np.pi * u) ** .6 * v * .3
def air(d, v=1.0):
    n = int(d * SR); u = T(n) / d
    return shaped_noise(n, lambda tt: 900 + 2200 * tt / d, 1.6) * np.sin(np.pi * u) * v * .3

# ---------- voice ----------
vo, vsr = sf.read(f'{S}/vo/{P["voice"]}.48k.wav', dtype='float64'); assert vsr == SR
if vo.ndim > 1: vo = vo.mean(1)
V = np.zeros(N)
for seg in P['vo']:
    a, b = max(0, int((seg['src0'] - .02) * SR)), int((seg['src1'] + .04) * SR); x = vo[a:b].copy()
    f = int(.008 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    i = int((seg['at'] - .02) * SR); n = min(len(x), N - i); V[i:i + n] += x[:n]
V = hp(V, 85); V = V + .2 * bp(V, 2500, 6500)                           # clear the rumble, a little presence
env = np.sqrt(np.convolve(V ** 2, np.ones(480) / 480, 'same')) + 1e-9    # gentle 3:1 on the loudest syllables
thr = np.percentile(env[env > 1e-4], 95) * .35; gr = np.where(env > thr, (env / thr) ** (1 / 3 - 1), 1.0)
gr = lfilter([1 - math.exp(-1 / (.03 * SR))], [1, -math.exp(-1 / (.03 * SR))], gr); V = V * gr
V = to_lufs(V, -16.0)
# duck the bed under the voice: about 6.5 dB, quick to dip and slow to come back
cr = 1000; ve = np.abs(V)[: N // 48 * 48].reshape(-1, 48).max(1); act = (np.convolve(ve, np.ones(30) / 30, 'same') > .01).astype(float)
g = np.zeros(len(act)); s_ = 0.0; aa, ar = math.exp(-1 / (.03 * cr)), math.exp(-1 / (.32 * cr))
for j in range(len(act)): c_ = aa if act[j] > s_ else ar; s_ = c_ * s_ + (1 - c_) * act[j]; g[j] = s_
duck = 1 - .53 * np.interp(np.arange(N) / 48, np.arange(len(g)), g)

# ---------- effects: each kind sits a set number of dB under the voice's loud syllables ----------
def kweight(x):
    return lfilter([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621],
                   lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585], x, axis=0), axis=0)
def l50(x):
    """K-weighted loudness over sliding 50 ms windows: short enough to read a tick or a pop the way the ear does"""
    if x.ndim == 1: x = st(x)
    w = int(.05 * SR); x = np.concatenate([x, np.zeros((w, 2))]); c = np.cumsum(np.concatenate([np.zeros(1), (kweight(x) ** 2).sum(1)]))
    return -.691 + 10 * np.log10((c[w:] - c[:-w]) / w + 1e-15)
lv = l50(np.stack([V, V], 1)); V50 = float(np.percentile(lv[lv > -45], 90))
OFF = {'whoosh': -6, 'swish': -12, 'ticks': -14, 'tick': -11, 'ding': -8, 'scratch': -13, 'stamp': -6, 'shimmer': -9, 'zip': -12,
       'pop': -11, 'dm': -4, 'typing': -15, 'drop': -7, 'chime': -7, 'success': -5, 'tap': -8, 'burst': -10, 'bloom': -7, 'dive': -6,
       'suck': -7, 'boom': -6, 'riser': -7, 'revcym': -9, 'hit': -7, 'cut': -16, 'punch': -11, 'pen': -14, 'air': -12}
HALL_SEND = {'shimmer': .5, 'ding': .35, 'chime': .45, 'success': .45, 'bloom': .5, 'boom': .3, 'whoosh': .25, 'burst': .5, 'dm': .2,
             'drop': .2, 'stamp': .15, 'riser': .2, 'dive': .25, 'pop': .15, 'hit': .3}
gain = lambda sig, k, v: 10 ** ((V50 + OFF[k] + 20 * math.log10(max(v, 1e-3)) - float(np.max(l50(sig)))) / 20)
fxh = bus()
for i, c in enumerate(P['sfx']):
    k, t, v, p = c['k'], c['t'], c.get('v', 1.0), c.get('pan', 0.0)
    if k == 'whoosh': sig = whoosh(.5, c.get('dir', 1)); t -= .72 * .5
    elif k == 'swish': sig = swish(.24, 1, p)
    elif k == 'ticks':
        n_, t1, dn = c.get('n', 10), c['t1'], c.get('dirn', -1); gt = gain(st(tick(4200), p), 'ticks', v)
        for j in range(1, n_):                                       # one tick each time the shown number moves on a step
            u = -math.log2(1 - j / n_) / 10; f0 = 4000 + (j / n_) * 1400 * (1 if dn > 0 else -1)
            put(FX, st(tick(f0), p), t + u * (t1 - t), gt)
        continue
    elif k == 'tick': sig = st(tick(5200), p)
    elif k == 'ding': sig = st(ding(c.get('note', 88)), p, .3)
    elif k == 'scratch': sig = st(scratch(c.get('d', .2)), p)
    elif k == 'stamp': sig = st(stamp(), p)
    elif k == 'shimmer': sig = st(shimmer(1, i), p, .5)
    elif k == 'zip': sig = st(zip_(), p)
    elif k == 'pop': sig = st(pop(c.get('note', 88)), p)
    elif k == 'dm': sig = st(dm(c.get('kind', 'in')), -.1 if c.get('kind', 'in') == 'in' else .2)
    elif k == 'typing': sig = st(typing(c['t1'] - t), -.1)
    elif k == 'drop': sig = st(drop(c.get('note', 84)), p)
    elif k == 'chime': sig = st(chime(c.get('notes', (79, 84))), p, .4)
    elif k == 'success': sig = st(success(), p, .5)
    elif k == 'tap': sig = st(tap(), 0)
    elif k == 'burst': sig = burst(1, i)
    elif k == 'bloom': sig = st(bloom(), 0, .5)
    elif k == 'dive': sig = st(dive(c['t1'] - t), 0, .6)
    elif k == 'suck': sig = st(suck(c['t1'] - t), 0, .5)
    elif k == 'boom': sig = st(boom(), 0)
    elif k == 'riser': d = c['d']; sig = st(riser(d), 0, .6); t -= d
    elif k == 'revcym': d = c['d']; sig = st(revcym(d), 0, .5); t -= d
    elif k == 'hit': sig = st(hit(), 0, .4)
    elif k == 'cut': sig = st(cut(), 0)
    elif k == 'punch': sig = st(punch(), 0)
    elif k == 'pen': sig = st(pen(c.get('d', .3)), .1)
    elif k == 'air': sig = st(air(c['t1'] - t), 0, .6)
    else: raise SystemExit(f'unknown cue {k}')
    g_ = gain(sig, k, v); put(FX, sig, t, g_)
    if k in HALL_SEND: put(fxh, sig, t, g_ * HALL_SEND[k])
fx = FX + reverb(fxh, HALL) * .45

bed = to_lufs(bed, -18.5)
mix = bed * duck[:, None] + fx + np.stack([V, V], 1)
pk = np.max(np.abs(mix)); mix = mix * (.95 / pk) if pk > .95 else mix
for name, x in (('mix', mix), ('stem_bed', bed * duck[:, None]), ('stem_fx', fx), ('stem_voice', np.stack([V, V], 1))):
    sf.write(f'{S}/ads/{AD}/{name}.wav', x.astype(np.float32), SR, subtype='FLOAT')
print(AD, 'mix', DUR, 's  LUFS mix', round(lufs(mix), 1), 'bed(ducked)', round(lufs(bed * duck[:, None]), 1), 'fx', round(lufs(fx), 1),
      'voice', round(lufs(V), 1), 'peak', round(float(np.max(np.abs(mix))), 3), 'kicks', len(kicks), 'cues', len(P['sfx']))
