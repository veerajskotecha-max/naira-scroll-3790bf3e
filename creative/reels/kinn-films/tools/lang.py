"""Spoken/sung language of each song (whisper small, int8), plus a few lines of what it hears. Usage: lang.py <model_dir> wav ..."""
import sys
sys.path.append('/root/.local/lib/python3.11/site-packages')
from faster_whisper import WhisperModel
md = sys.argv[1]
m = WhisperModel('small', device='cpu', compute_type='int8', download_root=md)
for p in sys.argv[2:]:
    segs, info = m.transcribe(p, beam_size=1, vad_filter=False, language=None, condition_on_previous_text=False)
    top = sorted(info.all_language_probs or [], key=lambda a: -a[1])[:4]
    txt = ' | '.join(s.text.strip() for s in list(segs)[:6])
    print(f'== {p.split("/")[-2]}/{p.split("/")[-1]}: {info.language} ({info.language_probability:.2f}); top {[(l, round(q, 2)) for l, q in top]}\n   heard: {txt[:300]}')
