"""Naira SFX kit — pure numpy/scipy synthesis (no samples, no downloads).

Every sound is built from sine partials, shaped noise and a synthetic noise-IR
reverb, then mastered the same way: 20 Hz DC high-pass, 18 kHz zero-phase
low-pass guard, raised-cosine fades so the first and last samples are exactly 0,
and sample-peak normalisation to -6 dBFS. 48 kHz / stereo / 24-bit.

Tonal material sits in A major so the kit agrees with itself:
pop bloom A5, sparkle glints on A-major pentatonic (F#7 A7 C#8 E8),
tick body A6, logo chime A4 -> E5 -> A5.
"""
import json, os
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sfx")
LN1000 = 6.907755  # ln(1000): exp(-LN1000*t/T60) is -60 dB at T60


def n_of(sec):
    return int(round(sec * SR))


def rc(n):
    """Raised-cosine ramp 0 -> ~1 over n samples; first value is exactly 0."""
    n = max(int(n), 1)
    return 0.5 - 0.5 * np.cos(np.pi * np.arange(n) / n)


def pan_gains(p):
    """Constant-power pan, p in [-1, 1]."""
    th = (np.asarray(p) + 1.0) * np.pi / 4.0
    return np.cos(th), np.sin(th)


def place(buf, mono, pan=0.0):
    gl, gr = pan_gains(pan)
    buf[:, 0] += mono * gl
    buf[:, 1] += mono * gr


def partial(n_total, freq, amp, t60, onset, attack, glide=None, phase=0.0):
    """One decaying sine. Raised-cosine attack from phase 0 -> no onset click.
    glide=(depth, tau): frequency starts at f*(1+depth) and settles to f."""
    y = np.zeros(n_total)
    i0 = n_of(onset)
    m = n_total - i0
    t = np.arange(m) / SR
    f = np.full(m, float(freq))
    if glide is not None:
        f = freq * (1.0 + glide[0] * np.exp(-t / glide[1]))
    assert f.max() < 18000.0, "partial above 18 kHz"
    ph = phase + 2 * np.pi * np.cumsum(f) / SR
    env = np.exp(-LN1000 * t / t60)
    na = n_of(attack)
    env[:na] *= rc(na)
    y[i0:] = amp * env * np.sin(ph)
    return y


def shaped_noise(n, rng, fc_fn, sigma_oct, nfft=1024, ceiling=16000.0):
    """White noise given a time-varying log-Gaussian band-pass in the STFT domain.
    Each frame's mask is energy-normalised so loudness is governed only by the
    time-domain envelope applied afterwards. Hard ceiling at 16 kHz."""
    x = rng.standard_normal(n + nfft)
    nov = nfft - nfft // 4
    f, tt, Z = signal.stft(x, fs=SR, window="hann", nperseg=nfft, noverlap=nov)
    F = np.maximum(f[:, None], 1.0)
    fc = np.asarray(fc_fn(tt))[None, :]
    sig = np.asarray(sigma_oct if np.ndim(sigma_oct) == 0 else sigma_oct(tt))
    if sig.ndim:
        sig = sig[None, :]
    M = np.exp(-0.5 * (np.log2(F / fc) / sig) ** 2)
    M *= 1.0 / (1.0 + (F / ceiling) ** 24)  # ceiling, keeps everything < 18 kHz
    M[0, :] = 0.0
    M /= np.sqrt(np.sum(M ** 2, axis=0, keepdims=True)) + 1e-12
    _, y = signal.istft(Z * M, fs=SR, window="hann", nperseg=nfft, noverlap=nov)
    y = y[:n]
    return y / (np.std(y) + 1e-12)


def reverb(dry, rng, t60_lo, t60_hi, length, wet, predelay=0.014, xover=2500.0, lp=11000.0):
    """Decorrelated stereo noise-IR reverb (two-band decay). Unit-energy IR."""
    n = n_of(length)
    t = np.arange(n) / SR
    mono = dry.mean(axis=1)
    lo_sos = signal.butter(2, xover, "low", fs=SR, output="sos")
    lp_sos = signal.butter(4, lp, "low", fs=SR, output="sos")
    out = np.zeros_like(dry)
    pd = n_of(predelay)
    for ch in range(2):
        w = rng.standard_normal(n)
        lo = signal.sosfilt(lo_sos, w)
        hi = w - lo
        ir = lo * np.exp(-LN1000 * t / t60_lo) + 0.7 * hi * np.exp(-LN1000 * t / t60_hi)
        ir = signal.sosfilt(lp_sos, ir)
        ir[: n_of(0.004)] *= rc(n_of(0.004))
        ir = np.concatenate([np.zeros(pd), ir])
        ir /= np.sqrt(np.sum(ir ** 2))
        out[:, ch] = signal.fftconvolve(mono, ir)[: len(mono)]
    return wet * out


def master(y, fade_in_s, fade_out_s, target_dbfs=-6.0):
    hp = signal.butter(2, 20.0, "high", fs=SR, output="sos")
    lp = signal.butter(8, 18000.0, "low", fs=SR, output="sos")
    y = signal.sosfilt(hp, y, axis=0)
    y = signal.sosfiltfilt(lp, y, axis=0)
    fi, fo = n_of(fade_in_s), n_of(fade_out_s)
    y[:fi] *= rc(fi)[:, None]
    y[-fo:] *= rc(fo)[::-1][:, None]
    y *= 10 ** (target_dbfs / 20.0) / np.abs(y).max()
    return y


def smooth(x, ms):
    k = signal.windows.hann(max(3, n_of(ms / 1000.0)))
    k /= k.sum()
    return np.convolve(x, k, mode="same")


# ---------------------------------------------------------------- pop_in
def make_pop_in():
    rng = np.random.default_rng(101)
    dur, hit = 0.45, 0.16
    n = n_of(dur)
    t = np.arange(n) / SR
    buf = np.zeros((n, 2))

    # Airy swish: filter centre climbs 1.5 -> 7 kHz into the hit, then relaxes.
    def fc(tt):
        up = 1500.0 * (7000.0 / 1500.0) ** np.clip(tt / hit, 0, 1)
        return np.where(tt < hit, up, 5000.0 + 2000.0 * np.exp(-(tt - hit) / 0.05))

    env = np.where(t < hit, (t / hit) ** 2.6, np.exp(-(t - hit) / 0.045))
    env = smooth(env, 8)
    wide = 0.1 + 0.4 * env  # opens up as it arrives
    c = shaped_noise(n, rng, fc, 0.8)
    l_ = shaped_noise(n, rng, fc, 0.8)
    r_ = shaped_noise(n, rng, fc, 0.8)
    swish_amp = 0.42
    buf[:, 0] += swish_amp * env * (np.sqrt(1 - wide) * c + np.sqrt(wide) * l_) * 0.707
    buf[:, 1] += swish_amp * env * (np.sqrt(1 - wide) * c + np.sqrt(wide) * r_) * 0.707

    # Rounded bloom at the hit: soft-mallet A5 body with a sub-octave cushion and
    # overtones that open a few ms after the body (the "bloom"), tiny downward
    # settle (2.5 %, 18 ms) so it lands rather than bloops upward.
    g = (0.025, 0.018)
    bloom = (
        partial(n, 880.0, 1.00, 0.38, hit, 0.007, g)
        + partial(n, 440.0, 0.35, 0.22, hit, 0.010, g)
        + partial(n, 1760.0, 0.22, 0.20, hit + 0.004, 0.012, g)
        + partial(n, 2429.0, 0.06, 0.12, hit + 0.004, 0.010, g)
    )
    place(buf, bloom, 0.0)

    # Breath of air on the bloom.
    puff_env = np.where(t < hit, 0.0, 1.0)
    i0 = n_of(hit)
    puff_env[i0:] = np.exp(-(t[i0:] - hit) / 0.05)
    puff_env[i0 : i0 + n_of(0.004)] *= rc(n_of(0.004))
    puffL = shaped_noise(n, rng, lambda tt: np.full_like(tt, 5000.0), 1.0)
    puffR = shaped_noise(n, rng, lambda tt: np.full_like(tt, 5000.0), 1.0)
    buf[:, 0] += 0.10 * puff_env * puffL
    buf[:, 1] += 0.10 * puff_env * puffR

    buf += reverb(buf, rng, 0.6, 0.35, 0.6, 0.18)
    return master(buf, 0.004, 0.06), hit


# ---------------------------------------------------------------- sparkle
def make_sparkle():
    rng = np.random.default_rng(202)
    dur = 0.8
    n = n_of(dur)
    buf = np.zeros((n, 2))
    t0 = 0.005
    # (onset, fundamental, amp, T60, pan, inharmonic ratios+amps)
    glints = [
        (t0 + 0.000, 3520.0, 1.00, 0.55, -0.20, [(1.594, 0.42), (2.200, 0.16)]),  # A7
        (t0 + 0.045, 4435.0, 0.70, 0.45, 0.28, [(1.594, 0.30)]),  # C#8
        (t0 + 0.095, 2960.0, 0.62, 0.60, -0.32, [(1.594, 0.38), (2.200, 0.14)]),  # F#7
        (t0 + 0.160, 5274.0, 0.42, 0.35, 0.15, [(1.420, 0.25)]),  # E8
    ]
    parts = []
    for on, f0, a, t60, p, overs in glints:
        mono = partial(n, f0, a, t60, on, 0.0018)
        # detuned twin -> ~8-12 Hz beating, the twinkle
        mono += partial(n, f0 * 1.0024, 0.45 * a, t60 * 0.9, on, 0.0018)
        for ratio, ra in overs:
            fr = f0 * ratio
            mono += partial(n, fr, a * ra, t60 * 0.55 / ratio ** 0.3, on, 0.0015)
            parts.append(fr)
        parts.append(f0)
        place(buf, mono, p)
    assert min(parts) >= 2500 and max(parts) <= 8000, parts

    # Glitter dust: a handful of tiny, quiet high sine grains in the first 250 ms.
    for k in range(10):
        on = t0 + 0.01 + min(rng.exponential(0.07), 0.25)
        f = rng.uniform(7000.0, 11000.0)
        a = 0.06 * np.exp(-(on - t0) / 0.15) * rng.uniform(0.6, 1.0)
        place(buf, partial(n, f, a, 0.04, on, 0.0015), rng.uniform(-0.6, 0.6))

    buf += reverb(buf, rng, 0.9, 0.7, 0.9, 0.22, predelay=0.012, xover=4000.0, lp=12000.0)
    return master(buf, 0.003, 0.15), t0


# ---------------------------------------------------------------- whoosh
def noise_layers(n, rng, env, wide, layers, pan=None):
    """Sum of band-passed noise layers. Each layer = shared centre + independent
    L/R components mixed by `wide` (0 mono .. 1 fully decorrelated)."""
    out = np.zeros((n, 2))
    for amp, fcf, sg in layers:
        c = shaped_noise(n, rng, fcf, sg, ceiling=15000.0)
        l_ = shaped_noise(n, rng, fcf, sg, ceiling=15000.0)
        r_ = shaped_noise(n, rng, fcf, sg, ceiling=15000.0)
        out[:, 0] += amp * env * (np.sqrt(1 - wide) * c + np.sqrt(wide) * l_) * 0.707
        out[:, 1] += amp * env * (np.sqrt(1 - wide) * c + np.sqrt(wide) * r_) * 0.707
    if pan is not None:
        gl, gr = pan_gains(pan)
        out[:, 0] *= gl * 1.414
        out[:, 1] *= gr * 1.414
    return out


def make_whoosh():
    rng = np.random.default_rng(303)
    dur, peak, fall = 0.40, 0.26, 0.12
    n = n_of(dur)
    t = np.arange(n) / SR
    # accelerating build into the cut, quick smooth release after it
    rise_env = (0.5 - 0.5 * np.cos(np.pi * np.clip(t / peak, 0, 1))) ** 3.0
    u = np.clip((t - peak) / fall, 0, 1)
    fall_env = (0.5 + 0.5 * np.cos(np.pi * u)) ** 1.5
    env = np.where(t < peak, rise_env, fall_env)

    def fc(tt):  # 350 Hz -> 2.8 kHz into the cut, settles to 1.8 kHz after
        up = 350.0 * (2800.0 / 350.0) ** np.clip(tt / peak, 0, 1)
        return np.where(tt < peak, up, 2800.0 - 1000.0 * np.clip((tt - peak) / fall, 0, 1))

    layers = [
        (1.00, fc, 0.45),  # body
        (0.30, fc, 0.18),  # narrow resonance -> audible pitch sweep
        (0.32, lambda tt: np.minimum(2.2 * fc(tt), 9000.0), 0.7),  # air
    ]
    buf = noise_layers(n, rng, env, 0.15 + 0.45 * env, layers)
    buf += reverb(buf, rng, 0.45, 0.25, 0.4, 0.12)
    return master(buf, 0.004, 0.02), peak


# ---------------------------------------------------------------- swipe_out
def make_swipe_out():
    rng = np.random.default_rng(404)
    dur, peak = 0.30, 0.05
    n = n_of(dur)
    t = np.arange(n) / SR
    rise_env = (0.5 - 0.5 * np.cos(np.pi * np.clip(t / peak, 0, 1))) ** 1.5
    u = np.clip((t - peak) / (0.285 - peak), 0, 1)
    fall_env = (0.5 + 0.5 * np.cos(np.pi * u)) ** 1.8
    env = np.where(t < peak, rise_env, fall_env)

    def fc(tt):  # 4 kHz falling to 600 Hz
        return 4000.0 * (600.0 / 4000.0) ** np.clip(tt / 0.27, 0, 1)

    layers = [
        (1.00, fc, 0.5),
        (0.25, fc, 0.2),
        (0.30, lambda tt: np.minimum(2.2 * fc(tt), 9000.0), 0.7),
    ]
    pan = 0.30 * np.clip(t / 0.28, 0, 1)  # drifts off to the right as it leaves
    buf = noise_layers(n, rng, env, np.full(n, 0.3), layers, pan=pan)
    buf += reverb(buf, rng, 0.4, 0.22, 0.3, 0.10)
    return master(buf, 0.003, 0.015), peak


# ---------------------------------------------------------------- tick
def make_tick():
    rng = np.random.default_rng(505)
    dur, on = 0.08, 0.003
    n = n_of(dur)
    buf = np.zeros((n, 2))
    mono = (
        partial(n, 1760.0, 1.00, 0.040, on, 0.0009)
        + partial(n, 3070.0, 0.40, 0.025, on, 0.0008)
        + partial(n, 4960.0, 0.15, 0.015, on, 0.0008)
        + partial(n, 620.0, 0.30, 0.030, on, 0.0010)
    )
    # 2 ms contact noise, band-limited 1.5-6 kHz, Hann-shaped (soft, not a step)
    k = n_of(0.002)
    burst = rng.standard_normal(k + 256)
    bp = signal.butter(2, [1500.0, 6000.0], "bandpass", fs=SR, output="sos")
    burst = signal.sosfilt(bp, burst)[256:] * signal.windows.hann(k)
    burst /= np.abs(burst).max()
    i0 = n_of(on)
    mono[i0 : i0 + k] += 0.30 * burst
    # round the edge: gentle 9 kHz low-pass (a tap, not a digital click)
    mono = signal.sosfilt(signal.butter(2, 9000.0, "low", fs=SR, output="sos"), mono)
    place(buf, mono, 0.0)
    return master(buf, 0.002, 0.025), on


# ---------------------------------------------------------------- logo_chime
def bell(n, f, onset, amp, base_t60, rng):
    """Warm bell: hum, prime + slow-beating twin, octave, a little inharmonic colour."""
    spec = [  # ratio, amp, T60 factor, attack
        (0.5, 0.10, 1.00, 0.008),
        (1.0, 1.00, 1.00, 0.005),
        (1.0012, 0.35, 0.95, 0.005),
        (2.0, 0.28, 0.55, 0.003),
        (2.76, 0.07, 0.35, 0.003),
        (3.0, 0.10, 0.40, 0.003),
        (4.07, 0.04, 0.25, 0.002),
        (5.4, 0.02, 0.18, 0.002),
    ]
    y = np.zeros(n)
    for r, a, tf, at in spec:
        y += partial(n, f * r, amp * a, base_t60 * tf, onset, at)
    # faint mallet contact
    k = n_of(0.003)
    b = signal.sosfilt(signal.butter(2, [1000.0, 4000.0], "bandpass", fs=SR, output="sos"), rng.standard_normal(k + 256))[256:]
    b = b * signal.windows.hann(k) / np.abs(b).max()
    i0 = n_of(onset)
    y[i0 : i0 + k] += 0.04 * amp * b
    return y


def make_logo_chime():
    rng = np.random.default_rng(606)
    dur, first = 1.8, 0.02
    n = n_of(dur)
    t = np.arange(n) / SR
    buf = np.zeros((n, 2))
    notes = [  # onset, freq, amp, T60, pan   (A4 -> E5 -> A5: root, fifth, octave)
        (first, 440.00, 1.00, 1.60, -0.15),
        (first + 0.20, 659.26, 0.78, 1.40, 0.15),
        (first + 0.46, 880.00, 0.70, 1.30, 0.0),
    ]
    for on, f, a, t60, p in notes:
        place(buf, bell(n, f, on, a, t60, rng), p)

    # Felt thump under the first note: soft low sine settling 95 -> 62 Hz,
    # plus a whisper of sub-300 Hz noise for the felt.
    th = partial(n, 62.0, 0.30, 0.28, first, 0.004, glide=(0.53, 0.03))
    k = n_of(0.03)
    fn = signal.sosfilt(signal.butter(2, 300.0, "low", fs=SR, output="sos"), rng.standard_normal(k + 512))[512:]
    fn = fn * signal.windows.hann(k) / np.abs(fn).max()
    i0 = n_of(first)
    th[i0 : i0 + k] += 0.05 * fn
    place(buf, th, 0.0)

    buf += reverb(buf, rng, 1.6, 0.8, 1.8, 0.30, predelay=0.018)
    return master(buf, 0.004, 0.45), first


if __name__ == "__main__":
    makers = {
        "pop_in": make_pop_in,
        "sparkle": make_sparkle,
        "whoosh": make_whoosh,
        "swipe_out": make_swipe_out,
        "tick": make_tick,
        "logo_chime": make_logo_chime,
    }
    os.makedirs(OUT, exist_ok=True)
    hits = {}
    for name, fn in makers.items():
        y, hit = fn()
        sf.write(os.path.join(OUT, name + ".wav"), y, SR, subtype="PCM_24")
        hits[name] = hit
        print(f"{name:11s} {len(y)/SR:.3f}s hit={hit:.3f}")
    json.dump(hits, open(os.path.join(OUT, "hits.json"), "w"), indent=1)
