"""mx.py: the plate renderer for the morph-edit reels. A virtual camera over real footage and real stills.

Every layer is a source picture seen through an animated camera. The camera puts a SOURCE point (x, y, 0-1 of the
source) at a CANVAS point (px, py, pixels; default the frame centre), scaled by k canvas px per source px (or s times
cover-fit when k is not keyed) and turned r degrees CLOCKWISE about that point, at opacity a. Every property is
keyframed with an easing, or computed per instant by camf(t) -> dict (tracks, registered swaps, measured curves).
A plate-wide group camera (gs, gr about gx, gy, plus gtx, gty) is applied on top of every layer that has group=True:
that is the one continuous camera move a substitution cycle rides, or the spin that a whip turns two layers through.

Motion blur is physical: an output frame averages the layer rendered at several instants across the shutter, so a whip,
spin or zoom blurs exactly as fast as it moves and a held picture stays sharp. The SOURCE picture is the same real frame
for every sample (no frame blending): only the virtual camera adds blur.

Stepped cadence (the reference's handmade 18 fps): inside a Plate.steps window the clock is quantised to 18 new pictures
a second (a 2-2-1 hold on the 30 fps timeline), and the shutter opens for `angle` of the 1/18 s step, so a fast step
blurs like a real 18 fps frame. Outside the windows the film runs at native 30 fps.

Usage from a build script:
    import mx; P = mx.Plate(1080, 1920); P.layer(src=..., t0=..., t1=..., keys=[...]); P.render(out_dir, dur)
"""
import os, sys, json, math, subprocess, hashlib
for _v in ('OPENBLAS_NUM_THREADS', 'OMP_NUM_THREADS', 'MKL_NUM_THREADS'): os.environ.setdefault(_v, '1')
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np, cv2
cv2.setNumThreads(1)          # render() forks workers; an OpenCV thread pool made before a fork deadlocks the children

EASE = {
    'lin': lambda u: u,
    'io': lambda u: u * u * (3 - 2 * u),
    'io3': lambda u: 4 * u ** 3 if u < .5 else 1 - (-2 * u + 2) ** 3 / 2,
    'in': lambda u: u ** 3, 'in2': lambda u: u * u,
    'out': lambda u: 1 - (1 - u) ** 3, 'out2': lambda u: 1 - (1 - u) ** 2,
    'expo_in': lambda u: 0 if u <= 0 else 2 ** (10 * u - 10),
    'expo_out': lambda u: 1 if u >= 1 else 1 - 2 ** (-10 * u),
    'step': lambda u: 1.0 if u >= 1 else 0.0,
}
CACHE = os.environ.get('MX_CACHE', '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/mx/cache')

# ---- decoding: each source with its own matrix ----
# Pankti is HLG BT.2020 with Dolby Vision, stored mirrored: tone-map (v11's Hable, no extra colour) and flip
PANKTI = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,"
          "zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,hflip")


def decode(src, t_in, t_out, fps=30, width=None, vf_extra='', pre=''):
    """the source frames [t_in, t_out] at fps as JPEG q1, cached; returns (dir, n, fps).
    pre: filters run before the fps/scale stage (tone-mapping, flips, crops)"""
    key = hashlib.md5(f'{src}|{t_in:.4f}|{t_out:.4f}|{fps}|{width}|{vf_extra}|{pre}'.encode()).hexdigest()[:12]
    d = f'{CACHE}/{os.path.basename(src).split(".")[0]}_{key}'
    if not os.path.exists(f'{d}/done'):
        os.makedirs(d, exist_ok=True)
        vf = ([pre] if pre else []) + [f'fps={fps}'] + ([f'scale={width}:-2:flags=lanczos'] if width else []) + ([vf_extra] if vf_extra else [])
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, t_in):.4f}', '-i', src, '-t', f'{t_out - max(0, t_in):.4f}',
                        '-vf', ','.join(vf), '-q:v', '1', '-qmin', '1', f'{d}/f_%05d.jpg'], check=True)
        open(f'{d}/done', 'w').write('1')
    n = len([f for f in os.listdir(d) if f.endswith('.jpg')])
    return d, n, fps


class Frames:
    """a decoded range (or a list of image files) with an LRU of loaded frames, kept as uint8 RGB, plus
    area-downscaled mip levels so a 4K source shown at half size does not alias"""
    def __init__(self, d=None, n=0, fps=30, paths=None, lru=20):
        self.d, self.n, self.fps, self.cap = d, n, fps, lru
        self.paths = paths
        if paths is not None: self.n = len(paths)
        self.lru = {}
    def path(self, k):
        return self.paths[k] if self.paths is not None else f'{self.d}/f_{k + 1:05d}.jpg'
    def get(self, k, lv=1):
        k = max(0, min(self.n - 1, int(k)))
        if not hasattr(self, '_capped') and self.lru:              # keep a 4K range's cache near 300 MB
            im0 = next(iter(self.lru.values())); self.cap = max(4, min(self.cap, int(1.6e8 / im0.nbytes))); self._capped = True
        key = (k, lv)
        if key not in self.lru:
            if len(self.lru) > self.cap: self.lru.pop(next(iter(self.lru)))
            if lv == 1:
                im = cv2.imread(self.path(k), cv2.IMREAD_UNCHANGED)
                if im.ndim == 2: im = cv2.cvtColor(im, cv2.COLOR_GRAY2BGR)
                if im.shape[2] == 4:                                 # keep a PNG's alpha as a 4th channel
                    im = cv2.cvtColor(im, cv2.COLOR_BGRA2RGBA)
                else: im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
                self.lru[key] = im
            else:
                b = self.get(k, 1); h, w = b.shape[:2]
                self.lru[key] = cv2.resize(b, (max(1, w // lv), max(1, h // lv)), interpolation=cv2.INTER_AREA)
        return self.lru[key]
    @property
    def size(self):
        im = self.get(0); return im.shape[1], im.shape[0]


def still(src, t, pre='', fps=30, width=None):
    """one real frame of a clip at t (as a 1-frame Frames)"""
    d, n, f = decode(src, t, t + .6 / fps, fps, width, '', pre)
    return Frames(d, max(1, min(n, 1)), f)


def image(path):
    return Frames(paths=[path])


def interp(keys, t, name, default):
    """keys: [[t, {name: value, ...}, ease], ...] sorted; a property only interpolates between keys that carry it"""
    ks = [k for k in keys if name in k[1]]
    if not ks: return default
    if t <= ks[0][0]: return ks[0][1][name]
    for a, b in zip(ks, ks[1:]):
        if t <= b[0]:
            u = (t - a[0]) / max(b[0] - a[0], 1e-9); e = EASE[b[2] if len(b) > 2 else 'io'](min(1, max(0, u)))
            return a[1][name] + (b[1][name] - a[1][name]) * e
    return ks[-1][1][name]


def steps(t0, dt, cum, name, ease='lin'):
    """keys from a per-step cumulative curve: value cum[i] at t0 + i * dt (a measured speed profile, e.g. the
    reference's spin of 0.8, 1.7, 2.7 ... degrees per 18 fps frame), straight lines between, so speed is constant
    within a step and the blur of each step matches its own speed"""
    return [[t0 + i * dt, {name: float(v)}, ease] for i, v in enumerate(cum)]


def affine(px, py, x, y, k, r):
    """3x3: source point (x, y) [px] to canvas (px, py), scale k, rotation r degrees clockwise"""
    M = cv2.getRotationMatrix2D((x, y), -r, k)
    M[0, 2] += px - x; M[1, 2] += py - y
    return np.vstack([M, [0, 0, 1]])


class Layer:
    def __init__(self, P, src, t0, t1, inp=0.0, speed=1.0, keys=(), camf=None, group=True, fps=None, width=None,
                 blend='over', mask=None, cmask=None, grade=None, samples=None, freeze=None, pre='', vf='', name=''):
        self.P, self.t0, self.t1, self.inp, self.speed, self.keys = P, t0, t1, inp, speed, sorted(keys, key=lambda k: k[0])
        self.camf, self.group, self.blend, self.mask, self.cmask, self.grade = camf, group, blend, mask, cmask, grade
        self.samples, self.freeze, self.name = samples, freeze, name
        if isinstance(src, Frames): self.F, self.inp_off = src, inp
        elif isinstance(src, str) and src.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            self.F, self.inp_off = image(src), 0
        else:
            sfps = fps or P.src_fps
            last = inp + (t1 - t0) * speed
            a = max(0, inp - 1 / sfps)
            d, n, f = decode(src, a, last + 2 / sfps, sfps, width, vf, pre)
            self.F = Frames(d, n, f); self.inp_off = inp - a
    def cam(self, t):
        g = lambda n, d: interp(self.keys, t, n, d)
        sw, sh = self.F.size
        c = {'s': g('s', 1.0), 'x': g('x', .5), 'y': g('y', .5), 'r': g('r', 0.0), 'a': g('a', 1.0),
             'px': g('px', self.P.W / 2), 'py': g('py', self.P.H / 2), 'k': g('k', None)}
        if self.camf: c.update(self.camf(t))
        if c['k'] is None: c['k'] = max(self.P.W / sw, self.P.H / sh) * c['s']
        return c
    def matrix(self, t):
        c = self.cam(t); sw, sh = self.F.size
        M = affine(c['px'], c['py'], c['x'] * sw, c['y'] * sh, c['k'], c['r'])
        if self.group: M = self.P.G(t) @ M
        return M
    def src_index(self, t):
        if self.freeze is not None: return self.freeze
        return int(math.floor((self.inp_off + (t - self.t0) * self.speed) * self.F.fps + 1e-4))
    def render(self, t, sh):
        """the layer at clock time t, its shutter open for sh seconds: (rgb, alpha) or None"""
        if t < self.t0 or t >= self.t1: return None
        W, H = self.P.W, self.P.H
        sw, shh = self.F.size
        ta, tb = t - sh / 2, t + sh / 2
        self.k_now = self.src_index(t)
        Ma, Mb = self.matrix(ta), self.matrix(tb)
        corners = np.array([[0, 0, 1], [sw, 0, 1], [0, shh, 1], [sw, shh, 1], [sw / 2, shh / 2, 1]], float).T
        travel = np.abs(Ma @ corners - Mb @ corners).max()
        n = self.samples or int(min(64, max(1, math.ceil(travel / 2.5))))
        ts = [t] if n == 1 else list(np.linspace(ta, tb, n))
        k = self.src_index(t); self.k_now = k                      # camf can read the picture on show (stabilising)
        acc = np.zeros((H, W, 3), np.float32); accA = np.zeros((H, W), np.float32)
        has_a = False
        for tt in ts:
            M = self.matrix(tt)
            ks = math.sqrt(abs(np.linalg.det(M[:2, :2])))
            lv = 4 if ks < .3 else 2 if ks < .65 else 1
            img = self.F.get(k, lv)
            Mi = M @ np.diag([lv, lv, 1.0]) if lv > 1 else M
            flag = cv2.INTER_CUBIC if ks > 1.1 else cv2.INTER_LINEAR
            w = cv2.warpAffine(img, Mi[:2], (W, H), flags=flag, borderMode=cv2.BORDER_REFLECT101)
            if w.shape[2] == 4:                                      # a cut-out still: its own alpha, nothing outside it
                a = cv2.warpAffine(img[..., 3], Mi[:2], (W, H), flags=flag, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
                accA += a.astype(np.float32) / 255; has_a = True; w = w[..., :3]
            acc += w.astype(np.float32)
            if self.mask is not None:
                m = self.mask(tt, self) if callable(self.mask) else self.mask
                if lv > 1: m = cv2.resize(m, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_AREA)
                accA += cv2.warpAffine(m.astype(np.float32), Mi[:2], (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
                has_a = True
        rgb = acc / (255 * len(ts))
        alpha = accA / len(ts) if has_a else np.ones((H, W), np.float32)
        if self.cmask is not None: alpha = alpha * self.cmask(t)
        alpha = alpha * self.cam(t)['a']
        if self.grade: rgb = self.grade(rgb, t)
        return rgb, alpha


class Plate:
    def __init__(self, W=1080, H=1920, fps=30, shutter=.5, src_fps=30, bg=(0, 0, 0)):
        self.W, self.H, self.fps, self.shutter, self.src_fps, self.layers, self.bg = W, H, fps, shutter, src_fps, [], bg
        self.gkeys = []                                            # group camera: gs, gr about (gx, gy), then gtx, gty
        self.gcamf = None
        self.steps = []                                            # (t0, t1, step fps, shutter angle 0-1)
        self.fx = []                                               # whole-frame effects: f(rgb, t) -> rgb
        self.overlays = []                                         # type and logo: never blurred, never in the group
    def layer(self, **kw):
        L = Layer(self, **kw); self.layers.append(L); return L
    def G(self, t):
        g = lambda n, d: interp(self.gkeys, t, n, d)
        c = {'gs': g('gs', 1.0), 'gr': g('gr', 0.0), 'gx': g('gx', self.W / 2), 'gy': g('gy', self.H / 2),
             'gtx': g('gtx', 0.0), 'gty': g('gty', 0.0)}
        if self.gcamf: c.update(self.gcamf(t))
        if c['gs'] == 1 and c['gr'] == 0 and c['gtx'] == 0 and c['gty'] == 0: return np.eye(3)
        M = affine(c['gx'] + c['gtx'], c['gy'] + c['gty'], c['gx'], c['gy'], c['gs'], c['gr'])
        return M
    def clock(self, t):
        """(picture time, shutter seconds) for output time t: stepped inside a steps window"""
        for (a, b, sf, ang) in self.steps:
            if a - 1e-6 <= t < b - 1e-6:
                return a + math.floor((t - a) * sf + 1e-4) / sf, ang / sf
        return t, self.shutter / self.fps
    def frame(self, t):
        out = np.empty((self.H, self.W, 3), np.float32); out[:] = np.array(self.bg, np.float32) / 255
        tq, sh = self.clock(t)
        for L in self.layers:
            r = L.render(tq, sh)
            if r is None: continue
            rgb, a = r
            if L.blend == 'add': out += rgb * a[..., None]
            elif L.blend == 'screen': out = 1 - (1 - out) * (1 - rgb * a[..., None])
            else: out = out * (1 - a[..., None]) + rgb * a[..., None]
        for f in self.fx: out = f(out, t)
        for o in self.overlays: out = o.draw(out, t)
        return np.clip(out, 0, 1)
    def overlay(self, img, x, y, t0, t1, fin=.25, fout=.2, rise=10, a=1.0, ease_in='out', ease_out='in'):
        o = Overlay(img, x, y, t0, t1, fin, fout, rise, a, ease_in, ease_out); self.overlays.append(o); return o
    def render(self, out_dir, dur, start=0, stop=None, q=95, workers=4):
        os.makedirs(out_dir, exist_ok=True)
        N = int(round(dur * self.fps)); idx = list(range(start, N if stop is None else min(stop, N)))
        def work(ii):
            cv2.setNumThreads(1)
            for i in ii:
                img = self.frame(i / self.fps)
                cv2.imwrite(f'{out_dir}/f_{i + 1:04d}.jpg', cv2.cvtColor((img * 255 + .5).astype(np.uint8), cv2.COLOR_RGB2BGR),
                            [cv2.IMWRITE_JPEG_QUALITY, q])
        if workers <= 1: work(idx)
        else:
            # contiguous blocks, dealt round-robin, so each worker's frame cache stays warm
            blocks = [idx[i:i + 6] for i in range(0, len(idx), 6)]
            pids = []
            for w in range(workers):
                pid = os.fork()
                if pid == 0:
                    try: work([i for b in blocks[w::workers] for i in b])
                    finally: os._exit(0)
                pids.append(pid)
            for pid in pids: os.waitpid(pid, 0)
        json.dump({'fps': self.fps, 'n': N}, open(f'{out_dir}/meta.json', 'w'))
        return N


class Overlay:
    """a flat RGBA picture (type, the logo) laid on the finished frame, faded and lifted in, faded out"""
    def __init__(self, img, x, y, t0, t1, fin, fout, rise, a, ei, eo):
        self.img = img.astype(np.float32) / 255 if img.dtype == np.uint8 else img
        self.x, self.y, self.t0, self.t1, self.fin, self.fout, self.rise, self.a, self.ei, self.eo = x, y, t0, t1, fin, fout, rise, a, ei, eo
        self.keys = None                                           # optional [[t, {'a':, 'x':, 'y':, 's':}, ease]]
    def draw(self, out, t):
        if t < self.t0 or t >= self.t1: return out
        u_in = 1 if self.fin <= 0 else min(1, (t - self.t0) / self.fin)
        u_out = 1 if self.fout <= 0 else min(1, (self.t1 - t) / self.fout)          # 1 until the fade-out starts, 0 at t1
        a = self.a * EASE['io'](u_in) * EASE['io'](u_out)
        dy = self.rise * (1 - EASE['out'](u_in))
        x, y, s = self.x, self.y + dy, 1.0
        if self.keys:
            a *= interp(self.keys, t, 'a', 1.0); x = interp(self.keys, t, 'x', x); y = interp(self.keys, t, 'y', y); s = interp(self.keys, t, 's', 1.0)
        if a <= 0.002: return out
        im = self.img
        H, W = out.shape[:2]
        if s != 1.0 or abs(x - round(x)) > .01 or abs(y - round(y)) > .01:
            M = np.array([[s, 0, x], [0, s, y]], np.float32)
            w = cv2.warpAffine(im, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
            al = w[..., 3:4] * a; return out * (1 - al) + w[..., :3] * al
        x, y = int(round(x)), int(round(y)); h, w = im.shape[:2]
        x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
        if x1 <= x0 or y1 <= y0: return out
        sub = im[y0 - y:y1 - y, x0 - x:x1 - x]; al = sub[..., 3:4] * a
        out = out.copy(); out[y0:y1, x0:x1] = out[y0:y1, x0:x1] * (1 - al) + sub[..., :3] * al
        return out


# ---- whole-frame effects ----
def radial_zoom_blur(rgb, cx, cy, amount, n=12):
    """a zoom-through: average copies scaled about (cx, cy) by up to 1+amount"""
    if amount < .005: return rgb
    H, W = rgb.shape[:2]; acc = np.zeros_like(rgb)
    for s in np.linspace(1, 1 + amount, n):
        M = cv2.getRotationMatrix2D((cx, cy), 0, s); acc += cv2.warpAffine(rgb, M, (W, H), borderMode=cv2.BORDER_REFLECT101)
    return acc / n


def sheet(frames_dir, out, fps_in=30, every=None, cols=8, w=200, times=None, label=True):
    """a contact sheet of a render: every Nth frame (or the given times), labelled with seconds"""
    from PIL import Image, ImageDraw
    fs = sorted(f for f in os.listdir(frames_dir) if f.startswith('f_') and f.endswith('.jpg'))
    if times is not None: pick = [min(len(fs) - 1, int(round(t * fps_in))) for t in times]
    else: pick = list(range(0, len(fs), every or 10))
    ims = []
    for i in pick:
        im = Image.open(f'{frames_dir}/{fs[i]}'); im = im.resize((w, int(im.height * w / im.width)))
        if label: ImageDraw.Draw(im).text((4, 4), f'{i / fps_in:.2f}', fill=(255, 255, 0))
        ims.append(im)
    rows = math.ceil(len(ims) / cols); h = ims[0].height
    S = Image.new('RGB', (cols * w, rows * h), (20, 20, 20))
    for j, im in enumerate(ims): S.paste(im, ((j % cols) * w, (j // cols) * h))
    S.save(out, quality=90)
    return out
