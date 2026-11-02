"""Sound for each ad: an original bed (every sample synthesised here, so it is ours to run in paid ads), the voice placed
phrase by phrase on the picture, small effects on the cuts, the bed ducked under the voice.
Usage: python3.13 -I audio.py <S> <ad>      writes ads/<ad>/mix.wav (48 kHz stereo, before loudness normalisation)"""
import json, sys
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
S, AD = sys.argv[1], sys.argv[2]
P = json.load(open(f'{S}/ads/{AD}/audio.json')); M = P['music']
SR = 48000; DUR = P['dur']; N = int(DUR * SR)
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N); FX = np.zeros((N, 2))
lp = lambda x, f, o=2: sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
hp = lambda x, f, o=2: sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(sig, t, gl=1.0, gr=1.0, bus=None):
    i = int(round(t * SR));
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    if bus is None: L[i:i + n] += sig[:n] * gl; R[i:i + n] += sig[:n] * gr
    else: bus[i:i + n, 0] += sig[:n] * gl; bus[i:i + n, 1] += sig[:n] * gr
env = lambda n, a, d: np.minimum(1, np.arange(n) / max(1, a * SR)) * np.exp(-np.arange(n) / (d * SR))
# ---------- instruments ----------
def kick(v=1.0):
    n = int(.42 * SR); t = np.arange(n) / SR; f = 48 + 90 * np.exp(-t / .03)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .14); y[:120] += rng.normal(0, .25, 120) * np.linspace(1, 0, 120); return y * v
def clap(v=1.0):
    n = int(.25 * SR); y = np.zeros(n)
    for o in (0, .009, .018): k = int(o * SR); y[k:] += rng.normal(0, 1, n - k) * np.exp(-np.arange(n - k) / (.02 * SR))
    y += rng.normal(0, .5, n) * np.exp(-np.arange(n) / (.09 * SR)) * .4
    return sosfilt(butter(2, [900, 6000], 'band', fs=SR, output='sos'), y) * v * .55
def hat(v=1.0, open_=False):
    n = int((.18 if open_ else .05) * SR); y = hp(rng.normal(0, 1, n), 7000, 4) * np.exp(-np.arange(n) / ((.06 if open_ else .012) * SR)); return y * v * .35
def pluck(m, v=1.0, d=.28):
    n = int(.6 * SR); t = np.arange(n) / SR; f = hz(m)
    y = (np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .12 * np.sin(6 * np.pi * f * t)) * env(n, .002, d)
    return lp(y, 4200) * v
def keys(ms, dur, v=1.0):                                        # soft electric-piano chord (FM)
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for m in ms:
        f = hz(m); idx = 1.4 * np.exp(-t / .3) + .2
        y += np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) * np.exp(-t / 1.6)
    y *= np.minimum(1, t / .006); y[-1500:] *= np.linspace(1, 0, 1500); return lp(y / len(ms), 3800) * v
def pad(ms, dur, v=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for m in ms:
        for d in (-.08, 0, .07):
            f = hz(m) * 2 ** (d / 12); ph = rng.random(); y += 2 * ((f * t + ph) % 1) - 1
    y = lp(y / (len(ms) * 3), 1500, 4); e = np.clip(np.minimum(t / .35, (dur - t) / .4), 0, 1); return y * e * v
def sub(m, dur, v=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.sin(2 * np.pi * hz(m) * t) + .25 * np.sin(4 * np.pi * hz(m) * t)
    e = np.clip(np.minimum(t / .01, (dur - t) / .04), 0, 1); return y * e * v
# ---------- effects ----------
def whoosh(d=.42, v=1.0):
    n = int(d * SR); t = np.arange(n) / SR; x = rng.normal(0, 1, n)
    out = np.zeros(n); seg = 512
    for i in range(0, n, seg):                                   # a band sweeping up then away
        u = i / n; fc = 300 + 5200 * u ** 1.6
        out[i:i + seg] = sosfilt(butter(2, [fc * .6, min(fc * 1.6, 20000)], 'band', fs=SR, output='sos'), x[i:i + seg])
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5; return out * e * v * .9
def impact(v=1.0):
    n = int(1.2 * SR); t = np.arange(n) / SR; f = 40 + 30 * np.exp(-t / .05)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .45) + lp(rng.normal(0, 1, n), 900) * np.exp(-t / .08) * .5
    return y * v
def glint(v=1.0):
    n = int(1.4 * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for f, a in ((2637, 1), (3951, .6), (5274, .35), (7040, .2)):
        y += a * np.sin(2 * np.pi * f * t) * np.exp(-t / (.55 if f < 4000 else .25))
    y *= np.minimum(1, t / .002); return y * v * .22
def pop(v=1.0):
    n = int(.12 * SR); t = np.arange(n) / SR; f = 520 + 900 * np.exp(-t / .015)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .03) * v * .5
def riser(t_end, d=1.6, v=1.0):
    n = int(d * SR); t = np.arange(n) / SR; x = rng.normal(0, 1, n); out = np.zeros(n); seg = 1024
    for i in range(0, n, seg):
        u = i / n; fc = 400 + 7000 * u ** 2
        out[i:i + seg] = sosfilt(butter(2, [fc * .7, min(fc * 1.4, 20000)], 'band', fs=SR, output='sos'), x[i:i + seg])
    put(out * (t / d) ** 2 * v * .35, t_end - d, .9, 1.0, FX)
# ---------- the bed ----------
BPM = M['bpm']; B = 60 / BPM; BAR = 4 * B
prog = [([48, 55, 59, 62, 64], 36), ([45, 52, 55, 59, 60], 33), ([41, 48, 52, 57, 60], 29), ([43, 50, 53, 57, 59], 31)]  # Cmaj9 Am9 Fmaj9 G6/9
drop = M.get('drop', 0)
nb = int(np.ceil(DUR / BAR)) + 1
for b in range(nb):
    t0 = M['start'] + b * BAR; chord, root = prog[b % 4]
    put(pad([m + 12 for m in chord[1:4]], BAR + .3, .16), t0, .9, 1.0)
    put(keys(chord[1:], BAR, .20), t0, 1.0, .9)
    for k in range(4):
        tb = t0 + k * B
        put(kick(.55 if k % 2 == 0 else .42), tb)
        if k % 2 == 1: put(clap(.42), tb, .95, 1.0)
        put(hat(.5), tb + B / 2, .8, 1.0); put(hat(.32), tb + B / 4, 1.0, .8); put(hat(.32), tb + 3 * B / 4, 1.0, .8)
        put(sub(root, B * .9, .30), tb)
    arp = [chord[2] + 12, chord[3] + 12, chord[4] + 12, chord[3] + 12]
    for k in range(8):                                            # eighth-note pluck, panned a little
        put(pluck(arp[k % 4], .14 if k % 2 == 0 else .10), t0 + k * B / 2, 1.0 if k % 2 else .7, .7 if k % 2 else 1.0)
# before the first drop the bed sits back (low-passed); after it, full
bed = np.stack([L, R], 1)
if drop > .5:
    i = int(drop * SR); pre = bed[:i].copy()
    for c in range(2): pre[:, c] = lp(pre[:, c], 1400, 2)
    xf = int(.12 * SR); w = np.linspace(0, 1, xf)[:, None]
    bed[:i - xf] = pre[:i - xf]; bed[i - xf:i] = pre[i - xf:i] * (1 - w) + bed[i - xf:i] * w
    riser(drop, 1.4, .8)
# tail: let the last bar ring out under the end card
fade = int(.9 * SR); bed[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
# ---------- effects on the cuts ----------
for t in M.get('whoosh', []): put(whoosh(.40, .55), t - .06, .8, 1.0, FX)
for t in M.get('hits', []): put(impact(.32), t, 1.0, 1.0, FX)
for t in M.get('glint', []): put(glint(1.0), t, .8, 1.0, FX)
for t in M.get('pop', []): put(pop(1.0), t, 1.0, 1.0, FX)
# ---------- voice ----------
vo, vsr = sf.read(f'{S}/vo/{P["voice"]}.48k.wav', dtype='float64'); assert vsr == SR
if vo.ndim > 1: vo = vo.mean(1)
V = np.zeros(N)
for seg in P['vo']:
    a, b = int((seg['src0'] - .02) * SR), int((seg['src1'] + .04) * SR); a = max(a, 0); x = vo[a:b].copy()
    f = int(.008 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    i = int((seg['at'] - .02) * SR); n = min(len(x), N - i); V[i:i + n] += x[:n]
V = hp(V, 80)
vp = np.percentile(np.abs(V[np.abs(V) > 1e-4]), 99.5); V *= .5 / vp      # voice to a known level
# duck: bed down ~9 dB wherever the voice is (fast attack, slow release)
e = np.abs(V); w = int(.03 * SR); e = np.convolve(e, np.ones(w) / w, 'same'); act = (e > .02).astype(float)
g = np.zeros(N); a_att, a_rel = np.exp(-1 / (.03 * SR)), np.exp(-1 / (.35 * SR)); s = 0
for i in range(N):
    a = a_att if act[i] > s else a_rel; s = a * s + (1 - a) * act[i]; g[i] = s
duck = 1 - .64 * g
mix = bed * .55 * duck[:, None] + FX * .9 + np.stack([V, V], 1)
pk = np.max(np.abs(mix)); mix *= .89 / pk if pk > .89 else 1
sf.write(f'{S}/ads/{AD}/mix.wav', mix.astype(np.float32), SR, subtype='FLOAT')
sf.write(f'{S}/ads/{AD}/voice.wav', V.astype(np.float32), SR, subtype='FLOAT')
print(AD, 'mix', round(DUR, 2), 's peak', round(float(np.max(np.abs(mix))), 3))
