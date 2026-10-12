"""Beat grids for the three songs -> songs.json.

librosa tracks the beats, then a straight line is fitted through them (the songs hold a constant tempo, so
a fitted grid is steadier than the tracked beats). The downbeat phase is the one of the four whose beats
carry the most onset strength plus kick (30-160 Hz) energy. Every cut lands on `downbeats` or `grid`."""
import numpy as np, librosa, json, os
W = os.environ.get('WORK', '.') + '/v13/work'
out = {}
for x in 'abc':
    y, sr = librosa.load(f'{W}/song_{x}.wav', sr=22050, mono=True); hop = 256
    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop); ot = librosa.times_like(oenv, sr=sr, hop_length=hop)
    tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop, units='time')
    beats = np.round(beats, 3)                     # the grids the cuts were timed to were fitted on ms-rounded beats
    on = librosa.onset.onset_detect(onset_envelope=oenv, sr=sr, hop_length=hop, units='time', backtrack=False)
    top = sorted(zip(np.interp(on, ot, oenv), on), reverse=True)[:12]
    loud = [round(float(20 * np.log10(np.sqrt(np.mean(y[int(i * sr):int((i + 1) * sr)] ** 2)) + 1e-9)), 1) for i in range(int(len(y) / sr))]
    n = np.arange(len(beats)); per, off = np.linalg.lstsq(np.vstack([n, np.ones_like(n)]).T, beats, rcond=None)[0]
    S_ = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)); fr = librosa.fft_frequencies(sr=sr, n_fft=2048)
    low = S_[(fr > 30) & (fr < 160)].sum(0); lt = librosa.times_like(low, sr=sr, hop_length=hop)
    grid = off + per * np.arange(-2, int(24.2 / per) + 3); grid = grid[(grid >= 0) & (grid < 24.2)]
    score = [np.mean([np.interp(t, ot, oenv) + .5 * np.interp(t, lt, low / low.max() * oenv.max()) for t in grid[ph::4]]) for ph in range(4)]
    downbeats = grid[int(np.argmax(score))::4]
    out[x] = dict(tempo=float(np.atleast_1d(tempo)[0]), beats=[round(float(b), 3) for b in beats], accents=sorted(round(float(t), 3) for _, t in top), loud=loud,
                  period=float(per), offset=float(off), grid=[round(float(g), 4) for g in grid], downbeats=[round(float(d), 4) for d in downbeats])
    print(f'song {x}: {60 / per:.1f} BPM, downbeats {np.round(downbeats, 3).tolist()}')
json.dump(out, open(f'{W}/songs.json', 'w'))
