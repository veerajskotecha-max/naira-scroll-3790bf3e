"""Soundtracks for the five cuts, straight from the three songs that came with the take (no SFX, no effects).

Posts run the whole 24.2 s song from 0, as uploaded; the ads cut their song on the bar the edit starts on.
Everything is brought to -14 LUFS (Instagram's playback level) with a sample-peak ceiling of -1 dBFS,
and gets a 5 ms anti-click ramp at the loop points; ads fade out over their last 0.35 s into the loop.
"""
import json, os, numpy as np, soundfile as sf
V = os.environ.get('WORK', '.') + '/v13'
SR = 48000
# integrated loudness of each upload, measured with ffmpeg ebur128 (LUFS)
LUFS = {'a': -14.0, 'b': -15.3, 'c': -16.5}
CUTS = {}
for v in ['post1', 'post2', 'post3', 'ad1', 'ad2']:
    d = json.load(open(f'{V}/eng/data_{v}.json')); CUTS[v] = (d['song'], d['song_start'], d['dur'])
for v, (song, start, dur) in CUTS.items():
    x, sr = sf.read(f'{V}/work/song_{song}.wav', dtype='float64'); assert sr == SR
    # exactly as long as the rendered frames, or -shortest drops the last frame of the shop card
    a, n = int(round(start * SR)), int(round(round(dur * 30) / 30 * SR))
    y = x[a:a + n].copy()
    if len(y) < n: y = np.vstack([y, np.zeros((n - len(y), 2))])      # the songs run 24.217 s; 24.2 is the take
    g = 10 ** ((-14.0 - LUFS[song]) / 20)
    y *= g
    pk = np.abs(y).max(); lim = 10 ** (-1 / 20)
    if pk > lim: y *= lim / pk; g *= lim / pk
    r = int(.005 * SR); ramp = np.linspace(0, 1, r)[:, None]
    y[:r] *= ramp; y[-r:] *= ramp[::-1]
    if v.startswith('ad'):
        f = int(.35 * SR); y[-f:] *= (np.cos(np.linspace(0, np.pi, f)) * .5 + .5)[:, None]
    sf.write(f'{V}/audio/{v}.wav', y.astype(np.float32), SR, subtype='FLOAT')
    print(v, f'song {song} from {start:.3f}s for {dur:.3f}s, gain {20 * np.log10(g):+.1f} dB, peak {20 * np.log10(np.abs(y).max()):.1f} dBFS')
