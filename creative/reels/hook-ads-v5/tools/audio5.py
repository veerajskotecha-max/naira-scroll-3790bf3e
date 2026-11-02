"""v5 sound for the short hook ads (v4 plus the hook formats' own soft sounds: slot ticks, the reel clack, a reaction pop,
a camera-shutter freeze and a padlock). v4 notes follow.
v4 sound for the two creator ads: v3's score, songs and soft effects under a creator's own voice.
- A creator's natural read is quieter and more dynamic than a studio voice, so the bed sits lower: the score at the level
  the ad's audio.json gives (-20 LUFS for these), ducked by its duck_db (8 dB) while she speaks; a song sits 1.5 dB over
  that and ducks 2 dB more, with v3's dip at 1-4 kHz so its vocals step aside for hers.
- mode "voice" keeps her voice and the soft effects and leaves the music out (no riser or reverse cymbal either), for the
  owner to add a song from Instagram's library.
Usage: python3.13 -I audio5.py <S> <ad> score|song|voice      writes ads/<ad>/mix_<mode>.wav and stems, 48 kHz float"""
import json, math, sys
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve, lfilter, stft, istft
S, AD, MODE = sys.argv[1], sys.argv[2], sys.argv[3]
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

def harp(m, v=1.0, d=2.2):
    """a plucked string: harmonics that die away faster the higher they are, a soft finger noise on the attack"""
    n = int(d * SR); t = T(n); f = hz(m); y = np.zeros(n)
    for k in range(1, 9):
        fk = f * k * (1 + .0004 * k * k)
        if fk > 9000: break
        y += np.sin(2 * np.pi * fk * t) * (1 / k ** 1.5) * np.exp(-t / (1.3 / k ** .8))
    y *= np.minimum(1, t / .002)
    y += lp(rng.standard_normal(n), 3000) * np.exp(-t / .004) * .05
    return lp(y, 4200) * v * .5
def strings(ms, dur, v=1.0, cut=2200):
    n = int(dur * SR); t = T(n); L = np.zeros(n); R = np.zeros(n)
    vib = 1 + .0025 * np.sin(2 * np.pi * 5.2 * t)
    for m in ms:
        for j, dt in enumerate((-.06, -.02, .02, .06)):
            ph = rng.random(); x = 2 * ((np.cumsum(hz(m) * 2 ** (dt / 12) * vib) / SR + ph) % 1) - 1
            if j % 2: L += x
            else: R += x
    y = lp(np.stack([L, R], 1) / (len(ms) * 2), cut, 4)
    return y * (np.clip(np.minimum(t / .8, (dur - t) / .7), 0, 1) ** 1.6)[:, None] * v
def snap(v=1.0):
    n = int(.2 * SR); t = T(n)
    y = bp(rng.standard_normal(n), 1600, 5200) * np.exp(-t / .012) + np.sin(2 * np.pi * 950 * t) * np.exp(-t / .01) * .3
    return y * v * .8
def softkick(v=1.0):
    n = int(.5 * SR); t = T(n); f = 50 + 80 * np.exp(-t / .03)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .16) + bp(rng.standard_normal(n), 1200, 3500) * np.exp(-t / .003) * .12
    return np.tanh(1.6 * y) / np.tanh(1.6) * v

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

# v3: the soft set. No bells: the owner asked for the "ting tings" to go.
def whoosh3(d=.5, dir=1, v=1.0):
    n = int(d * SR); u = T(n) / d
    fc = lambda tt: 260 + 2900 * math.sin(math.pi * min(1, tt / d / .72) / 2) ** 2 if tt / d < .72 else 3160 - 2200 * (tt / d - .72) / .28
    y = shaped_noise(n, fc, 1.3) * np.where(u < .72, (u / .72) ** 2.2, np.exp(-(u - .72) / .1))
    out = np.zeros((n, 2))
    for j in range(0, n, 480): out[j:j + 480] = st(y[j:j + 480], -dir * .6 + dir * 1.2 * min(1, j / n / .8))
    return out * v
def swish3(d=.26, v=1.0, p=0):
    n = int(d * SR); u = T(n) / d
    return st(shaped_noise(n, lambda tt: 700 + 2600 * (tt / d) ** 1.3, 1.0) * np.sin(np.pi * np.minimum(1, u * 1.1)) ** 1.6 * v * .5, p, .3)
def tap3(v=1.0):
    n = int(.12 * SR); t = T(n)
    return (lp(rng.standard_normal(n), 2200) * np.exp(-t / .006) * .5 + np.sin(2 * np.pi * 170 * t) * np.exp(-t / .025)) * v
def drop3(v=1.0):
    n = int(.4 * SR); t = T(n); f = 170 * (1 - .45 * np.minimum(1, t / .09))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .06) + lp(rng.standard_normal(n), 700) * np.exp(-t / .015) * .35) * v
def bloom3(v=1.0):
    d = .3; n = int(d * SR); u = T(n) / d
    sw = shaped_noise(n, lambda tt: 400 + 2600 * (tt / d) ** 2, 1.5) * u ** 2.2 * .4
    m = int(1.6 * SR); t = T(m)
    whoom = (np.sin(2 * np.pi * 146.8 * t) + .5 * np.sin(2 * np.pi * 220 * t)) * np.minimum(1, t / .04) * np.exp(-t / .6) * .35
    return np.concatenate([sw, np.zeros(m)]) + np.concatenate([np.zeros(n), whoom])
def shimmer3(v=1.0):
    n = int(1.0 * SR); y = np.zeros(n)
    for i, m in enumerate((79, 86)):
        k = int(i * .05 * SR); b = bell(hz(m), .8, .2, 2.0, .5); y[k:k + len(b)] += b[:n - k]
    return lp(y, 5000) * v

# ---------- v5: the hook formats' sounds, all felt and wood, nothing metallic ----------
def roll5(d, v=1.0):
    """slot reels: soft ticks, quick then slowing"""
    n = int((d + .06) * SR); y = np.zeros(n); t = 0.0
    while t < d:
        u = t / d; rate = 24 - 16 * u ** 1.4; i = int(t * SR); k = min(int(.014 * SR), n - i)
        y[i:i + k] += rng.standard_normal(k) * np.exp(-np.linspace(0, 10, k)) * (.55 + .45 * (1 - u)); t += 1 / rate
    return lp(hp(y, 700), 2800) * v
def clack5(v=1.0):
    """a reel landing: a dull wooden knock"""
    k = int(.07 * SR); tt = np.arange(k) / SR
    return lp(hp(rng.standard_normal(k) * np.exp(-tt * 140) * .5 + np.sin(2 * np.pi * 380 * tt) * np.exp(-tt * 70), 160), 2400) * v
def pop5(v=1.0):
    """a reaction landing on a message: a soft, round pop"""
    k = int(.1 * SR); tt = np.arange(k) / SR; f = 480 + 700 * np.exp(-tt * 45)
    return lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 36), 2200) * v
def freeze5(v=1.0):
    """the picture freezes: a camera shutter's two soft clicks and a breath of air"""
    n = int(.5 * SR); y = np.zeros(n)
    for dt, g in ((0, 1.0), (.055, .7)):
        i = int(dt * SR); k = int(.02 * SR); y[i:i + k] += rng.standard_normal(k) * np.exp(-np.linspace(0, 9, k)) * g
    a = rng.standard_normal(n) * np.exp(-np.linspace(0, 6, n)) * .25
    return (lp(hp(y, 900), 5000) + lp(hp(a, 1500), 7000)) * v
def unlock5(v=1.0):
    """a small padlock opening: a click, then the shackle's lighter clack"""
    n = int(.3 * SR); y = np.zeros(n)
    for dt, f, g in ((0, 1800, 1.0), (.11, 1200, .7)):
        i = int(dt * SR); k = int(.03 * SR); tt = np.arange(k) / SR
        y[i:i + k] += (rng.standard_normal(k) * .5 + np.sin(2 * np.pi * f * tt)) * np.exp(-tt * 120) * g
    return lp(hp(y, 400), 4500) * v

# ---------- voice: each placed phrase comes from its own read, matched in level to the main read ----------
reads = {}
def read(name):
    if name not in reads:
        x, vsr = sf.read(f'{S}/vo/{name}.48k.wav', dtype='float64'); assert vsr == SR
        reads[name] = x.mean(1) if x.ndim > 1 else x
    return reads[name]
ref = lufs(read(P['voice']))
V = np.zeros(N)
for seg in P['vo']:
    name = seg.get('file') or P['voice']; vo = read(name) * 10 ** ((ref - lufs(read(name))) / 20)
    a, b = max(0, int((seg['src0'] - .02) * SR)), int((seg['src1'] + .04) * SR); x = vo[a:b].copy()
    f = int(.008 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    i = int(round((seg['at'] - (seg['src0'] - a / SR)) * SR))                # keep her words where the picture has them
    if i < 0: x = x[-i:]; i = 0                                          # a phrase at 0 s has no lead-in to place
    n = min(len(x), N - i); V[i:i + n] += x[:n]
V = hp(V, 85); V = V + .2 * bp(V, 2500, 6500)
env = np.sqrt(np.convolve(V ** 2, np.ones(480) / 480, 'same')) + 1e-9
thr = np.percentile(env[env > 1e-4], 95) * .35; gr = np.where(env > thr, (env / thr) ** (1 / 3 - 1), 1.0)
gr = lfilter([1 - math.exp(-1 / (.03 * SR))], [1, -math.exp(-1 / (.03 * SR))], gr); V = V * gr
V = to_lufs(V, -16.0)
from scipy.ndimage import maximum_filter1d, uniform_filter1d
def peak_limit(x, ceil, la=.005):
    """a creator's raw read has plosives 16 dB over its loudness; hold them to the ceiling with 5 ms of look-ahead,
    so the master's limiter is not left to clip them into inter-sample overs"""
    n = int(la * SR); pk = maximum_filter1d(np.abs(x), size=4 * n + 1)
    g = uniform_filter1d(np.minimum(1.0, ceil / np.maximum(pk, 1e-9)), size=2 * n + 1)
    return x * g
V = peak_limit(lp(V, 15000, 4), .5)                                    # her phone mic's clicks live up by Nyquist; a voice needs none of it
cr = 1000; ve = np.abs(V)[: N // 48 * 48].reshape(-1, 48).max(1); act = (np.convolve(ve, np.ones(30) / 30, 'same') > .01).astype(float)
g = np.zeros(len(act)); s_ = 0.0; aa, ar = math.exp(-1 / (.03 * cr)), math.exp(-1 / (.32 * cr))
for j in range(len(act)): c_ = aa if act[j] > s_ else ar; s_ = c_ * s_ + (1 - c_) * act[j]; g[j] = s_
G = np.interp(np.arange(N) / 48, np.arange(len(g)), g)                    # 0..1, how much the voice is speaking

# ---------- music ----------
def score():
    """the original: harp, Rhodes, strings, a half-time kick, snaps; the end card resolves home"""
    sc = M['score']; BEAT = 60 / sc['bpm']; BAR = 4 * BEAT; SX = BEAT / 4; SW = .1 * SX
    ANCHOR, END = sc['anchor'], sc['end']
    def sec_at(t):
        for a, b, k in sc['sections']:
            if a <= t < b: return k
        return None
    PROG3 = [(38, [54, 57, 61, 64]), (35, [57, 61, 62, 66]), (31, [54, 57, 59, 62]), (33, [54, 59, 61, 64])]   # Dmaj9 Bm9 Gmaj9 A6/9
    HOME3 = (38, [54, 57, 61, 64, 69])
    DR, BS, KEYS, PADB, HARP, ROOMS = (bus() for _ in range(6)); kicks = []
    for kb in range(math.floor(-ANCHOR / BAR) - 1, math.ceil((END - ANCHOR) / BAR)):
        tb = ANCHOR + kb * BAR
        if tb >= END - 1e-6: break
        root, ch = PROG3[kb % 4]
        seq = [ch[0], ch[1], ch[2], ch[3], ch[2] + 12, ch[3], ch[1] + 12, ch[2]]
        for i in range(16):
            t = tb + i * SX + (SW if i % 2 else 0); sec = sec_at(t)
            if t < 0 or sec is None or t >= END: continue
            groove = sec in ('groove', 'lift')
            if groove and i in (0, 8): put(DR, softkick(.8 if i == 0 else .7), t); kicks.append(t)
            if groove and i == 11 and kb % 2: put(DR, softkick(.4), t); kicks.append(t)
            if groove and i in (4, 12): put(DR, st(snap(.55), .15), t); put(ROOMS, st(snap(.55)), t, .7)
            if sec in ('groove', 'lift', 'break') and i % 2 == 0: put(DR, st(shaker(.7 if i % 4 == 2 else .4), .4), t, .7 if sec == 'break' else 1)
            if groove and i in (0, 10, 14): put(BS, bass(root + (7 if i == 14 else 0), SX * (6 if i == 0 else 3 if i == 10 else 1.6), .45), t)
            if sec in ('intro', 'groove', 'lift', 'break') and i % 2 == 0:
                put(HARP, st(harp(seq[i // 2] + 12, (.2 if sec == 'intro' else .24) * (1.1 if i % 4 == 0 else .85)), .35 if (i // 2) % 2 else -.25), t)
            if sec == 'lift' and i % 4 == 2: put(HARP, st(harp(ch[(i // 4) % 4] + 24, .09), .5), t)
        if tb + BAR < .5: continue
        sec = sec_at(max(tb, 0))
        if sec in ('groove', 'lift'):
            put(KEYS, ep_chord(ch, 2.5 * BEAT, .34), tb); put(KEYS, ep_chord(ch, 1.5 * BEAT, .24), tb + 10 * SX + SW)
        elif sec in ('intro', 'break', 'stop'): put(KEYS, ep_chord(ch, BAR * .95, .28), tb)
        if sec:
            put(PADB, pad([m + 12 for m in ch[:3]], BAR + .35, .16 if sec == 'groove' else .22, {'intro': 1000, 'break': 1400, 'stop': 1600}.get(sec, 1800)), tb)
            if sec == 'lift': put(PADB, strings([m + 12 for m in ch], BAR + .4, .3, 2400), tb)
    root, ch = HOME3
    put(DR, softkick(.9), END); kicks.append(END); put(BS, bass(root, 1.6, .45), END)
    put(KEYS, ep_chord(ch, 2.4, .4), END + .01); put(PADB, strings([m + 12 for m in ch], DUR - END + .5, .34, 2400), END)
    for k, m in enumerate((62, 66, 69, 71, 74, 78, 81, 83)): put(HARP, st(harp(m, .2 - .012 * k), -.4 + .1 * k), END + .05 + k * SX)
    sc_ = np.zeros(N)
    for tk in kicks:
        i = int(tk * SR)
        if 0 <= i < N: k = min(N - i, int(.4 * SR)); sc_[i:i + k] = np.maximum(sc_[i:i + k], np.exp(-T(k) / .12))
    HARP = pingpong(HARP, BEAT * .75, fb=.32, mix=.22)
    bed = (DR + BS * (1 - .35 * sc_)[:, None] + KEYS + PADB * (1 - .35 * sc_)[:, None] + HARP
           + reverb(ROOMS + KEYS * .3 + HARP * .2, ROOM) * .35 + reverb(PADB * .4 + HARP * .45, HALL) * .3)
    bed = hp(bed, 38); bed = bed - .45 * lp(bed, 90) + .4 * bp(bed, 300, 2500)
    f = int(.6 * SR); bed[-f:] *= np.linspace(1, 0, f)[:, None] ** 1.6
    return to_lufs(bed, M.get('bed_lufs', -18.5)), 1 - (1 - 10 ** (-M.get('duck_db', 6.5) / 20)) * G
def song():
    """the owner's earlier song, cut so its silence and drop land on the picture"""
    sg = M['song']; x, sr = sf.read(f'{S}/{sg["file"]}', dtype='float64'); assert sr == SR
    if x.ndim == 1: x = np.stack([x, x], 1)
    out = np.zeros((N, 2)); segs = sg['segs']
    for j, (a, b, off) in enumerate(segs):
        xf = .35 if j < len(segs) - 1 else 0                              # overlap into the next piece, faded out
        ia, ib = int(a * SR), min(N, int((b + xf) * SR)); s0 = int(round((a + off) * SR))
        piece = np.zeros((ib - ia, 2)); lo = max(0, s0); src = x[lo:s0 + (ib - ia)]
        if len(src): piece[lo - s0:lo - s0 + len(src)] = src
        fi = int((.06 if j == 0 else .03) * SR); piece[:fi] *= np.linspace(0, 1, fi)[:, None]
        if xf: k = int(xf * SR); piece[-k:] *= np.linspace(1, 0, k)[:, None] ** 1.5
        out[ia:ib] += piece
    # level the song's own dynamics about halfway, so a quiet intro still reads under the voice and a drop still lands
    w = int(.4 * SR); e = np.sqrt(np.convolve((out ** 2).mean(1), np.ones(w) / w, 'same')) + 1e-6
    db = 20 * np.log10(e); tgt = np.median(db[db > -50]); gdb = np.clip((tgt - db) * .5, -6, 9)
    gdb = np.convolve(gdb, np.ones(int(.3 * SR)) / int(.3 * SR), 'same'); out = out * (10 ** (gdb / 20))[:, None]
    f = int(.6 * SR); out[-f:] *= np.linspace(1, 0, f)[:, None] ** 1.6
    out = to_lufs(hp(out, 38), M.get('bed_lufs', -18.5) + 1.5)                 # a song ducks harder, so it starts higher
    out = out - .45 * bp(out, 1000, 4000) * G[:, None]                       # its vocals step back where the voice speaks
    return out, 1 - (1 - 10 ** (-(M.get('duck_db', 7.0) + 2) / 20)) * G
bed, duck = score() if MODE == 'score' else song() if MODE == 'song' else (np.zeros((N, 2)), np.ones(N))

# ---------- effects: the soft set, each a fixed number of dB under the voice's loud syllables ----------
def kweight(x):
    return lfilter([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621],
                   lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585], x, axis=0), axis=0)
def l50(x):
    if x.ndim == 1: x = st(x)
    w = int(.05 * SR); x = np.concatenate([x, np.zeros((w, 2))]); c = np.cumsum(np.concatenate([np.zeros(1), (kweight(x) ** 2).sum(1)]))
    return -.691 + 10 * np.log10((c[w:] - c[:-w]) / w + 1e-15)
lv = l50(np.stack([V, V], 1)); V50 = float(np.percentile(lv[lv > -45], 90))
OFF3 = {'whoosh': -9, 'swish': -15, 'tap': -14, 'drop': -11, 'dm': -6, 'typing': -17, 'bloom': -10, 'boom': -8, 'dive': -10,
        'suck': -10, 'riser': -10, 'revcym': -12, 'air': -14, 'shimmer': -16,
        'roll': -19, 'clack': -15, 'pop': -13, 'freeze': -11, 'unlock': -12}
HALL3 = {'whoosh': .2, 'bloom': .5, 'boom': .3, 'dm': .2, 'drop': .15, 'riser': .2, 'dive': .25, 'shimmer': .5, 'tap': .1}
gain = lambda sig, k, v: 10 ** ((V50 + OFF3[k] + 20 * math.log10(max(v, 1e-3)) - float(np.max(l50(sig)))) / 20)
FX, fxh = bus(), bus()
for i, c in enumerate(P['sfx']):
    if c.get('music') and MODE != 'score': continue                      # a song brings its own build; voice-only has no music
    k, t, v, p = c['k'], c['t'], c.get('v', 1.0), c.get('pan', 0.0)
    if k == 'whoosh': sig = whoosh3(.5, c.get('dir', 1)); t -= .72 * .5
    elif k == 'swish': sig = swish3(.26, 1, p)
    elif k == 'tap': sig = st(tap3(), p)
    elif k == 'drop': sig = st(drop3(), p)
    elif k == 'dm': sig = st(dm(c.get('kind', 'in')), -.1 if c.get('kind', 'in') == 'in' else .2)
    elif k == 'typing': sig = st(typing(c['t1'] - t), -.1)
    elif k == 'bloom': sig = st(bloom3(), 0, .5)
    elif k == 'boom': sig = st(boom(), 0)
    elif k == 'dive': sig = st(dive(c['t1'] - t), 0, .6)
    elif k == 'suck': sig = st(suck(c['t1'] - t), 0, .5)
    elif k == 'riser': d = c['d']; sig = st(riser(d), 0, .6); t -= d
    elif k == 'revcym': d = c['d']; sig = st(revcym(d), 0, .5); t -= d
    elif k == 'air': sig = st(air(c['t1'] - t), 0, .6)
    elif k == 'shimmer': sig = st(shimmer3(), p, .5)
    elif k == 'roll': sig = st(roll5(c['t1'] - t), -.2)
    elif k == 'clack': sig = st(clack5(), -.2)
    elif k == 'pop': sig = st(pop5(), p)
    elif k == 'freeze': sig = st(freeze5(), 0, .3)
    elif k == 'unlock': sig = st(unlock5(), p)
    else: raise SystemExit(f'unknown cue {k}')
    g_ = gain(sig, k, v); put(FX, sig, t, g_)
    if k in HALL3: put(fxh, sig, t, g_ * HALL3[k])
fx = FX + reverb(fxh, HALL) * .45

mix = bed * duck[:, None] + fx + np.stack([V, V], 1)
pk = np.max(np.abs(mix)); mix = mix * (.95 / pk) if pk > .95 else mix
for name, x in ((f'mix_{MODE}', mix), (f'stem_bed_{MODE}', bed * duck[:, None]), (f'stem_fx_{MODE}', fx), ('stem_voice', np.stack([V, V], 1))):
    sf.write(f'{S}/ads/{AD}/{name}.wav', x.astype(np.float32), SR, subtype='FLOAT')
print(AD, MODE, 'LUFS mix', round(lufs(mix), 1), 'bed(ducked)', round(lufs(bed * duck[:, None]), 1), 'fx', round(lufs(fx), 1),
      'voice', round(lufs(V), 1), 'peak', round(float(np.max(np.abs(mix))), 3), 'cues', len(P['sfx']))
