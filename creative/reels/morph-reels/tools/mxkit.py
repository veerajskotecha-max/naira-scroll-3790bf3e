"""mxkit.py: everything around the plate for the morph-edit reels: brand type, the logo end frame, the offer slot,
the sound (a beatless pad, sub-only whooshes, felt taps, the drawer slide, a creator's own voice), mastering,
encoding (9:16 and the 4:5 feed crop) and QC sheets.

Brand rules baked in:
- Type is one line of Jost tracked caps (ivory with a soft ink shadow) or a Cormorant price, only on holds.
- The logo is sage NAIRA with the blush flower as the I (kinn-films/img/logo_sage.svg, rendered to assets/logo_2708.png).
- The offer lives in ONE slot (OFFER below); re-read Shopify on render day and change it here only.
- Sound: no bells, dings, chimes, ticks or shimmer. One dry sound per kind of transformation, at most three kinds.
"""
import os, sys, json, math, subprocess
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy.signal import butter, sosfilt, fftconvolve, lfilter, resample_poly
import soundfile as sf

S = '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad'
FONTS = f'{S}/fonts'
LOGO = f'{S}/mx/assets/logo_2708.png'
IVORY, INK, SAGE, DEEP, BLUSH = (251, 243, 236), (26, 22, 20), (153, 180, 175), (80, 114, 106), (255, 189, 168)

# ---- the ONE offer slot (live Shopify, 12 Nov 2026: BUY2 10%, BUY3 20%, BUY4 30%, applied in the bag) ----
OFFER = {'rungs': [(2, 10), (3, 20), (4, 30)],
         'prices': {'woven-gold-hoops': (1049, 1499), 'brushed-gold-huggies': (699, 879), 'toggle-link-chain': (999, 1429),
                    'cushion-halo-ring': (999, 1429), 'prism-riviere-bracelet': (2399, 3999), 'halo-curve-ring': (899, 1289)}}


def rs(n):
    s = f'{int(n):,}'
    # Indian grouping: 1,23,456
    if n >= 100000:
        a = f'{int(n):d}'; s = a[:-3]; s = ','.join([s[max(0, i - 2):i] for i in range(len(s), 0, -2)][::-1]) + ',' + a[-3:]
    return '₹' + s


def bag_total(handles):
    sub = sum(OFFER['prices'][h][0] for h in handles); n = len(handles); rate = 0
    for q, p in OFFER['rungs']:
        if n >= q: rate = p
    return sub, int(round(sub * (1 - rate / 100))), rate


# ---------------- type ----------------
def _font(kind, size, weight=None):
    f = {'jost': 'Jost.ttf', 'cg': 'CG.ttf', 'cgi': 'CG-Italic.ttf'}[kind]
    ft = ImageFont.truetype(f'{FONTS}/{f}', size)
    if weight: ft.set_variation_by_axes([weight])
    return ft


def text(s, kind='jost', size=30, weight=500, track=.24, color=IVORY, shadow=.38, shadow_r=10, pad=40, halo=None):
    """an RGBA uint8 picture of one line. Jost caps are tracked (track em); Cormorant is set as is.
    shadow: opacity of a soft halo under the letters (ink under light type, ivory under ink type, or `halo`), so the
    line reads on footage without a box"""
    ft = _font(kind, size, weight)
    if track:
        widths = [ft.getlength(c) for c in s]; tw = sum(widths) + track * size * (len(s) - 1)
    else: tw = ft.getlength(s)
    asc, desc = ft.getmetrics()
    W, H = int(math.ceil(tw)) + 2 * pad, asc + desc + 2 * pad
    lay = Image.new('L', (W, H), 0); d = ImageDraw.Draw(lay)
    if track:
        x = pad
        for c, w in zip(s, widths): d.text((x, pad), c, font=ft, fill=255); x += w + track * size
    else: d.text((pad, pad), s, font=ft, fill=255)
    a = np.asarray(lay, np.float32) / 255
    sa = np.zeros_like(a)
    if shadow > 0:
        sa = np.roll(np.asarray(lay.filter(ImageFilter.GaussianBlur(shadow_r)), np.float32) / 255, 2, axis=0)
        sa = np.clip(sa * 1.6, 0, 1) * shadow
    out = np.zeros((H, W, 4), np.float32)
    oa = a + sa * (1 - a)
    col, ink = np.array(color, np.float32) / 255, np.array(halo or (INK if sum(color) > 380 else IVORY), np.float32) / 255
    out[..., :3] = (col * a[..., None] + ink * (sa * (1 - a))[..., None]) / np.maximum(oa, 1e-6)[..., None]
    out[..., 3] = oa
    return (np.clip(out, 0, 1) * 255 + .5).astype(np.uint8), pad, int(math.ceil(tw))


def stack(lines, gap=14, align='center'):
    """several text() pictures one above the other (each line is (img, pad, width)); returns (img, pad)"""
    ims = [l[0] for l in lines]; pad = lines[0][1]
    W = max(i.shape[1] for i in ims); H = sum(i.shape[0] - 2 * l[1] for i, l in zip(ims, lines)) + gap * (len(ims) - 1) + 2 * pad
    out = np.zeros((H, W, 4), np.float32); y = 0
    for (im, p, w) in lines:
        h = im.shape[0]; x = (W - im.shape[1]) // 2 if align == 'center' else 0
        f = im.astype(np.float32) / 255; reg = out[y:y + h, x:x + im.shape[1]]
        a = f[..., 3:4]; reg[..., :3] = f[..., :3] * a + reg[..., :3] * (1 - a); reg[..., 3:4] = a + reg[..., 3:4] * (1 - a)
        y += h - 2 * p + gap
    return (out * 255 + .5).astype(np.uint8), pad


def place(P, img_pad, cx, y_top, t0, t1, **kw):
    """lay a text picture centred on cx with its letters' top at y_top (px)"""
    img, pad = img_pad[0], img_pad[1]
    return P.overlay(img, cx - img.shape[1] / 2, y_top - pad, t0, t1, **kw)


def super_line(P, s, t0, t1, y=300, size=30, cx=540, color=IVORY, shadow=.38, **kw):
    """the one super of a hold: Jost tracked caps, ivory on dark footage, INK on light (wood, wall, ivory)"""
    return place(P, text(s, 'jost', size, 500, .24, color=color, shadow=shadow), cx, y, t0, t1, **kw)


def price_line(P, name, price, mrp, t0, t1, y=300, cx=540, color=IVORY, shadow=.38, **kw):
    """PIECE NAME in caps over a Cormorant price with the MRP struck through"""
    dim = (235, 225, 216) if sum(color) > 380 else (110, 100, 94)
    a = text(name.upper(), 'jost', 28, 500, .24, color=color, shadow=shadow)
    p = text(rs(price), 'cg', 64, 500, 0, color=color, shadow=shadow)
    m = strike(text(rs(mrp), 'cg', 34, 400, 0, color=dim, shadow=shadow))
    row = hrow([p, m], gap=18)
    return place(P, stack([a, row], gap=16), cx, y, t0, t1, **kw)


def strike(tp):
    img, pad, w = tp; im = img.copy(); h = im.shape[0]; y = int(h * .56)
    core = im[..., 3] > 200
    im[y - 1:y + 1, pad - 2:pad + w + 2, :3] = np.median(im[core][:, :3], 0).astype(np.uint8) if core.any() else 230
    im[y - 1:y + 1, pad - 2:pad + w + 2, 3] = 230
    return im, pad, w


def hrow(parts, gap=16):
    """text pictures side by side on a shared baseline (bottom-aligned)"""
    pad = max(p[1] for p in parts)
    H = max(p[0].shape[0] for p in parts); W = sum(p[2] for p in parts) + gap * (len(parts) - 1) + 2 * pad
    out = np.zeros((H, W, 4), np.float32); x = pad
    for (im, p, w) in parts:
        f = im.astype(np.float32) / 255; h = im.shape[0]
        # align baselines: each picture's text sits pad from its own bottom
        y0 = H - h - (pad - p); x0 = x - p
        x0c, y0c = max(0, x0), max(0, y0)
        sub = f[y0c - y0:, x0c - x0:]; sub = sub[:H - y0c, :W - x0c]
        reg = out[y0c:y0c + sub.shape[0], x0c:x0c + sub.shape[1]]; a = sub[..., 3:4]
        reg[..., :3] = sub[..., :3] * a + reg[..., :3] * (1 - a); reg[..., 3:4] = a + reg[..., 3:4] * (1 - a)
        x += w + gap
    return (out * 255 + .5).astype(np.uint8), pad, W - 2 * pad


def logo(width, color=None):
    """the vector logo as RGBA at a width; color recolours the letters only (the flower stays blush)"""
    im = Image.open(LOGO).convert('RGBA'); h = int(round(im.height * width / im.width))
    im = np.asarray(im.resize((width, h), Image.LANCZOS)).copy()
    if color is not None:
        sage = np.abs(im[..., :3].astype(int) - np.array(SAGE)).sum(2) < 60
        im[sage, :3] = color
    return im


# ---------------- the end frame ----------------
def endcard(P, t0, t1, ground=IVORY, logo_w=560, logo_y=760, lines=None, fade=.0):
    """the last frame IS the logo: ivory ground, sage NAIRA with the blush flower, the ladder, the facts.
    The plate's own end (the print-to-vector dissolve) is built in the reel; this lays the card itself"""
    g = np.zeros((P.H, P.W, 4), np.uint8); g[..., :3] = ground; g[..., 3] = 255
    P.overlay(g, 0, 0, t0, t1, fin=fade, fout=0, rise=0)
    L = logo(logo_w); P.overlay(L, (P.W - logo_w) / 2, logo_y, t0, t1, fin=fade, fout=0, rise=0)
    y = logo_y + L.shape[0] + 70
    lines = lines or ladder_lines()
    for i, (s, kind, size, col, gap) in enumerate(lines):
        tp = text(s, kind, size, 500 if kind == 'jost' else 500, .22 if kind == 'jost' else 0, color=col, shadow=0)
        place(P, (tp[0], tp[1]), P.W / 2, y, t0 + .12 + .1 * i, t1, fin=.3, fout=0, rise=8)
        y += size + gap


def ladder_lines():
    """the card's lines: each rung on its own line (one long line read as small print), then the facts"""
    r = OFFER['rungs']
    rungs = [(f'BUY {q}  ·  {p}% OFF', 'jost', 30, DEEP, 16) for q, p in r]
    rungs[-1] = rungs[-1][:4] + (24,)
    return rungs + [('APPLIED IN THE BAG', 'jost', 19, (120, 112, 106), 54),
                    ('COD AVAILABLE  ·  FREE INSURED SHIPPING', 'jost', 22, INK, 44),
                    ('nairaflore.com', 'cgi', 44, DEEP, 0)]


# ---------------- sound ----------------
SR = 48000
_rng = np.random.default_rng(20261112)
def _sos(kind, f, o): return butter(o, f, kind, fs=SR, output='sos')
def lp(x, f, o=2): return sosfilt(_sos('low', min(f, SR / 2 - 200), o), x, axis=0)
def hp(x, f, o=2): return sosfilt(_sos('high', f, o), x, axis=0)
def bp(x, f1, f2, o=2): return sosfilt(_sos('band', [f1, min(f2, SR / 2 - 200)], o), x, axis=0)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
T = lambda n: np.arange(n) / SR


def _ir(rt, dur, pre=.02, damp=4200, seed=5):
    r = np.random.default_rng(seed); n = int(dur * SR); t = T(n)
    x = r.standard_normal((n, 2)) * (10 ** (-3 * t / rt))[:, None]
    w = np.clip(t / (rt * .6), 0, 1)[:, None]; x = x * (1 - w) + lp(x, damp, 1) * w
    k = int(.004 * SR); x[:k] *= np.linspace(0, 1, k)[:, None]
    x = np.concatenate([np.zeros((int(pre * SR), 2)), x]); return x / np.sqrt(np.sum(x ** 2) / 2)
HALL = _ir(2.6, 3.4)


def lufs(x):
    """integrated loudness, ITU-R BS.1770-4"""
    if x.ndim == 1: x = np.stack([x, x], 1)
    y = lfilter([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621],
                lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585], x, axis=0), axis=0)
    blk, hop = int(.4 * SR), int(.1 * SR); c = np.cumsum(np.concatenate([np.zeros((1, 2)), y ** 2]), 0)
    ms = np.array([((c[i + blk] - c[i]) / blk).sum() for i in range(0, len(y) - blk + 1, hop)])
    L = -.691 + 10 * np.log10(ms + 1e-15); g = ms[L > -70]
    if not len(g): return -99.0
    rel = -.691 + 10 * np.log10(g.mean()) - 10
    return float(-.691 + 10 * np.log10(ms[(L > -70) & (L > rel)].mean()))


class Mix:
    """a reel's sound: buses for the bed, the transformations and the voice, each placed by time"""
    def __init__(self, dur):
        self.dur, self.N = dur, int(round(dur * SR))
        self.bed, self.fx, self.vo = (np.zeros((self.N, 2)) for _ in range(3))
        self.duck = []                                            # (t0, t1, dB) dips of the bed
    def put(self, bus, sig, t, g=1.0):
        if sig.ndim == 1: sig = np.stack([sig, sig], 1)
        i = int(round(t * SR))
        if i >= self.N or i + len(sig) <= 0: return
        if i < 0: sig = sig[-i:]; i = 0
        n = min(len(sig), self.N - i); bus[i:i + n] += sig[:n] * g

    # -- the bed: a beatless string pad, the hero-v6 score's own instrument and key (B minor to D add9) --
    def pad(self, chords, t0=0.0, level=1.0, cut=1600):
        """chords: [(start s, [midi...]), ...]; each holds to the next start (the last to the end), cross-swelling"""
        for i, (t, ms) in enumerate(chords):
            end = chords[i + 1][0] + .9 if i + 1 < len(chords) else self.dur + .5
            d = end - t; n = int(d * SR); tt = T(n); L = np.zeros(n); R = np.zeros(n)
            vib = 1 + .0022 * np.sin(2 * np.pi * 4.6 * tt + i)
            for m in ms:
                for j, dt in enumerate((-.07, -.025, .025, .07)):
                    ph = _rng.random(); x = 2 * ((np.cumsum(hz(m) * 2 ** (dt / 12) * vib) / SR + ph) % 1) - 1
                    (L if j % 2 else R)[:] += x
            y = lp(np.stack([L, R], 1) / (len(ms) * 2), cut, 4)
            env = np.clip(np.minimum(tt / .9, (d - tt) / .9), 0, 1) ** 1.5
            self.put(self.bed, y * env[:, None] * .22 * level, t + t0)
        wet = np.stack([fftconvolve(self.bed[:, c], HALL[:, c])[:self.N] for c in (0, 1)], 1)
        self.bed = self.bed * .55 + wet * .45

    # -- whips: sub only (all energy under 400 Hz), rising from the first frame of the move to the max-blur frame --
    def subwhoosh(self, t_start, t_peak, tail=.42, v=1.0):
        d1 = max(.05, t_peak - t_start); n1, n2 = int(d1 * SR), int(tail * SR); n = n1 + n2
        u = np.concatenate([np.linspace(0, 1, n1, endpoint=False), np.ones(n2)])
        env = np.concatenate([np.linspace(0, 1, n1) ** 3.2, np.exp(-np.linspace(0, tail, n2) / (tail / 4.5))])
        noise = lp(_rng.standard_normal(n), 380, 4); noise /= np.std(noise) + 1e-9
        f = 34 + 52 * u ** 2
        body = np.sin(2 * np.pi * np.cumsum(f) / SR)
        y = (noise * .55 + body * .7) * env
        self.put(self.fx, np.stack([y, y], 1) * .5 * v, t_start)

    # -- substitution cycles: a roll of soft felt taps, spacing widening (decay well under 30 ms, no ring) --
    def felt_roll(self, t0, gaps=(.045, .05, .055, .065, .08, .1, .145), v=1.0):
        t = t0
        for i, g in enumerate((0,) + tuple(gaps)):
            t += g; self.put(self.fx, self._felt(v * (1 - .05 * i), seed=i), t)

    def _felt(self, v=1.0, seed=0):
        r = np.random.default_rng(seed + 77); n = int(.06 * SR); t = T(n)
        y = lp(r.standard_normal(n), 1400, 2) * np.exp(-t / .006) * .45 + np.sin(2 * np.pi * (190 + 25 * r.random()) * t) * np.exp(-t / .014) * .5
        return np.stack([y, y], 1) * v * .35

    def felt(self, t, v=1.0, seed=0):
        self.put(self.fx, self._felt(v, seed), t)

    # -- the box: a paperboard drawer sliding on velvet, ending on a soft stop --
    def drawer(self, t, d=.55, v=1.0):
        n = int(d * SR); tt = T(n); u = tt / d
        grain = bp(_rng.standard_normal(n), 500, 2600, 2) * (1 + .6 * np.sin(2 * np.pi * (22 + 12 * u) * tt))
        env = np.sin(np.pi * np.minimum(1, u * 1.05)) ** 1.2
        y = grain * env * .12
        stop = self._felt(.9, 9)[:, 0]
        y = np.concatenate([y, np.zeros(len(stop))]); y[n - 300:n - 300 + len(stop)] += stop * 1.2
        self.put(self.fx, np.stack([y, y], 1) * v, t)

    # -- the creator's own voice (a 48 kHz wav), with short fades --
    def voice(self, path, a, b, at, g=1.0):
        x, sr = sf.read(path, always_2d=True)
        if sr != SR: x = resample_poly(x, SR, sr, axis=0)
        x = x[int(a * SR):int(b * SR)].copy()
        if x.shape[1] == 1: x = np.repeat(x, 2, 1)
        f = int(.015 * SR); x[:f] *= np.linspace(0, 1, f)[:, None]; x[-f:] *= np.linspace(1, 0, f)[:, None]
        self.put(self.vo, x * g, at)

    def master(self, out, bed_lufs=-24.0, fx_db=0.0, vo_lufs=-16.5, target=-14.0, tp=-1.3, fade_out=.35):
        N = self.N; bed = self.bed.copy()
        if np.abs(bed).max() > 0: bed *= 10 ** ((bed_lufs - lufs(bed)) / 20)
        g = np.ones(N)
        for (a, b, db) in self.duck:                              # dips with 120 ms ramps
            k = np.zeros(N); i0, i1 = int(a * SR), int(b * SR); r = int(.12 * SR)
            k[max(0, i0):min(N, i1)] = 1
            k = np.convolve(k, np.ones(r) / r, 'same'); g *= 10 ** (db * k / 20)
        vo = self.vo.copy()
        if np.abs(vo).max() > 0:
            vo *= 10 ** ((vo_lufs - lufs(vo)) / 20)
            env = np.convolve((np.abs(vo).max(1) > 10 ** (-42 / 20)).astype(float), np.ones(int(.2 * SR)) / int(.2 * SR), 'same')
            g *= 10 ** (-8 * np.clip(env * 1.5, 0, 1) / 20)       # the bed steps 8 dB under her voice
        mix = bed * g[:, None] + self.fx * 10 ** (fx_db / 20) + vo
        mix *= 10 ** ((target - lufs(mix)) / 20)
        # true-peak guard: 4x oversampled peaks, a gain that never lets one over, eased over 5 ms either side
        from scipy.ndimage import minimum_filter1d
        up = resample_poly(mix, 4, 1, axis=0); pk = np.abs(up).max(1).reshape(-1, 4).max(1)[:N]
        w = int(.005 * SR); need = minimum_filter1d(np.minimum(1, 10 ** (tp / 20) / np.maximum(pk, 1e-9)), 2 * w + 1)
        need = minimum_filter1d(np.convolve(need, np.ones(w) / w, 'same'), w)
        mix *= need[:, None]
        f = int(fade_out * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None] ** 1.5
        sf.write(out, mix.astype(np.float32), SR, subtype='PCM_24')
        return {'lufs': round(lufs(mix), 2), 'tp_db': round(20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=0)).max() + 1e-12), 2)}


# ---------------- encode and QC ----------------
def encode(frames_dir, wav, out, fps=30, crf=16, crop45=False):
    vf = 'format=yuv420p'
    if crop45: vf = 'crop=1080:1350:0:230,' + vf
    cmd = ['ffmpeg', '-v', 'error', '-y', '-framerate', str(fps), '-i', f'{frames_dir}/f_%04d.jpg']
    if wav: cmd += ['-i', wav]
    cmd += ['-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-profile:v', 'high', '-pix_fmt', 'yuv420p',
            '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-movflags', '+faststart']
    if wav: cmd += ['-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest']
    cmd += [out]
    subprocess.run(cmd, check=True)
    return out


def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-show_entries', 'stream=codec_type,width,height,nb_read_frames,duration',
                        '-of', 'json', path], capture_output=True, text=True)
    return json.loads(r.stdout)
