"""1080x1920 phone gallery of the 27 real clips in the burst's order (thumbnail at the burst's moment + real length), brand-tinted chrome."""
import io, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
S, OUT = sys.argv[1], sys.argv[2]; FONT = f'{S}/fonts/Jost.ttf'
order = [('62379666', 0.4), ('041FCDC6', 8.7), ('E2552016', 5.0), ('5627AA72', 14.0), ('267E722A', 0.3), ('212E5E27', 20.6), ('2FB96BA5', 2.8),
         ('F2532C01', 28.0), ('E3C6EA7D', 10.2), ('D0798597', 2.0), ('1AEDD2D8', 17.8), ('74FA1A49', 20.6), ('A9E89517', 9.0), ('0C1A5F38', 12.5),
         ('A352935A', 12.0), ('FB8CD2FD', 6.5), ('C64FD42F', 21.2), ('84BD71C7', 59.2), ('BD3B07AF', 22.95), ('398F157B', 8.2), ('76D95B49', 2.0),
         ('CF686DEA', 19.5), ('20AA749D', 0.8), ('DE17C1BF', 8.3), ('069EEAED', 1.0), ('50E69BE9', 1.3), ('8FC2055C', 0.6)]
INK, IVORY, BLUSH, GREY = (26, 22, 20), (251, 243, 236), (255, 189, 168), (150, 140, 134)
W, H = 1080, 1920; cols = 5; gap = 4; cell = (W - gap * (cols - 1)) // cols
img = Image.new('RGB', (W, H), INK); d = ImageDraw.Draw(img)
F_big = ImageFont.truetype(FONT, 84); F_small = ImageFont.truetype(FONT, 38); F_dur = ImageFont.truetype(FONT, 30)
for f in (F_big, F_small, F_dur):
    try: f.set_variation_by_axes([600])
    except Exception: pass
d.text((40, 236), 'Recents', font=F_big, fill=IVORY)
d.text((44, 344), f'{len(order)} Videos', font=F_small, fill=GREY)
d.rounded_rectangle((W - 220, 262, W - 40, 326), radius=32, fill=BLUSH); d.text((W - 184, 268), 'Select', font=F_small, fill=INK)
y0 = 420
for k, (name, t) in enumerate(order):
    info = subprocess.run([f'{S}/ffmpeg', '-hide_banner', '-i', f'{S}/v14/dl/{name}/{name}.mov'], capture_output=True, text=True).stderr
    h, m, s = info.split('Duration: ')[1].split(',')[0].split(':'); dur = float(h) * 3600 + float(m) * 60 + float(s)
    raw = subprocess.run([f'{S}/ffmpeg', '-v', 'error', '-nostdin', '-ss', str(t), '-i', f'{S}/v14/dl/{name}/{name}.mov', '-frames:v', '1',
                          '-vf', 'scale=540:960:flags=lanczos:in_color_matrix=bt709:in_range=full', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    fr = Image.open(io.BytesIO(raw)).convert('RGB')
    sq = fr.crop((0, 140, 540, 680)).resize((cell, cell), Image.LANCZOS)
    x = (k % cols) * (cell + gap); y = y0 + (k // cols) * (cell + gap)
    img.paste(sq, (x, y))
    sec = int(round(dur)); lab = f'{sec // 60}:{sec % 60:02d}'; tw = d.textlength(lab, font=F_dur)
    d.text((x + cell - tw - 12 + 2, y + cell - 44 + 2), lab, font=F_dur, fill=(0, 0, 0)); d.text((x + cell - tw - 12, y + cell - 44), lab, font=F_dur, fill=(255, 255, 255))
img.save(OUT, quality=92); print(OUT, 'cell', cell, 'grid ends at', y0 + 6 * (cell + gap))
