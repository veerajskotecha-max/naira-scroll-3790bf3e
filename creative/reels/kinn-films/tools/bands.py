"""Per-beat energy of a song in three bands (sub <120 Hz, mid, air >5 kHz), on a given beat grid, to read its sections.
Usage: bands.py <ffmpeg> <wav> <k0> <beat> [sub-beats per row]"""
import sys, subprocess
sys.path.append('/root/.local/lib/python3.11/site-packages')
import numpy as np
ff, wav, k0, beat = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]); sub = int(sys.argv[5]) if len(sys.argv) > 5 else 1
raw = subprocess.run([ff, '-v', 'error', '-i', wav, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, np.float32); sr = 48000; dur = len(x) / sr
def band(lo, hi, a, b):
    seg = x[int(a * sr):int(b * sr)]
    if len(seg) < 256: return 0.0
    F = np.fft.rfft(seg * np.hanning(len(seg))); f = np.fft.rfftfreq(len(seg), 1 / sr)
    m = (f >= lo) & (f < hi); return float(np.sqrt(np.mean(np.abs(F[m]) ** 2)) / np.sqrt(len(seg)))
st = beat / sub; k = int(np.floor(-k0 / st))
rows = []
while True:
    a = k0 + k * st; b = a + st
    if a >= dur: break
    if b > 0:
        a2, b2 = max(a, 0), min(b, dur)
        rows.append((k, a, band(20, 120, a2, b2), band(120, 5000, a2, b2), band(5000, 16000, a2, b2), float(np.sqrt(np.mean(x[int(a2 * sr):int(b2 * sr)] ** 2)))))
    k += 1
mx = [max(r[i] for r in rows) for i in (2, 3, 4, 5)]
for k, a, s, m, h, r in rows:
    bar = lambda v, M: '#' * int(round(24 * v / M))
    print(f'{k / sub:7.2f} {a:7.3f}  sub {bar(s, mx[0]):24s} mid {bar(m, mx[1]):24s} air {bar(h, mx[2]):24s} rms {20 * np.log10(r + 1e-9):6.1f}')
