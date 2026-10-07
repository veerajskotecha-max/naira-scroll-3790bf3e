"""Final mix for the Halo / Baroque ad: her cleaned voiceover on top, the original bed ducked under it,
the SFX kit on the graphics' hits, then two-pass loudnorm to -14 LUFS / -1.5 dBTP."""
import json, math, subprocess, numpy as np, soundfile as sf
from scipy.ndimage import uniform_filter1d
S = __import__('os').environ.get('WORK', '.'); W = S + '/v12'; FF = S + '/ffmpeg'
SR = 48000; DUR = json.load(open(W + '/eng/data.json'))['dur']; N = int(DUR * SR)
C = json.load(open(W + '/eng/data.json'))['cue']; X = json.load(open(W + '/eng/data.json'))['exit']
def lufs_gain(x, target):
    r = subprocess.run([FF, '-hide_banner', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'],
                       input=x.astype(np.float32).tobytes(), capture_output=True)
    I = float([l for l in r.stderr.decode().splitlines() if l.strip().startswith('I:')][-1].split()[1]); return 10 ** ((target - I) / 20), I
vo, _ = sf.read(W + '/vo_edit.wav', always_2d=True); vo = np.repeat(vo[:, :1], 2, 1)
V = np.zeros((N, 2)); V[:min(N, len(vo))] = vo[:N]
g, I = lufs_gain(V[:int(34.1 * SR)], -16.5); V *= g
mu, _ = sf.read(W + '/music_bed.wav', always_2d=True); M = np.zeros((N, 2)); M[:min(N, len(mu))] = mu[:N]
g, _ = lufs_gain(M, -22.5); M *= g
# duck the bed under the voice: 7 dB down while she speaks, 60 ms in, 350 ms out
env = uniform_filter1d(np.abs(V[:, 0]), int(.03 * SR)); act = (env > 10 ** (-42 / 20)).astype(float)
att, rel = int(.06 * SR), int(.35 * SR); a = np.zeros(N); lvl = 0.0
step = 480
for i in range(0, N, step):
    tgt = act[i:i + step].max(); lvl += (tgt - lvl) * (step / att if tgt > lvl else step / rel); lvl = min(1, max(0, lvl)); a[i:i + step] = lvl
duck = 10 ** (-7 * a / 20)
M *= duck[:, None]
# the end card: the bed comes up as the card flips
up = np.clip((np.arange(N) / SR - X['shrink']) / .5, 0, 1); M *= (1 + .5 * up)[:, None]
HIT = {"pop_in": .167, "sparkle": .008, "whoosh": .27, "swipe_out": .076, "tick": .005, "logo_chime": .029}
cache = {}
def load(name, pitch=1.0):
    k = (name, pitch)
    if k not in cache:
        y, _ = sf.read(f'{S}/v8/sfx/{name}.wav', always_2d=True)
        if pitch != 1.0: idx = np.arange(0, len(y) - 1, pitch); y = np.stack([np.interp(idx, np.arange(len(y)), y[:, c]) for c in range(2)], 1)
        cache[k] = y
    return cache[k]
def ticks(p0, top, span, dur, gap=.055):
    out, last, prev = [], -1, None
    for i in range(int(dur * 1000) + 200):
        t = p0 + i / 1000; q = min(1, (t - p0) / dur); v = top - span * (1 - (1 - q) ** 3); tens = math.floor(v / 10)
        if prev is not None and tens != prev and t - last >= gap: out.append(t); last = t
        prev = tens
    return out
# Elegance over decoration: eleven soft cues on the moments that matter, nothing on every pop-in,
# no counting ticks, no swishes on lines. The bus is warmed (high-cut) and given a little room.
EV = [                                                # three, and quiet: the first DM, the card turning, the wordmark
  (.05, 'pop_in', -27, 1.08),
  (X['flip'] + .22, 'whoosh', -24, .85),
  (X['letters'] + .02, 'logo_chime', -19, 1.0),
]
FX = np.zeros((N, 2))
for t, name, db, pitch in EV:
    y = load(name, pitch); st = int((t - HIT[name] / pitch) * SR); a0, c0 = max(0, st), min(N, st + len(y))
    if c0 > a0: FX[a0:c0] += y[a0 - st:c0 - st] * 10 ** (db / 20)
from scipy.signal import butter, sosfiltfilt, fftconvolve
FX = sosfiltfilt(butter(2, 7500, 'low', fs=SR, output='sos'), FX, axis=0)          # warm: no glassy top
_it = np.arange(int(1.2 * SR)) / SR; _r = np.random.default_rng(3)
_ir = np.stack([_r.normal(0, 1, len(_it)) * np.exp(-_it / .3) for _ in range(2)], 1); _ir[:int(.01 * SR)] = 0
FX = FX + np.stack([fftconvolve(FX[:, c], _ir[:, c])[:N] for c in range(2)], 1) * .012     # a little room round them
out = V + M + FX
sf.write(W + '/mix_pre.wav', out.astype(np.float32), SR, subtype='FLOAT')
r = subprocess.run([FF, '-hide_banner', '-i', W + '/mix_pre.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
j = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
subprocess.run([FF, '-loglevel', 'error', '-y', '-i', W + '/mix_pre.wav', '-af', af + ',aresample=48000', '-c:a', 'pcm_s24le', W + '/mix.wav'], check=True)
print('events', len(EV), '| voice was', round(I, 1), 'LUFS | mix in', j['input_i'], 'LUFS', j['input_tp'], 'dBTP')
