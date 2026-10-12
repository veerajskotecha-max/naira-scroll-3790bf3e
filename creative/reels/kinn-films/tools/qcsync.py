"""Where each cut lands, measured in the final file: the picture cut (the frame where the image changes most, within a frame of
the edit's cut) and the nearest musical hit (the strongest rise in low-mid energy within +-80 ms). Usage: qcsync.py <S> <reel> ..."""
import json, subprocess, sys
sys.path.append('/root/.local/lib/python3.11/site-packages')
import numpy as np
S = sys.argv[1]; FF = f'{S}/ffmpeg'; O = f'{S}/v15/out'
for name in sys.argv[2:]:
    D = json.load(open(f'{S}/v15/eng/data_{name}.json')); p = f'{O}/final/{name}.mp4'
    raw = subprocess.run([FF, '-v', 'error', '-nostdin', '-i', p, '-map', '0:a', '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32); sr = 48000
    v = subprocess.run([FF, '-v', 'error', '-nostdin', '-i', p, '-vf', 'scale=108:192,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    fr = np.frombuffer(v, np.uint8).reshape(-1, 192, 108).astype(np.float32); dif = np.r_[0, np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))]
    n, hop = 1024, 120; f = np.fft.rfftfreq(n, 1 / sr); m = (f >= 30) & (f < 400); w = np.hanning(n)
    def flux(t0, t1):
        ts = np.arange(t0, t1, hop / sr); e = []
        for t in ts:
            c = int(t * sr); seg = x[max(0, c - n // 2):c + n // 2]
            e.append(np.log10(np.sum(np.abs(np.fft.rfft(np.pad(seg, (0, n - len(seg))) * w))[m] ** 2) + 1e-9))
        e = np.array(e); return ts, np.maximum(0, np.diff(e, prepend=e[0]))
    cuts = sorted({round(s['t0'] * 30) for s in D['shots'] if s['t0'] > 0 and not s['id'].startswith('c')})
    pic, aud = [], []
    for k in cuts:
        lo, hi = max(1, k - 1), min(len(dif) - 1, k + 1); j = lo + int(np.argmax(dif[lo:hi + 1])); pic.append(j - k)
        t = k / 30; ts, fl = flux(t - .08, t + .08); aud.append((ts[int(np.argmax(fl))] - t) * 1000)
    aud = np.array(aud)
    print(f'{name:10s} {len(cuts)} cuts | picture cut on the edit frame: {sum(1 for d in pic if d == 0)}/{len(pic)} (off by {sorted(set(pic))}) | '
          f'nearest hit: median {np.median(aud):+.0f} ms, 80% within {np.percentile(np.abs(aud), 80):.0f} ms, worst {aud[np.argmax(np.abs(aud))]:+.0f} ms')
