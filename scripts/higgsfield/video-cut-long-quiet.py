"""Cut THE LONG QUIET — the 29s voiceover brand film, plus a 15s and 6s pull.

Six 4s live clips, hard cut, then a 5s endcard, with the voiceover laid over the
whole thing. No music: the Higgsfield audio surface has no general-purpose music
model, so the track is voice and silence, which suits a film called The Long
Quiet better than a bed would anyway.
"""
import os
import subprocess

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
CLIPS = os.path.join(HERE, "clips")
OUT = "/home/user/naira-scroll-3790bf3e/naira-flore-film"
FF = imageio_ffmpeg.get_ffmpeg_exe()

W, H, FPS = 1080, 1920, 24
CREAM, INK, SAGE, CORAL = (244, 240, 232), (28, 28, 28), (169, 188, 173), (231, 156, 130)


def font(sz, bold=False):
    base = "/usr/share/fonts/truetype/dejavu/DejaVuSans"
    return ImageFont.truetype(base + ("-Bold" if bold else "") + ".ttf", sz)


def endcard(path):
    im = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(im)
    f1, f2 = font(96, True), font(46)
    for text, f, y, fill in (("NAIRA FLORE", f1, 840, INK),
                             ("Softly, slowly, worn.", f2, 990, (95, 89, 83))):
        d.text(((W - d.textlength(text, font=f)) / 2, y), text, font=f, fill=fill)
    d.rectangle([W // 2 - 70, 950, W // 2 + 70, 954], fill=SAGE)
    d.ellipse([W // 2 - 6, 1120, W // 2 + 6, 1132], fill=CORAL)
    im.save(path)


def run(args):
    r = subprocess.run([FF, "-y", "-loglevel", "error"] + args,
                       capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(r.stderr[-2000:])


def main():
    os.makedirs(OUT, exist_ok=True)
    card = os.path.join(HERE, "endcard.png")
    endcard(card)

    # 5s endcard as video, matched to the clips' format
    card_mp4 = os.path.join(HERE, "endcard.mp4")
    run(["-loop", "1", "-t", "5", "-i", card, "-r", str(FPS),
         "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", card_mp4])

    listing = os.path.join(HERE, "concat.txt")
    with open(listing, "w") as fh:
        for n in range(1, 7):
            fh.write("file '%s'\n" % os.path.join(CLIPS, "c%d.mp4" % n))
        fh.write("file '%s'\n" % card_mp4)

    silent = os.path.join(HERE, "silent.mp4")
    run(["-f", "concat", "-safe", "0", "-i", listing,
         "-vf", "fade=t=in:st=0:d=0.6,fade=t=out:st=28.2:d=0.8",
         "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-r", str(FPS), silent])

    # VO: a beat of air at the head so the first line lands inside shot one,
    # and a gentle lift so it sits at broadcast level without clipping.
    master = os.path.join(OUT, "naira-flore-the-long-quiet-29s.mp4")
    run(["-i", silent, "-i", os.path.join(HERE, "vo.wav"),
         "-filter_complex",
         "[1:a]adelay=400|400,volume=1.6,afade=t=in:st=0:d=0.3,"
         "afade=t=out:st=28.4:d=0.6,aresample=48000[a]",
         "-map", "0:v", "-map", "[a]", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "192k", "-shortest", master])

    # 15s pull: shots 1, 3, 5 and the endcard — clay, spice, water, sign-off.
    cut15 = os.path.join(OUT, "naira-flore-the-long-quiet-15s.mp4")
    run(["-i", master, "-filter_complex",
         "[0:v]trim=0:4,setpts=PTS-STARTPTS[v0];"
         "[0:v]trim=8:12,setpts=PTS-STARTPTS[v1];"
         "[0:v]trim=16:20,setpts=PTS-STARTPTS[v2];"
         "[0:v]trim=24:27,setpts=PTS-STARTPTS[v3];"
         "[v0][v1][v2][v3]concat=n=4:v=1:a=0[v];"
         "[0:a]atrim=0:4,asetpts=PTS-STARTPTS[a0];"
         "[0:a]atrim=8:12,asetpts=PTS-STARTPTS[a1];"
         "[0:a]atrim=16:20,asetpts=PTS-STARTPTS[a2];"
         "[0:a]atrim=24:27,asetpts=PTS-STARTPTS[a3];"
         "[a0][a1][a2][a3]concat=n=4:v=0:a=1[a]",
         "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-pix_fmt", "yuv420p",
         "-crf", "18", "-c:a", "aac", "-b:a", "192k", cut15])

    # 6s pull: the strongest single shot plus the sign-off.
    cut6 = os.path.join(OUT, "naira-flore-the-long-quiet-6s.mp4")
    run(["-i", master, "-filter_complex",
         "[0:v]trim=0:3,setpts=PTS-STARTPTS[v0];"
         "[0:v]trim=25:28,setpts=PTS-STARTPTS[v1];[v0][v1]concat=n=2:v=1:a=0[v]",
         "-map", "[v]", "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p",
         "-crf", "18", cut6])

    for p in (master, cut15, cut6):
        dur = subprocess.run([FF, "-i", p], capture_output=True, text=True).stderr
        dur = [l for l in dur.split("\n") if "Duration" in l][0].split(",")[0].strip()
        print("%-52s %6.1f MB  %s" % (os.path.basename(p),
                                      os.path.getsize(p) / 1048576, dur))


if __name__ == "__main__":
    main()
