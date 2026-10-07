"""Voiceover for the Halo / Baroque ad: cleaned, cut to phrases with the dead air out, sped 6%,
and a word map on the output timeline for captions and graphic cues."""
import json, subprocess, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
S = __import__('os').environ.get('WORK', '.')
W = S + '/v12'; FF = S + '/ffmpeg'; SR = 48000; TEMPO = 1.06
# 1) clean: rumble out, hiss tracked out, mud down, presence and air up, sibilance tamed, levelled
chain = ("highpass=f=75,afftdn=nr=14:nf=-48:tn=1,equalizer=f=280:t=q:w=1.1:g=-2.5,"
         "equalizer=f=3300:t=q:w=1.2:g=2.5,highshelf=f=10500:g=2.5,deesser=i=0.35:m=0.5:f=0.55,"
         "acompressor=threshold=-26dB:ratio=3:attack=6:release=90:makeup=4,alimiter=limit=0.89")
subprocess.run([FF, '-loglevel', 'error', '-y', '-i', W + '/vo_raw48.wav', '-af', chain, '-ar', '48000', '-c:a', 'pcm_f32le', W + '/vo_clean.wav'], check=True)
y, sr = sf.read(W + '/vo_clean.wav'); assert sr == SR
# 2) phrases (source seconds) and the gap after each, in output seconds before the tempo change
SEG = [(0.00, 3.00, .16), (3.40, 9.26, .22), (9.74, 14.00, .12), (14.36, 17.48, .34), (18.05, 19.32, .18),
       (19.70, 24.18, .22), (24.88, 30.05, .28), (33.47, 37.62, .26), (37.92, 40.06, .30), (40.48, 41.00, 0)]   # the tails of 'well.' and 'from' and the onset of 'So' were clipped
tone = y[int(30.2 * SR):int(30.8 * SR)] * .6                               # her room, for the gaps
out, cur, mapping = [], 0.0, []
fade = int(.012 * SR)
for a, b, gap in SEG:
    seg = y[int(a * SR):int(b * SR)].copy(); seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    mapping.append(dict(src=[a, b], out=[cur, cur + (b - a)])); out.append(seg); cur += b - a
    if gap:
        g = np.resize(tone, int(gap * SR)); g[:fade] *= np.linspace(0, 1, fade); g[-fade:] *= np.linspace(1, 0, fade); out.append(g); cur += gap
v = np.concatenate(out)
sf.write(W + '/vo_cut.wav', v.astype(np.float32), SR, subtype='FLOAT')
subprocess.run([FF, '-loglevel', 'error', '-y', '-i', W + '/vo_cut.wav', '-af', f'atempo={TEMPO}', '-c:a', 'pcm_f32le', W + '/vo_edit.wav'], check=True)
for m in mapping: m['out'] = [round(m['out'][0] / TEMPO, 4), round(m['out'][1] / TEMPO, 4)]
# 3) words, from the raw take, mapped onto the output timeline
mdl = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = mdl.transcribe(W + '/voice16.wav', word_timestamps=True)
words = []
for s in segs:
    for w in s.words:
        for m in mapping:
            a, b = m['src']
            if a - .4 <= w.start < b and w.end > a + .02:      # whisper starts some words early; the audio has them
                o = m['out'][0] + max(0, w.start - a) / TEMPO; oe = m['out'][0] + (min(w.end, b) - a) / TEMPO
                words.append(dict(w=w.word.strip(), t=round(o, 3), e=round(oe, 3))); break
json.dump(dict(tempo=TEMPO, segments=mapping, words=words, dur=round(len(v) / SR / TEMPO, 3)), open(W + '/timeline.json', 'w'), indent=1)
print('vo out', round(len(v) / SR / TEMPO, 2), 's;', len(words), 'words')
for m in mapping: print(m)
print(' '.join(f"{w['w']}@{w['t']:.2f}" for w in words))
