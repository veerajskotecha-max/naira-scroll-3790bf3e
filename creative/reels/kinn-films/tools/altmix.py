"""Mix and match: lay a different track under a finished reel. The track is time-stretched (rubberband, pitch kept) to the
reel's tempo and placed so its drop or bass return lands exactly on the reel's big cut; the bass jump is measured in the
stretched audio and the placement corrected to the sample. A track that runs out is extended by repeating its last full bar.
Then -14 LUFS / under -1 dBTP like mix.py. Usage: altmix.py <S> out_name reel song_file song_beat song_beat0 song_cue reel_cue"""
import json, os, subprocess, sys, numpy as np
S, name, reel, f, P, b0, cue_s, cue_r = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], *map(float, sys.argv[5:9])
FF = f'{S}/ffmpeg'; OUT = f'{S}/v15/out/audio'; SR = 48000
D = json.load(open(f'{S}/v15/eng/data_{reel}.json')); dur = D['frames'] / 30; tempo = P / D['beat']   # >1: speed the track up
def load(p): return np.frombuffer(subprocess.run([FF, '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2)
def save(p, a): subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_f32le', p], input=a.astype(np.float32).tobytes(), check=True)
x = load(f)
need = cue_s + (dur - cue_r) * tempo + 1.0                      # original-time end the reel needs, plus margin
while len(x) / SR < need:                                        # repeat the last full bar, 15 ms crossfade at the seam
    nb = int((len(x) / SR - b0) / P); e = int(round((b0 + nb * P) * SR)); s = int(round((b0 + (nb - 4) * P) * SR)); xf = int(.015 * SR)
    bar = x[s:e].copy(); r = np.linspace(0, 1, xf)[:, None]; bar[:xf] = bar[:xf] * r + x[e:e + xf] * (1 - r) if e + xf <= len(x) else bar[:xf] * r
    x = np.concatenate([x[:e], bar]); print(f'{name}: extended by one bar to {len(x) / SR:.2f}s')
pre = 0.6; s0 = cue_s - cue_r * tempo - pre                      # original-time start of the piece we stretch
pad = max(0, -s0); s0 = max(0, s0)
seg = x[int(s0 * SR):int((cue_s + (dur - cue_r) * tempo + .6) * SR)]
if pad: seg = np.concatenate([np.zeros((int(pad * SR), 2), np.float32), seg])
tmp_in, tmp_out = f'{OUT}/_alt_in.wav', f'{OUT}/_alt_st.wav'; save(tmp_in, seg)
subprocess.run([FF, '-v', 'error', '-y', '-i', tmp_in, '-af', f'rubberband=tempo={tempo:.6f}:pitchq=quality:transients=crisp', '-c:a', 'pcm_f32le', tmp_out], check=True)
y = load(tmp_out); exp = (cue_s - (s0 - pad)) / tempo            # where the cue should sit in the stretched audio
n, hop = 2048, 120; fr = np.fft.rfftfreq(n, 1 / SR); m = (fr >= 20) & (fr < 150); w = np.hanning(n); mono = y.mean(1)
ts = np.arange(exp - .15, exp + .15, hop / SR); L = np.array([10 * np.log10(np.sum(np.abs(np.fft.rfft(mono[int(t * SR) - n // 2:int(t * SR) + n // 2] * w))[m] ** 2) + 1e-9) for t in ts])
got = ts[int(np.argmax(np.diff(L, prepend=L[0])))]; a = got - cue_r
z = y[int(round(a * SR)):int(round(a * SR)) + int(round(dur * SR))]
print(f'{name}: {os.path.basename(f)} tempo x{tempo:.4f}, cue expected {exp:.3f}s found {got:.3f}s (latency {1000 * (got - exp):+.0f} ms), starts at track {s0 - pad + a * tempo:.3f}s')
save(tmp_in, z)
ns = int(round(dur * SR)); pre_f = f'atrim=end_sample={ns},afade=t=in:d=0.006,afade=t=out:st={dur - .045:.4f}:d=0.045'
v = subprocess.run([FF, '-hide_banner', '-nostdin', '-i', tmp_in, '-af', pre_f + ',ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
sm = v[v.rindex('Summary:'):]; I0 = float(sm.split('I:')[1].split('LUFS')[0]); P0 = float(sm.split('Peak:')[1].split('dBFS')[0]); g = -14 - I0
lim = ',alimiter=limit=0.7943:attack=1:release=60:level=false:latency=1' if P0 + g > -2 else ''
subprocess.run([FF, '-v', 'error', '-y', '-i', tmp_in, '-af', f'{pre_f},volume={g:.3f}dB{lim},apad,atrim=end_sample={ns}', '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s16le', f'{OUT}/{name}.wav'], check=True)
os.remove(tmp_in); os.remove(tmp_out)
v = subprocess.run([FF, '-hide_banner', '-nostdin', '-i', f'{OUT}/{name}.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
sm = v[v.rindex('Summary:'):]; print(f'{name}: {sm.split("I:")[1].split("LUFS")[0].strip()} LUFS, true peak {sm.split("Peak:")[1].split("dBFS")[0].strip()} dBFS, {dur:.3f}s')
