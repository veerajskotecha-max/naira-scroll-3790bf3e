"""Cut each reel's stretch of its song and master it for Instagram: -14 LUFS integrated, under -1 dBTP, exactly frames/30 long.
A straight gain to -14 LUFS, then a lookahead limiter (latency compensated) only where that gain would push peaks past -2 dBFS.
Usage: mix.py <S> name:file:start:dur ...   (or reel names, read from eng/data_<reel>.json)"""
import json, os, subprocess, sys
S = sys.argv[1]; FF = f'{S}/ffmpeg'; OUT = f'{S}/v15/out/audio'
def meas(p):
    v = subprocess.run([FF, '-hide_banner', '-nostdin', '-i', p, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = v[v.rindex('Summary:'):]; I = float(s.split('I:')[1].split('LUFS')[0]); P = float(s.split('Peak:')[1].split('dBFS')[0]); return I, P
def nsamp(p):
    v = subprocess.run([FF, '-hide_banner', '-nostdin', '-i', p, '-af', 'astats=measure_overall=Number_of_samples:measure_perchannel=none', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return int(float(v.split('Number of samples:')[1].split('\n')[0]))
jobs = []
for a in sys.argv[2:]:
    if ':' in a: n, f, st, du = a.split(':'); jobs.append((n, f, float(st), float(du)))
    else: D = json.load(open(f'{S}/v15/eng/data_{a}.json')); jobs.append((a, D['audio']['file'], D['audio']['start'], D['frames'] / 30))
for n, f, st, du in jobs:
    ns = round(du * 48000); tmp = f'{OUT}/_{n}.wav'; out = f'{OUT}/{n}.wav'
    subprocess.run([FF, '-hide_banner', '-nostdin', '-y', '-v', 'error', '-ss', f'{st:.4f}', '-t', f'{du + .5:.4f}', '-i', f, '-af',
                    f'aresample=48000,atrim=end_sample={ns},asetpts=N/SR/TB,afade=t=in:d=0.006,afade=t=out:st={du - .045:.4f}:d=0.045',
                    '-ac', '2', '-c:a', 'pcm_f32le', tmp], check=True)
    I0, P0 = meas(tmp); g = -14.0 - I0
    lim = f',alimiter=limit=0.7943:attack=1:release=60:level=false:latency=1' if P0 + g > -2.0 else ''
    subprocess.run([FF, '-hide_banner', '-nostdin', '-y', '-v', 'error', '-i', tmp, '-af', f'volume={g:.3f}dB{lim},apad,atrim=end_sample={ns}',
                    '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
    os.remove(tmp); I, P = meas(out); k = nsamp(out)
    print(f'{n:10s} from {st:7.3f}s {du:6.3f}s | in {I0:6.1f} LUFS peak {P0:5.1f} | gain {g:+5.1f}{" +limiter" if lim else "         "} | out {I:6.1f} LUFS true peak {P:5.1f} dBFS | {k} samples ({k / 48000:.3f}s, want {ns})')
