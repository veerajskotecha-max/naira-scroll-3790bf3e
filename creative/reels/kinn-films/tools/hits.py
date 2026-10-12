"""Drum hits of a song by band: kick (40-120 Hz), snare/clap (180-1800 Hz, broadband), hats (6-14 kHz). Spectral-flux onsets, peak-picked,
each reported with its strength and its place on the felt-beat grid (beat index). Usage: hits.py <ffmpeg> <wav> <k0> <beat> <t0> <t1> [out.json]"""
import sys, subprocess, json
sys.path.append('/root/.local/lib/python3.11/site-packages')
import numpy as np
ff, wav, k0, beat, t0, t1 = sys.argv[1], sys.argv[2], *map(float, sys.argv[3:7])
x = np.frombuffer(subprocess.run([ff, '-v', 'error', '-i', wav, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32); sr = 48000
n, hop = 2048, 240; w = np.hanning(n); f = np.fft.rfftfreq(n, 1 / sr)
frames = np.arange(0, len(x) - n, hop); S = np.abs(np.array([np.fft.rfft(x[i:i + n] * w) for i in frames])); tt = (frames + n / 2) / sr
bands = {'kick': (40, 120), 'snare': (180, 1800), 'hat': (6000, 14000)}
out = {}
for name, (lo, hi) in bands.items():
    m = (f >= lo) & (f < hi); e = np.log10(S[:, m].sum(axis=1) + 1e-6); fl = np.maximum(0, np.diff(e, prepend=e[0]))
    thr = np.percentile(fl, 92); pk = []
    for i in range(2, len(fl) - 2):
        if fl[i] > thr and fl[i] == fl[i - 2:i + 3].max() and t0 <= tt[i] <= t1: pk.append((round(float(tt[i]) - 0.02, 3), round(float(fl[i]), 2)))   # flux peaks ~20 ms after the attack
    out[name] = pk
grid = lambda t: (t - k0) / beat
for name, pk in out.items():
    print(f'== {name}: {len(pk)} hits')
    print('  ' + '  '.join(f'{t:6.2f}({grid(t):5.2f}){s:.1f}' for t, s in pk))
if len(sys.argv) > 7: json.dump(out, open(sys.argv[7], 'w'))
