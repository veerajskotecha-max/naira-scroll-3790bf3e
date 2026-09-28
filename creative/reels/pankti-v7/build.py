"""Pankti x Naira, re-cut v7.

Source: Pankti's own 31.5s cut (HLG HDR, mirrored front camera, 161 BPM track).
Every shot is a whole number of beats long and the music runs unbroken from the
track's first beat, so each cut lands on a beat without re-editing the audio.
"""
import json, os, subprocess

S = os.path.dirname(os.path.abspath(__file__))
FF = os.environ.get("FFMPEG", os.path.join(S, "ffmpeg"))
SRC = os.environ.get("PANKTI_RAW", os.path.join(S, "pankti_raw.mp4"))
SEG = os.path.join(S, "seg"); os.makedirs(SEG, exist_ok=True)

BEAT = 60 / 161.5          # 0.3715s, librosa's tempo for this track
FIRST_BEAT = 0.39          # the audio bed starts here so output t=0 is on a beat
FPS = 30

# HLG -> SDR with Hable, which kept the gold warm where a plain conversion
# greyed it; the source is mirrored (the box reads "ARIAN"), hence hflip.
GRADE = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,"
         "zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,"
         "hflip,colortemperature=temperature=6100:mix=0.25,"
         "curves=master='0/0.02 0.25/0.23 0.5/0.5 0.75/0.78 1/0.98',eq=saturation=1.06")

# src in/out (s), beats on screen, push-in from z0 to z1, crop focus (0..1), overlay
EDL = [
    # Hook: gold fills the frame on frame 0, with the line already on it.
    dict(a=7.36, b=8.84, n=4, z0=1.10, z1=1.18, fx=.5, fy=.85, ov=dict(id="t01", kind="line", text="not all gold", y=1165, tone="ivory")),
    dict(a=11.66, b=12.77, n=3, z0=1.12, z1=1.20, fx=.35, fy=.45, ov=dict(id="t02", kind="line", text="has to shine.", y=430, tone="ivory")),
    dict(a=4.30, b=5.60, n=3, z0=1.0, z1=1.05, fx=.5, fy=.5, ov=dict(id="t03", kind="label", name="Brushed Gold Huggies", price="₹1,099", y=420, tone="ivory")),
    dict(a=10.28, b=11.39, n=3, z0=1.05, z1=1.10, fx=.4, fy=.5, ov=dict(id="t04", kind="line", text="satin, not mirror.", y=430, tone="ivory")),
    dict(a=1.00, b=2.90, n=3, z0=1.0, z1=1.05, fx=.5, fy=.5, ov=dict(id="t05", kind="label", name="Toggle Link Chain", price="₹1,499", y=420, tone="ivory")),
    # Breath: no words while the chain swings and she fastens it.
    dict(a=13.72, b=15.20, n=4, z0=1.0, z1=1.06, fx=.5, fy=.4, ov=None),
    dict(a=15.26, b=17.30, n=3, z0=1.04, z1=1.04, fx=.5, fy=.5, ov=None),
    # The hero action, held longest: the toggle turned through her fingers.
    dict(a=18.30, b=20.90, n=7, z0=1.10, z1=1.24, fx=.45, fy=.42, ov=dict(id="t08", kind="line", text="closes with a turn.", y=430, tone="ivory")),
    dict(a=23.00, b=24.11, n=3, z0=1.02, z1=1.08, fx=.5, fy=.45, ov=dict(id="t09", kind="line", text="worn together,", y=760, tone="ivory")),
    dict(a=25.00, b=26.86, n=5, z0=1.0, z1=1.06, fx=.5, fy=.45, ov=dict(id="t10", kind="line", text="every day.", y=760, tone="ivory")),
    dict(a=29.90, b=31.45, n=4, z0=1.0, z1=1.04, fx=.5, fy=.4, ov=None),  # a clean goodbye; the price lives on the end card
]
END = dict(n=6, ov=dict(id="t12", kind="end"))


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(r.stderr[-3000:])


def text_layer(i, dur):
    """Words rise 14px and fade in over 0.2s, then hold until the cut. The hook
    starts fully set: on frame 0 there is no time to wait for type to arrive."""
    fade = "" if i == 0 else ",fade=t=in:st=0:d=0.2:alpha=1"
    y = "0" if i == 0 else "'14*(1-min(1,t/0.2))'"
    return fade, y


def build():
    spec = [s["ov"] for s in EDL if s["ov"]] + [END["ov"]]
    json.dump(spec, open(os.path.join(S, "ov_spec.json"), "w"), indent=1)
    run(["python3", os.path.join(S, "overlays.py"), os.path.join(S, "ov_spec.json")])

    parts, t_out = [], 0.0
    for i, s in enumerate(EDL):
        dur = s["n"] * BEAT
        speed = (s["b"] - s["a"]) / dur
        z0, z1 = s["z0"], s["z1"]
        zoom = (f"scale=w='2*trunc(540*({z0}+({z1}-{z0})*t/{dur:.4f}))':h=-2:eval=frame:flags=lanczos,"
                f"crop=1080:1920:'(iw-1080)*{s['fx']}':'(ih-1920)*{s['fy']}'")
        base = (f"[0:v]trim={s['a']}:{s['b']},setpts=(PTS-STARTPTS)/{speed:.5f},{GRADE},"
                f"fps={FPS},{zoom},setsar=1,trim=duration={dur:.4f}")
        out = os.path.join(SEG, f"s{i:02d}.mov")
        if s["ov"]:
            fade, y = text_layer(i, dur)
            fc = (f"{base}[v];[1:v]format=rgba{fade}[t];[v][t]overlay=x=0:y={y}:shortest=1,"
                  f"format=yuv420p[o]")
            cmd = [FF, "-y", "-i", SRC, "-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.4f}",
                   "-i", os.path.join(S, "ov", s["ov"]["id"] + ".png"), "-filter_complex", fc, "-map", "[o]"]
        else:
            cmd = [FF, "-y", "-i", SRC, "-filter_complex", base + ",format=yuv420p[o]", "-map", "[o]"]
        run(cmd + ["-an", "-c:v", "prores_ks", "-profile:v", "3", "-pix_fmt", "yuv422p10le", out])
        parts.append(out); t_out += dur
        print(f"s{i:02d} src {s['a']:.2f}-{s['b']:.2f} x{speed:.2f} -> {dur:.2f}s  (ends {t_out:.2f})")

    # End card: logo settles from 103% to 100% over 0.5s on ivory; no dissolve,
    # so no two layouts ever sit on top of each other.
    dur = END["n"] * BEAT
    out = os.path.join(SEG, "s99.mov")
    run([FF, "-y", "-loop", "1", "-framerate", str(FPS), "-t", f"{dur:.4f}", "-i",
         os.path.join(S, "ov", "t12.png"), "-filter_complex",
         f"[0:v]scale=w='2*trunc(540*(1+0.03*max(0,1-t/0.5)))':h=-2:eval=frame:flags=lanczos,"
         f"crop=1080:1920,format=yuv420p[o]", "-map", "[o]",
         "-c:v", "prores_ks", "-profile:v", "3", "-pix_fmt", "yuv422p10le", out])
    parts.append(out); t_out += dur
    print(f"end card {dur:.2f}s  total {t_out:.2f}s")

    lst = os.path.join(SEG, "list.txt")
    open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    final = os.path.join(S, "naira-pankti-v7.mp4")
    run([FF, "-y", "-f", "concat", "-safe", "0", "-i", lst, "-ss", str(FIRST_BEAT), "-i", SRC,
         "-filter_complex",
         f"[1:a]atrim=0:{t_out:.4f},afade=t=out:st={t_out - 0.9:.4f}:d=0.9,"
         f"loudnorm=I=-14:TP=-1.5:LRA=11[a]",
         "-map", "0:v", "-map", "[a]", "-t", f"{t_out:.4f}",
         "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-pix_fmt", "yuv420p",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", final])
    print("wrote", final)


if __name__ == "__main__":
    build()
