"""Audio report for an ad: momentary loudness (400 ms, K-weighted) of voice / bed / fx / mix every 0.5 s, voice-over-bed
through a phone band (280-9000 Hz) while she speaks, and the master's integrated loudness and true peak.
Usage: python3.13 -I areport.py <S> <ad> <mode> [checks: t0-t1:label ...]"""
import sys, math, subprocess
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np, soundfile as sf
from scipy.signal import lfilter, butter, sosfilt
S, AD, MODE = sys.argv[1:4]; SR = 48000
def kw(x): return lfilter([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621], lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585], x, axis=0), axis=0)
d = f'{S}/ads/{AD}'
st = {'voice': sf.read(f'{d}/stem_voice.wav')[0], 'bed': sf.read(f'{d}/stem_bed_{MODE}.wav')[0], 'fx': sf.read(f'{d}/stem_fx_{MODE}.wav')[0],
      'mix': sf.read(f'{d}/mix_{MODE}.wav')[0]}
K = {n: kw(x) for n, x in st.items()}
def mom(n, t, w=.4):
    i0, i1 = int(max(0, t - w / 2) * SR), int((t + w / 2) * SR); y = K[n][i0:i1]
    return -.691 + 10 * math.log10((y ** 2).mean(0).sum() + 1e-15)
N = len(st['mix']); dur = N / SR
print(f'{AD} {MODE}: {dur:.2f} s'); print('  t     voice    bed     fx    mix')
t = .25
while t < dur:
    print(f'{t:5.2f} ' + ' '.join(f'{mom(n, t):6.1f}' for n in ('voice', 'bed', 'fx', 'mix'))); t += .5
sos = butter(4, [280, 9000], 'band', fs=SR, output='sos')
v = sosfilt(sos, st['voice'][:, 0]); b = sosfilt(sos, st['bed'][:, 0])
w = int(.4 * SR); ev = np.convolve(v ** 2, np.ones(w) / w, 'same'); eb = np.convolve(b ** 2, np.ones(w) / w, 'same')
act = ev > np.percentile(ev, 60)
print(f'phone band, while a voice speaks: voice over bed median {np.median(10 * np.log10(ev[act] / (eb[act] + 1e-12))):.1f} dB, '
      f'10th pct {np.percentile(10 * np.log10(ev[act] / (eb[act] + 1e-12)), 10):.1f} dB')
for c in sys.argv[4:]:
    rng, lab = c.split(':', 1); a, b_ = map(float, rng.split('-')); i0, i1 = int(a * SR), int(b_ * SR)
    pk = 20 * math.log10(np.abs(st['bed'][i0:i1]).max() + 1e-12); pm = 20 * math.log10(np.abs(st['mix'][i0:i1]).max() + 1e-12)
    print(f'check {lab} {a}-{b_}: bed peak {pk:.1f} dBFS, mix peak {pm:.1f} dBFS')
m = f'{d}/master_{MODE}.wav'
r = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-i', m, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = [l for l in r.splitlines() if l.strip().startswith('I:')][-1].strip(); P = [l for l in r.splitlines() if l.strip().startswith('Peak:')][-1].strip()
print(f'master: {I}, true {P}')
