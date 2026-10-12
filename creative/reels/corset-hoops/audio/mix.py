"""Soundtracks for the five cuts, straight from the three songs that came with the take (no SFX, no effects).

Every cut takes its song from the downbeat its edit starts on, for a whole number of bars.
Everything is brought to -14 LUFS (Instagram's playback level) with a sample-peak ceiling of -1 dBFS,
and gets a 5 ms anti-click ramp at the loop points. Ads fade out over their last 0.35 s under the shop card;
posts cut on the downbeat, so the loop lands on the beat.
"""
import json, os, numpy as np, soundfile as sf
V = os.environ.get('WORK', '.') + '/v13'
SR = 48000
from scipy.signal import lfilter

def lufs(x, sr=SR):
    """Integrated loudness, ITU-R BS.1770-4: K-weighting, 400 ms blocks at 75% overlap, -70 LUFS and -10 LU gates.
    Each cut is levelled on its own section: a song's quiet intro or loud chorus is not the whole song."""
    k = lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585], x, axis=0)
    k = lfilter([1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621], k, axis=0)
    n, hop = int(.4 * sr), int(.1 * sr)
    z = np.array([(k[i:i + n] ** 2).mean(axis=0).sum() for i in range(0, len(k) - n + 1, hop)])
    z = z[-0.691 + 10 * np.log10(z + 1e-12) > -70]
    z = z[-0.691 + 10 * np.log10(z + 1e-12) > -0.691 + 10 * np.log10(z.mean()) - 10]
    return -0.691 + 10 * np.log10(z.mean())
CUTS = {}
for v in ['ad_cover', 'ad_work', 'ad_moons', 'post_mummy', 'post_poll']:
    d = json.load(open(f'{V}/eng/data_{v}.json')); CUTS[v] = (d['song'], d['song_start'], d['dur'])
for v, (song, start, dur) in CUTS.items():
    x, sr = sf.read(f'{V}/work/song_{song}.wav', dtype='float64'); assert sr == SR
    # exactly as long as the rendered frames, or -shortest drops the last frame of the shop card
    a, n = int(round(start * SR)), int(round(round(dur * 30) / 30 * SR))
    y = x[a:a + n].copy()
    if len(y) < n: y = np.vstack([y, np.zeros((n - len(y), 2))])      # the songs run 24.217 s; 24.2 is the take
    g = 10 ** ((-14.0 - lufs(y)) / 20)
    y *= g
    pk = np.abs(y).max(); lim = 10 ** (-1 / 20)
    if pk > lim: y *= lim / pk; g *= lim / pk
    r = int(.005 * SR); ramp = np.linspace(0, 1, r)[:, None]
    y[:r] *= ramp; y[-r:] *= ramp[::-1]
    if v.startswith('ad'):
        f = int(.35 * SR); y[-f:] *= (np.cos(np.linspace(0, np.pi, f)) * .5 + .5)[:, None]
    sf.write(f'{V}/audio/{v}.wav', y.astype(np.float32), SR, subtype='FLOAT')
    print(v, f'song {song} from {start:.3f}s for {dur:.3f}s, gain {20 * np.log10(g):+.1f} dB, peak {20 * np.log10(np.abs(y).max()):.1f} dBFS')
