"""short-term loudness of each stem over time (3 s window is too slow for ads; this uses 400 ms momentary blocks)
python3.13 -I levels.py <S> <ad> [step]"""
import sys, math
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np, soundfile as sf
from scipy.signal import lfilter
S, AD = sys.argv[1], sys.argv[2]; step = float(sys.argv[3]) if len(sys.argv) > 3 else .5
def kw(x): return lfilter([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621], lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585], x, axis=0), axis=0)
st = {n: sf.read(f'{S}/ads/{AD}/{n}.wav')[0] for n in ('stem_voice', 'stem_bed', 'stem_fx', 'mix')}
k = {n: kw(x) for n, x in st.items()}; SR = 48000
print(' t     voice   bed    fx     mix    mixpeak')
t = 0.0
while t < len(st['mix']) / SR - .2:
    a, b = int(t * SR), int((t + .4) * SR); row = []
    for n in ('stem_voice', 'stem_bed', 'stem_fx', 'mix'):
        ms = np.mean(k[n][a:b] ** 2, 0).sum(); row.append(-.691 + 10 * math.log10(ms + 1e-12))
    pk = 20 * math.log10(np.max(np.abs(st['mix'][a:b])) + 1e-9)
    print(f'{t:5.1f}  ' + '  '.join(f'{v:6.1f}' for v in row) + f'  {pk:6.1f}'); t += step
