"""Pankti x Naira v11 — the footage plate the motion graphics are drawn over.

Her own 31.5 s cut (HLG HDR, mirrored front camera) re-cut to her track's beat:
every shot is a whole number of beats and the music runs unbroken from its first
beat, so each cut lands on a beat. Writes plate.mp4, the plate's frames (frames/)
and the two split-screen panels (panelL/, panelRw/) the engine reads.
"""
import os, subprocess

S = os.path.dirname(os.path.abspath(__file__))
FF = os.environ.get("FFMPEG", os.path.join(S, "ffmpeg"))
SRC = os.path.join(S, "pankti_raw.mp4")
BEAT = 0.36584          # fitted beat to beat across the whole track (164.01 BPM); 161.5 drifted ~180 ms by the end
FPS = 30

# HLG -> SDR with Hable, which kept the gold warm where a plain conversion greyed it;
# the source is mirrored (the box reads "ARIAN"), hence hflip.
GRADE = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,"
         "zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,"
         "hflip,colortemperature=temperature=6100:mix=0.25,"
         "curves=master='0/0.02 0.25/0.23 0.5/0.5 0.75/0.78 1/0.98',eq=saturation=1.06")

# source in/out (s), beats on screen, push-in z0 -> z1, crop focus (0..1).
# The push grows from the crop's top-left, not the focus point: crop computes its offset from the first
# frame's size while scale enlarges every frame after it. The tracks were measured on exactly this plate,
# so change the zoom or the focus and the tracked graphics must be re-tracked (track.py / ringtrack.py).
# fy=1.0 on the necklace shots keeps the toggle above Meta's caption zone (y > 1248).
EDL = [
    dict(a=7.36, b=8.84, n=4, z0=1.10, z1=1.18, fx=.5, fy=.85, fix=",hue=h=-4"),  # hook; the gold read brassy next to the end card
    dict(a=11.66, b=12.77, n=3, z0=1.12, z1=1.20, fx=.35, fy=.45),
    dict(a=4.30, b=5.60, n=3, z0=1.32, z1=1.38, fx=.5, fy=1.0),                    # huggies box
    dict(a=10.28, b=11.39, n=3, z0=1.05, z1=1.10, fx=.4, fy=.5),
    dict(a=1.50, b=2.90, n=3, z0=1.36, z1=1.42, fx=.5, fy=1.0),                    # toggle box; her edit jump-cuts the drawer open at 1.49
    dict(a=13.72, b=15.20, n=4, z0=1.0, z1=1.06, fx=.5, fy=.4),                    # the chain swings
    dict(a=15.26, b=16.55, n=3, z0=1.08, z1=1.08, fx=.5, fy=1.0),                  # fastening; after 16.6 the ring drops into the caption zone
    dict(a=18.30, b=20.90, n=7, z0=1.10, z1=1.24, fx=.45, fy=1.0),                 # the toggle turned, held longest
    dict(a=23.00, b=24.11, n=3, z0=1.02, z1=1.08, fx=.5, fy=.45),
    dict(a=25.00, b=26.86, n=5, z0=1.28, z1=1.28, fx=.5, fy=1.0),                  # "every day." — tight enough that the toggle stays above 1248
    dict(a=29.90, b=31.45, n=4, z0=1.0, z1=1.04, fx=.5, fy=.4),                    # a clean goodbye before the card flips
]


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(r.stderr[-3000:])


def build():
    seg = os.path.join(S, "seg"); os.makedirs(seg, exist_ok=True)
    parts, t_out = [], 0.0
    for i, s in enumerate(EDL):
        # frame-exact beat boundaries: rounding each shot on its own let the cuts drift ~3 frames by the end
        f_a, f_b = round(t_out * FPS), round((t_out + s["n"] * BEAT) * FPS)
        nf = f_b - f_a
        dur = nf / FPS
        speed = (s["b"] - s["a"]) / dur
        z0, z1 = s["z0"], s["z1"]
        vf = (f"[0:v]trim={s['a']}:{s['b']},setpts=(PTS-STARTPTS)/{speed:.5f},{GRADE}{s.get('fix', '')},fps={FPS},"
              f"scale=w='2*trunc(540*({z0}+({z1}-{z0})*t/{dur:.4f}))':h=-2:eval=frame:flags=lanczos,"
              f"crop=1080:1920:'(iw-1080)*{s['fx']}':'(ih-1920)*{s['fy']}',setsar=1,trim=end_frame={nf},format=yuv420p[o]")
        out = os.path.join(seg, f"s{i:02d}.mov")
        run([FF, "-y", "-i", SRC, "-filter_complex", vf, "-map", "[o]", "-an", "-c:v", "prores_ks", "-profile:v", "3",
             "-pix_fmt", "yuv422p10le", out])
        parts.append(out); t_out += s["n"] * BEAT
        print(f"s{i:02d} src {s['a']:.2f}-{s['b']:.2f} x{speed:.2f} -> {nf} frames (ends {t_out:.2f})")
    lst = os.path.join(seg, "list.txt")
    open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    plate = os.path.join(S, "plate.mp4")
    run([FF, "-y", "-f", "concat", "-safe", "0", "-i", lst, "-an", "-c:v", "libx264", "-crf", "10", "-preset", "medium",
         "-pix_fmt", "yuv420p", plate])
    os.makedirs(os.path.join(S, "frames"), exist_ok=True)
    run([FF, "-y", "-i", plate, "-q:v", "2", os.path.join(S, "frames", "f_%05d.jpg")])
    # the split screen's two panels: her ear with the huggie, and a pendant-height crop of the necklace
    for name, ss, vf in (("panelL", 11.95, "scale=1232:2190:flags=lanczos,crop=540:1920:301:269"),
                         ("panelRw", 23.371, "scale=1728:3072:flags=lanczos,crop=1080:1920:0:1100")):
        os.makedirs(os.path.join(S, name), exist_ok=True)
        run([FF, "-y", "-ss", str(ss), "-t", "0.80", "-i", SRC, "-vf", f"{GRADE},{vf},fps={FPS}", "-q:v", "2",
             os.path.join(S, name, "p_%03d.jpg")])
    print("wrote", plate)


if __name__ == "__main__":
    build()
