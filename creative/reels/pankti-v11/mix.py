"""Pankti v11 mix: her track as the bed (from the raw's first beat), the SFX kit
placed on the motion's hits, pitch-varied where a run of the same sound would
otherwise machine-gun, then two-pass loudnorm to -14 LUFS / -1.5 dBTP."""
import json, os, subprocess, numpy as np, soundfile as sf
S = os.path.dirname(os.path.abspath(__file__))
FF, SR, DUR = os.environ.get('FFMPEG', os.path.join(S, 'ffmpeg')), 48000, 19.6
os.chdir(S)
B = 0.36584; b = lambda k: k * B      # fitted from her track: 164.01 BPM
bc = lambda k: round(k * B * 30) / 30  # a cut, on the plate's frame grid
T1, T2 = bc(7) + .06, bc(13) + .2      # the two tags land (engine/data.py)
import math
def price_ticks(p0, span=260, top=2598, dur=1.0, gap=.055):
    # the countdown's tens wheel, heard only once it is slow enough to be separate clicks
    out, last, prev = [], -1, None
    for i in range(0, 1200):
        t = p0 + .12 + i / 1000; q = min(1, (t - p0 - .12) / dur); v = top - span * (1 - (1 - q) ** 3)
        tens = math.floor(v / 10)
        if prev is not None and tens != prev and t - last >= gap: out.append(t); last = t
        prev = tens
    return out
subprocess.run([FF, '-loglevel', 'error', '-y', '-ss', '0.3855', '-t', str(DUR + .1), '-i', os.path.join(S, 'pankti_raw.mp4'), '-vn', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_f32le', 'bed.wav'], check=True)
bed, _ = sf.read('bed.wav', always_2d=True); n = int(DUR * SR); out = np.zeros((n, 2)); out[:min(n, len(bed))] = bed[:n]
f0 = int(18.7 * SR); out[f0:] *= (np.cos(np.linspace(0, np.pi / 2, n - f0)) ** 2)[:, None]
HIT = {"pop_in": .167, "sparkle": .008, "whoosh": .27, "swipe_out": .076, "tick": .005, "logo_chime": .029}
cache = {}
def load(name, pitch=1.0):
    k = (name, pitch)
    if k not in cache:
        y, _ = sf.read(os.path.join(S, 'sfx', name + '.wav'), always_2d=True)
        if pitch != 1.0:                      # resample = pitch + speed together, fine for short hits
            idx = np.arange(0, len(y) - 1, pitch); y = np.stack([np.interp(idx, np.arange(len(y)), y[:, c]) for c in range(2)], 1)
        cache[k] = y
    return cache[k]
EV = [
  (b(1) + .17, 'sparkle', -12, 1.0), (b(3) + .17, 'sparkle', -14, 1.1),               # hook glints
  (b(6) + .05, 'sparkle', -6, 1.0), (b(6) + .09, 'sparkle', -12, 1.5),                 # "shine." burst
  (T1 + .12, 'pop_in', -9, 1.0), (T1 + .31, 'tick', -13, 1.1),                          # huggies tag lands, thread knots
  (b(10) + .10, 'whoosh', -17, 1.4),                                                    # "satin," brushed swish
  (b(11) + .04, 'sparkle', -10, 1.6), (b(12) + .04, 'swipe_out', -8, 1.1),              # mirror ting, slash on the beat
  (T2 + .12, 'pop_in', -9, .92), (T2 + .31, 'tick', -13, 1.0),                          # toggle tag lands, thread knots
  (b(17) + .17, 'sparkle', -12, 1.0), (b(18.5) + .125, 'sparkle', -14, 1.15),          # chain glints
  (b(23) + .2, 'whoosh', -13, 1.15),                                                    # the comet draws the dial
  (b(26) + .35, 'sparkle', -16, 1.3), (b(28) + .35, 'sparkle', -17, 1.45),            # glints on the toggle
  (b(27) + .3, 'swipe_out', -17, 1.25),                                                # "turn." turns
] + [(b(k), 'tick', -14, 1.0 + .03 * (k - 24)) for k in range(24, 30)] + [             # the dial clicks as the comet lands
  (b(31) + .12, 'whoosh', -8, 1.0),                                                     # split panels land
  (b(32) + .22, 'sparkle', -12, 1.0), (b(32) + .30, 'sparkle', -14, 1.25),             # callout circles
] + [(b(33.5) + i * B / 2, 'tick', -12, 1.0 + .07 * i) for i in range(7)] + [          # weekday streak, rising
  (b(40) + .15, 'whoosh', -9, .9),                                                      # card shrinks
  (b(41) + .22, 'whoosh', -6, 1.0), (b(41) + .5, 'tick', -10, .55),                    # flip + card flap
  (b(42.5) + .2, 'whoosh', -15, 1.2),                                                   # card grows
  (b(44) + .1, 'sparkle', -11, 1.0),                                                    # flower flies
  (b(45) + .02, 'logo_chime', -3, 1.0),                                                 # letters bloom out
  (b(46) + .12, 'pop_in', -7, 1.0), (b(46.5) + .12, 'pop_in', -8, 1.12),               # products
] + [(t, 'tick', -18, 1.45 - .02 * k) for k, t in enumerate(price_ticks(b(47)))] + [   # the price counting down
  (b(47) + 1.0, 'sparkle', -12, 1.1), (b(48) + .2, 'swipe_out', -15, 1.0),            # price lands, underline
]
for t, name, db, pitch in EV:
    y = load(name, pitch); st = int((t - HIT[name] / pitch) * SR); a, c = max(0, st), min(n, st + len(y))
    out[a:c] += y[a - st:c - st] * 10 ** (db / 20)
sf.write('mix_pre.wav', out.astype(np.float32), SR, subtype='FLOAT')
r = subprocess.run([FF, '-hide_banner', '-i', 'mix_pre.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
j = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
subprocess.run([FF, '-loglevel', 'error', '-y', '-i', 'mix_pre.wav', '-af', af + ',aresample=48000', '-c:a', 'pcm_s24le', 'mix.wav'], check=True)
print('events', len(EV), 'in', j['input_i'], 'LUFS')
